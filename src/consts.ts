import type { ServiceIdentifier } from 'inversify';
import * as vscode from 'vscode';
import { name, displayName } from '../package.json';

export const NAME = name;
export const DISPLAY_NAME = displayName;
export const Context: ServiceIdentifier<vscode.ExtensionContext> = Symbol('Context');
export const BASIC_COMMAND = `extension.${NAME}`;
export const Commands = {
  GENERATE_COMMIT: BASIC_COMMAND
} as const;
export type Commands = (typeof Commands)[keyof typeof Commands];
