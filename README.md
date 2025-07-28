# 🧹 Code Sweeper

> Lightweight JavaScript/TypeScript code cleanup tool

[![npm version](https://badge.fury.io/js/code-sweeper.svg)](https://www.npmjs.com/package/code-sweeper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Code Sweeper is a tool focused on automatically cleaning redundant code in projects, filling the code cleanup gaps that ESLint and Prettier cannot cover.

## ✨ Features

- 🔍 **Smart Analysis**: AST-based static analysis for precise identification of unused code
- 🧹 **One-click Cleanup**: Remove unused imports, variables, and functions
- 🐛 **Debug Cleanup**: Automatically remove console.log and debugger statements
- ⚙️ **Flexible Configuration**: Support custom cleanup rules and file filtering
- 🚀 **Multi-framework Support**: Compatible with Vue, React, and TypeScript projects
- 📊 **Detailed Reports**: Provide before-and-after cleanup analysis
- 🔌 **Build Tool Integration**: Support for Webpack, Vite, and Rollup plugins

## 🚀 Quick Start

### Installation

```bash
# Global installation
npm install -g code-sweeper

# Or install in project
npm install --save-dev code-sweeper
```

### Basic Usage (CLI)

```bash
# Analyze code issues
code-sweeper analyze

# Clean code (preview mode)
code-sweeper clean --dry-run

# Execute cleanup
code-sweeper clean

# Initialize configuration file
code-sweeper config --init
```

## 🔌 Build Tool Integration

For seamless integration into your build process, Code Sweeper provides official plugins for major build tools.

### Installation

```bash
npm install @fe-fast/code-sweeper --save-dev
# or
pnpm add -D @fe-fast/code-sweeper
# or
yarn add -D @fe-fast/code-sweeper
```

### Webpack

```javascript
// webpack.config.js
const { CodeSweeperWebpackPlugin } = require('@fe-fast/code-sweeper/webpack');

module.exports = {
  // ... other configs
  plugins: [
    new CodeSweeperWebpackPlugin({
      // options
      rules: {
        removeConsoleLog: process.env.NODE_ENV === 'production',
      },
    }),
  ],
};
```

### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import codeSweeperPlugin from '@fe-fast/code-sweeper/vite';

export default defineConfig({
  plugins: [
    codeSweeperPlugin({
      rules: {
        removeConsoleLog: process.env.NODE_ENV === 'production',
      },
    }),
  ],
});
```

### Rollup

```javascript
// rollup.config.js
import codeSweeperPlugin from '@fe-fast/code-sweeper/rollup';

export default {
  // ... other configs
  plugins: [
    codeSweeperPlugin({
      rules: {
        removeConsoleLog: process.env.NODE_ENV === 'production',
      },
    }),
  ],
};
```

### Plugin Options

All plugins support the following options:

```typescript
interface PluginOptions {
  include?: string[];
  exclude?: string[];
  dryRun?: boolean;
  skipConfirmation?: boolean;
  rules?: {
    removeUnusedImports?: boolean;
    removeUnusedVariables?: boolean;
    removeConsoleLog?: boolean;
    removeDebugger?: boolean;
    formatCode?: boolean;
    renameToCamelCase?: boolean;
  };
}
```

For more examples, check out the [examples](./examples) directory.

## 📋 Command Reference

### `analyze` - Code Analysis

Analyze code issues in the project without making any modifications.

```bash
code-sweeper analyze [options]

Options:
  -p, --path <path>     Target directory path (default: current directory)
  -c, --config <file>   Configuration file path
  --json               Output results in JSON format
```

### `clean` - Code Cleanup

Execute code cleanup operations.

```bash
code-sweeper clean [options]

Options:
  -p, --path <path>     Target directory path (default: current directory)
  -c, --config <file>   Configuration file path
  --dry-run            Preview mode, don't actually modify files
  --imports            Only clean unused imports
  --variables          Only clean unused variables
  --console            Only remove console statements
  --debugger           Only remove debugger statements
  -y, --yes            Skip confirmation prompts
```

### `config` - Configuration Management

Manage cleanup rule configurations.

```bash
code-sweeper config [options]

Options:
  --init               Initialize configuration file
  --show               Show current configuration
```

## ⚙️ Configuration File

Create a `.code-sweeper.json` file in your project root:

```json
{
  "rules": {
    "removeUnusedImports": true,
    "removeUnusedVariables": true,
    "removeConsoleLog": true,
    "removeDebugger": true,
    "formatCode": false,
    "renameToCamelCase": false
  },
  "include": [
    "src/**/*.{js,ts,jsx,tsx}",
    "components/**/*.{js,ts,jsx,tsx}"
  ],
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "*.min.js"
  ],
  "parser": {
    "typescript": true,
    "jsx": true,
    "decorators": true,
    "classProperties": true
  }
}
```

## 📊 Usage Examples

### Analysis Result Example

```bash
$ code-sweeper analyze

🔍 Code Sweeper - Analyzing your code...
📁 Target path: /Users/project/src

📊 Code Analysis Report
══════════════════════════════════════════════════

📈 Summary:
   • Total files scanned: 45
   • Files with issues: 12
   • Total issues found: 28

🔍 Issue Breakdown:
   • Unused imports: 15
   • Unused variables: 8
   • Console statements: 3
   • Debugger statements: 2

💡 Recommendations:
   • Run code-sweeper clean to fix these issues
   • Use --dry-run flag to preview changes first
```

### Cleanup Result Example

```bash
$ code-sweeper clean

🧹 Code Sweeper - Cleaning your code...

✅ Cleaning completed!

📊 Summary:
   • Files modified: 8
   • Issues fixed: 23
   • Lines removed: 45
   • Estimated size reduction: ~2.1KB
```

## 🛠️ Development

```bash
# Clone the project
git clone https://github.com/william-xue/code-sweeper.git
cd code-sweeper

# Install dependencies
npm install

# Build project
npm run build

# Run tests
npm test

# Local development
npm run dev
```

## 🤝 Contributing

Welcome to submit Issues and Pull Requests!

1. Fork this project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Babel](https://babeljs.io/) - AST parsing and transformation
- [TypeScript](https://www.typescriptlang.org/) - Type support
- [Commander.js](https://github.com/tj/commander.js/) - CLI framework

---

**Make code cleaner, make development more efficient!** 🚀
