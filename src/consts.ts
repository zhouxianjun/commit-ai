import type { ServiceIdentifier } from 'inversify';
import * as vscode from 'vscode';

export const Context: ServiceIdentifier<vscode.ExtensionContext> = Symbol('Context');
