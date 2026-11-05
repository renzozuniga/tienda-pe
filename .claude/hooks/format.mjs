#!/usr/bin/env node
// PostToolUse (Edit|Write|MultiEdit): formats only the edited file with Prettier. Never blocks.
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw || '{}');
    const filePath = input.tool_input?.file_path;
    if (!filePath || !/\.(tsx?|jsx?|mjs|css|json|md|ya?ml)$/.test(filePath)) return;
    const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
    const prettier = join(root, 'node_modules', '.bin', 'prettier');
    execFileSync(prettier, ['--write', '--ignore-unknown', '--log-level', 'warn', filePath], {
      cwd: root,
      stdio: ['ignore', 'ignore', 'inherit'],
      timeout: 5000,
    });
  } catch {
    // Formatting is best effort; lint-staged and CI catch the rest.
  }
});
