# Installation instructions

This repository is agent-agnostic. It is intended for Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI, and other clients supported by Agent Skills or the Skills CLI.

When asked to install this collection, treat `sources.json` as the complete source of truth. Do not rely on a fixed skill count or hard-coded skill names.

For every `bundled` entry, install the named skill from this repository. For every `external` entry, install the named skill from its `source`. Use the Skills CLI with global scope and all supported agents so the canonical copy is stored under `$HOME/.agents/skills/`; agents that do not read that directory natively may receive compatibility symlinks in their own skill directories.

After installation, iterate over every entry in `sources.json` and verify that `$HOME/.agents/skills/<name>/SKILL.md` exists. Report success or failure for every listed skill.

Do not move or duplicate system or built-in skills managed by any agent. In particular, keep Codex-managed system skills in `$HOME/.codex/skills/.system/`.

Third-party skill source code is intentionally not vendored here. Install it from the URLs recorded in `sources.json`.
