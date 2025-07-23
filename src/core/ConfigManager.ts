import fs from 'fs-extra';
import path from 'path';
import { Config } from '../types/index.js';
import { defaultConfig, configFileNames } from '../config/default.js';

export class ConfigManager {
  private configPath: string;
  private customConfigPath?: string;

  constructor(customConfigPath?: string) {
    this.customConfigPath = customConfigPath;
    this.configPath = this.findConfigFile();
  }

  async load(): Promise<Config> {
    try {
      if (await this.exists()) {
        const configContent = await fs.readFile(this.configPath, 'utf-8');
        const config = JSON.parse(configContent);
        
        // Merge with default config to ensure all properties exist
        return this.mergeWithDefaults(config);
      }
    } catch (error) {
      }
    
    return defaultConfig;
  }

  async save(config: Config): Promise<void> {
    const configDir = path.dirname(this.configPath);
    await fs.ensureDir(configDir);
    
    const configContent = JSON.stringify(config, null, 2);
    await fs.writeFile(this.configPath, configContent, 'utf-8');
  }

  async exists(): Promise<boolean> {
    return fs.pathExists(this.configPath);
  }

  getConfigPath(): string {
    return this.configPath;
  }

  private findConfigFile(): string {
    // If custom config path is provided, use it
    if (this.customConfigPath) {
      return path.resolve(this.customConfigPath);
    }

    // Look for config files in current directory and parent directories
    let currentDir = process.cwd();
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
      for (const fileName of configFileNames) {
        const configPath = path.join(currentDir, fileName);
        if (fs.existsSync(configPath)) {
          return configPath;
        }
      }
      currentDir = path.dirname(currentDir);
    }

    // Default to .code-sweeper.json in current directory
    return path.join(process.cwd(), '.code-sweeper.json');
  }

  private mergeWithDefaults(config: Partial<Config>): Config {
    return {
      rules: {
        ...defaultConfig.rules,
        ...config.rules
      },
      include: config.include || defaultConfig.include,
      exclude: config.exclude || defaultConfig.exclude,
      parser: {
        ...defaultConfig.parser,
        ...config.parser
      }
    };
  }

  // Validate configuration
  validateConfig(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required properties
    if (!config.rules || typeof config.rules !== 'object') {
      errors.push('Missing or invalid "rules" property');
    }

    if (!config.include || !Array.isArray(config.include)) {
      errors.push('Missing or invalid "include" property (should be an array)');
    }

    if (!config.exclude || !Array.isArray(config.exclude)) {
      errors.push('Missing or invalid "exclude" property (should be an array)');
    }

    // Check rule properties
    if (config.rules) {
      const requiredRules = [
        'removeUnusedImports',
        'removeUnusedVariables', 
        'removeConsoleLog',
        'removeDebugger',
        'formatCode',
        'renameToCamelCase'
      ];

      for (const rule of requiredRules) {
        if (typeof config.rules[rule] !== 'boolean') {
          errors.push(`Rule "${rule}" should be a boolean`);
        }
      }
    }

    // Check parser config
    if (config.parser) {
      const parserProps = ['typescript', 'jsx', 'decorators', 'classProperties'];
      for (const prop of parserProps) {
        if (config.parser[prop] !== undefined && typeof config.parser[prop] !== 'boolean') {
          errors.push(`Parser option "${prop}" should be a boolean`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get configuration schema for documentation
  getConfigSchema(): object {
    return {
      type: 'object',
      properties: {
        rules: {
          type: 'object',
          properties: {
            removeUnusedImports: { type: 'boolean', description: 'Remove unused import statements' },
            removeUnusedVariables: { type: 'boolean', description: 'Remove unused variable declarations' },
            removeConsoleLog: { type: 'boolean', description: 'Remove console.log statements' },
            removeDebugger: { type: 'boolean', description: 'Remove statements' },
            formatCode: { type: 'boolean', description: 'Format code according to style rules' },
            renameToCamelCase: { type: 'boolean', description: 'Rename variables to camelCase' }
          },
          required: ['removeUnusedImports', 'removeUnusedVariables', 'removeConsoleLog', 'removeDebugger']
        },
        include: {
          type: 'array',
          items: { type: 'string' },
          description: 'File patterns to include in cleaning'
        },
        exclude: {
          type: 'array', 
          items: { type: 'string' },
          description: 'File patterns to exclude from cleaning'
        },
        parser: {
          type: 'object',
          properties: {
            typescript: { type: 'boolean', description: 'Enable TypeScript parsing' },
            jsx: { type: 'boolean', description: 'Enable JSX parsing' },
            decorators: { type: 'boolean', description: 'Enable decorator syntax' },
            classProperties: { type: 'boolean', description: 'Enable class properties syntax' }
          }
        }
      },
      required: ['rules', 'include', 'exclude']
    };
  }

  // Create example configuration
  createExampleConfig(): Config {
    return {
      rules: {
        removeUnusedImports: true,
        removeUnusedVariables: true,
        removeConsoleLog: true,
        removeDebugger: true,
        formatCode: false,
        renameToCamelCase: false
      },
      include: [
        'src/**/*.{js,ts,jsx,tsx}',
        'components/**/*.{js,ts,jsx,tsx}',
        'pages/**/*.{js,ts,jsx,tsx}'
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '*.min.js',
        'vendor/**'
      ],
      parser: {
        typescript: true,
        jsx: true,
        decorators: true,
        classProperties: true
      }
    };
  }
}