"""把正文片段套上统一的头部，输出 HTML，再用 Chrome 打印成 PDF。

头部的姓名、联系方式和照片从同目录的 profile.json 读取。

用法：python3 build.py <版本名> <输出 PDF 路径> [求职意向]
版本名对应同目录的 <版本名>.body.html。
例如：python3 build.py general "../张三-简历-后端开发.pdf" "后端开发"
"""
import html
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).parent

ICONS = {
    "user": '<svg viewBox="0 0 24 24"><circle cx="12" cy="7.5" r="4.5"/><path d="M3 22c0-5 4-8 9-8s9 3 9 8z"/></svg>',
    "phone": '<svg viewBox="0 0 24 24"><rect x="6" y="1.5" width="12" height="21" rx="2.5" fill="none" stroke="#555" stroke-width="2"/><circle cx="12" cy="18.5" r="1.3"/></svg>',
    "mail": '<svg viewBox="0 0 24 24"><path d="M2 5h20v14H2z" fill="none" stroke="#555" stroke-width="2"/><path d="M2 5l10 8 10-8" fill="none" stroke="#555" stroke-width="2"/></svg>',
    "web": '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="#555" stroke-width="2"/><ellipse cx="12" cy="12" rx="4.2" ry="10" fill="none" stroke="#555" stroke-width="1.8"/><path d="M2 12h20" stroke="#555" stroke-width="1.8"/></svg>',
    "github": '<svg viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
}


def contact_item(item):
    text = html.escape(item["text"])
    if "href" in item:
        text = f'<a href="{html.escape(item["href"])}">{text}</a>'
    return f'  <span>{ICONS.get(item.get("icon"), "")}{text}</span>'


def find_browser():
    """按顺序找 Chrome、Edge，环境变量 RESUME_BROWSER 优先。"""
    if os.environ.get("RESUME_BROWSER"):
        if not Path(os.environ["RESUME_BROWSER"]).is_file():
            sys.exit(f"RESUME_BROWSER 指向的文件不存在：{os.environ['RESUME_BROWSER']}")
        return os.environ["RESUME_BROWSER"]
    if sys.platform == "darwin":
        candidates = [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
        ]
    elif sys.platform == "win32":
        roots = [os.environ.get(k) for k in ("PROGRAMFILES", "PROGRAMFILES(X86)", "LOCALAPPDATA")]
        candidates = [
            str(Path(root, *exe))
            for exe in (("Google", "Chrome", "Application", "chrome.exe"),
                        ("Microsoft", "Edge", "Application", "msedge.exe"))
            for root in roots if root
        ]
    else:
        candidates = [shutil.which(n) for n in
                      ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge")]
    for c in candidates:
        if c and Path(c).is_file():
            return c
    sys.exit("找不到 Chrome 或 Edge，请用环境变量 RESUME_BROWSER 指定浏览器程序的路径")


if len(sys.argv) not in (3, 4):
    sys.exit('用法：python3 build.py <版本名> <输出 PDF 路径> [求职意向]\n'
             '例如：python3 build.py general "../张三-简历-后端开发.pdf" "后端开发"')
piece, out = sys.argv[1], Path(sys.argv[2]).resolve()
body_file = HERE / f"{piece}.body.html"
if not body_file.is_file():
    versions = ", ".join(sorted(p.name.removesuffix(".body.html") for p in HERE.glob("*.body.html")))
    sys.exit(f"找不到正文 {body_file.name}。现有版本：{versions or '无'}")
profile = json.loads((HERE / "profile.json").read_text(encoding="utf-8"))
title = sys.argv[3] if len(sys.argv) > 3 else ""
name = f"{profile['name']} – {title}" if title else profile["name"]

# profile.json 的 contact 每个子数组排成一行
contact = "\n".join(
    '<div class="contact">\n' + "\n".join(contact_item(i) for i in row) + "\n</div>"
    for row in profile.get("contact", [])
)
photo = profile.get("photo")
photo_tag = f'<img class="photo" src="{html.escape(photo)}" alt="">' if photo else ""

# 正文片段里写一个 <!-- TOP_END -->，它之前的内容和姓名、联系方式一起排在照片左侧。
body = body_file.read_text(encoding="utf-8")
top, _, rest = body.partition("<!-- TOP_END -->")
page_html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>{html.escape(name)}</title><link rel="stylesheet" href="style.css"></head>
<body>
<div class="top{'' if photo else ' no-photo'}">
{photo_tag}
<h1>{html.escape(name)}</h1>
{contact}
{top}
</div>
{rest}
</body>
</html>
"""
page = HERE / f"{piece}.html"
page.write_text(page_html, encoding="utf-8")
# 浏览器正常时也会往 stderr 写很多无关日志，所以只在失败时输出
started = time.time()
result = subprocess.run(
    [find_browser(), "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
     f"--print-to-pdf={out}", page.as_uri()],
    capture_output=True, text=True, errors="replace",
)
# 有时浏览器返回 0 却没写出文件，所以再看一次文件有没有更新
if result.returncode or not out.is_file() or out.stat().st_mtime < started - 1:
    sys.exit(f"浏览器没有生成 PDF（返回码 {result.returncode}）。浏览器输出：\n{result.stderr.strip()}")
print("pdf:", out)
