// Main exports for the Code Sweeper library
export { CodeCleaner } from './core/CodeCleaner.js';
export { ConfigManager } from './core/ConfigManager.js';
export { Logger } from './utils/Logger.js';
// Configuration exports
export { defaultConfig } from './config/default.js';
// Utility function for quick cleaning
export async function cleanCode(options = {}) {
    const { CodeCleaner } = await import('./core/CodeCleaner.js');
    const { defaultConfig } = await import('./config/default.js');
    const cleanOptions = {
        path: options.path || process.cwd(),
        dryRun: options.dryRun || false,
        skipConfirmation: options.skipConfirmation || false,
        rules: {
            ...defaultConfig.rules,
            ...options.rules
        },
        include: options.include || defaultConfig.include,
        exclude: options.exclude || defaultConfig.exclude
    };
    const cleaner = new CodeCleaner(cleanOptions);
    return await cleaner.clean();
}
// Utility function for quick analysis
export async function analyzeCode(options = {}) {
    const { CodeCleaner } = await import('./core/CodeCleaner.js');
    const { defaultConfig } = await import('./config/default.js');
    const cleanOptions = {
        path: options.path || process.cwd(),
        dryRun: true,
        skipConfirmation: true,
        rules: {
            ...defaultConfig.rules,
            ...options.rules
        },
        include: options.include || defaultConfig.include,
        exclude: options.exclude || defaultConfig.exclude
    };
    const cleaner = new CodeCleaner(cleanOptions);
    return await cleaner.analyze();
}
// Version information
export const version = '1.0.0';
