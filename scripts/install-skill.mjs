#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, realpathSync, renameSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const targetDirs = {
  claude: '.claude/skills',
  codex: '.codex/skills',
  gemini: '.gemini/skills',
  grok: '.grok/skills',
  deepcode: '.agents/skills',
};

function usage() {
  return 'Usage: node scripts/install-skill.mjs --target claude|codex|gemini|grok|deepcode [--dest ABSOLUTE_PARENT_DIR] [--dry-run] [--force]';
}

function parse(args) {
  const options = { dryRun: false, force: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--target' || arg === '--dest') options[arg.slice(2)] = args[++i];
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--force') options.force = true;
    else throw new Error(`Unknown option: ${arg}\n${usage()}`);
  }
  if (!targetDirs[options.target]) throw new Error(usage());
  if (options.dest && !isAbsolute(options.dest)) throw new Error('--dest must be an absolute parent directory');
  return options;
}

export function install(options) {
  if (!targetDirs[options.target]) throw new Error(usage());
  const parent = resolve(options.dest ?? join(homedir(), targetDirs[options.target]));
  const destination = join(parent, 'civic-scanner');
  if (destination === root || root.startsWith(destination + '\\') || root.startsWith(destination + '/')) {
    throw new Error('Destination overlaps the source repository');
  }
  if (existsSync(destination) && !options.force) {
    throw new Error(`${destination} already exists; inspect it before using --force`);
  }
  if (options.dryRun) return { destination, dryRun: true };
  mkdirSync(parent, { recursive: true });
  if (existsSync(destination)) {
    const backup = `${destination}.backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    renameSync(destination, backup);
    console.log(`Previous installation saved at ${backup}`);
  }
  mkdirSync(destination);
  cpSync(join(root, 'SKILL.md'), join(destination, 'SKILL.md'));
  cpSync(join(root, 'references'), join(destination, 'references'), {
    recursive: true,
    filter: (source) => !basename(source).endsWith('-beat-memory.json'),
  });
  mkdirSync(join(destination, 'scripts'));
  cpSync(join(root, 'scripts', 'transcript-ledger.mjs'), join(destination, 'scripts', 'transcript-ledger.mjs'));
  cpSync(join(root, 'scripts', 'check-coverage.mjs'), join(destination, 'scripts', 'check-coverage.mjs'));
  cpSync(join(root, 'scripts', 'reddit_extract.py'), join(destination, 'scripts', 'reddit_extract.py'));
  cpSync(join(root, 'scripts', 'reddit_extract.LICENSE'), join(destination, 'scripts', 'reddit_extract.LICENSE'));
  cpSync(join(root, 'build-report.js'), join(destination, 'build-report.js'));
  cpSync(join(root, 'report-schema.json'), join(destination, 'report-schema.json'));
  const installed = readFileSync(join(destination, 'SKILL.md'), 'utf8');
  if (!installed.startsWith('---\nname: civic-scanner\n')) throw new Error('Installed SKILL.md failed verification');
  return { destination: realpathSync(destination), dryRun: false };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = install(parse(process.argv.slice(2)));
    console.log(`${result.dryRun ? 'Would install' : 'Installed'} civic-scanner at ${result.destination}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
