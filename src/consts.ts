import type { ServiceIdentifier } from 'inversify';
import * as vscode from 'vscode';
import { name } from '../package.json';

export const NAME = name;
export const Context: ServiceIdentifier<vscode.ExtensionContext> = Symbol('Context');
export const BASIC_COMMAND = `extension.${NAME}`;
export const Commands = {
  GENERATE_COMMIT: BASIC_COMMAND,
  SHOW_TOKEN_INFO: `${BASIC_COMMAND}.show-token-info`
} as const;
export type Commands = (typeof Commands)[keyof typeof Commands];
