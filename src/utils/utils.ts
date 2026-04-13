import * as vscode from 'vscode';
import { DISPLAY_NAME } from '../consts';

/**
 * Adds progress handling functionality.
 */
export class ProgressHandler {
  static async withProgress<T>(
    title: string,
    task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
  ): Promise<T> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `[${DISPLAY_NAME}] ${title}`,
        cancellable: true
      },
      task
    );
  }
}

export const zeroToUndefined = (value?: number) => (value === 0 ? undefined : value);
