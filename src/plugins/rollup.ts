import { cleanCode, CleanRules } from '@fe-fast/code-sweeper';
import type { Plugin } from 'rollup';

export interface CodeSweeperRollupPluginOptions {
  include?: string[];
  exclude?: string[];
  dryRun?: boolean;
  skipConfirmation?: boolean;
  rules?: Partial<CleanRules>;
}

export default function codeSweeperPlugin(options: CodeSweeperRollupPluginOptions = {}): Plugin {
  const finalOptions = {
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
  return {
    name: 'code-sweeper',
    // 在构建开始前执行代码清理
    async buildStart() {
      try {
        await cleanCode({
          ...finalOptions,
          path: '/Users/xueyuan/Desktop/code-sweeper/examples/vue-rollup',
          // 确保不会影响构建过程
          dryRun: false,
          skipConfirmation: true
        });
      } catch (error) {
        this.error(error as Error);
      }
    },

  };
}

export { codeSweeperPlugin };