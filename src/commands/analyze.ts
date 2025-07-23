import chalk from 'chalk';
import ora from 'ora';
import { CodeCleaner } from '../core/CodeCleaner.js';
import { ConfigManager } from '../core/ConfigManager.js';
import { Logger } from '../utils/Logger.js';
import { CleanOptions } from '../types/index.js';

export async function analyzeCommand(options: any) {
  const logger = new Logger();
  const spinner = ora();

  try {
    // Load configuration
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();
    
    const cleanOptions: CleanOptions = {
      path: options.path,
      dryRun: true, // Always dry run for analyze
      skipConfirmation: true,
      rules: config.rules,
      include: config.include,
      exclude: config.exclude
    };

    logger.info('🔍 Code Sweeper - Analyzing your code...');
    logger.info(`📁 Target path: ${chalk.cyan(cleanOptions.path)}`);

    // Initialize code cleaner
    const cleaner = new CodeCleaner(cleanOptions);
    
    // Analyze files
    spinner.start('Scanning files...');
    const analysis = await cleaner.analyze();
    spinner.succeed(`Analyzed ${analysis.totalFiles} files`);

    if (options.json) {
      // Output JSON format
      console.log(JSON.stringify(analysis, null, 2));
      return;
    }

    // Human-readable output
    if (analysis.issues.length === 0) {
      logger.success('✨ Great! No issues found in your code.');
      return;
    }

    logger.info(`\n📊 Code Analysis Report`);
    logger.info('═'.repeat(50));
    
    // Summary statistics
    logger.info(`\n📈 Summary:`);
    logger.info(`   • Total files scanned: ${chalk.cyan(analysis.totalFiles)}`);
    logger.info(`   • Files with issues: ${chalk.yellow(analysis.filesWithIssues)}`);
    logger.info(`   • Total issues found: ${chalk.red(analysis.issues.length)}`);
    
    // Issue breakdown
    logger.info(`\n🔍 Issue Breakdown:`);
    if (analysis.unusedImports > 0) {
      logger.info(`   • Unused imports: ${chalk.yellow(analysis.unusedImports)}`);
    }
    if (analysis.consoleStatements > 0) {
      logger.info(`   • Console statements: ${chalk.yellow(analysis.consoleStatements)}`);
    }
    if (analysis.debuggerStatements > 0) {
      logger.info(`   • Debugger statements: ${chalk.yellow(analysis.debuggerStatements)}`);
    }

    // File-by-file breakdown
    if (analysis.fileDetails && analysis.fileDetails.length > 0) {
      logger.info(`\n📄 Files with Issues:`);
      analysis.fileDetails.slice(0, 10).forEach((file, index) => {
        logger.info(`   ${index + 1}. ${chalk.cyan(file.path)} (${chalk.red(file.issueCount)} issues)`);
        file.issues.slice(0, 3).forEach(issue => {
          logger.info(`      • ${issue.type}: ${chalk.gray(issue.description)}`);
        });
        if (file.issues.length > 3) {
          logger.info(`      • ... and ${file.issues.length - 3} more`);
        }
      });
      
      if (analysis.fileDetails.length > 10) {
        logger.info(`   ... and ${analysis.fileDetails.length - 10} more files`);
      }
    }

    // Recommendations
    logger.info(`\n💡 Recommendations:`);
    logger.info(`   • Run ${chalk.cyan('code-sweeper clean')} to fix these issues`);
    logger.info(`   • Use ${chalk.cyan('--dry-run')} flag to preview changes first`);
    logger.info(`   • Configure rules in ${chalk.cyan('.code-sweeper.json')} for custom behavior`);

    // Potential savings
    const estimatedSavings = analysis.issues.length * 1.2; // Rough estimate
    logger.info(`\n💾 Estimated cleanup impact:`);
    logger.info(`   • Approximately ${chalk.green(Math.round(estimatedSavings))} lines could be removed`);
    logger.info(`   • Code readability and maintainability will improve`);

  } catch (error) {
    spinner.fail('Analysis failed');
    logger.error('❌ Error during analysis:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}