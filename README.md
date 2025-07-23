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

## 🚀 快速开始

### 安装

```bash
# 全局安装
npm install -g code-sweeper

# 或在项目中安装
npm install --save-dev code-sweeper
```

### 基本使用

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

## 📋 命令详解

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

### 清理结果示例

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

## 🛠️ 开发

```bash
# 克隆项目
git clone https://github.com/your-username/code-sweeper.git
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
