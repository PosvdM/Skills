# Personal skill installation

Install every personal Skill declared in `sources.json`. These instructions are agent-agnostic and apply to Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI, and other clients supported by Agent Skills or the Skills CLI.

## Rules

- Treat `sources.json` as the complete source of truth. Never rely on a fixed count or hard-coded list of Skill names.
- Store canonical copies under `~/.agents/skills/`. On Windows, resolve `~` to the current user's profile directory.
- Install only personal Skills declared in `sources.json`.
- Do not move, copy, replace, or delete system and built-in Skills managed by any agent. Keep Codex system Skills in `~/.codex/skills/.system/`.
- Use the Skills CLI in global scope with `--agent universal`. This installs canonical copies in `~/.agents/skills/` without creating per-Skill compatibility links. Never pass `--agent '*'`.
- Agents that read `~/.agents/skills/` natively need no compatibility link.
- For each installed agent that requires its own personal Skills directory, link that entire directory to `~/.agents/skills/`: use a directory symlink on macOS/Linux or a directory Junction on Windows. Create one parent-directory link per installed agent, never one link per Skill.
- Link only a documented, dedicated personal Skills directory. Do not link or replace a directory that contains system, built-in, enterprise, plugin, project, or other agent-managed Skills.
- Do not create directories or links for absent agents.
- Before replacing an existing personal Skills directory with a parent-directory link, migrate any personal Skills it contains into `~/.agents/skills/`. Existing per-Skill links that already resolve into the canonical directory may be removed after verification. Preserve conflicts with clearly named backups. Remove the old directory only after confirming that nothing remains outside the canonical directory.

## Procedure

1. Read and validate every entry in `sources.json`. Names must be unique, and each entry must have type `bundled` or `external`.
2. Check for Git, Node.js, npm, and `npx`. If a required dependency is missing, explain what is needed and obtain permission before installing software.
3. For each `bundled` entry, confirm that its repository path contains `SKILL.md`, then install it from this repository:

   ```bash
   npx -y skills add https://github.com/PosvdM/skills --skill <name> --global --yes --agent universal
   ```

4. For each `external` entry, install the named Skill from its recorded source. Third-party source code is intentionally not vendored here:

   ```bash
   npx -y skills add <source> --skill <name> --global --yes --agent universal
   ```

5. Detect which agents are actually installed. For each non-native agent, identify its documented personal Skills directory and apply the parent-directory link rules above. Do not rely on the presence of a newly created empty directory as evidence that an agent is installed.
6. Iterate over every manifest entry and verify that `~/.agents/skills/<name>/SKILL.md` exists. Confirm that each compatibility link created during this run belongs to an installed agent, targets the canonical parent directory, and exposes every canonical Skill.
7. Report the result for every manifest entry. Include any migrated Skill, backup, skipped link, failed installation, or compatibility link. Do not claim completion while an entry is missing.
