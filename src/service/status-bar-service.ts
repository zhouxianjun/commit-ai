import { Commands } from '../consts';
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
    this.statusBarItem.command = Commands.SHOW_TOKEN_INFO;
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
    const tokens = this.compactNumber(state.tokens);
    const usage =
      state.limit && state.usagePercent !== undefined
        ? ` (${Math.round(state.usagePercent)}%)`
        : '';

    return `$(sparkle) ~${tokens}${usage}`;
  }

  private compactNumber(num: number): string {
    if (num < 1000) {
      return num.toString();
    }
    if (num < 1000000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  }

  private formatTooltip(state: TokenState, config: StatusConfig): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString();
    tooltip.isTrusted = true;
    tooltip.supportThemeIcons = true;
    tooltip.appendMarkdown('**Token Usage Details**\n\n');

    if (state.modelName) {
      tooltip.appendMarkdown(`- Current Model: **${state.modelName}**\n`);
    }

    tooltip.appendMarkdown(`- Total Characters: **${state.totalChars.toLocaleString()}**\n`);
    tooltip.appendMarkdown(`- Estimated Tokens: **~${state.tokens.toLocaleString()}**\n`);

    if (state.limit) {
      tooltip.appendMarkdown(`- Model Window Limit: **${state.limit.toLocaleString()}**\n`);
      tooltip.appendMarkdown(`- Context Usage: **${(state.usagePercent || 0).toFixed(1)}%**\n`);
    }

    tooltip.appendMarkdown('\n---\n\n');
    tooltip.appendMarkdown(`${config.icon} Status: **${config.label || config.text || 'Ready'}**`);

    return tooltip;
  }

  dispose() {
    this.statusBarItem.dispose();
  }
}
