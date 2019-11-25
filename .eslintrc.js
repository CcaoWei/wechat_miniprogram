module.exports = {
  // reference: https://eslint.org/docs/rules/
  root: true,
  parserOptions: {
    sourceType: 'module',
      ecmaFeatures: {
          jsx: true,
      }
  },
  env: {
    browser: false,
    node: true,
  },
  globals: {
    wx: false,
    App: false,
    Page: false,
    Promise: false,
    getApp:false,
    getCurrentPages:false,
    Map:false,
    Component:false,
    Symbol:false

  },
  extends: 'eslint:recommended',
  // add your custom rules here
  'rules': {
    'no-console': 'off',
    'for-direction': 'error',
    'no-extra-parens': 'error',
    'no-semi': 'off',
    'block-scoped-var': 'error',
    'complexity': ['error', 300],
    // 'no-magic-numbers': 'error',
    'no-unused-expressions': 'error',
    'no-extra-parens':'off',
  }
}
