export { CodeCleaner } from './core/CodeCleaner.js';
export { ConfigManager } from './core/ConfigManager.js';
export { Logger } from './utils/Logger.js';
export type { CleanOptions, CleanRules, Config, ParserConfig, AnalysisResult, CleanResult, CodeIssue, FileAnalysis, FileChange, ImportInfo, VariableInfo, FunctionInfo, ConsoleStatement, DebuggerStatement, IssueType, IssueSeverity, ChangeType } from './types/index.js';
export { defaultConfig } from './config/default.js';
export declare function cleanCode(options?: Partial<CleanOptions>): Promise<import("./index.js").CleanResult>;
export declare function analyzeCode(options?: Partial<CleanOptions>): Promise<import("./index.js").AnalysisResult>;
export declare const version = "1.0.0";
import type { CleanOptions } from './types/index.js';
