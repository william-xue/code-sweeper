export declare class Logger {
    private verbose;
    private silent;
    constructor(options?: {
        verbose?: boolean;
        silent?: boolean;
    });
    info(message: string, ...args: any[]): void;
    success(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    log(message: string, ...args: any[]): void;
    title(message: string): void;
    subtitle(message: string): void;
    section(title: string, content: string[]): void;
    table(headers: string[], rows: string[][]): void;
    progress(current: number, total: number, message?: string): void;
    private createProgressBar;
    startSpinner(message: string): void;
    stopSpinner(success?: boolean, message?: string): void;
    clear(): void;
    newLine(): void;
    separator(): void;
    setVerbose(verbose: boolean): void;
    setSilent(silent: boolean): void;
    isVerbose(): boolean;
    isSilent(): boolean;
    fileList(title: string, files: string[], maxDisplay?: number): void;
    issueReport(issues: Array<{
        type: string;
        count: number;
        description: string;
    }>): void;
    summary(stats: Record<string, number | string>): void;
}
