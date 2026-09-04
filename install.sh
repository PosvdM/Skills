#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skills_directory="${HOME}/.agents/skills"
bundled_target="${skills_directory}/direct-writing"

command -v git >/dev/null 2>&1 || {
  echo "Error: git is required." >&2
  exit 1
}

command -v npx >/dev/null 2>&1 || {
  echo "Error: Node.js and npm are required." >&2
  exit 1
}

mkdir -p "${skills_directory}"

if [[ -e "${bundled_target}" ]]; then
  backup_path="${bundled_target}.backup-$(date +%Y%m%d-%H%M%S)"
  mv "${bundled_target}" "${backup_path}"
  echo "Backed up existing direct-writing to ${backup_path}"
fi

npx -y skills add "${repository_root}" \
  --skill direct-writing --global --agent '*' --yes

npx -y skills add https://github.com/vercel-labs/skills \
  --skill find-skills --global --agent '*' --yes

npx -y skills add https://github.com/anthropics/skills \
  --skill docx pdf --global --agent '*' --yes

missing=0
for skill_name in direct-writing find-skills docx pdf; do
  skill_file="${skills_directory}/${skill_name}/SKILL.md"
  if [[ -f "${skill_file}" ]]; then
    echo "OK: ${skill_file}"
  else
    echo "Missing: ${skill_file}" >&2
    missing=1
  fi
done

if [[ "${missing}" -ne 0 ]]; then
  echo "Installation did not produce every expected skill." >&2
  exit 1
fi

echo "All personal skills are installed in ${skills_directory}."
