# Cross-Agent Personal Skills

这是我的跨智能体个人 Skills 清单和安装入口，适用于 Claude Code、Codex、Cursor、GitHub Copilot、Gemini CLI 等支持 Agent Skills 或 Skills CLI 的客户端。个人 Skills 的主目录固定为：

```text
$HOME/.agents/skills/
```

各客户端管理的系统或内置 Skills 不在本仓库中。安装过程只处理 `sources.json` 中列出的个人 Skills。

## Skill 清单

[`sources.json`](sources.json) 是唯一清单，不在其他文件中重复维护具体 Skill 名称。

- `bundled`：自建 Skill，完整文件保存在 `skills/<name>/`。
- `external`：已有上游仓库的 Skill，只记录名称、来源和安装页面，不复制源文件。

## 交给智能体安装

把本仓库链接交给能够访问 GitHub 和运行终端命令的智能体，并发送：

```text
请读取 https://github.com/PosvdM/skills 中的 AGENTS.md 和 sources.json，安装清单中的全部个人 Skills。统一安装到 ~/.agents/skills/；原生读取该目录的智能体直接使用，不原生读取的当前智能体按其规范建立兼容链接。让 Skills CLI 自动检测已安装的智能体，不要使用 --agent '*'，也不要为未安装的智能体创建目录或链接。不要移动或复制任何客户端管理的系统或内置 Skills。完成后根据 sources.json 逐项确认每个 Skill 都有 ~/.agents/skills/<name>/SKILL.md，并报告安装结果。
```

智能体应当根据每项的 `type` 安装：

1. `bundled`：从本仓库中安装对应的自建 Skill；
2. `external`：使用记录的 `source` 和 `name` 从原作者仓库安装；
3. 通过 Skills CLI 的全局安装与自动检测功能处理当前已安装智能体的目录兼容；
4. 根据清单动态验收，不依赖固定的 Skill 数量或名称。

安装需要 Git、Node.js 和 npm。`npx` 可以直接运行 Skills CLI，无需提前安装该 CLI。如果仓库是私有的，需要先登录有权访问它的 GitHub 账号。

## 安装命令规则

对于 `bundled` 条目：

```bash
npx -y skills add https://github.com/PosvdM/skills --skill <name> --global --yes
```

对于 `external` 条目：

```bash
npx -y skills add <source> --skill <name> --global --yes
```

省略 `--agent` 后，Skills CLI 会检测当前电脑上已经安装的智能体。不要使用 `--agent '*'`：它会为 CLI 支持的全部智能体创建入口，包括电脑上并未安装的客户端。在 Windows 上，这些入口可能表现为 Junction。

如果自动检测未包含正在使用的智能体，先确认该客户端确实需要专用 Skills 目录，再只为该客户端传入 `--agent <当前智能体>`。

这些是供智能体生成实际命令的规则，不需要在 README 中逐项写死。

## 以后增加 Skill

新增自建 Skill：

1. 把完整目录放入 `skills/<name>/`，确保其中有 `SKILL.md`；
2. 在 `sources.json` 的 `skills` 数组中增加 `type: "bundled"`、`name` 和 `path`。

新增第三方 Skill：只需在 `sources.json` 中增加 `type: "external"`、`name` 和 `source`；`sourcePath`、`installPage` 可用于记录原始目录和展示页面。

新增条目后不需要修改安装流程或验收指令；下次智能体会直接读取更新后的清单。
