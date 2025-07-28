import { CleanOptions, AnalysisResult, CleanResult } from '../types/index.js';
export declare class CodeCleaner {
    private options;
    private logger;
    constructor(options: CleanOptions);
    analyze(): Promise<AnalysisResult>;
    clean(): Promise<CleanResult>;
    private getTargetFiles;
    private isValidFile;
    private analyzeFile;
    private parseFile;
    private analyzeImport;
    private analyzeVariable;
    private isConsoleCall;
    private cleanFile;
    private isUnusedImport;
    private isUnusedVariable;
    private removeNodesFromContent;
}
