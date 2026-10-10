# 各 Agent 的个人 Skills 目录

这里记录各 Agent 个人 Skills 目录的上次核实结果，供[安装说明](install.md)第 4 步参考。Agent 更新后目录可能变化，官方网页也可能滞后，所以每次安装仍要重新核实；本表只用来缩小查找范围，并提供清理旧链接时要检查的曾用目录。

| Agent | 原生读取 `~/.agents/skills/` | 个人 Skills 目录 | 曾用目录 | 上次核实 |
|---|---|---|---|---|
| Codex | 是 | — | — | 沿用 Codex 文档，未实测 |
| VS Code（GitHub Copilot） | 是 | — | — | 1.141.0，2026-10-10 查看默认配置 |
| Claude Code | 否 | `~/.claude/skills/` | — | 2.1.295，2026-10-10 实测 |
| Antigravity | 否 | `~/.gemini/config/skills/` | `~/.gemini/antigravity-cli/skills/`、`~/.gemini/antigravity/skills/` | CLI 1.2.5，2026-10-10 实测 |
| Cursor | 否 | `~/.cursor/skills/` | — | 沿用 Cursor 文档，未实测 |

## 说明

- **Codex**：个人 Skill 从 `~/.agents/skills/` 读取。`~/.codex/skills/` 存放 Codex 自己的系统 Skill（`.system/`），不要链接或替换。
- **VS Code**：Copilot 默认搜索 `~/.agents/skills`、`~/.copilot/skills` 和 `~/.claude/skills`，不需要链接。因为 `~/.claude/skills` 也链接到标准目录，同一个 Skill 可能出现两次；出现时在 VS Code 设置中去掉 `~/.claude/skills`。
- **Claude Code**：只读 `~/.claude/skills/`。插件 Skill 另有存放位置，所以这个目录可以整体链接。
- **Antigravity**：CLI、2.0 和 IDE 的全局目录都是 `~/.gemini/config/skills/`，`~/.agents/` 只在项目内识别。内置 Skill 放在 `~/.gemini/antigravity/builtin/`，不要动。
  - 官方网页（https://antigravity.google/docs/skills ）写 CLI 的全局目录是 `~/.gemini/antigravity-cli/skills/`，但 CLI 1.2.5 实测不读这个目录；它自带的 `agy-customizations` Skill 写的是 `~/.gemini/config/`，与实测一致。
  - 网页写 IDE 旧路径 `~/.gemini/antigravity/skills/` 仍然有效。两个旧路径都列为曾用目录，避免和当前目录重复链接。
- **Cursor**：目录取自 Cursor 官方文档，尚未在本机安装核实。

## 更新本表

安装报告列出核实结果和本表不一致时，更新对应的行：改当前目录，把旧目录移到“曾用目录”，并在“上次核实”中写明版本、日期和核实方法（实测、自带说明或官方文档）。新的 Agent 也按这个格式加一行。只记录专用的个人 Skills 目录；和系统、内置或插件 Skill 混放的目录写进“说明”，注明不能链接。
