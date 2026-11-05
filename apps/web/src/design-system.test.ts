// @vitest-environment node
/**
 * Guards the design system: only styles/tokens.css may hold literal colors or raw MAO palette tokens.
 * Components and pages must use semantic tokens (var(--color-*), var(--space-*), …).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('.', import.meta.url));
const ALLOWED = new Set(['styles/tokens.css']);

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

const sources: Record<string, string> = Object.fromEntries(
  walk(SRC)
    .map((file) => relative(SRC, file))
    .filter((file) => /\.(css|ts|tsx)$/.test(file) && !/\.test\.tsx?$/.test(file) && !ALLOWED.has(file))
    .map((file) => [file, readFileSync(join(SRC, file), 'utf8')]),
);

const LITERAL_COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;
const RAW_TOKEN = /--mao-[a-z0-9-]+/;

function offenders(pattern: RegExp) {
  return Object.entries(sources).flatMap(([file, text]) =>
    text
      .split('\n')
      .map((line, i) => ({ file, line: i + 1, text: line.trim() }))
      .filter(({ text }) => pattern.test(text)),
  );
}

describe('design system', () => {
  it('scans the source files', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(10);
  });

  it('has no literal colors outside tokens.css', () => {
    expect(offenders(LITERAL_COLOR)).toEqual([]);
  });

  it('uses no raw MAO palette tokens outside tokens.css', () => {
    expect(offenders(RAW_TOKEN)).toEqual([]);
  });
});
