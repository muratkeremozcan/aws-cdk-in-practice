module.exports = {
  plugins: ['eslint-plugin-cypress'],
  extends: ['plugin:cypress/recommended'],
  rules: {
    'cypress/no-assigning-return-values': 'error',
    'cypress/no-unnecessary-waiting': 'error',
    'cypress/assertion-before-screenshot': 'warn',
    'cypress/no-async-tests': 'error',
    'cypress/no-pause': 'error',
    '@typescript-eslint/no-var-requires': 'off',
  },
  env: { 'cypress/globals': true },
  settings: {
    // allows for path aliases in TS
    'import/resolver': {
      typescript: {},
    },
  },
}
