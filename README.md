# Cross-Agent Personal Skills

这是我的跨智能体个人 Skills 清单和安装入口，适用于 Claude Code、Codex、Cursor、GitHub Copilot、Gemini CLI 等支持 Agent Skills 或 Skills CLI 的客户端。个人 Skills 的主目录固定为：

```text
$HOME/.agents/skills/
```

各客户端管理的系统或内置 Skills 不在本仓库中。

## Skill 清单

[`sources.json`](sources.json) 是唯一清单，不在其他文件中重复维护具体 Skill 名称。

- `bundled`：自建 Skill，完整文件保存在 `skills/<name>/`。
- `external`：已有上游仓库的 Skill，只记录名称、来源和安装页面，不复制源文件。

## 使用

把下面一句话交给智能体：

```text
请按这个仓库的 AGENTS.md 安装我的个人 Skills：https://github.com/PosvdM/skills
```

完整安装规则见 [`AGENTS.md`](AGENTS.md)。仓库是私有的，因此新设备需要先登录有权访问它的 GitHub 账号。

## 以后增加 Skill

新增自建 Skill：

1. 把完整目录放入 `skills/<name>/`，确保其中有 `SKILL.md`；
2. 在 `sources.json` 的 `skills` 数组中增加 `type: "bundled"`、`name` 和 `path`。

新增第三方 Skill：只需在 `sources.json` 中增加 `type: "external"`、`name` 和 `source`；`sourcePath`、`installPage` 可用于记录原始目录和展示页面。

新增条目后不需要修改安装流程或验收指令；下次智能体会直接读取更新后的清单。
