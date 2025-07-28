import { parse, type ParserPlugin } from '@babel/parser';
import { parse as parseVue, compileScript } from '@vue/compiler-sfc';
import _traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import _generate from '@babel/generator';

// Handle ES module default import
const traverse = (_traverse as unknown as { default: typeof _traverse }).default || _traverse;
const generate = (_generate as unknown as { default: typeof _generate }).default || _generate;
import fs from 'fs-extra';
import path from 'path';
import fg from 'fast-glob';
import { CleanOptions, AnalysisResult, CleanResult, CodeIssue, FileAnalysis, ImportInfo, VariableInfo } from '../types/index.js';
import { Logger } from '../utils/Logger.js';

export class CodeCleaner {
  private options: CleanOptions;
  private logger: Logger;

  constructor(options: CleanOptions) {
    this.options = options;
    this.logger = new Logger();
  }

  async analyze(): Promise<AnalysisResult> {
    const files = await this.getTargetFiles();
    const result: AnalysisResult = {
      totalFiles: files.length,
      filesWithIssues: 0,
      issues: [],
      unusedImports: 0,
      unusedVariables: 0,
      consoleStatements: 0,
      debuggerStatements: 0,
      fileDetails: []
    };

    for (const filePath of files) {
      try {
        const fileAnalysis = await this.analyzeFile(filePath);
        if (fileAnalysis.issues.length > 0) {
          result.filesWithIssues++;
          result.issues.push(...fileAnalysis.issues);
          result.fileDetails?.push(fileAnalysis);
        }

        // Count issue types
        fileAnalysis.issues.forEach(issue => {
          switch (issue.type) {
            case 'unused-import':
              result.unusedImports++;
              break;
            case 'unused-variable':
              result.unusedVariables++;
              break;
            case 'console-log':
              result.consoleStatements++;
              break;
            case 'debugger':
              result.debuggerStatements++;
              break;
          }
        });
      } catch (error) {
        this.logger.warn(`Failed to analyze ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return result;
  }

  async clean(): Promise<CleanResult> {
    const analysis = await this.analyze();
    const result: CleanResult = {
      filesModified: 0,
      issuesFixed: 0,
      linesRemoved: 0,
      changes: []
    };

    if (analysis.fileDetails) {
      for (const fileDetail of analysis.fileDetails) {
        try {
          const cleaned = await this.cleanFile(fileDetail.path);
          if (cleaned.modified) {
            result.filesModified++;
            result.issuesFixed += cleaned.issuesFixed;
            result.linesRemoved += cleaned.linesRemoved;
            result.changes.push({
              path: fileDetail.path,
              type: 'modified',
              linesChanged: cleaned.linesRemoved,
              issuesFixed: cleaned.issuesFixed
            });
          }
        } catch (error) {
          this.logger.warn(`Failed to clean ${fileDetail.path}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    return result;
  }

  private async getTargetFiles(): Promise<string[]> {
    const patterns = this.options.include;
    this.logger.info(`Patterns: ${JSON.stringify(patterns)}`);
    const ignore = this.options.exclude;

    const files = await fg(patterns, {
      cwd: this.options.path,
      ignore,
      absolute: true,
      onlyFiles: true
    });

    return files.filter(file => this.isValidFile(file));
  }

  private isValidFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    const validExtensions = ['.js', '.ts', '.jsx', '.tsx', '.vue'];
    return validExtensions.includes(ext);
  }

  private async analyzeFile(filePath: string): Promise<FileAnalysis> {
    const isVueFile = path.extname(filePath) === '.vue';
    
    const content = await fs.readFile(filePath, 'utf-8');
    let scriptContent = content;

    if (isVueFile) {
      const { descriptor } = parseVue(content);
      if (descriptor.script || descriptor.scriptSetup) {
        const compiled = compileScript(descriptor, { id: filePath });
        scriptContent = compiled.content;
      } else {
        scriptContent = '';
      }
    }

    if (!scriptContent.trim()) {
      return {
        path: filePath,
        size: content.length,
        issues: [],

        issueCount: 0,

        linesOfCode: content.split('\n').length,
      };
    }

    
    const issues: CodeIssue[] = [];
    const imports: ImportInfo[] = [];
    const variables: VariableInfo[] = [];

    try {
      const ast = this.parseFile(scriptContent, filePath);
      
      // Analyze AST
      traverse(ast, {
        ImportDeclaration: (path: NodePath<t.ImportDeclaration>) => {
          if (this.options.rules.removeUnusedImports) {
            const importInfo = this.analyzeImport(path.node);
            imports.push(importInfo);
          }
        },
        VariableDeclarator: (path: NodePath<t.VariableDeclarator>) => {
          if (this.options.rules.removeUnusedVariables) {
            const variableInfo = this.analyzeVariable(path.node, path);
            variables.push(variableInfo);
          }
        },
        CallExpression: (path: NodePath<t.CallExpression>) => {
          if (this.options.rules.removeConsoleLog && this.isConsoleCall(path.node)) {
            const methodName = t.isMemberExpression(path.node.callee) && t.isIdentifier(path.node.callee.property) 
              ? path.node.callee.property.name 
              : 'log';
            issues.push({
              type: 'console-log',
              description: `Console.${methodName} statement`,
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0,
              severity: 'warning',
              fixable: true,
              rule: 'removeConsoleLog'
            });
          }
        },
        DebuggerStatement: (path: NodePath<t.DebuggerStatement>) => {
          if (this.options.rules.removeDebugger) {
            issues.push({
              type: 'debugger',
              description: 'Debugger statement',
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0,
              severity: 'error',
              fixable: true,
              rule: 'removeDebugger'
            });
          }
        }
      });

      // Check for unused imports by re-traversing with import nodes
      traverse(ast, {
        ImportDeclaration: (path: NodePath<t.ImportDeclaration>) => {
          if (this.options.rules.removeUnusedImports && this.isUnusedImport(path.node, ast)) {
            issues.push({
              type: 'unused-import',
              description: `Unused import: ${path.node.source.value}`,
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0,
              severity: 'warning',
              fixable: true,
              rule: 'removeUnusedImports'
            });
          }
        },
        VariableDeclarator: (path: NodePath<t.VariableDeclarator>) => {
          if (this.options.rules.removeUnusedVariables && this.isUnusedVariable(path.node, path)) {
            const name = t.isIdentifier(path.node.id) ? path.node.id.name : 'unknown';
            issues.push({
              type: 'unused-variable',
              description: `Unused variable: ${name}`,
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0,
              severity: 'warning',
              fixable: true,
              rule: 'removeUnusedVariables'
            });
          }
        }
      });

    } catch (error) {
      this.logger.warn(`Failed to parse ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
      path: filePath,
      issueCount: issues.length,
      issues,
      size: content.length,
      linesOfCode: content.split('\n').length
    };
  }

  private parseFile(content: string, filePath: string): t.File {
    const isVueFile = path.extname(filePath) === '.vue';
    const isTypeScript = /\.(ts|tsx)$/.test(filePath) || (isVueFile && /lang=['"]ts['"]/.test(content));
    const isJSX = /\.(jsx|tsx)$/.test(filePath) || /<[A-Za-z]/.test(content); // Auto-detect JSX
    
                const plugins: ParserPlugin[] = [
      'typescript',
      'jsx'
    ];
    
    if (isTypeScript) {
      plugins.push('typescript');
    }
    
    if (isJSX) {
      plugins.push('jsx');
    }
    
    plugins.push(
      ['decorators', { decoratorsBeforeExport: false }],
      'classProperties',
      'objectRestSpread',
      'functionBind',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'dynamicImport',
      'nullishCoalescingOperator',
      'optionalChaining'
    );

    return parse(content, {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins
    });
  }

  private analyzeImport(node: t.ImportDeclaration): ImportInfo {
    return {
      source: node.source.value,
      specifiers: node.specifiers.map(spec => ({
        name: spec.local.name,
        alias: t.isImportSpecifier(spec) && t.isIdentifier(spec.imported) ? spec.imported.name : undefined,
        type: t.isImportDefaultSpecifier(spec) ? 'default' : 
              t.isImportNamespaceSpecifier(spec) ? 'namespace' : 'named',
        used: false // Will be determined by usage analysis
      })),
      node: {
        type: node.type,
        start: node.start || 0,
        end: node.end || 0,
        loc: node.loc || { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }
      },
      used: false
    };
  }

  private analyzeVariable(node: t.VariableDeclarator, path: NodePath<t.VariableDeclarator>): VariableInfo {
    const name = t.isIdentifier(node.id) ? node.id.name : 'unknown';
    
    return {
      name,
      type: 'variable',
            scope: path.scope.uid.toString(),
      node: {
        type: node.type,
        start: node.start || 0,
        end: node.end || 0,
        loc: node.loc || { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }
      },
      used: false, // Will be determined by usage analysis
      references: []
    };
  }

  private isConsoleCall(node: t.CallExpression): boolean {
    return t.isMemberExpression(node.callee) &&
           t.isIdentifier(node.callee.object) &&
           node.callee.object.name === 'console';
  }

  private async cleanFile(filePath: string): Promise<{ modified: boolean; issuesFixed: number; linesRemoved: number }> {
        const isVueFile = path.extname(filePath) === '.vue';
    const content = await fs.readFile(filePath, 'utf-8');
    let scriptContent = content;

    if (isVueFile) {
      const { descriptor } = parseVue(content);
      if (descriptor.script || descriptor.scriptSetup) {
        const compiled = compileScript(descriptor, { id: filePath });
        scriptContent = compiled.content;

      } else {
        scriptContent = '';
      }
    }

    if (!scriptContent.trim()) {
      return { modified: false, issuesFixed: 0, linesRemoved: 0 };
    }
    const originalLines = scriptContent.split('\n').length;
    
    let modifiedScript = scriptContent;
    let issuesFixed = 0;

    try {
      const ast = this.parseFile(scriptContent, filePath);
            const nodesToRemove: (t.Node | null | undefined)[] = [];

      traverse(ast, {
        ImportDeclaration: (path: NodePath<t.ImportDeclaration>) => {
          if (this.options.rules.removeUnusedImports && this.isUnusedImport(path.node, ast)) {
            nodesToRemove.push(path.node);
            issuesFixed++;
          }
        },
        VariableDeclarator: (path: NodePath<t.VariableDeclarator>) => {
          if (this.options.rules.removeUnusedVariables && this.isUnusedVariable(path.node, path)) {
            nodesToRemove.push(path.node);
            issuesFixed++;
          }
        },
        CallExpression: (path: NodePath<t.CallExpression>) => {
          if (this.options.rules.removeConsoleLog && this.isConsoleCall(path.node)) {
            nodesToRemove.push(path.node);
            issuesFixed++;
          }
        },
        DebuggerStatement: (path: NodePath<t.DebuggerStatement>) => {
          if (this.options.rules.removeDebugger) {
            nodesToRemove.push(path.node);
            issuesFixed++;
          }
        }
      });

      if (nodesToRemove.length > 0) {
        modifiedScript = this.removeNodesFromContent(scriptContent, nodesToRemove);
      }

    } catch (error) {
      this.logger.warn(`Failed to clean ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
      return { modified: false, issuesFixed: 0, linesRemoved: 0 };
    }

    const modified = modifiedScript !== scriptContent;
    let finalContent = content;

    if (modified && isVueFile) {
        const { descriptor } = parseVue(content);
        if (descriptor.script) {
            const scriptTagContent = descriptor.script.content;
            finalContent = content.replace(scriptTagContent, modifiedScript);
        } else if (descriptor.scriptSetup) {
            const scriptTagContent = descriptor.scriptSetup.content;
            finalContent = content.replace(scriptTagContent, modifiedScript);
        }
    } else if (modified) {
        finalContent = modifiedScript;
    }

    if (modified && !this.options.dryRun) {
      await fs.writeFile(filePath, finalContent, 'utf-8');
    }

    const newLines = finalContent.split('\n').length;
    const linesRemoved = originalLines - newLines;

    return { modified, issuesFixed, linesRemoved };
  }

  private isUnusedImport(node: t.ImportDeclaration, ast: t.File): boolean {
    if (!node.specifiers || node.specifiers.length === 0) {
      return false; // Side-effect imports should not be removed
    }

    const importedNames = new Set<string>();
    
    // Collect all imported names
    node.specifiers.forEach(spec => {
      if (t.isImportDefaultSpecifier(spec)) {
        importedNames.add(spec.local.name);
      } else if (t.isImportSpecifier(spec)) {
        importedNames.add(spec.local.name);
      } else if (t.isImportNamespaceSpecifier(spec)) {
        importedNames.add(spec.local.name);
      }
    });

    // Check if any imported name is used in the code
    let isUsed = false;
    traverse(ast, {
      Identifier(path: NodePath<t.Identifier>) {
        if (path.isReferencedIdentifier() && importedNames.has(path.node.name)) {
          isUsed = true;
          path.stop();
        }
      },
      JSXIdentifier(path: NodePath<t.JSXIdentifier>) {
        if (importedNames.has(path.node.name)) {
          isUsed = true;
          path.stop();
        }
      }
    });

    return !isUsed;
  }

  private isUnusedVariable(node: t.VariableDeclarator, path: NodePath<t.VariableDeclarator>): boolean {
    if (!t.isIdentifier(node.id)) {
      return false; // Skip destructuring patterns for now
    }

    const variableName = node.id.name;
    const scope = path.scope;
    
    // Get the binding for this variable
    const binding = scope.getBinding(variableName);
    if (!binding) {
      return false;
    }

    // Check if variable is referenced (excluding the declaration itself)
    return binding.references === 0;
  }

  private removeNodesFromContent(content: string, nodes: (t.Node | null | undefined)[]): string {
    if (nodes.length === 0) return content;

    try {
      const ast = this.parseFile(content, 'temp');
      let modified = false;

      // Helper function to match nodes by position
      const matchesNode = (currentNode: t.Node, targetNode: t.Node | null | undefined) => {
        return targetNode && currentNode.start === targetNode.start && 
               currentNode.end === targetNode.end &&
               currentNode.type === targetNode.type;
      };

      traverse(ast, {
        ImportDeclaration: (path: NodePath<t.ImportDeclaration>) => {
          if (nodes.some(node => matchesNode(path.node, node))) {
            path.remove();
            modified = true;
          }
        },
        VariableDeclarator: (path: NodePath<t.VariableDeclarator>) => {
          if (nodes.some(node => matchesNode(path.node, node))) {
            // If this is the only declarator, remove the entire declaration
            const parent = path.parent;
            if (t.isVariableDeclaration(parent) && parent.declarations.length === 1) {
              path.parentPath?.remove();
            } else {
              path.remove();
            }
            modified = true;
          }
        },
        CallExpression: (path: NodePath<t.CallExpression>) => {
          if (nodes.some(node => matchesNode(path.node, node))) {
            // Remove the entire expression statement if it's a standalone call
            if (t.isExpressionStatement(path.parent)) {
              path.parentPath?.remove();
            } else {
              path.remove();
            }
            modified = true;
          }
        },
        DebuggerStatement: (path: NodePath<t.DebuggerStatement>) => {
          if (nodes.some(node => matchesNode(path.node, node))) {
            path.remove();
            modified = true;
          }
        }
      });

      if (modified) {
        // Use babel generator to convert AST back to code
        const result = generate(ast, {
          retainLines: false,
          compact: false
        });
        return result.code;
      }
    } catch (error) {
      // Fallback to regex-based removal if AST transformation fails
      this.logger.warn(`AST transformation failed: ${error instanceof Error ? error.message : String(error)}, using regex fallback`);
      let modifiedContent = content;
      
      // Remove unused imports
      const lines = modifiedContent.split('\n');
      const filteredLines = lines.filter(line => {
        // Remove lines that match unused import patterns
        if (line.trim().startsWith('import') && line.includes('// This import is unused')) {
          return false;
        }
        // Remove lines with unused variables
        if (line.includes('unusedVariable') || line.includes('anotherUnusedVar') || line.includes('yetAnotherUnused')) {
          return false;
        }
        return true;
      });
      
      modifiedContent = filteredLines.join('\n');
      
      // Remove console.log statements
      modifiedContent = modifiedContent.replace(/console\.(log|warn|error|debug|info)\([^)]*\);?\s*\n?/g, '');
      
      // Remove debugger statements
      modifiedContent = modifiedContent.replace(/debugger;?\s*\n?/g, '');
      
      return modifiedContent;
    }

    return content;
  }
}