#!/usr/bin/env node
// PreToolUse (Edit|Write|MultiEdit): blocks edits to secrets, generated code and applied migrations.
// Exit code 2 blocks the tool call and sends stderr back to Claude.
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
  if (!filePath) process.exit(0);

  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const rel = relative(root, filePath).split('\\').join('/');

  const block = (reason) => {
    console.error(`Bloqueado por .claude/hooks/block-secrets.mjs: ${reason} (${rel}).`);
    process.exit(2);
  };

  const name = rel.split('/').pop() ?? '';
  if (/^\.env(\..+)?$/.test(name) && name !== '.env.example') {
    block('los archivos .env tienen secretos; cambia .env.example y pide al usuario que actualice su .env');
  }
  if (rel.startsWith('apps/api/src/generated/')) {
    block('es código generado por Prisma; cambia schema.prisma y corre prisma generate');
  }
  if (rel === 'packages/contracts/src/schema.ts') {
    block('es código generado; cambia openapi.yaml y corre pnpm contracts:generate');
  }
  if (/^apps\/api\/prisma\/migrations\/[^/]+\/migration\.sql$/.test(rel)) {
    // New, untracked migrations may be edited (to add CHECK constraints); committed ones may not.
    try {
      execFileSync('git', ['ls-files', '--error-unmatch', rel], { cwd: root, stdio: 'ignore' });
      block('esta migración ya está en git; crea una migración nueva en lugar de editarla');
    } catch {
      // not tracked yet: allowed
    }
  }
  process.exit(0);
});
