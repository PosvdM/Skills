# Cross-Agent Personal Skills

这是我的跨智能体个人 Skills 清单和安装入口，适用于 Claude Code、Codex、Cursor、GitHub Copilot、Gemini CLI 等支持 Agent Skills 或 Skills CLI 的客户端。个人 Skills 的主目录固定为：

```text
$HOME/.agents/skills/
```

各客户端管理的系统或内置 Skills 不在本仓库中，也不会被安装脚本移动或复制。安装器会从主目录向已支持的智能体目录建立兼容链接，不会把个人 Skill 的源文件分散复制到多个位置。

## Skill 清单

[`sources.json`](sources.json) 是唯一清单，安装器会逐项读取，不包含写死的 Skill 名称。

- `bundled`：自建 Skill，完整文件保存在 `skills/<name>/`。
- `external`：已有上游仓库的 Skill，只记录名称、来源和安装页面，不复制源文件。

## 在新电脑上安装

前提：电脑已安装 Git、Node.js 和 npm。脚本支持 macOS 和 Linux；`npx` 会自动运行 Skills CLI，无需单独安装该 CLI。

```bash
git clone https://github.com/PosvdM/skills.git
cd skills
./install.sh
```

安装脚本会自动：

1. 校验 `sources.json` 的格式、名称、重复项和自建 Skill 文件；
2. 安装清单中的每个自建和第三方 Skill；
3. 让 Skills CLI 为其支持的智能体建立全局兼容链接；
4. 根据清单逐项检查 `$HOME/.agents/skills/<name>/SKILL.md`。

如果目标目录中已有同名 Skill，脚本会先保存带时间戳的备份，再安装清单指定的版本。

## 直接交给任意智能体

把仓库链接和下面这段指令交给 Claude、ChatGPT/Codex、Cursor 或其他能够运行终端命令的智能体：

```text
请打开 https://github.com/PosvdM/skills，按照 README 运行 install.sh，把 sources.json 中列出的全部个人 Skills 安装到 ~/.agents/skills/，并为当前智能体建立兼容链接。不要移动或复制任何客户端管理的系统或内置 Skills。完成后根据 sources.json 逐项检查每个 Skill 目录及其 SKILL.md。
```

如果仓库是私有的，需要先在新电脑上登录有权访问该仓库的 GitHub 账号。

## 以后增加 Skill

新增自建 Skill：

1. 把完整目录放入 `skills/<name>/`，确保其中有 `SKILL.md`；
2. 在 `sources.json` 的 `skills` 数组中增加 `type: "bundled"`、`name` 和 `path`。

新增第三方 Skill：只需在 `sources.json` 中增加 `type: "external"`、`name` 和 `source`；`sourcePath`、`installPage` 可用于记录原始目录和展示页面。

新增条目后不用修改 `install.sh` 或验收指令。

提交前可只校验清单，不执行安装：

```bash
./install.sh --check
```
