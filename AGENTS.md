# 个人 Skills 安装

按 `sources.json` 安装全部个人 Skill。适用于 Claude Code、Codex、Antigravity、Cursor 等支持 Agent Skills 的客户端。

## 原则

- 直接从 GitHub 读取清单并安装，不要 clone 本仓库，也不要从本地路径安装。清单地址：`https://raw.githubusercontent.com/PosvdM/Skills/main/sources.json`
- `sources.json` 是唯一依据，不要假定 Skill 的数量或名称。只安装其中声明的 Skill。
- 标准目录是 `~/.agents/skills/`（Windows 上 `~` 指当前用户的个人目录）。
- 不要改动 Agent 自己管理的系统、内置、企业、插件或项目 Skill，包括 Codex 的 `~/.codex/skills/`（含 `.system/`）。
- 不要删除个人 Skill：需要替换时先迁移，发生冲突时保留命名清楚的备份。

## 步骤

1. **校验清单。** 修改文件系统前完整检查一遍，任何一项不通过就停止并报告：
   - `schemaVersion` 为 `2`，有 `skills` 数组。
   - 每个条目的 `name` 为非空的小写 kebab-case，忽略大小写后唯一。
   - `type` 为 `bundled` 或 `external`；`external` 条目的 `source` 不能为空。
2. **检查依赖：** Git、Node.js、npm、`npx`。缺少时说明需要什么，征得同意后再安装。
3. **安装。** 每个条目执行一次。`<source>` 对 `bundled` 是 `https://github.com/PosvdM/Skills`，对 `external` 是条目里的 `source`：

   ```bash
   npx -y skills add <source> --skill <name> --global --yes --agent universal
   ```

   必须用 `--agent universal`（只装进标准目录，不为每个 Skill 建链接），不要用 `--agent '*'`。
4. **链接其他 Agent。** 只处理本机实际安装了的 Agent，新建的空目录不能当作已安装的依据。原生读取 `~/.agents/skills/` 的 Agent（如 Codex）跳过。其余 Agent：
   - 把它文档中说明的专用个人 Skills 目录整体链接到 `~/.agents/skills/`（macOS/Linux 用目录符号链接，Windows 用 Junction）。每个 Agent 只建一个父目录链接。
   - 该目录里如果混有系统、内置、插件等由 Agent 管理的 Skill，不要链接，跳过并报告。
   - 目录已经存在时，先把其中的个人 Skill 迁移到标准目录。已经指向标准目录的单个 Skill 链接，核实后可以删除。确认没有遗留后，再换成父目录链接。
5. **验收。**
   - 每个清单条目都有 `~/.agents/skills/<name>/SKILL.md`，且 frontmatter 中的 `name` 与清单一致。
   - 列出标准目录中清单之外的 Skill，只报告，不删除。
   - 本次创建的每个链接都指向标准目录，并能访问所有 Skill。
6. **报告**每个条目的结果，以及迁移、备份、跳过的链接和失败项。还有条目缺失时，不要宣称已经完成。
