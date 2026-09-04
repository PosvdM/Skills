#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skills_directory="${HOME}/.agents/skills"
manifest_file="${repository_root}/sources.json"
manifest_reader="${repository_root}/scripts/read-manifest.mjs"
mode="${1:-install}"

if [[ "${mode}" != "install" && "${mode}" != "--check" ]]; then
  echo "Usage: ./install.sh [--check]" >&2
  exit 1
fi

command -v node >/dev/null 2>&1 || {
  echo "Error: Node.js is required." >&2
  exit 1
}

manifest_entries="$(node "${manifest_reader}" "${manifest_file}" "${repository_root}")"

if [[ "${mode}" == "--check" ]]; then
  echo "Manifest is valid:"
  while IFS=$'\t' read -r skill_name skill_type skill_location; do
    echo "- ${skill_name} (${skill_type}: ${skill_location})"
  done <<< "${manifest_entries}"
  exit 0
fi

command -v git >/dev/null 2>&1 || {
  echo "Error: git is required." >&2
  exit 1
}

command -v npx >/dev/null 2>&1 || {
  echo "Error: Node.js and npm are required." >&2
  exit 1
}

mkdir -p "${skills_directory}"

expected_skills=()

while IFS=$'\t' read -r skill_name skill_type skill_location; do
  expected_skills+=("${skill_name}")
  skill_target="${skills_directory}/${skill_name}"

  if [[ -e "${skill_target}" || -L "${skill_target}" ]]; then
    backup_path="${skill_target}.backup-$(date +%Y%m%d-%H%M%S)"
    mv "${skill_target}" "${backup_path}"
    echo "Backed up existing ${skill_name} to ${backup_path}"
  fi

  if [[ "${skill_type}" == "bundled" ]]; then
    npx -y skills add "${repository_root}" \
      --skill "${skill_name}" --global --agent '*' --yes
  else
    npx -y skills add "${skill_location}" \
      --skill "${skill_name}" --global --agent '*' --yes
  fi
done <<< "${manifest_entries}"

missing=0
for skill_name in "${expected_skills[@]}"; do
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
