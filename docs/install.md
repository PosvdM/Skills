# 个人 Skills 安装与更新

按 `sources.json` 安装或更新个人 Skill，适用于 Claude Code、Codex、Antigravity、Cursor 等支持 Agent Skills 的客户端。比对和安装由[同步脚本](#同步脚本)完成，Agent 运行脚本，再处理报告中的异常。

按用户的要求选择做法：

| 情况 | 做法 | 脚本参数 |
|---|---|---|
| 首次安装（本机还没有 `my-skills`）、换了机器、新装了 Agent，或用户要求完整检查 | [完整安装](#完整安装) | 无 |
| 没有点名，如"更新我仓库的 skills" | [日常更新](#日常更新) | 无 |
| 点名一个或几个 Skill，如"去我仓库装上 xxx" | [点名安装](#点名安装) | `--only <name>[,<name>...]` |
| 只问有没有更新，如"看看我仓库的 skills 有没有更新" | [只检查](#只检查) | `--check` |

用户点名时始终按点名安装处理，即使同时属于完整安装的情况，也只处理目录链接，不清理清单之外的 Skill，除非用户另外要求。

## 原则

- 标准目录是 `~/.agents/skills/`（Windows 上 `~` 指当前用户的个人目录）。只安装 `sources.json` 中声明的 Skill，安装和比对都交给脚本，不要绕过脚本手动运行 `npx skills add`。
- 不要用 `npx skills update`：它不保留 `--agent universal`，会给检测到的每个 Agent 单独建 Skill 链接。
- 不要改动 Agent 自己管理的系统、内置、企业、插件或项目 Skill。
- 不要擅自删除个人 Skill：需要替换时先迁移，发生冲突时保留命名清楚的备份。清单已不再包含的 Skill 先列给用户，确认后再删除。
- 标有 `"optional": true` 的是可选 Skill，只在用户点名时安装。已经装上的可选 Skill 一直保留并随全量更新，由用户手动卸载。

## 同步脚本

脚本需要 Git、Node.js 18 或更高版本和 `npx`。缺少时说明需要什么，征得同意后再安装。

macOS 和 Linux：

```bash
curl -fsSL https://raw.githubusercontent.com/PosvdM/Skills/main/scripts/sync.mjs | node --input-type=module - [参数]
```

Windows（PowerShell）：

```powershell
$f = Join-Path $env:TEMP "skills-sync-$([guid]::NewGuid()).mjs"
try {
  Invoke-RestMethod https://raw.githubusercontent.com/PosvdM/Skills/main/scripts/sync.mjs -OutFile $f -ErrorAction Stop
  node $f [参数]
} finally {
  Remove-Item $f -ErrorAction SilentlyContinue
}
```

参数：

| 参数 | 作用 |
|---|---|
| 无 | 全量更新：所有非可选条目，加上本机已安装的可选条目 |
| `--only a,b` | 只处理点名的条目，可选和非可选条目都可以点名；不列出清单之外的 Skill |
| `--check` | 只检查，不安装 |
| `--repo <地址或路径>` | 换一个清单仓库，只用于测试脚本 |

脚本从 GitHub 读取主分支的 `sources.json` 并校验，再对比 `~/.agents/.skill-lock.json` 记录的目录 hash 和上游，只安装缺失、来源改变或上游有更新的条目，最后核对安装结果，并按 [`agent-directories.md`](https://raw.githubusercontent.com/PosvdM/Skills/main/docs/agent-directories.md) 检查各 Agent 的目录。脚本不创建或删除链接，也不删除 Skill，这些由 Agent 按下文处理。

进度写到 stderr，JSON 报告写到 stdout。没有输出 JSON 报告时（如下载失败），按失败处理，不要当作没有更新。报告字段：

- `skills`：每个条目的 `status`，取值为 `up-to-date`、`installed`、`updated`、`failed`，`--check` 时还有 `would-install`、`would-update`；`reason` 说明需要安装的原因，`error` 说明失败原因，`warning` 表示已经装好但 `skills add` 返回了非零退出码。
- `skippedOptional`：未安装、本次跳过的可选条目。
- `extras`：标准目录中清单之外的 Skill，`lockSource` 是 lock 文件中记录的来源。
- `agentDirs`：每个目录的 `agent`、`kind`（`current` 当前目录，`former` 曾用目录）和 `state`：`linked` 指向标准目录、`missing` 不存在、`directory` 是真实目录（附 `entries`）、`other-link` 指向别处、`broken-link` 链接失效、`other` 是文件等。
- `errors`：清单、依赖、参数或目录表的问题。

退出码：

- `0`：全部成功。
- `1`：有条目失败，或 `errors` 不为空（如目录表无法读取）。安装可能已经部分完成，报告失败项和 `errors`。
- `2`：清单无效、依赖缺失或参数错误，未做任何修改。停止并报告 `errors`；点名的 Skill 不在清单中时也是这种情况。

## 日常更新

1. 不带参数运行脚本。
2. 按[链接 Agent 目录](#链接-agent-目录)处理 `agentDirs`。
3. `extras` 不为空时，列给用户，注明 `lockSource`，说明是否和清单中的 Skill 重复或冲突。用户同意后用 `npx skills remove --global --yes <name>` 删除。Windows 上这条命令完成后 Node 可能崩溃并返回非零退出码，以目录是否已删除为准。
4. 按[报告](#报告)回复用户。

## 点名安装

1. 用 `--only <name>[,<name>...]` 运行脚本。
2. 按[链接 Agent 目录](#链接-agent-目录)处理 `agentDirs`。
3. 按[报告](#报告)回复用户。

## 只检查

用 `--check` 运行脚本，不做任何修改。列出 `would-install`、`would-update` 的条目和原因，以及 `extras` 和 `agentDirs` 中需要处理的项，问用户要不要按日常更新安装。

## 完整安装

在日常更新的基础上，重新核实各 Agent 的目录，并清查各 Agent 目录里的个人 Skill。

1. 不带参数运行脚本。
2. **核实目录。** 对本机每个已安装的 Agent，核实它读取个人 Skill 的目录，不只依赖 [`agent-directories.md`](https://raw.githubusercontent.com/PosvdM/Skills/main/docs/agent-directories.md) 和报告中的 `agentDirs`。Agent 更新后目录可能变化，官方网页也可能滞后，核实方法按可靠程度依次为：实测（放一个临时测试 Skill，看 Agent 能否读到，测完删除）、Agent 自带的说明、官方网页。核实结果和表格不一致时，以核实结果为准。
3. 按[链接 Agent 目录](#链接-agent-目录)处理，使用核实后的目录。
4. **清理清单之外的 Skill。** 清单删除或改名的 Skill 会留在标准目录里，早期手动放进各 Agent 目录的个人 Skill 也可能还在，它们会和清单中的 Skill 同时加载。
   - 标准目录中的按[日常更新](#日常更新)第 3 步处理。
   - 检查每个已安装 Agent 的专用目录，包括原生读取标准目录的 Agent（如 Codex 的 `~/.codex/skills/`），列出其中既不由 Agent 管理、也不是指向标准目录的链接的 Skill，说明是否和清单中的 Skill 重复或冲突，征得用户同意后按用户选择删除或备份。
5. 按[报告](#报告)回复用户。

## 链接 Agent 目录

只处理本机实际安装了的 Agent：能找到程序或命令才算已安装，只有配置目录或空目录不算。原生读取 `~/.agents/skills/` 的 Agent 不需要链接，不在 `agentDirs` 中。

当前目录：

- `linked`：不用处理。
- `missing`：Agent 未安装就跳过；已安装就建立链接。
- 其他状态：先处理再建立链接。目录里混有系统、内置、插件等由 Agent 管理的 Skill 时，不要链接，跳过并报告。目录里有个人 Skill 时，先迁移到标准目录；已经指向标准目录的单个 Skill 链接，核实后可以删除。确认没有遗留后，再换成父目录链接。

建立链接时，把专用个人 Skills 目录整体链接到 `~/.agents/skills/`（macOS/Linux 用目录符号链接，Windows 用 Junction），每个 Agent 只建一个父目录链接。建好后确认链接指向标准目录，并能访问所有 Skill。

曾用目录，以及 Agent 已改为原生读取后留下的旧目录：

- 指向 `~/.agents/skills` 的符号链接或 Junction：删除。
- 真实目录等其他状态：不删除，在报告中列出。

## 报告

- 每个条目的结果，未安装的可选条目列出名称。
- 迁移、备份、删除的 Skill，新建和删除的链接，跳过项和失败项。
- 完整安装时核实结果和表格不一致的，列出 Agent、版本、实际目录和核实方法，供更新表格。
- 首次安装时告诉用户：已经装上 `my-skills`，以后说"更新我仓库的 skills"或"去我仓库装上 <name>"即可；有的 Agent 要开新会话才能加载新装的 Skill。
- 还有条目缺失或失败时，不要宣称已经完成。
