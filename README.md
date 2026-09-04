# Personal Skills

这是我的个人 Skills 清单和安装入口。目标目录固定为：

```text
$HOME/.agents/skills/
```

Codex 管理的系统 Skills 不在本仓库中，也不会被安装脚本移动或复制。

## 包含的 Skills

| Skill | 保存方式 | 来源 |
| --- | --- | --- |
| `direct-writing` | 完整文件 | 本仓库 [`skills/direct-writing`](skills/direct-writing) |
| `find-skills` | 仅保存安装链接 | [skills.sh](https://www.skills.sh/vercel-labs/skills/find-skills) · [GitHub](https://github.com/vercel-labs/skills/tree/main/skills/find-skills) |
| `docx` | 仅保存安装链接 | [GitHub](https://github.com/anthropics/skills/tree/main/skills/docx) |
| `pdf` | 仅保存安装链接 | [GitHub](https://github.com/anthropics/skills/tree/main/skills/pdf) |

第三方 Skills 始终从原作者仓库安装，本仓库不复制它们的源文件。

## 在新电脑上安装

前提：macOS 已安装 Git、Node.js 和 npm。`npx` 会自动运行 Skills CLI，无需单独安装该 CLI。

```bash
git clone https://github.com/PosvdM/skills.git
cd skills
./install.sh
```

安装脚本会：

1. 从本仓库复制 `direct-writing`；
2. 从 `vercel-labs/skills` 安装 `find-skills`；
3. 从 `anthropics/skills` 安装 `docx` 和 `pdf`；
4. 检查四个 Skills 是否全部位于 `$HOME/.agents/skills/`。

如果目标目录中已有 `direct-writing`，脚本会先保存带时间戳的备份，再安装仓库版本。

## 直接交给 ChatGPT/Codex

在新的 ChatGPT 应用中发送下面这句话：

```text
请打开 https://github.com/PosvdM/skills，按照 README 运行 install.sh，把仓库列出的全部个人 Skills 安装到 ~/.agents/skills/。不要移动或复制 Codex 系统 Skills。完成后检查 direct-writing、find-skills、docx、pdf 四个目录及各自的 SKILL.md。
```

如果仓库是私有的，需要先在新电脑上登录有权访问该仓库的 GitHub 账号。

## 单独安装第三方 Skills

```bash
npx -y skills add https://github.com/vercel-labs/skills --skill find-skills --global --yes --copy
npx -y skills add https://github.com/anthropics/skills --skill docx pdf --global --yes --copy
```

来源详情见 [`sources.json`](sources.json)。
