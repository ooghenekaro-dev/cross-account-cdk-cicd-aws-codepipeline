import js from '@eslint/js'
import globals from 'globals'
import * as tseslint from '@typescript-eslint/eslint-plugin'

export default [
  // Base JS + global settings
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module'
      },
      globals: {
        ...globals.node,
        ...globals.es2022
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-console': 'off'
    }
  },

  // Apply ESLint recommended + TS rules
  ...(tseslint.configs.recommendedTypeChecked as any[])
]
