---
name: slides
description: 做演讲、宣讲 PPT 时使用。在对话里定好内容后手写 SVG 页面，用 PPT Master 的脚本检查并导出可编辑的 PPTX，不走 PPT Master 的完整流程。
---

# 做 PPT

## 核心

- 多放图少放字
- 不要读 PPT

## 讲稿和页面文字

- 整场像讲故事一样串起来，不交代台下都知道的背景。
- 最打动人的部分要展开讲，不能一页带过。
- 先讲整体，再讲细节。
- 不讲和主线无关的信息。
- 页面文字和讲稿用书面语，按 plain-language 写。页面上不放操作说明，也不放提醒演讲者的话。
- 文字和遮罩不挡住图里的主体。

## 流程

下文 `PM` 指 PPT Master 的目录 `~/.agents/skills/ppt-master`。第一次在本机使用时，先检查是否装好了 `PM/requirements.txt` 中的 Python 包，缺少时在运行下列脚本所用的 Python 环境中运行 `python3 -m pip install -r PM/requirements.txt`；系统 Python 拒绝安装时，先建虚拟环境，之后都用它运行脚本。

1. 在对话里和用户定下：受众、时长、主线、逐页大纲（每页讲什么、用哪张图）、配色和字体。缺图先告诉用户。用户确认后一直做到导出，中间不再停下来确认。
2. 建项目：`python3 PM/scripts/project_manager.py init <名字> --format ppt169 --dir <放项目的目录>`。
3. 写页面前读 `PM/references/shared-standards-core.md` 第 1 节和第 4 节，里面是导出对 SVG 写法的限制。PPT Master 的其他 references 和 workflows 不读。
4. 页面手写成 SVG，画布 1280×720，存到 `svg_output/`，文件名用 `01_封面.svg` 这种格式。图片放在 `images/`。
5. 每写完几页就用本机 Chrome 的无头模式截图，自己看一遍（Chrome 的位置见记忆里的机器文件）：
   `<Chrome> --headless=new --disable-gpu --hide-scrollbars --window-size=1280,720 --screenshot=<输出.png> "file://<项目>/svg_output/<页>.svg"`
   Chrome 偶尔会退出却不写文件，没生成图片就重试。
6. 讲稿写在 `notes/total.md`：每页一节，以 `# 01_封面` 这种和 SVG 同名的标题开头，节与节之间用 `---` 分隔。写完运行 `python3 PM/scripts/total_md_split.py <项目>`。
7. 检查：`python3 PM/scripts/svg_quality_checker.py <项目> --quick-generate --canonical-authoring --stage final`，有问题改 SVG 后重跑。
8. 导出：`python3 PM/scripts/svg_to_pptx.py <项目> --quick-generate --with-notes`，成品在 `exports/`。
9. 用户要动画时，用 `PM/scripts/animation_config.py` 写 `animations.json`，再重新导出。
10. 把成品的路径交给用户，请用户在 PowerPoint 里打开看效果。
