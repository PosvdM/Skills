# 个人 Skills 安装与更新

按 `sources.json` 安装或更新全部个人 Skill，两者步骤相同。适用于 Claude Code、Codex、Antigravity、Cursor 等支持 Agent Skills 的客户端。

## 原则

- 直接从 GitHub 读取清单并安装，不要 clone 本仓库，也不要从本地路径安装。清单地址：`https://raw.githubusercontent.com/PosvdM/Skills/main/sources.json`
- `sources.json` 是唯一依据，不要假定 Skill 的数量或名称。只安装其中声明的 Skill。
- 标准目录是 `~/.agents/skills/`（Windows 上 `~` 指当前用户的个人目录）。
- 不要改动 Agent 自己管理的系统、内置、企业、插件或项目 Skill。
- 不要擅自删除个人 Skill：需要替换时先迁移，发生冲突时保留命名清楚的备份。清单已不再包含的 Skill 先列给用户，确认后再删除。

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
4. **链接其他 Agent。** 只处理本机实际安装了的 Agent：能找到程序或命令才算已安装，只有配置目录或空目录不算。
   - **确定目录。** 先在 [`agent-directories.md`](https://raw.githubusercontent.com/PosvdM/Skills/main/docs/agent-directories.md) 中查线索，再核实。Agent 更新后目录可能变化，官方网页也可能滞后，核实方法按可靠程度依次为：实测（放一个临时测试 Skill，看 Agent 能否读到，测完删除）、Agent 自带的说明、官方网页。核实结果和表格不一致时，以核实结果为准。
   - 原生读取 `~/.agents/skills/` 的 Agent 不需要链接。其余 Agent 把专用个人 Skills 目录整体链接到 `~/.agents/skills/`（macOS/Linux 用目录符号链接，Windows 用 Junction）。每个 Agent 只建一个父目录链接。
   - 该目录里如果混有系统、内置、插件等由 Agent 管理的 Skill，不要链接，跳过并报告。
   - 目录已经存在时，先把其中的个人 Skill 迁移到标准目录。已经指向标准目录的单个 Skill 链接，核实后可以删除。确认没有遗留后，再换成父目录链接。
   - **清理旧链接。** 检查表中列出的当前目录和曾用目录。Agent 已改为原生读取，或目录已经换位置时，删除不再需要的旧链接。只删除指向 `~/.agents/skills` 的符号链接或 Junction；真实目录不删，只报告。
5. **清理清单之外的 Skill。** 清单删除或改名的 Skill 会留在标准目录里，早期手动放进各 Agent 目录的个人 Skill 也可能还在，它们会和清单中的 Skill 同时加载。
   - 列出标准目录中清单之外的 Skill，注明 `~/.agents/.skill-lock.json` 中记录的来源。
   - 检查每个已安装 Agent 的专用目录，包括原生读取标准目录的 Agent（如 Codex 的 `~/.codex/skills/`），列出其中既不由 Agent 管理、也不是指向标准目录的链接的 Skill。
   - 说明每个 Skill 是否和清单中的 Skill 重复或冲突，征得用户同意后再处理：标准目录中的用 `npx skills remove --global --yes <name>` 删除，其他目录中的按用户选择删除或备份。Windows 上这条命令完成后 Node 可能崩溃并返回非零退出码，以目录是否已删除为准。
6. **验收。**
   - 每个清单条目都有 `~/.agents/skills/<name>/SKILL.md`，且 frontmatter 中的 `name` 与清单一致。
   - 本次创建的每个链接都指向标准目录，并能访问所有 Skill。
7. **报告**每个条目的结果，以及迁移、备份、删除的 Skill，新建和删除的链接、跳过项和失败项。核实结果和表格不一致时，列出 Agent、版本、实际目录和核实方法，供更新表格。还有条目缺失时，不要宣称已经完成。
