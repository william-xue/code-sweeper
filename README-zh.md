# 🧹 Code Sweeper

> 轻量级的 JavaScript/TypeScript 代码清理工具

[![npm version](https://badge.fury.io/js/code-sweeper.svg)](https://www.npmjs.com/package/code-sweeper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Code Sweeper 是一款专注于自动化清理项目中冗余代码的工具，填补了 ESLint 和 Prettier 无法覆盖的代码清理空白。

## ✨ 特性

- 🔍 **智能分析**：基于 AST 静态分析，精准识别无用代码
- 🧹 **一键清理**：删除未使用的 import、变量、函数
- 🐛 **调试清理**：自动移除 console.log、debugger 语句
- ⚙️ **灵活配置**：支持自定义清理规则和文件过滤
- 🚀 **多框架支持**：兼容 Vue、React、TypeScript 项目
- 📊 **详细报告**：提供清理前后的对比分析
- 🔌 **构建工具集成**：支持 Webpack、Vite 和 Rollup 插件

## 🚀 快速开始

### 安装

```bash
# 全局安装
npm install -g code-sweeper

# 或在项目中安装
npm install --save-dev code-sweeper
```

### 命令行使用

```bash
# 分析代码问题
code-sweeper analyze

# 清理代码（预览模式）
code-sweeper clean --dry-run

# 执行清理
code-sweeper clean

# 初始化配置文件
code-sweeper config --init
```

## 🔌 构建工具集成

为了将代码清理无缝集成到您的构建流程中，Code Sweeper 提供了针对主流构建工具的官方插件。

### 安装插件

```bash
npm install @fe-fast/code-sweeper --save-dev
# 或
pnpm add -D @fe-fast/code-sweeper
# 或
yarn add -D @fe-fast/code-sweeper
```

### Webpack

```javascript
// webpack.config.js
const { CodeSweeperWebpackPlugin } = require('@fe-fast/code-sweeper/webpack');

module.exports = {
  // ... 其他配置
  plugins: [
    new CodeSweeperWebpackPlugin({
      // 插件选项
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
  // ... 其他配置
  plugins: [
    codeSweeperPlugin({
      rules: {
        removeConsoleLog: process.env.NODE_ENV === 'production',
      },
    }),
  ],
};
```

### 插件选项

所有插件都支持以下配置选项：

```typescript
interface PluginOptions {
  // 包含的文件模式
  include?: string[];
  
  // 排除的文件模式
  exclude?: string[];
  
  // 是否为试运行模式（不实际修改文件）
  dryRun?: boolean;
  
  // 是否跳过确认提示
  skipConfirmation?: boolean;
  
  // 清理规则
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

更多示例请查看 [examples](./examples) 目录。

## 📋 命令行详解

### `analyze` - 代码分析

分析项目中的代码问题，不做任何修改。

```bash
code-sweeper analyze [options]

选项：
  -p, --path <path>     目标目录路径 (默认: 当前目录)
  -c, --config <file>   配置文件路径
  --json               输出 JSON 格式结果
```

### `clean` - 代码清理

执行代码清理操作。

```bash
code-sweeper clean [options]

选项：
  -p, --path <path>     目标目录路径 (默认: 当前目录)
  -c, --config <file>   配置文件路径
  --dry-run            预览模式，不实际修改文件
  --imports            仅清理未使用的 import
  --variables          仅清理未使用的变量
  --console            仅移除 console 语句
  --debugger           仅移除 debugger 语句
  -y, --yes            跳过确认提示
```

### `config` - 配置管理

管理清理规则配置。

```bash
code-sweeper config [options]

选项：
  --init               初始化配置文件
  --show               显示当前配置
```

## ⚙️ 配置文件

在项目根目录创建 `.code-sweeper.json` 文件：

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

## 📊 使用示例

### 分析结果示例

```bash
$ code-sweeper analyze

🔍 Code Sweeper - 正在分析您的代码...
📁 目标路径: /Users/project/src

📊 代码分析报告
══════════════════════════════════════════════════

📈 总结:
   • 扫描文件总数: 45
   • 有问题的文件: 12
   • 发现问题总数: 28

🔍 问题分类:
   • 未使用的导入: 15
   • 未使用的变量: 8
   • Console 语句: 3
   • Debugger 语句: 2

💡 建议:
   • 运行 code-sweeper clean 来修复这些问题
   • 使用 --dry-run 标志先预览更改
```

### 清理结果示例

```bash
$ code-sweeper clean

🧹 Code Sweeper - 正在清理您的代码...

✅ 清理完成！

📊 总结:
   • 修改文件数: 8
   • 修复问题数: 23
   • 删除行数: 45
   • 预计减少大小: ~2.1KB
```

## 🛠️ 开发

```bash
# 克隆项目
git clone https://github.com/william-xue/code-sweeper.git
cd code-sweeper

# 安装依赖
npm install

# 构建项目
npm run build

# 运行测试
npm test

# 本地开发
npm run dev
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Babel](https://babeljs.io/) - AST 解析和转换
- [TypeScript](https://www.typescriptlang.org/) - 类型支持
- [Commander.js](https://github.com/tj/commander.js/) - CLI 框架

---

**让代码更清洁，让开发更高效！** 🚀