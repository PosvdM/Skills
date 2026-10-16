"""输出 PDF 的页数，并把每页按 2 倍分辨率渲染成 PNG，放到系统临时目录下的 resume-preview/。

用法：python3 preview.py <PDF 路径>
依赖 PyMuPDF：pip install pymupdf，或者不装，用 uv run --with pymupdf preview.py <PDF 路径>
"""
import shutil
import sys
import tempfile
from pathlib import Path

import pymupdf

if len(sys.argv) != 2:
    sys.exit("用法：python3 preview.py <PDF 路径>")
out = Path(tempfile.gettempdir()) / "resume-preview"
shutil.rmtree(out, ignore_errors=True)
out.mkdir()
doc = pymupdf.open(sys.argv[1])
print("pages:", doc.page_count)
for i, page in enumerate(doc, 1):
    page.get_pixmap(dpi=144).save(str(out / f"p{i}.png"))
print("png:", out)
