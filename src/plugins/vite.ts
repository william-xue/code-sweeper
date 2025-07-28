import { cleanCode, CleanRules } from '@fe-fast/code-sweeper';
import type { Plugin, ViteDevServer } from 'vite';

export interface CodeSweeperVitePluginOptions {
  include?: string[];
  exclude?: string[];
  dryRun?: boolean;
  skipConfirmation?: boolean;
  rules?: Partial<CleanRules>;
}

export default function codeSweeperPlugin(options: CodeSweeperVitePluginOptions = {}): Plugin {
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
    name: 'vite-plugin-code-sweeper',
    // 在构建前执行代码清理
    async buildStart() {
      try {
        await cleanCode({
          ...finalOptions,
          // 确保不会影响构建过程
          dryRun: false,
          skipConfirmation: true
        });
      } catch (error) {
        this.error(error as Error);
      }
    },
    // 在开发服务器启动时执行代码清理
    async configureServer(server: ViteDevServer) {
      server.watcher.on('change', async (filePath: string) => {
        if (/\.(js|jsx|ts|tsx)$/.test(filePath) && !filePath.includes('node_modules')) {
          try {
            await cleanCode({
              ...finalOptions,
              path: filePath,
              dryRun: false,
              skipConfirmation: true
            });
          } catch (error) {
            console.error('Code Sweeper Error:', error);
          }
        }
      });
    }
  };
}

export { codeSweeperPlugin };