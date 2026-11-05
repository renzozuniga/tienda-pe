#!/usr/bin/env node
// Stop: runs the typecheck before Claude ends its turn, but only if TypeScript files changed.
// Exit code 2 keeps Claude working and shows it the errors. stop_hook_active prevents loops.
import { execFileSync } from 'node:child_process';

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let input = {};
  try {
    input = JSON.parse(raw || '{}');
  } catch {
    process.exit(0);
  }
  if (input.stop_hook_active) process.exit(0);

  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  let changed = '';
  try {
    changed = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
  } catch {
    process.exit(0);
  }
  if (!/\.(tsx?|mts)$/m.test(changed) && !/openapi\.yaml$/m.test(changed)) process.exit(0);

  try {
    execFileSync('pnpm', ['typecheck'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 });
  } catch (err) {
    const all = `${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`.split('\n');
    const errors = all.filter((line) => /error TS\d+/.test(line));
    const out = (errors.length ? errors : all).slice(-40);
    console.error(`pnpm typecheck falló. Corrige estos errores antes de terminar:\n${out.join('\n')}`);
    process.exit(2);
  }
  process.exit(0);
});
