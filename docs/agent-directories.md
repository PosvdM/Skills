# 各 Agent 的个人 Skills 目录

安装时第 4 步要用到每个 Agent 的个人 Skills 目录。有些 Agent 的目录不容易查到，这里记录已经核实过的位置。表中的 Agent 仍以本机实际安装情况为准；没有列出的 Agent，按它的官方文档查找。

| Agent | 原生读取 `~/.agents/skills/` | 个人 Skills 目录 | 处理 | 不要碰的目录 |
|---|---|---|---|---|
| Codex | 是 | — | 跳过 | `~/.codex/skills/`（含 Codex 管理的 `.system/`） |
| VS Code（GitHub Copilot） | 是 | — | 跳过 | — |
| Claude Code | 否 | `~/.claude/skills/` | 链接 | — |
| Antigravity | 否 | `~/.gemini/config/skills/` | 链接 | `~/.gemini/antigravity/builtin/`、`~/.gemini/antigravity-cli/builtin/` |
| Cursor | 否 | `~/.cursor/skills/` | 链接 | — |

## 说明

- **Codex**：个人 Skill 从 `~/.agents/skills/` 读取。`~/.codex/skills/` 存放 Codex 自己的系统 Skill，不要链接或替换。
- **VS Code**：Copilot 默认搜索 `~/.agents/skills`、`~/.copilot/skills` 和 `~/.claude/skills`，不需要链接。
- **Claude Code**：只读 `~/.claude/skills/`，插件 Skill 另有存放位置，所以这个目录可以整体链接。
- **Antigravity**：全局配置根目录是 `~/.gemini/config/`，Skill 放在其下的 `skills/<name>/`。它只在项目内识别 `.agents/`，不读用户目录下的 `~/.agents/skills/`。这个位置出自 Antigravity 自带的 `agy-customizations` Skill（`~/.gemini/antigravity/builtin/skills/agy-customizations/SKILL.md`），在线文档：https://antigravity.google/docs/skills 。内置 Skill 放在 `builtin/` 下，和个人目录分开。
- **Cursor**：目录取自 Cursor 官方文档，尚未在本机安装核实。

## 补充新的 Agent

找到新 Agent 的个人 Skills 目录后，在上表加一行，并在“说明”中写明出处。只记录专用的个人 Skills 目录；和系统、内置或插件 Skill 混放的目录不能链接，要在“不要碰的目录”一栏写明。
