#!/usr/bin/env node
import { Command } from 'commander';
import { cleanCommand } from './commands/clean.js';
import { configCommand } from './commands/config.js';
import { analyzeCommand } from './commands/analyze.js';
const program = new Command();
program.name('code-sweeper').description('🧹 A lightweight JavaScript/TypeScript code cleaning tool').version('1.0.0');

// Clean command
program.command('clean').description('Clean unused code from your project').option('-p, --path <path>', 'Target directory path', process.cwd()).option('-c, --config <config>', 'Configuration file path').option('--dry-run', 'Show what would be cleaned without making changes').option('--imports', 'Clean unused imports').option('--variables', 'Clean unused variables').option('--console', 'Remove console.log statements').option('--debugger', 'Remove debugger statements').option('-y, --yes', 'Skip confirmation prompts').action(cleanCommand);

// Analyze command
program.command('analyze').description('Analyze code and show cleanup opportunities').option('-p, --path <path>', 'Target directory path', process.cwd()).option('-c, --config <config>', 'Configuration file path').option('--json', 'Output results in JSON format').action(analyzeCommand);

// Config command
program.command('config').description('Manage configuration settings').option('--init', 'Initialize configuration file').option('--show', 'Show current configuration').action(configCommand);

// Global error handler
process.on('uncaughtException', error => {
  process.exit(1);
});
process.on('unhandledRejection', reason => {
  process.exit(1);
});
program.parse();