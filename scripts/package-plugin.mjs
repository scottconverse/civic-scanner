#!/usr/bin/env node
import { existsSync, mkdirSync, realpathSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { install } from './install-skill.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function packagePlugin(outputRoot, { force = false } = {}) {
  if (!isAbsolute(outputRoot)) throw new Error('--out must be an absolute directory');
  const out = resolve(outputRoot);
  if (out === root || root.startsWith(out + '\\') || root.startsWith(out + '/')) throw new Error('Output must not contain the source repository');
  if (existsSync(out)) {
    if (!force) throw new Error(`${out} already exists; inspect it before using --force`);
    const backup = `${out}.backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    renameSync(out, backup);
    console.log(`Previous package saved at ${backup}`);
  }
  const pluginRoot = join(out, 'plugins', 'civic-scanner');
  mkdirSync(pluginRoot, { recursive: true });
  install({ target: 'codex', dest: join(pluginRoot, 'skills') });
  const manifest = {
    $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
    name: 'civic-scanner',
    version: '2.4.0',
    description: 'Source-grounded scan of a citywide civic landscape and meeting actions for local reporting.',
    repository: 'https://github.com/scottconverse/civic-scanner',
    extensions: { 'com.openai': { interface: {
      displayName: 'Civic Scanner',
      shortDescription: 'Scan local government records and meetings.',
      longDescription: 'Find and verify developments across local civic beats, with a complete action ledger for relevant public meetings.',
      developerName: 'Scott Converse',
      category: 'Productivity',
      capabilities: ['Read'],
      websiteURL: 'https://github.com/scottconverse/civic-scanner',
      defaultPrompt: ['Use Civic Scanner to run a daily scan for Longmont, Colorado.'],
    } } },
  };
  writeFileSync(join(pluginRoot, 'plugin.json'), JSON.stringify(manifest, null, 2) + '\n');
  const marketplaceDir = join(out, '.agents', 'plugins');
  mkdirSync(marketplaceDir, { recursive: true });
  const marketplace = {
    name: 'civic-scanner-local',
    interface: { displayName: 'Civic Scanner' },
    plugins: [{ name: 'civic-scanner', source: { source: 'local', path: './plugins/civic-scanner' }, policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' }, category: 'Productivity' }],
  };
  writeFileSync(join(marketplaceDir, 'marketplace.json'), JSON.stringify(marketplace, null, 2) + '\n');
  if (!existsSync(join(pluginRoot, 'skills', 'civic-scanner', 'SKILL.md'))) throw new Error('Plugin skill bundle missing');
  return { outputRoot: realpathSync(out), pluginRoot };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    let out = join(root, 'dist');
    let force = false;
    for (let i = 2; i < process.argv.length; i++) {
      if (process.argv[i] === '--out') out = process.argv[++i];
      else if (process.argv[i] === '--force') force = true;
      else throw new Error('Usage: node scripts/package-plugin.mjs [--out ABSOLUTE_DIR] [--force]');
    }
    const result = packagePlugin(out, { force });
    console.log(`Built local ChatGPT/Codex plugin marketplace at ${result.outputRoot}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
