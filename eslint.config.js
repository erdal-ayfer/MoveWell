import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import hooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'output', '.playwright-cli'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': hooks },
    rules: { ...hooks.configs.recommended.rules },
  },
  { files: ['*.js'], languageOptions: { globals: globals.node } },
  {
    files: ['scripts/*.js'],
    languageOptions: { globals: globals.browser },
    // Playwright CLI reads this file as a function expression, not a module.
    rules: { '@typescript-eslint/no-unused-expressions': 'off' },
  },
)
