#!/usr/bin/env node
// PostToolUse (Edit|Write|MultiEdit): regenerates contract types when openapi.yaml changes.
// On failure, exit 2 so Claude sees the error and fixes the YAML.
import { execFileSync } from 'node:child_process';
import { relative } from 'node:path';

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let input = {};
  try {
    input = JSON.parse(raw || '{}');
  } catch {
    process.exit(0);
  }
  const filePath = input.tool_input?.file_path;
  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  if (!filePath || relative(root, filePath).split('\\').join('/') !== 'packages/contracts/openapi.yaml') {
    process.exit(0);
  }
  try {
    execFileSync('pnpm', ['contracts:generate'], { cwd: root, stdio: ['ignore', 'ignore', 'pipe'], timeout: 15000 });
  } catch (err) {
    console.error(`openapi.yaml no se pudo convertir a tipos:\n${err.stderr?.toString() ?? err.message}`);
    process.exit(2);
  }
  process.exit(0);
});
