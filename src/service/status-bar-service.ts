import { inject, injectable } from 'inversify';
import * as vscode from 'vscode';
import { TokenService, type TokenState } from './token-service';
import { ConfigKeys, ConfigService } from './config-service';

const STATUS_UI_CONFIG: Record<string, StatusConfig> = {
  exceeded: { color: '#ff4444', icon: '$(error)', label: 'Exceeds limit' },
  warning: { color: '#ffaa00', icon: '$(warning)', label: 'Approaching limit' },
  caution: { color: '#888888', icon: '$(info)', label: 'Caution' },
  ok: { color: undefined, icon: '$(check)', label: 'OK' },
  analyzing: { color: undefined, icon: '$(sync~spin)', text: 'Analyzing...', isProcessing: true },
  idle: { hide: true }
};
type StatusConfig = {
  color?: string;
  icon?: string;
  text?: string;
  isProcessing?: boolean;
  hide?: boolean;
  label?: string;
};

@injectable()
export class StatusBarService implements vscode.Disposable {
  private statusBarItem: vscode.StatusBarItem;

  constructor(
    @inject(TokenService) private tokenService: TokenService,
    @inject(ConfigService) private configService: ConfigService
  ) {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.statusBarItem.command = 'extension.ai-commit.showTokenInfo';
    this.statusBarItem.show();

    this.tokenService.onChange((state) => this.updateStatusBar(state));
    this.updateStatusBar(this.tokenService.state);
  }

  private updateStatusBar(state: TokenState) {
    const config = STATUS_UI_CONFIG[state.status] || STATUS_UI_CONFIG.ok;
    const isShow = this.configService.getConfig<boolean>(ConfigKeys.SHOW_TOKEN_COUNT, true);
    if (config.hide || !isShow) {
      this.statusBarItem.hide();
      return;
    }
    this.render(state, config);
  }

  private render(state: TokenState, config: StatusConfig) {
    this.statusBarItem.show();
    this.statusBarItem.color = config.color;
    this.statusBarItem.text = config.isProcessing
      ? `${config.icon} ${config.text}`
      : this.formatText(state);
    this.statusBarItem.tooltip = this.formatTooltip(state, config);
  }

  private formatText(state: TokenState): string {
    const tokens = state.tokens.toLocaleString();
    const limit = state.limit?.toLocaleString();
    const usage = Math.round(state.usagePercent || 0);

    return state.limit
      ? `$(symbol-numeric) ~${tokens}/${limit} (${usage}%)`
      : `$(symbol-numeric) ~${tokens} tokens`;
  }

  private formatTooltip(state: TokenState, config: StatusConfig): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString();
    tooltip.isTrusted = true;
    tooltip.appendMarkdown('**Token Count Info**\n\n');

    tooltip.appendMarkdown(`- Characters: **${state.totalChars.toLocaleString()}**\n`);
    tooltip.appendMarkdown(`- Estimated tokens: **~${state.tokens.toLocaleString()}**\n`);

    state.limit && tooltip.appendMarkdown(`- Model limit: **${state.limit.toLocaleString()}**\n`);
    state.limit &&
      tooltip.appendMarkdown(`- Usage: **${Math.round(state.usagePercent || 0)}%**\n\n`);

    tooltip.appendMarkdown(`${config.icon} Status: **${config.label || config.text || 'Ready'}**`);

    return tooltip;
  }

  dispose() {
    this.statusBarItem.dispose();
  }
}
