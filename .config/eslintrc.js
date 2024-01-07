// @ts-check

/** @type {import('eslint/lib/linter/linter').ConfigData} */
const config = {
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  root: true,
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    // @ts-ignore
    EXPERIMENTAL_useProjectService: true,
    project: true,
  },
  settings: {
    react: {
      version: '18',
    },
  },
  overrides: [
    {
      files: '*.{js,ts,tsx}',
      extends: ['@sourcegraph/eslint-config', 'plugin:storybook/recommended', 'plugin:react/jsx-runtime'],
      rules: {
        'import/order': 'off',
        'import/export': 'off',
        'etc/no-deprecated': 'off', // slow
        'no-restricted-imports': 'off',
        'unicorn/switch-case-braces': 'off',
        'unicorn/prefer-event-target': 'off',
        'unicorn/prefer-dom-node-remove': 'off',
        'unicorn/filename-case': 'off',
        'ban/ban': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'jsx-a11y/anchor-has-content': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        'arrow-body-style': ['error', 'as-needed'],
        '@typescript-eslint/consistent-type-exports': [
          'error',
          {
            fixMixedExportsWithInlineTypeSpecifier: true,
          },
        ],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            fixStyle: 'inline-type-imports',
            disallowTypeAnnotations: false,
          },
        ],
        'jsdoc/tag-lines': ['error', 'always', { count: 0, startLines: 1, endLines: 0 }],
      },
    },
    {
      files: '*.story.ts?(x)',
      rules: {
        'react/forbid-dom-props': 'off',
        'import/no-default-export': 'off',
        'no-console': 'off',
      },
    },
    {
      files: ['vitest.workspace.ts', 'vite.config.ts', 'vitest.config.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      files: ['provider/**/index.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      files: ['provider/hello-world/*.ts', 'provider/storybook/*.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off', // makes for cleaner sample code
      },
    },
    {
      files: ['web/**/*.ts?(x)'],
      plugins: ['react-refresh'],
      rules: {
        'import/no-default-export': 'off',
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        'import/extensions': ['error', 'ignorePackages'],
      },
    },
    {
      files: ['provider/docs/**/*.ts'],
      rules: {
        'import/extensions': ['error', 'ignorePackages'],
      },
    },
    {
      files: ['**/*.mdx'],
      extends: ['plugin:mdx/recommended'],
    },
    {
      files: ['web/**/*.{mdx,ts,tsx}'],
      extends: ['plugin:tailwindcss/recommended'],
      rules: {
        'tailwindcss/classnames-order': 'warn',
      },
      settings: {
        tailwindcss: {
          config: 'web/tailwind.config.ts',
        },
      },
    },
  ],
  ignorePatterns: [
    'out/',
    'dist/',
    '*.schema.ts',
    '.eslintrc.js',
    'postcss.config.js',
    'vitest.config.ts',
    'vitest.workspace.ts',
    'vite.config.ts',
    'client/vscode/src/entrypoint/*',
    'client/vscode/test/fixtures/',
    '/coverage/',
    'testdata/',
    'web/src/components/ui', // shadcn components
    '*.mts',
  ],
}
module.exports = config
