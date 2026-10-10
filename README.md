# Cross-Agent Personal Skills

我的跨 Agent 个人 Skills 清单和安装入口，适用于 Claude Code、Codex、Antigravity、Cursor 等支持 Agent Skills 的客户端。Skills 统一安装到 `~/.agents/skills/`，其他 Agent 通过目录链接共用。各客户端自带的系统或内置 Skills 不归本仓库管理。

## 安装

把下面一句话交给 Agent：

```text
请按这个仓库的 AGENTS.md 安装我的个人 Skills：https://github.com/PosvdM/Skills
```

Agent 直接从 GitHub 读取清单并安装，不需要 clone 本仓库。完整规则见 [`AGENTS.md`](AGENTS.md)，各 Agent 的个人 Skills 目录见 [`docs/agent-directories.md`](docs/agent-directories.md)。

## Skill 清单

[`sources.json`](sources.json) 是唯一清单，其他文件不重复列出 Skill 名称。条目分两类：

- `bundled`：自建 Skill，文件放在 `skills/<name>/`。
- `external`：第三方 Skill，只记录上游仓库地址 `source`，不复制源文件。

## 增加 Skill

- 自建：把含 `SKILL.md` 的目录放进 `skills/<name>/`，在 `sources.json` 中加 `{ "name": "<name>", "type": "bundled" }`。
- 第三方：在 `sources.json` 中加 `{ "name": "<name>", "type": "external", "source": "<上游仓库地址>" }`。

`name` 必须与 `SKILL.md` frontmatter 中的 `name` 一致。安装流程不用改。

## 在项目中引用 project-docs

把 [`templates/AGENTS.md`](templates/AGENTS.md) 复制到项目根目录；项目已有 `AGENTS.md` 时，只加入其中的“文档”一节。Agent 会在线读取 `project-docs`，不需要安装，前提是本仓库保持公开。

Claude Code 在项目没有 `CLAUDE.md` 时会直接读取 `AGENTS.md`；已有 `CLAUDE.md` 时，在其开头加一行 `@AGENTS.md`。
