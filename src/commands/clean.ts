import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { CodeCleaner } from '../core/CodeCleaner.js';
import { ConfigManager } from '../core/ConfigManager.js';
import { Logger } from '../utils/Logger.js';
import { CleanOptions } from '../types/index.js';

export async function cleanCommand(options: any) {
  const logger = new Logger();
  const spinner = ora();

  try {
    // Load configuration
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();
    
    // Merge CLI options with config
    const cleanOptions: CleanOptions = {
      path: options.path,
      dryRun: options.dryRun || false,
      skipConfirmation: options.yes || false,
      rules: {
        ...config.rules,
        removeUnusedImports: options.imports ?? config.rules.removeUnusedImports,
        removeUnusedVariables: options.variables ?? config.rules.removeUnusedVariables,
        removeConsoleLog: options.console ?? config.rules.removeConsoleLog,
        removeDebugger: options.debugger ?? config.rules.removeDebugger
      },
      include: config.include,
      exclude: config.exclude
    };

    logger.info('🧹 Code Sweeper - Starting cleanup process...');
    logger.info(`📁 Target path: ${chalk.cyan(cleanOptions.path)}`);
    
    if (cleanOptions.dryRun) {
      logger.warn('🔍 Dry run mode - no files will be modified');
    }

    // Initialize code cleaner
    const cleaner = new CodeCleaner(cleanOptions);
    
    // Analyze files
    spinner.start('Analyzing files...');
    const analysis = await cleaner.analyze();
    spinner.succeed(`Found ${analysis.totalFiles} files to analyze`);

    if (analysis.issues.length === 0) {
      logger.success('✨ No cleanup needed - your code is already clean!');
      return;
    }

    // Show analysis results
    logger.info(`\n📊 Analysis Results:`);
    logger.info(`   • Unused imports: ${chalk.yellow(analysis.unusedImports)}`);
    logger.info(`   • Unused variables: ${chalk.yellow(analysis.unusedVariables)}`);
    logger.info(`   • Console statements: ${chalk.yellow(analysis.consoleStatements)}`);
    logger.info(`   • Debugger statements: ${chalk.yellow(analysis.debuggerStatements)}`);
    logger.info(`   • Total issues: ${chalk.red(analysis.issues.length)}`);

    // Confirmation prompt
    if (!cleanOptions.skipConfirmation && !cleanOptions.dryRun) {
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Do you want to proceed with the cleanup?',
          default: false
        }
      ]);

      if (!proceed) {
        logger.info('Cleanup cancelled by user.');
        return;
      }
    }

    // Perform cleanup
    if (!cleanOptions.dryRun) {
      spinner.start('Cleaning files...');
      const result = await cleaner.clean();
      spinner.succeed('Cleanup completed!');

      logger.success(`\n✅ Cleanup Summary:`);
      logger.info(`   • Files modified: ${chalk.green(result.filesModified)}`);
      logger.info(`   • Issues fixed: ${chalk.green(result.issuesFixed)}`);
      logger.info(`   • Lines removed: ${chalk.green(result.linesRemoved)}`);
    } else {
      logger.info('\n🔍 Dry run completed - use --no-dry-run to apply changes');
    }

  } catch (error) {
    spinner.fail('Cleanup failed');
    logger.error('❌ Error during cleanup:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}