import { Config } from '../types/index.js';

export const defaultConfig: Config = {
  rules: {
    removeUnusedImports: true,
    removeUnusedVariables: true,
    removeConsoleLog: true,
    removeDebugger: true,
    formatCode: false,
    renameToCamelCase: false
  },
  include: [
    '**/*.js',
    '**/*.ts',
    '**/*.jsx',
    '**/*.tsx',
    '**/*.vue'
  ],
  exclude: [
    'node_modules/**',
    'dist/**',
    'build/**',
    'coverage/**',
    '*.min.js',
    '*.bundle.js',
    '.git/**',
    '.next/**',
    '.nuxt/**',
    'public/**',
    'static/**'
  ],
  parser: {
    typescript: true,
    jsx: true,
    decorators: true,
    classProperties: true
  }
};

export const configFileName = '.code-sweeper.json';
export const configFileNames = [
  '.code-sweeper.json',
  '.code-sweeper.js',
  'code-sweeper.config.json',
  'code-sweeper.config.js'
];