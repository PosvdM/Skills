#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const [manifestArgument, repositoryArgument] = process.argv.slice(2);

if (!manifestArgument || !repositoryArgument) {
  console.error("Usage: read-manifest.mjs <sources.json> <repository-root>");
  process.exit(1);
}

const manifestPath = path.resolve(manifestArgument);
const repositoryRoot = path.resolve(repositoryArgument);

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch (error) {
  console.error(`Cannot read ${manifestPath}: ${error.message}`);
  process.exit(1);
}

if (manifest.schemaVersion !== 1) {
  console.error("sources.json must use schemaVersion 1.");
  process.exit(1);
}

if (manifest.installDirectory !== "$HOME/.agents/skills") {
  console.error('installDirectory must be "$HOME/.agents/skills".');
  process.exit(1);
}

if (!Array.isArray(manifest.skills) || manifest.skills.length === 0) {
  console.error("sources.json must contain at least one skill.");
  process.exit(1);
}

const seenNames = new Set();
const rows = [];

for (const [index, skill] of manifest.skills.entries()) {
  const label = `skills[${index}]`;

  if (!skill || typeof skill !== "object") {
    console.error(`${label} must be an object.`);
    process.exit(1);
  }

  if (typeof skill.name !== "string" || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(skill.name)) {
    console.error(`${label}.name must contain lowercase letters, digits, or hyphens.`);
    process.exit(1);
  }

  if (seenNames.has(skill.name)) {
    console.error(`Duplicate skill name: ${skill.name}`);
    process.exit(1);
  }
  seenNames.add(skill.name);

  if (skill.type === "bundled") {
    if (typeof skill.path !== "string" || /[\t\r\n]/.test(skill.path)) {
      console.error(`${label}.path must be a valid repository-relative path.`);
      process.exit(1);
    }

    const skillDirectory = path.resolve(repositoryRoot, skill.path);
    const relativePath = path.relative(repositoryRoot, skillDirectory);
    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      console.error(`${label}.path must stay inside the repository.`);
      process.exit(1);
    }

    if (!fs.existsSync(path.join(skillDirectory, "SKILL.md"))) {
      console.error(`Missing SKILL.md for bundled skill ${skill.name}: ${skill.path}`);
      process.exit(1);
    }

    rows.push([skill.name, skill.type, skill.path]);
    continue;
  }

  if (skill.type === "external") {
    if (typeof skill.source !== "string" || skill.source.length === 0 || /[\t\r\n]/.test(skill.source)) {
      console.error(`${label}.source must be a valid Skills CLI package or URL.`);
      process.exit(1);
    }

    rows.push([skill.name, skill.type, skill.source]);
    continue;
  }

  console.error(`${label}.type must be "bundled" or "external".`);
  process.exit(1);
}

for (const row of rows) {
  console.log(row.join("\t"));
}
