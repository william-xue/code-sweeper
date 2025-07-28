import chalk from 'chalk';
export class Logger {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.silent = options.silent || false;
    }
    info(message, ...args) {
        if (!this.silent) {
            console.log(message, ...args);
        }
    }
    success(message, ...args) {
        if (!this.silent) {
            console.log(chalk.green(message), ...args);
        }
    }
    warn(message, ...args) {
        if (!this.silent) {
            console.warn(chalk.yellow(message), ...args);
        }
    }
    error(message, ...args) {
        if (!this.silent) {
            console.error(chalk.red(message), ...args);
        }
    }
    debug(message, ...args) {
        if (this.verbose && !this.silent) {
            console.log(chalk.gray(message), ...args);
        }
    }
    log(message, ...args) {
        if (!this.silent) {
            console.log(message, ...args);
        }
    }
    // Formatted logging methods
    title(message) {
        if (!this.silent) {
            console.log();
            console.log(chalk.bold.blue(message));
        }
    }
    subtitle(message) {
        if (!this.silent) {
            console.log();
            console.log(chalk.bold(message));
        }
    }
    section(title, content) {
        if (!this.silent) {
            this.subtitle(title);
            content.forEach(line => {
                console.log(`  ${line}`);
            });
        }
    }
    table(headers, rows) {
        if (!this.silent) {
            // Simple table implementation
            const colWidths = headers.map((header, i) => {
                const maxContentWidth = Math.max(...rows.map(row => (row[i] || '').length));
                return Math.max(header.length, maxContentWidth);
            });
            // Header
            const headerRow = headers.map((header, i) => header.padEnd(colWidths[i])).join(' | ');
            console.log(headerRow);
            console.log(colWidths.map(width => '-'.repeat(width)).join('-|-'));
            // Rows
            rows.forEach(row => {
                const formattedRow = row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join(' | ');
                console.log(formattedRow);
            });
        }
    }
    progress(current, total, message) {
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
    createProgressBar(percentage, width = 20) {
        const filled = Math.round((percentage / 100) * width);
        const empty = width - filled;
        return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    }
    // Spinner-like methods for compatibility
    startSpinner(message) {
        if (!this.silent) {
            process.stdout.write(`${chalk.blue('⏳')} ${message}...`);
        }
    }
    stopSpinner(success = true, message) {
        if (!this.silent) {
            const icon = success ? chalk.green('✅') : chalk.red('❌');
            const text = message || (success ? 'Done' : 'Failed');
            process.stdout.write(`\r${icon} ${text}\n`);
        }
    }
    // Utility methods
    clear() {
        if (!this.silent) {
            console.clear();
        }
    }
    newLine() {
        if (!this.silent) {
            console.log();
        }
    }
    separator() {
        if (!this.silent) {
            console.log(chalk.gray('-'.repeat(50)));
        }
    }
    // Configuration methods
    setVerbose(verbose) {
        this.verbose = verbose;
    }
    setSilent(silent) {
        this.silent = silent;
    }
    isVerbose() {
        return this.verbose;
    }
    isSilent() {
        return this.silent;
    }
    // Formatted output for specific use cases
    fileList(title, files, maxDisplay = 10) {
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
    issueReport(issues) {
        if (!this.silent) {
            this.subtitle('Issues Found');
            issues.forEach(issue => {
                const color = issue.count > 0 ? 'yellow' : 'green';
                console.log(`    ${chalk[color]('•')} ${issue.type}: ${issue.count}`);
            });
        }
    }
    summary(stats) {
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
