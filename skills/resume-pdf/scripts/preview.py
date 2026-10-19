"""输出 PDF 的页数，并把每页按 2 倍分辨率渲染成 PNG，放到系统临时目录下的 resume-preview/。
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

# 通过 osascript 调用 PDFKit：渲染每一页，返回页数和第 2 页起的文字
JXA = """
ObjC.import("PDFKit"); ObjC.import("AppKit");
function run(argv) {
  var doc = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(argv[0]));
  if (doc.isNil()) throw new Error("打不开 PDF：" + argv[0]);
  var n = doc.pageCount, texts = [];
  for (var i = 0; i < n; i++) {
    var page = doc.pageAtIndex(i);
    var b = page.boundsForBox($.kPDFDisplayBoxMediaBox);
    var img = page.thumbnailOfSizeForBox($.NSMakeSize(b.size.width * 2, b.size.height * 2), $.kPDFDisplayBoxMediaBox);
    $.NSBitmapImageRep.imageRepWithData(img.TIFFRepresentation)
      .representationUsingTypeProperties($.NSBitmapImageFileTypePNG, $())
      .writeToFileAtomically(argv[1] + "/p" + (i + 1) + ".png", true);
    if (i > 0) texts.push(page.string.js);
  }
  return JSON.stringify({pages: n, texts: texts});
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
    return data["pages"], data["texts"]


def render_pymupdf(pdf, out):
    import pymupdf
    doc = pymupdf.open(pdf)
    texts = []
    for i, page in enumerate(doc, 1):
        page.get_pixmap(dpi=144).save(str(out / f"p{i}.png"))
        if i > 1:
            texts.append(page.get_text())
    return doc.page_count, texts


if len(sys.argv) != 2:
    sys.exit("用法：python3 preview.py <PDF 路径>")
pdf = Path(sys.argv[1]).resolve()
out = Path(tempfile.gettempdir()) / "resume-preview"
shutil.rmtree(out, ignore_errors=True)
out.mkdir()
render = render_macos if sys.platform == "darwin" else render_pymupdf
pages, texts = render(pdf, out)
print("pages:", pages)
for i, text in enumerate(texts, 2):
    print(f"--- 第 {i} 页的文字 ---")
    print(text.strip())
print("png:", out)
