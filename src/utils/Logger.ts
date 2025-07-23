import chalk from 'chalk';

export class Logger {
  private verbose: boolean;
  private silent: boolean;

  constructor(options: { verbose?: boolean; silent?: boolean } = {}) {
    this.verbose = options.verbose || false;
    this.silent = options.silent || false;
  }

  info(message: string, ...args: any[]): void {
    if (!this.silent) {
      console.log(message, ...args);
    }
  }

  success(message: string, ...args: any[]): void {
    if (!this.silent) {
      console.log(chalk.green(message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (!this.silent) {
      console.warn(chalk.yellow(message), ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (!this.silent) {
      console.error(chalk.red(message), ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.verbose && !this.silent) {
      console.log(chalk.gray(message), ...args);
    }
  }

  log(message: string, ...args: any[]): void {
    if (!this.silent) {
      console.log(message, ...args);
    }
  }

  // Formatted logging methods
  title(message: string): void {
    if (!this.silent) {
      console.log();
      console.log(chalk.bold.blue(message));
    }
  }

  subtitle(message: string): void {
    if (!this.silent) {
      console.log();
      console.log(chalk.bold(message));
    }
  }

  section(title: string, content: string[]): void {
    if (!this.silent) {
      this.subtitle(title);
      content.forEach(line => {
        console.log(`  ${line}`);
      });
    }
  }

  table(headers: string[], rows: string[][]): void {
    if (!this.silent) {
      // Simple table implementation
      const colWidths = headers.map((header, i) => {
        const maxContentWidth = Math.max(...rows.map(row => (row[i] || '').length));
        return Math.max(header.length, maxContentWidth);
      });

      // Header
      const headerRow = headers.map((header, i) => 
        header.padEnd(colWidths[i])
      ).join(' | ');
      console.log(headerRow);
      console.log(colWidths.map(width => '-'.repeat(width)).join('-|-'));

      // Rows
      rows.forEach(row => {
        const formattedRow = row.map((cell, i) => 
          (cell || '').padEnd(colWidths[i])
        ).join(' | ');
        console.log(formattedRow);
      });
    }
  }

  progress(current: number, total: number, message?: string): void {
    if (!this.silent) {
      const percentage = Math.round((current / total) * 100);
      const progressBar = this.createProgressBar(percentage);
      const status = message ? ` ${message}` : '';
      process.stdout.write(`\r${progressBar} ${percentage}%${status}`);
      
      if (current === total) {
        process.stdout.write('\n');
      }
    }
  }

  private createProgressBar(percentage: number, width: number = 20): string {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  // Spinner-like methods for compatibility
  startSpinner(message: string): void {
    if (!this.silent) {
      process.stdout.write(`${chalk.blue('⏳')} ${message}...`);
    }
  }

  stopSpinner(success: boolean = true, message?: string): void {
    if (!this.silent) {
      const icon = success ? chalk.green('✅') : chalk.red('❌');
      const text = message || (success ? 'Done' : 'Failed');
      process.stdout.write(`\r${icon} ${text}\n`);
    }
  }

  // Utility methods
  clear(): void {
    if (!this.silent) {
      console.clear();
    }
  }

  newLine(): void {
    if (!this.silent) {
      console.log();
    }
  }

  separator(): void {
    if (!this.silent) {
      console.log(chalk.gray('-'.repeat(50)));
    }
  }

  // Configuration methods
  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
  }

  setSilent(silent: boolean): void {
    this.silent = silent;
  }

  isVerbose(): boolean {
    return this.verbose;
  }

  isSilent(): boolean {
    return this.silent;
  }

  // Formatted output for specific use cases
  fileList(title: string, files: string[], maxDisplay: number = 10): void {
    if (!this.silent) {
      this.subtitle(title);
      const displayFiles = files.slice(0, maxDisplay);
      displayFiles.forEach((file, index) => {
        console.log(`    ${chalk.cyan('•')} ${file}`);
      });
      
      if (files.length > maxDisplay) {
        console.log(`    ${chalk.gray(`... and ${files.length - maxDisplay} more files`)}`);
      }
    }
  }

  issueReport(issues: Array<{ type: string; count: number; description: string }>): void {
    if (!this.silent) {
      this.subtitle('Issues Found');
      issues.forEach(issue => {
        const color = issue.count > 0 ? 'yellow' : 'green';
        console.log(`    ${chalk[color]('•')} ${issue.type}: ${issue.count}`);
      });
    }
  }

  summary(stats: Record<string, number | string>): void {
    if (!this.silent) {
      this.subtitle('Summary');
      Object.entries(stats).forEach(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
        const capitalizedKey = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);
        console.log(`    ${chalk.cyan('•')} ${capitalizedKey}: ${value}`);
      });
    }
  }
}