import chalk from 'chalk';
import inquirer from 'inquirer';
import { ConfigManager } from '../core/ConfigManager.js';
import { Logger } from '../utils/Logger.js';
import { defaultConfig } from '../config/default.js';

export async function configCommand(options: any) {
  const logger = new Logger();
  const configManager = new ConfigManager();

  try {
    if (options.init) {
      await initializeConfig(configManager, logger);
    } else if (options.show) {
      await showConfig(configManager, logger);
    } else {
      await interactiveConfig(configManager, logger);
    }
  } catch (error) {
    logger.error('❌ Configuration error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function initializeConfig(configManager: ConfigManager, logger: Logger) {
  logger.info('🔧 Initializing Code Sweeper configuration...');
  
  const configExists = await configManager.exists();
  if (configExists) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Configuration file already exists. Overwrite?',
        default: false
      }
    ]);
    
    if (!overwrite) {
      logger.info('Configuration initialization cancelled.');
      return;
    }
  }

  // Interactive configuration setup
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'rules',
      message: 'Select cleanup rules to enable:',
      choices: [
        { name: 'Remove unused imports', value: 'removeUnusedImports', checked: true },
        { name: 'Remove unused variables', value: 'removeUnusedVariables', checked: true },
        { name: 'Remove console.log statements', value: 'removeConsoleLog', checked: true },
        { name: 'Remove statements', value: 'removeDebugger', checked: true },
        { name: 'Format code style', value: 'formatCode', checked: false },
        { name: 'Rename variables to camelCase', value: 'renameToCamelCase', checked: false }
      ]
    },
    {
      type: 'input',
      name: 'include',
      message: 'File patterns to include (comma-separated):',
      default: '**/*.{js,ts,jsx,tsx,vue}'
    },
    {
      type: 'input',
      name: 'exclude',
      message: 'File patterns to exclude (comma-separated):',
      default: 'node_modules/**,dist/**,build/**,*.min.js'
    }
  ]);

  // Build configuration
  const config = {
    ...defaultConfig,
    rules: {
      removeUnusedImports: answers.rules.includes('removeUnusedImports'),
      removeUnusedVariables: answers.rules.includes('removeUnusedVariables'),
      removeConsoleLog: answers.rules.includes('removeConsoleLog'),
      removeDebugger: answers.rules.includes('removeDebugger'),
      formatCode: answers.rules.includes('formatCode'),
      renameToCamelCase: answers.rules.includes('renameToCamelCase')
    },
    include: answers.include.split(',').map((s: string) => s.trim()),
    exclude: answers.exclude.split(',').map((s: string) => s.trim())
  };

  await configManager.save(config);
  logger.success('✅ Configuration file created successfully!');
  logger.info(`📄 Configuration saved to: ${chalk.cyan(configManager.getConfigPath())}`);
}

async function showConfig(configManager: ConfigManager, logger: Logger) {
  logger.info('📋 Current Code Sweeper Configuration:');
  
  const config = await configManager.load();
  
  logger.info(`\n📄 Configuration file: ${chalk.cyan(configManager.getConfigPath())}`);
}

async function interactiveConfig(configManager: ConfigManager, logger: Logger) {
  logger.info('⚙️  Code Sweeper Configuration Manager');
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '🔧 Initialize new configuration', value: 'init' },
        { name: '📋 Show current configuration', value: 'show' },
        { name: '✏️  Edit configuration', value: 'edit' },
        { name: '🗑️  Reset to defaults', value: 'reset' }
      ]
    }
  ]);

  switch (action) {
    case 'init':
      await initializeConfig(configManager, logger);
      break;
    case 'show':
      await showConfig(configManager, logger);
      break;
    case 'edit':
      await editConfig(configManager, logger);
      break;
    case 'reset':
      await resetConfig(configManager, logger);
      break;
  }
}

async function editConfig(configManager: ConfigManager, logger: Logger) {
  const config = await configManager.load();
  
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'rules',
      message: 'Select cleanup rules to enable:',
      choices: [
        { name: 'Remove unused imports', value: 'removeUnusedImports', checked: config.rules.removeUnusedImports },
        { name: 'Remove unused variables', value: 'removeUnusedVariables', checked: config.rules.removeUnusedVariables },
        { name: 'Remove console.log statements', value: 'removeConsoleLog', checked: config.rules.removeConsoleLog },
        { name: 'Remove statements', value: 'removeDebugger', checked: config.rules.removeDebugger },
        { name: 'Format code style', value: 'formatCode', checked: config.rules.formatCode },
        { name: 'Rename variables to camelCase', value: 'renameToCamelCase', checked: config.rules.renameToCamelCase }
      ]
    }
  ]);

  const updatedConfig = {
    ...config,
    rules: {
      removeUnusedImports: answers.rules.includes('removeUnusedImports'),
      removeUnusedVariables: answers.rules.includes('removeUnusedVariables'),
      removeConsoleLog: answers.rules.includes('removeConsoleLog'),
      removeDebugger: answers.rules.includes('removeDebugger'),
      formatCode: answers.rules.includes('formatCode'),
      renameToCamelCase: answers.rules.includes('renameToCamelCase')
    }
  };

  await configManager.save(updatedConfig);
  logger.success('✅ Configuration updated successfully!');
}

async function resetConfig(configManager: ConfigManager, logger: Logger) {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to reset configuration to defaults?',
      default: false
    }
  ]);

  if (confirm) {
    await configManager.save(defaultConfig);
    logger.success('✅ Configuration reset to defaults!');
  } else {
    logger.info('Reset cancelled.');
  }
}