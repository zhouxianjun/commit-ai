import 'reflect-metadata';
import * as vscode from 'vscode';
import { initContainer } from './service';

/**
 * Activates the extension and registers commands.
 */
export async function activate(context: vscode.ExtensionContext) {
  try {
    initContainer(context);
  } catch (error) {
    console.error('Failed to activate extension:', error);
    throw error;
  }
}

/**
 * Deactivates the extension.
 */
export function deactivate() {}
