// @ts-check
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/coverage/**', 'apps/api/src/generated/**', 'packages/contracts/src/schema.ts'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    extends: [reactHooks.configs.flat['recommended-latest'], reactRefresh.configs.vite],
  },
  {
    // The entry point renders the app and exports nothing.
    files: ['apps/web/src/main.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['apps/api/**/*.ts', '**/*.{js,mjs,cjs}', '**/*.config.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    // Scripts and seeds talk to the terminal on purpose.
    files: ['apps/api/prisma/seed.ts', '.claude/hooks/**', '**/scripts/**'],
    rules: { 'no-console': 'off' },
  },
  prettier,
);
