module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'comma-dangle': ['error', 'only-multiline'],
    indent: 'off',
    semi: ['error', 'never'],
    '@typescript-eslint/no-var-requires': 0,
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1,
      },
    ],
    'no-trailing-spaces': 'error',
    'no-console': [
      'error',
      {
        allow: ['warn', 'error'],
      },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'prettier/prettier': 'error',
  },
}
