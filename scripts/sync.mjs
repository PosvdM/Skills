#!/usr/bin/env node
// 按 sources.json 安装或更新个人 Skill，并检查各 Agent 的目录链接。用法见 docs/install.md。
// 进度写到 stderr，最后把 JSON 报告写到 stdout。
// 退出码：0 全部成功；1 有条目失败或 errors 不为空；2 清单无效、依赖缺失或参数错误，未做任何修改。

import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

const DEFAULT_REPO = 'https://github.com/PosvdM/Skills';
const isWindows = process.platform === 'win32';
const home = homedir();
const standardDir = join(home, '.agents', 'skills');
const lockPath = join(home, '.agents', '.skill-lock.json');

const report = { mode: 'update', repo: DEFAULT_REPO, skills: [], skippedOptional: [], extras: [], agentDirs: [], errors: [] };
const log = (msg) => process.stderr.write(`${msg}\n`);

function finish(code) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exit(code);
}

function fail(msg) {
  report.errors.push(msg);
  finish(2);
}

function parseArgs(argv) {
  const opts = { only: null, check: false, repo: DEFAULT_REPO };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--check') opts.check = true;
    else if (arg === '--only') opts.only = (argv[++i] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    else if (arg === '--repo') opts.repo = argv[++i];
    else fail(`未知参数：${arg}`);
  }
  if (opts.only && opts.only.length === 0) fail('--only 需要 Skill 名称，多个用逗号分隔');
  if (!opts.repo) fail('--repo 需要仓库地址或路径');
  if (!isSafeSource(opts.repo, true)) fail(`--repo 含有不支持的字符：${opts.repo}`);
  return opts;
}

