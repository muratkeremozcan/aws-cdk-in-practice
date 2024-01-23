module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:import/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './cypress/tsconfig.json'],
  },
  plugins: [
    '@typescript-eslint',
    'filenames',
    'implicit-dependencies',
    'no-only-tests',
  ],
  ignorePatterns: ['dist', 'node_modules', 'scripts', '**/*.d.ts'],
  root: true,
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'import/no-unresolved': 'off',
    'no-only-tests/no-only-tests': 'error',
    '@typescript-eslint/no-unused-vars': 'off',
    complexity: ['warn', 15],
    indent: ['error', 2, {SwitchCase: 1}],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
  },
}
