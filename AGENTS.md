# Personal skill installation

Install every personal Skill declared in `sources.json`. These instructions are agent-agnostic and apply to Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI, and other clients supported by Agent Skills or the Skills CLI.

## Rules

- Treat `sources.json` as the complete source of truth. Never rely on a fixed count or hard-coded list of Skill names.
- Store canonical copies under `~/.agents/skills/`. On Windows, resolve `~` to the current user's profile directory.
- Install only personal Skills declared in `sources.json`.
- Do not move, copy, replace, or delete system and built-in Skills managed by any agent. Keep Codex system Skills in `~/.codex/skills/.system/`.
- Use the Skills CLI in global scope and let it auto-detect installed agents. Never pass `--agent '*'`; it can create directories, symlinks, or Windows Junctions for agents that are not installed.
- Agents that read `~/.agents/skills/` natively need no compatibility link. Create a link only when the current installed agent requires its own Skills directory.
- If auto-detection misses the current agent, verify that the client is installed and requires a separate directory, then specify only that agent with `--agent <current-agent>`.
- Do not create directories or links for absent agents.
- If an existing same-named personal Skill differs from the requested version, preserve it with a clearly named backup before replacing it.

## Procedure

1. Read and validate every entry in `sources.json`. Names must be unique, and each entry must have type `bundled` or `external`.
2. Check for Git, Node.js, npm, and `npx`. If a required dependency is missing, explain what is needed and obtain permission before installing software.
3. For each `bundled` entry, confirm that its repository path contains `SKILL.md`, then install it from this repository:

   ```bash
   npx -y skills add https://github.com/PosvdM/skills --skill <name> --global --yes
   ```

4. For each `external` entry, install the named Skill from its recorded source. Third-party source code is intentionally not vendored here:

   ```bash
   npx -y skills add <source> --skill <name> --global --yes
   ```

5. Do not add `--agent` when automatic detection is correct. Apply the exception in the rules only when detection misses the verified current agent.
6. Iterate over every manifest entry and verify that `~/.agents/skills/<name>/SKILL.md` exists. Also confirm that any compatibility link created during this run belongs to an installed agent and resolves to the canonical copy.
7. Report the result for every manifest entry. Include any skipped Skill, backup, failed installation, or compatibility link. Do not claim completion while an entry is missing.