// 来源会作为参数传给 git 和 npx。Windows 上 npx 要经过 cmd 运行，所以拒绝以 - 开头和含 shell 元字符的来源；
// 只有 --repo 允许空格（本地测试路径），运行时加引号。
function isSafeSource(source, allowSpaces = false) {
  if (typeof source !== 'string' || !source.trim() || source.startsWith('-')) return false;
  return !(allowSpaces ? /["&|<>^%!`$;()\r\n]/ : /[\s"&|<>^%!`$;()]/).test(source);
}

function run(cmd, args, options = {}) {
  // Windows 上 npx 是 .cmd 文件，需要经过 shell 运行；参数已由 isSafeSource 限制，这里给含空格的参数加引号。
  const shell = options.shell ?? isWindows;
  const finalArgs = shell ? args.map((a) => (/\s/.test(a) ? `"${a}"` : a)) : args;
  const res = spawnSync(cmd, finalArgs, { encoding: 'utf8', ...options, shell });
  return { ok: res.status === 0, status: res.status, stdout: res.stdout ?? '', stderr: res.stderr ?? '', error: res.error };
}

// 取命令输出的最后几行作为错误说明，去掉终端控制字符、框线和 npm 升级提示。
function tailOutput(res) {
  const text = `${res.stdout}\n${res.stderr}\n${res.error ?? ''}`
    .replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '')
    .split('\n')
    .map((l) => l.replace(/^[\s\u2502\u2514\u250c\u25c7\u25a0]+/, '').trim())
    .filter((l) => l && !l.startsWith('npm notice'));
  return text.slice(-3).join(' / ');
}

function hasCommand(cmd) {
  return run(cmd, ['--version']).ok;
}

// 比较时把 GitHub 地址统一成 owner/repo；其他来源按原样比较。
function sourceKey(source) {
  const s = String(source).trim().replace(/\.git$/, '').replace(/\/+$/, '');
  const m = s.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+)$/i) || s.match(/^([\w.-]+)\/([\w.-]+)$/);
  return (m ? `${m[1]}/${m[2]}` : s).toLowerCase();
}

function gitUrl(source) {
  return /^[\w.-]+\/[\w.-]+$/.test(source) ? `https://github.com/${source}` : source;
}

// 只拉目录树、不拉文件内容，用来读清单和计算 Skill 目录的 tree hash（与 skills CLI 记在 lock 文件里的 skillFolderHash 相同）。
const clones = new Map();
function cloneTrees(source) {
  const key = sourceKey(source);
  if (clones.has(key)) return clones.get(key);
  const dir = mkdtempSync(join(tmpdir(), 'skills-sync-'));
  const res = run('git', ['clone', '--quiet', '--depth', '1', '--filter=blob:none', '--no-checkout', '--', gitUrl(source), dir], { shell: false });
  const result = res.ok ? { dir } : { dir, error: (res.stderr || String(res.error)).trim() };
  clones.set(key, result);
  return result;
}

function gitShow(dir, spec) {
  const res = run('git', ['-C', dir, 'show', `HEAD:${spec}`], { shell: false });
  return res.ok ? res.stdout : null;
}

function treeHash(dir, folder) {
  // 仓库根目录的 Skill 用 HEAD^{tree}；HEAD:. 取不到根目录。
  const res = run('git', ['-C', dir, 'rev-parse', folder ? `HEAD:${folder}` : 'HEAD^{tree}'], { shell: false });
  return res.ok ? res.stdout.trim() : null;
}

function validateManifest(manifest) {
  const errors = [];
  if (manifest?.schemaVersion !== 3) errors.push('schemaVersion 不是 3');
  if (!Array.isArray(manifest?.skills)) return [...errors, '缺少 skills 数组'];
  const seen = new Set();
  manifest.skills.forEach((s, i) => {
    const where = `skills[${i}]`;
    if (typeof s !== 'object' || s === null || Array.isArray(s)) {
      errors.push(`${where} 不是对象`);
      return;
    }
    if (typeof s?.name !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.name)) errors.push(`${where}.name 不是非空的小写 kebab-case`);
    else if (seen.has(s.name)) errors.push(`${where}.name 重复：${s.name}`);
    else seen.add(s.name);
    if (s?.type !== 'bundled' && s?.type !== 'external') errors.push(`${where}.type 必须是 bundled 或 external`);
    if (s?.type === 'external' && (typeof s.source !== 'string' || !s.source.trim())) errors.push(`${where}.source 不能为空`);
    else if (s?.type === 'external' && !isSafeSource(s.source)) errors.push(`${where}.source 含有不支持的字符或以 - 开头`);
    if ('optional' in s && typeof s.optional !== 'boolean') errors.push(`${where}.optional 必须是布尔值`);
  });
  return errors;
}

function readLock() {
  try {
    return JSON.parse(readFileSync(lockPath, 'utf8')).skills ?? {};
  } catch {
    return {};
  }
}

function frontmatterName(file) {
  try {
    const fm = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const m = fm?.[1].match(/^name:\s*(.+?)\s*$/m);
    return m ? m[1].replace(/^(["'])(.*)\1$/, '$2') : null;
  } catch {
    return null;
  }
}

const isInstalled = (name) => existsSync(join(standardDir, name, 'SKILL.md'));

// 判断一个已安装的条目是否需要重装：不在 lock 中、来源变了、上游目录不见了或 hash 不同时都重装。
function needsInstall(entry, lock) {
  if (!isInstalled(entry.name)) return '未安装';
  const locked = lock[entry.name];
  if (!locked) return 'lock 文件中没有记录';
  if (sourceKey(locked.sourceUrl || locked.source) !== sourceKey(entry.source)) return `来源由 ${locked.source} 改为 ${entry.source}`;
  if (!/^[0-9a-f]{40}$/i.test(locked.skillFolderHash ?? '') || !locked.skillPath) return 'lock 文件中没有目录 hash';
  const clone = cloneTrees(entry.source);
  if (clone.error) return `无法读取上游，直接重装（${clone.error.split('\n')[0]}）`;
  const folder = locked.skillPath.replace(/\\/g, '/').replace(/\/?SKILL\.md$/i, '');
  const latest = treeHash(clone.dir, folder);
  if (!latest) return '上游目录位置变了';
  return latest === locked.skillFolderHash ? null : '上游有更新';
}

// 从 agent-directories.md 的表格读出各 Agent 的当前目录和曾用目录。
function parseAgentDirs(markdown) {
  const rows = [];
  for (const line of markdown.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 4 || cells[0] === 'Agent' || /^-+$/.test(cells[0])) continue;
    // 去掉结尾的斜杠，否则 lstat 会跟随链接，把链接当成目录。
    const paths = (cell) => [...cell.matchAll(/`(~[/\\][^`]*)`/g)].map((m) => join(home, m[1].slice(2)).replace(/[/\\]+$/, ''));
    rows.push({ agent: cells[0], current: paths(cells[2]), former: paths(cells[3]) });
  }
  return rows;
}

function dirState(dir) {
  let stat;
  try {
    stat = lstatSync(dir);
  } catch {
    return { state: 'missing' };
  }
  if (stat.isSymbolicLink()) {
    try {
      const target = realpathSync(dir);
      return { state: target === realpathSync(standardDir) ? 'linked' : 'other-link', target };
    } catch {
      return { state: 'broken-link' };
    }
  }
  if (stat.isDirectory()) return { state: 'directory', entries: readdirSync(dir) };
  return { state: 'other' };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  report.mode = opts.check ? 'check' : opts.only ? 'only' : 'update';
  report.repo = opts.repo;

  for (const cmd of ['git', 'npx']) if (!hasCommand(cmd)) report.errors.push(`缺少依赖：${cmd}`);
  if (report.errors.length) finish(2);

  log(`读取清单：${opts.repo}`);
  const repo = cloneTrees(opts.repo);
  if (repo.error) fail(`无法读取仓库 ${opts.repo}：${repo.error}`);
  let manifest;
  try {
    manifest = JSON.parse(gitShow(repo.dir, 'sources.json') ?? '');
  } catch {
    fail('sources.json 不存在或不是有效的 JSON');
  }
  const manifestErrors = validateManifest(manifest);
  if (manifestErrors.length) {
    report.errors.push(...manifestErrors);
    finish(2);
  }

  const entries = manifest.skills.map((s) => ({ name: s.name, type: s.type, optional: s.optional === true, source: s.type === 'bundled' ? opts.repo : s.source }));
  const names = new Set(entries.map((e) => e.name));
  let scope;
  if (opts.only) {
    const unknown = opts.only.filter((n) => !names.has(n));
    if (unknown.length) fail(`清单中没有这些 Skill：${unknown.join(', ')}`);
    scope = entries.filter((e) => opts.only.includes(e.name));
  } else {
    scope = entries.filter((e) => !e.optional || isInstalled(e.name));
    report.skippedOptional = entries.filter((e) => e.optional && !isInstalled(e.name)).map((e) => e.name);
  }

  const lock = readLock();
  const results = new Map();
  for (const entry of scope) {
    log(`检查 ${entry.name}`);
    const reason = needsInstall(entry, lock);
    results.set(entry.name, { name: entry.name, type: entry.type, optional: entry.optional, status: reason ? 'pending' : 'up-to-date', reason: reason ?? undefined });
  }

  // 同一来源的条目合并成一次安装，只 clone 一次上游仓库。
  const bySource = new Map();
  for (const entry of scope) {
    if (results.get(entry.name).status !== 'pending') continue;
    const key = sourceKey(entry.source);
    if (!bySource.has(key)) bySource.set(key, { source: entry.source, items: [] });
    bySource.get(key).items.push(entry);
  }
  for (const { source, items } of bySource.values()) {
    const list = items.map((e) => e.name);
    if (opts.check) {
      for (const n of list) results.get(n).status = isInstalled(n) ? 'would-update' : 'would-install';
      continue;
    }
    log(`安装 ${list.join(', ')}（${source}）`);
    const before = new Map(list.map((n) => [n, isInstalled(n)]));
    const startedAt = Date.now() - 1000;
    const res = run('npx', ['-y', 'skills', 'add', source, '--skill', ...list, '--global', '--yes', '--agent', 'universal']);
    const lockAfter = readLock();
    const exitInfo = `skills add 退出码 ${res.status}：${tailOutput(res)}`;
    for (const n of list) {
      const r = results.get(n);
      const name = frontmatterName(join(standardDir, n, 'SKILL.md'));
      const locked = lockAfter[n];
      // 旧文件可能还在，所以以 lock 文件在本次安装中更新、来源一致为准，不只看退出码或文件是否存在。
      const lockUpdated = locked && Date.parse(locked.updatedAt) >= startedAt && sourceKey(locked.sourceUrl || locked.source) === sourceKey(source);
      if (name !== n || !lockUpdated) {
        r.status = 'failed';
        r.error = name !== n ? (name ? `SKILL.md 的 name 是 ${name}` : `没有 ~/.agents/skills/${n}/SKILL.md`) : 'lock 文件没有记录本次安装';
        if (!res.ok) r.error += `；${exitInfo}`;
      } else {
        r.status = before.get(n) ? 'updated' : 'installed';
        if (!res.ok) r.warning = `已安装，但 ${exitInfo}`;
      }
    }
  }

  // 已安装条目也核对 frontmatter 中的 name。
  for (const r of results.values()) {
    if (r.status !== 'up-to-date') continue;
    const name = frontmatterName(join(standardDir, r.name, 'SKILL.md'));
    if (name !== r.name) Object.assign(r, { status: 'failed', error: `SKILL.md 的 name 是 ${name ?? '空'}` });
  }
  report.skills = [...results.values()];

  if (!opts.only) {
    const lockNow = readLock();
    report.extras = (existsSync(standardDir) ? readdirSync(standardDir, { withFileTypes: true }) : [])
      .filter((d) => (d.isDirectory() || d.isSymbolicLink()) && !d.name.startsWith('.') && !names.has(d.name))
      .map((d) => ({ name: d.name, lockSource: lockNow[d.name]?.source ?? null }));
  }

  const table = gitShow(repo.dir, 'docs/agent-directories.md');
  if (!table) report.errors.push('无法读取 docs/agent-directories.md，没有检查 Agent 目录');
  else {
    const rows = parseAgentDirs(table);
    if (!rows.length) report.errors.push('docs/agent-directories.md 中没有解析出表格');
    for (const row of rows) {
      for (const [kind, dirs] of [['current', row.current], ['former', row.former]]) {
        for (const dir of dirs) report.agentDirs.push({ agent: row.agent, kind, dir, ...dirState(dir) });
      }
    }
  }

  finish(report.skills.some((s) => s.status === 'failed') || report.errors.length ? 1 : 0);
}

process.on('exit', () => {
  for (const { dir } of clones.values()) rmSync(dir, { recursive: true, force: true });
});

main();
