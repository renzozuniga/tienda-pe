// Conventional Commits. Scopes are optional; when used, they name the area touched.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['web', 'api', 'contracts', 'db', 'docs', 'ci', 'deps', 'claude']],
    'body-max-line-length': [1, 'always', 120],
  },
};
