# Installation instructions

This repository is agent-agnostic. It is intended for Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI, and other clients supported by Agent Skills or the Skills CLI.

When asked to install this collection, run `./install.sh` from the repository root. Treat `sources.json` as the complete source of truth. Verify every listed skill has a `SKILL.md` under `$HOME/.agents/skills/`, and let the Skills CLI create compatibility links for supported agents.

Do not move or duplicate system or built-in skills managed by any agent. In particular, keep Codex-managed system skills in `$HOME/.codex/skills/.system/`.

Third-party skill source code is intentionally not vendored here. Install it from the URLs recorded in `sources.json`.
