import { Config } from '../types/index.js';
export declare class ConfigManager {
    private configPath;
    private customConfigPath?;
    constructor(customConfigPath?: string);
    load(): Promise<Config>;
    save(config: Config): Promise<void>;
    exists(): Promise<boolean>;
    getConfigPath(): string;
    private findConfigFile;
    private mergeWithDefaults;
    validateConfig(config: any): {
        valid: boolean;
        errors: string[];
    };
    getConfigSchema(): object;
    createExampleConfig(): Config;
}
