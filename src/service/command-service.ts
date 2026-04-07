import * as vscode from 'vscode';
import { NAME } from './config-service';
import { inject, injectable } from 'inversify';
import { CommitService } from './commit-service';
import { Context } from '../consts';

@injectable()
export class CommandService implements vscode.Disposable {
  private disposables: vscode.Disposable[] = [];
  constructor(
    @inject(Context) private context: vscode.ExtensionContext,
    @inject(CommitService) private commitService: CommitService
  ) {
    this.registerCommands();
  }

  registerCommands() {
    this.registerCommand('extension.ai-commit', (args) =>
      this.commitService.generateCommitMessage(args)
    );
    this.registerCommand('extension.ai-commit.token-info', this.showTokenInfo);
    this.registerCommand('extension.ai-commit.show-token-info', () => this.showTokenInfo());
  }

  private openSettings() {
    return vscode.commands.executeCommand('workbench.action.openSettings', NAME);
  }
  private async showTokenInfo() {
    const result = await vscode.window.showInformationMessage(
      'Token display is active. You can configure limits and display options in settings.',
      'Open Settings'
    );
    result === 'Open Settings' && this.openSettings();
  }

  private registerCommand(command: string, handler: (...args: any[]) => any) {
    const disposable = vscode.commands.registerCommand(command, (...args) => {
      return this.createRetryableHandler(handler)(...args);
    });

    this.disposables.push(disposable);
    this.context.subscriptions.push(disposable);
  }

  private createRetryableHandler(handler: (...args: any[]) => any) {
    return async (...args: any[]) => {
      try {
        await handler(...args);
      } catch (error) {
        const actions = {
          Retry: () => this.createRetryableHandler(handler)(...args),
          Configure: () => this.openSettings()
        };
        const result = await vscode.window.showErrorMessage(
          `Failed: ${error.message}`,
          ...Object.keys(actions)
        );
        result && (actions as any)[result]?.();
      }
    };
  }

  dispose() {}
}
