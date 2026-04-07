import type { ServiceIdentifier } from 'inversify';
import * as vscode from 'vscode';

export const Context: ServiceIdentifier<vscode.ExtensionContext> = Symbol('Context');
export const BASIC_COMMAND = 'extension.ai-commit';
export enum Commands {
  GENERATE_COMMIT = BASIC_COMMAND,
  SHOW_TOKEN_INFO = `${BASIC_COMMAND}.show-token-info`
}
