# Installation instructions

When asked to install this collection, run `./install.sh` from the repository root and verify that `direct-writing`, `find-skills`, `docx`, and `pdf` each have a `SKILL.md` under `$HOME/.agents/skills/`.

Keep Codex-managed system skills in `$HOME/.codex/skills/.system/`. Do not move or duplicate system skills into the personal skills directory.

Third-party skill source code is intentionally not vendored here. Install it from the URLs recorded in `sources.json`.
