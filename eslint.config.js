const nodePlugin = require('eslint-plugin-node');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        // Node.js globals
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Jest globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 2021,
      },
    },
    files: ['**/*.js'],
    plugins: {
      node: nodePlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Basic rules
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],

      // Node.js specific rules
      'node/exports-style': ['error', 'module.exports'],
      'node/file-extension-in-import': ['error', 'always'],
      'node/prefer-global/buffer': ['error', 'always'],
      'node/prefer-global/console': ['error', 'always'],
      'node/prefer-global/process': ['error', 'always'],
      'node/prefer-global/url-search-params': ['error', 'always'],
      'node/prefer-global/url': ['error', 'always'],
      'node/prefer-promises/dns': 'error',
      'node/prefer-promises/fs': 'error',
      'node/no-unsupported-features/es-syntax': [
        'error',
        {
          version: '>=18.0.0',
          ignores: ['restSpreadProperties'],
        },
      ],
      'node/no-unsupported-features/node-builtins': [
        'error',
        {
          version: '>=18.0.0',
        },
      ],

      // General rules
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'prettier/prettier': 'error',
      'no-process-exit': 'off',
      'no-useless-escape': 'warn',
      'no-inner-declarations': 'warn',
    },
    settings: {
      node: {
        version: '>=18.0.0',
      },
    },
    ...prettierConfig,
  },
  // Test files override
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        // Mocha globals
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      'node/no-unpublished-require': 'off',
      'no-unused-vars': 'warn',
    },
  },
];
