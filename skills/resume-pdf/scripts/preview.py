"""输出 PDF 的页数，并把每页按 2 倍分辨率渲染成 PNG，放到系统临时目录下的 resume-preview/。
同时输出第 1 页页底还空着多少，方便判断能不能再加内容。
超过 1 页时，再输出第 2 页起的文字，方便判断要压缩多少。

用法：python3 preview.py <PDF 路径>
macOS 用系统自带的 PDFKit，不用装依赖。
Windows 和 Linux 依赖 PyMuPDF：pip install pymupdf，或者不装，用 uv run --with pymupdf preview.py <PDF 路径>
"""
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

# 和 style.css 里 @page 的下边距一致。算页底空白时要扣掉这一段
BOTTOM_MARGIN_MM = 10
PT_PER_MM = 72 / 25.4

# 通过 osascript 调用 PDFKit：渲染每一页，返回页数、第 1 页最后一行文字到页面底边的距离（pt）和第 2 页起的文字
JXA = """
ObjC.import("PDFKit"); ObjC.import("AppKit");
function run(argv) {
  var doc = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(argv[0]));
  if (doc.isNil()) throw new Error("打不开 PDF：" + argv[0]);
  var n = doc.pageCount, texts = [], gap = null;
  for (var i = 0; i < n; i++) {
    var page = doc.pageAtIndex(i);
    var b = page.boundsForBox($.kPDFDisplayBoxMediaBox);
    var img = page.thumbnailOfSizeForBox($.NSMakeSize(b.size.width * 2, b.size.height * 2), $.kPDFDisplayBoxMediaBox);
    $.NSBitmapImageRep.imageRepWithData(img.TIFFRepresentation)
      .representationUsingTypeProperties($.NSBitmapImageFileTypePNG, $())
      .writeToFileAtomically(argv[1] + "/p" + (i + 1) + ".png", true);
    if (i == 0) {
      // PDF 坐标原点在左下角，整页文字的外框的 y 就是它到页面底边的距离
      var sel = page.selectionForRect(b);
      if (!sel.isNil()) gap = sel.boundsForPage(page).origin.y;
    }
    if (i > 0) texts.push(page.string.js);
  }
  return JSON.stringify({pages: n, gap: gap, texts: texts});
}
"""


def render_macos(pdf, out):
    result = subprocess.run(
        ["osascript", "-l", "JavaScript", "-", str(pdf), str(out)],
        input=JXA, capture_output=True, text=True,
    )
    if result.returncode:
        sys.exit(result.stderr.strip())
    data = json.loads(result.stdout)
    return data["pages"], data["gap"], data["texts"]


def render_pymupdf(pdf, out):
    import pymupdf
    doc = pymupdf.open(pdf)
    texts, gap = [], None
    for i, page in enumerate(doc, 1):
        page.get_pixmap(dpi=144).save(str(out / f"p{i}.png"))
        if i == 1:
            # 文字块的第 7 项为 0，图片块为 1；只看文字
            bottoms = [b[3] for b in page.get_text("blocks") if b[6] == 0]
            if bottoms:
                gap = page.rect.height - max(bottoms)
        if i > 1:
            texts.append(page.get_text())
    return doc.page_count, gap, texts


if len(sys.argv) != 2:
    sys.exit("用法：python3 preview.py <PDF 路径>")
pdf = Path(sys.argv[1]).resolve()
out = Path(tempfile.gettempdir()) / "resume-preview"
shutil.rmtree(out, ignore_errors=True)
out.mkdir()
render = render_macos if sys.platform == "darwin" else render_pymupdf
pages, gap, texts = render(pdf, out)
print("pages:", pages)
if gap is not None:
    blank = gap / PT_PER_MM - BOTTOM_MARGIN_MM
    print(f"第 1 页页底空白：约 {blank:.0f} mm（已扣除 {BOTTOM_MARGIN_MM} mm 页边距；正文一行约 4.5 mm）")
for i, text in enumerate(texts, 2):
    print(f"--- 第 {i} 页的文字 ---")
    print(text.strip())
print("png:", out)
