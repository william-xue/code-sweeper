import { cleanCode, CleanRules } from '@fe-fast/code-sweeper';
import type { Compiler, Compilation } from 'webpack';

export interface CodeSweeperWebpackPluginOptions {
  include?: string[];
  exclude?: string[];
  dryRun?: boolean;
  skipConfirmation?: boolean;
  rules?: Partial<CleanRules>;
}

interface ProcessedOptions extends Omit<CodeSweeperWebpackPluginOptions, 'rules'> {
  rules: CleanRules;
}

export class CodeSweeperWebpackPlugin {
  private options: ProcessedOptions;

  constructor(options: CodeSweeperWebpackPluginOptions = {}) {
    this.options = {
      ...options,
      rules: {
        removeUnusedImports: true,
        removeUnusedVariables: true,
        removeConsoleLog: true,
        removeDebugger: true,
        formatCode: false,
        renameToCamelCase: false,
        ...options.rules,
      },
    };
  }

  apply(compiler: Compiler): void {
    // 在emit阶段执行代码清理
    compiler.hooks.emit.tapAsync('CodeSweeperWebpackPlugin', async (compilation: Compilation, callback: (error?: Error) => void) => {
      try {
        // 获取所有源文件路径
        const filePaths = Array.from(compilation.fileDependencies)
          .filter((file: string) => /\.(js|jsx|ts|tsx)$/.test(file))
          .filter((file: string) => !file.includes('node_modules'));

        // 对每个文件单独执行代码清理
        for (const filePath of filePaths) {
          try {
            await cleanCode({
              ...this.options,
              path: filePath,
              // 确保不会影响构建过程
              dryRun: false,
              skipConfirmation: true
            });
          } catch (fileError) {
            console.warn(`Code Sweeper warning for ${filePath}:`, fileError);
          }
        }

        callback();
      } catch (error) {
        callback(error as Error);
      }
    });
  }
}

export default CodeSweeperWebpackPlugin;