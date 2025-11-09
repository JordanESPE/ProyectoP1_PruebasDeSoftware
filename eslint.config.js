const js = require('@eslint/js');

module.exports = {
  files: [ 'src/**/*.js' ],
  languageOptions: {
    ecmaVersion: 2021,
    sourceType: 'commonjs'
  },
  rules: {
    ...js.configs.recommended.rules,
    semi: [ 'error', 'always' ],
    quotes: [ 'error', 'single' ],
  }
}
