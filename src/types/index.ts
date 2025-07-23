export interface CleanOptions {
  path: string;
  dryRun: boolean;
  skipConfirmation: boolean;
  rules: CleanRules;
  include: string[];
  exclude: string[];
}

export interface CleanRules {
  removeUnusedImports: boolean;
  removeUnusedVariables: boolean;
  removeConsoleLog: boolean;
  removeDebugger: boolean;
  formatCode: boolean;
  renameToCamelCase: boolean;
}

export interface Config {
  rules: CleanRules;
  include: string[];
  exclude: string[];
  parser: ParserConfig;
}

export interface ParserConfig {
  typescript: boolean;
  jsx: boolean;
  decorators: boolean;
  classProperties: boolean;
}

export interface AnalysisResult {
  totalFiles: number;
  filesWithIssues: number;
  issues: CodeIssue[];
  unusedImports: number;
  unusedVariables: number;
  consoleStatements: number;
  debuggerStatements: number;
  fileDetails?: FileAnalysis[];
}

export interface FileAnalysis {
  path: string;
  issueCount: number;
  issues: CodeIssue[];
  size: number;
  linesOfCode: number;
}

export interface CodeIssue {
  type: IssueType;
  description: string;
  line: number;
  column: number;
  severity: IssueSeverity;
  fixable: boolean;
  rule: string;
}

export type IssueType = 
  | 'unused-import'
  | 'unused-variable'
  | 'console-log'
  | 'debugger'
  | 'naming-convention'
  | 'code-style';

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface CleanResult {
  filesModified: number;
  issuesFixed: number;
  linesRemoved: number;
  changes: FileChange[];
}

export interface FileChange {
  path: string;
  type: ChangeType;
  linesChanged: number;
  issuesFixed: number;
  before?: string;
  after?: string;
}

export type ChangeType = 'modified' | 'deleted' | 'renamed';

export interface ASTNode {
  type: string;
  start: number;
  end: number;
  loc: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export interface ImportInfo {
  source: string;
  specifiers: ImportSpecifier[];
  node: ASTNode;
  used: boolean;
}

export interface ImportSpecifier {
  name: string;
  alias?: string;
  type: 'default' | 'named' | 'namespace';
  used: boolean;
}

export interface VariableInfo {
  name: string;
  type: string;
  scope: string;
  node: ASTNode;
  used: boolean;
  references: ASTNode[];
}

export interface FunctionInfo {
  name: string;
  type: 'function' | 'method' | 'arrow';
  node: ASTNode;
  used: boolean;
  exported: boolean;
}

export interface ConsoleStatement {
  type: 'log' | 'warn' | 'error' | 'debug' | 'info';
  node: ASTNode;
  arguments: string[];
}

export interface DebuggerStatement {
  node: ASTNode;
}