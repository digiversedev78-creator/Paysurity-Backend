// apps/api/.eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', "unused-imports"],
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': ['warn', { 'vars': 'all', 'varsIgnorePattern': '^_', 'args': 'after-used', 'argsIgnorePattern': '^_' }],
    '@typescript-eslint/no-unused-vars': 'off',
    'no-console': 'warn', // Warn for console logs
    'no-unused-vars': 'off', // Disable the base ESLint rule
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Enable TypeScript-specific unused vars rule as error
    '@typescript-eslint/no-explicit-any': 'warn', // Warn for explicit any
    'no-process-exit': 'error', // Error for process.exit
  },
};
