import * as vscode from 'vscode';
import { injectable, inject } from 'inversify';
import { Context, DISPLAY_NAME } from '../consts';
import { ConfigService, ConfigKeys } from './config-service';
import * as path from 'path';
import { getHtmlForWebview } from '../utils/webview';
import type { InvokeRequest, InvokeResponse } from '../../types/shared';
import { fetchFavicon } from '../utils/utils';

@injectable()
export class WebviewService implements vscode.Disposable {
  private panel?: vscode.WebviewPanel;
  #invokeMap = new Map<keyof InvokeRequest, (args: any) => any>();

  constructor(
    @inject(Context) private context: vscode.ExtensionContext,
    @inject(ConfigService) private configService: ConfigService
  ) {
    this.registerCommand('listProviders', () => {
      return this.configService.getConfig(ConfigKeys.SERVERS);
    });
    this.registerCommand('fetchDomainIcon', fetchFavicon);
  }

  public async openSettings() {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'commit-ai-settings',
      `${DISPLAY_NAME} Settings`,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(this.context.extensionPath, 'out', 'webview'))
        ]
      }
    );

    this.panel.webview.html = this.getHtmlForWebview(this.panel.webview);

    this.panel.onDidDispose(
      () => {
        this.panel = undefined;
      },
      null,
      this.context.subscriptions
    );

    this.panel.webview.onDidReceiveMessage(
      async (message) => {
        const handler = this.#invokeMap.get(message.command);
        if (handler) {
          try {
            const result = await handler(message.args);
            this.panel?.webview.postMessage({
              command: 'response',
              id: message.id,
              args: result
            });
          } catch (error) {
            this.panel?.webview.postMessage({
              command: 'response',
              id: message.id,
              error: error
            });
          }
        }
      },
      undefined,
      this.context.subscriptions
    );
  }

  private registerCommand<K extends keyof InvokeRequest>(
    command: K,
    callback: (args: InvokeRequest[K]) => InvokeResponse[K]
  ) {
    this.#invokeMap.set(command, callback);
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const isDev = this.context.extensionMode === vscode.ExtensionMode.Development;
    const webviewPath = path.join(this.context.extensionPath, 'out', 'webview');
    return getHtmlForWebview(webviewPath, webview, isDev);
  }

  dispose() {
    this.panel?.dispose();
    this.#invokeMap.clear();
  }
}
