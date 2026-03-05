// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const prettierConfig = require('eslint-config-prettier')
const reactNativePlugin = require('eslint-plugin-react-native')

module.exports = defineConfig([
  expoConfig,
  // React Native specific code-quality rules
  {
    plugins: {
      'react-native': reactNativePlugin,
    },
    rules: {
      'react-native/no-inline-styles': 'warn',
      'react-native/no-unused-styles': 'warn',
      'react-native/split-platform-components': 'warn',
    },
  },
  // TypeScript code-quality enhancements + import structure
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  // Must be last — disables all ESLint formatting rules so Prettier owns formatting
  prettierConfig,
  {
    ignores: [
      // Build output
      'dist/*',
      // Expo internals
      '/.expo',
      // Auto-generated declarations — must not be edited
      'expo-env.d.ts',
      // Tooling configs — not app code
      'metro.config.js',
      'eslint.config.js',
      // Non-JS project directories
      '/.claude',
      'diagrams',
      'supabase',
      'node_modules',
    ],
  },
])
