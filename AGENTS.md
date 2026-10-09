# 个人 Skills 安装

安装 `sources.json` 中声明的全部个人 Skill。本说明不针对特定 Agent，适用于 Claude Code、Codex、Cursor、GitHub Copilot、Gemini CLI，以及其他支持 Agent Skills 或 Skills CLI 的客户端。

## 规则

- `sources.json` 是完整且唯一的依据。不要依赖固定的数量或写死的 Skill 名称列表。
- 标准副本存放在 `~/.agents/skills/`。在 Windows 上，`~` 指当前用户的个人目录。
- 只安装 `sources.json` 中声明的个人 Skill。
- 不要移动、复制、替换或删除任何 Agent 管理的系统 Skill 和内置 Skill。在这套配置中，Codex 从 `~/.agents/skills/` 读取个人 Skill，不需要兼容链接。不要链接、替换或删除 Codex 的 Skills 目录 `~/.codex/skills/`，其中的 `~/.codex/skills/.system/` 存放着 Codex 管理的系统 Skill。
- 使用 Skills CLI 的全局模式并指定 `--agent universal`。这样会把标准副本安装到 `~/.agents/skills/`，不会为每个 Skill 单独创建兼容链接。不要使用 `--agent '*'`。
- 原生读取 `~/.agents/skills/` 的 Agent 不需要兼容链接。
- 对于已安装、且需要自己的个人 Skills 目录的 Agent，把它的整个目录链接到 `~/.agents/skills/`：macOS/Linux 上用目录符号链接，Windows 上用目录 Junction。每个已安装的 Agent 只创建一个父目录链接，不要为每个 Skill 分别创建链接。
- 只链接有文档说明的、专用的个人 Skills 目录。不要链接或替换包含系统、内置、企业、插件、项目或其他由 Agent 管理的 Skill 的目录。
- 不要为未安装的 Agent 创建目录或链接。
- 用父目录链接替换已有的个人 Skills 目录之前，先把其中的个人 Skill 迁移到 `~/.agents/skills/`。已经指向标准目录的单个 Skill 链接，核实后可以删除。发生冲突时保留备份，并清楚命名。确认标准目录之外没有遗留内容后，再删除旧目录。

## 步骤

1. 修改文件系统之前，先解析并校验整个 `sources.json`。任何一项检查失败，都停止并报告错误：
   - 根对象必须使用支持的 `schemaVersion: 1`，`installDirectory` 必须正好是 `"~/.agents/skills"`，并且有 `skills` 数组。
   - 每个 Skill 的 `name` 必须是非空的小写 kebab-case；忽略大小写后名称仍须唯一，以免在 Windows 或 macOS 上冲突。
   - `type` 必须是 `bundled` 或 `external`。
   - `bundled` 条目必须有一个位于 `skills/` 下、相对于仓库根目录的 `path`，不能是绝对路径，也不能包含 `..`。该目录和其中的 `SKILL.md` 必须存在，且 frontmatter 中的 `name` 必须与清单中的名称一致。
   - `external` 条目的 `source` 和 `sourcePath` 不能为空，`installPage` 必须是 HTTPS 地址。确认来源可以访问、记录的源路径中有 `SKILL.md`，且其 frontmatter 中的 `name` 与清单中的名称一致。
2. 检查 Git、Node.js、npm 和 `npx` 是否可用。缺少必需的依赖时，说明需要什么，并在安装软件前征得同意。
3. 对每个 `bundled` 条目，确认其仓库路径中有 `SKILL.md`，然后从本仓库安装：

   ```bash
   npx -y skills add https://github.com/PosvdM/Skills --skill <name> --global --yes --agent universal
   ```

4. 对每个 `external` 条目，从记录的来源安装该 Skill。本仓库有意不收录第三方源码：

   ```bash
   npx -y skills add <source> --skill <name> --global --yes --agent universal
   ```

5. 检测实际安装了哪些 Agent。对每个不原生读取 `~/.agents/skills/` 的 Agent，找到它文档中说明的个人 Skills 目录，按上面的父目录链接规则处理。不要把新建的空目录当作 Agent 已安装的依据。
6. 逐个检查清单条目，确认 `~/.agents/skills/<name>/SKILL.md` 存在，且 frontmatter 中的名称一致。把已安装的目录名与清单对比，报告多出来的个人 Skill，但不要删除。确认本次创建的每个兼容链接都属于已安装的 Agent、指向标准父目录，并且能访问所有标准 Skill。
7. 报告每个清单条目的结果，包括迁移的 Skill、备份、跳过的链接、安装失败和兼容链接。还有条目缺失时，不要宣称已经完成。
