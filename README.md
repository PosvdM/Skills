# Cross-Agent Personal Skills

我的跨 Agent 个人 Skills 清单和安装入口，适用于 Claude Code、Codex、Antigravity、Cursor 等支持 Agent Skills 的客户端。Skills 统一安装到 `~/.agents/skills/`，其他 Agent 通过目录链接共用。各客户端自带的系统或内置 Skills 不归本仓库管理。

## 安装和更新

安装或更新时，把下面一句话交给 Agent：

```text
请按 https://raw.githubusercontent.com/PosvdM/Skills/main/docs/install.md 安装或更新我的个人 Skills
```

Agent 直接从 GitHub 读取清单并安装，不需要 clone 本仓库。装好后会有 `my-skills`，以后直接对 Agent 说"更新我仓库的 skills"或"去我仓库装上 <name>"即可。日常更新只安装上游有变化的 Skill；新装了 Agent 时说"完整检查我仓库的 skills"，Agent 会重新核实各 Agent 的目录；说"看看我仓库的 skills 有没有更新"只检查、不安装。

比对和安装由 [`scripts/sync.mjs`](scripts/sync.mjs) 完成，Agent 处理脚本报告的异常。完整规则见 [`docs/install.md`](docs/install.md)，各 Agent 的个人 Skills 目录见 [`docs/agent-directories.md`](docs/agent-directories.md)。

## Skill 清单

[`sources.json`](sources.json) 是唯一清单，其他文件不重复列出 Skill 名称。条目分两类：

- `bundled`：自建 Skill，文件放在 `skills/<name>/`。
- `external`：第三方 Skill，不复制源文件。`source` 是上游仓库地址，安装时使用；`listing` 是找到这个 Skill 的页面（如 skills.sh），可以不写。

两类条目都可以加 `"optional": true`，标为可选 Skill。全量安装和更新时跳过可选 Skill，除非它因依赖或分组被带入（见[依赖和分组](#依赖和分组)）；用到时点名安装，如"去我仓库装上 <name>"。装上后一直保留并随全量更新；不需要时手动卸载：`npx skills remove --global --yes <name>`。

### 依赖和分组

需要和其他 Skill 一起安装时，用下面两个字段声明：

- `requires`：单向依赖，写成 Skill 名称的数组。安装这个 Skill 时一起安装它依赖的 Skill，依赖的依赖也一并安装；单独安装被依赖的 Skill 时不带上依赖它的 Skill。只写缺了就无法使用的依赖，例如 `slides` 要运行 `ppt-master` 的脚本。
- `group`：成套使用的 Skill 写同一个分组名（小写 kebab-case）。安装组内任一成员时整组一起安装，也可以点名分组名安装。一个分组至少有 2 个成员，分组名不能与 Skill 同名。

例如：

```json
{ "name": "slides", "type": "bundled", "optional": true, "requires": ["ppt-master"] },
{ "name": "a", "type": "bundled", "optional": true, "group": "suite" },
{ "name": "b", "type": "bundled", "optional": true, "group": "suite" }
```

全量更新以非可选条目和已安装的可选条目为起点，展开它们的依赖和同组成员，范围内缺失的条目都会安装，包括可选 Skill。卸载后仍在下次全量更新展开范围内的 Skill 会被重新装上，例如它被非可选 Skill 或已装的 Skill 依赖，或与它们同组。

## 增加 Skill

- 自建：把含 `SKILL.md` 的目录放进 `skills/<name>/`，在 `sources.json` 中加 `{ "name": "<name>", "type": "bundled" }`。
- 第三方：在 `sources.json` 中加 `{ "name": "<name>", "type": "external", "source": "<上游仓库地址>", "listing": "<Skill 页面地址>" }`。没有对应页面时省略 `listing`。

只在需要时安装的，再加 `"optional": true`；要和其他 Skill 一起安装的，按[依赖和分组](#依赖和分组)加 `requires` 或 `group`。`name` 必须与 `SKILL.md` frontmatter 中的 `name` 一致。安装流程不用改。

## 在项目中引用 project-docs

把 [`templates/AGENTS.md`](templates/AGENTS.md) 复制到项目根目录；项目已有 `AGENTS.md` 时，只加入其中的“文档”一节。本机已安装 `project-docs` 时，Agent 加载本机版本；未安装时在线读取，前提是本仓库保持公开。规则只写在 `SKILL.md` 中，“文档”一节只说明去哪里读取，修改规范后不需要更新各项目的 `AGENTS.md`。

Claude Code 在项目没有 `CLAUDE.md` 时会直接读取 `AGENTS.md`；已有 `CLAUDE.md` 时，在其开头加一行 `@AGENTS.md`。
