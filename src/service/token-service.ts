import { inject, injectable, LazyServiceIdentifier } from 'inversify';
import * as vscode from 'vscode';
import { ConfigKeys, ConfigService } from './config-service';
import { LLMServerService } from './llm-server-service';
import { ModelContextService } from './model-context';
import { calculateTokens, type TokenCountMode } from '../utils/tokens';
import { getCurrentGitRepository, getGitApi } from '../utils/git-utils';
import { debounce, isNil, type DebouncedFunc } from 'lodash-es';
import { PromptService } from './prompt-service';
import { ProviderService } from './provider-service';

export interface TokenState {
  tokens: number;
  limit: number | undefined;
  totalChars: number;
  usagePercent: number | undefined;
  status: 'idle' | 'analyzing' | 'ready' | 'exceeded' | 'warning' | 'caution' | 'ok';
  modelName?: string;
}
export type TokenStateChangeListener = (state: TokenState) => void;

@injectable()
export class TokenService implements vscode.Disposable {
  private _state: TokenState = {
    tokens: 0,
    limit: undefined,
    totalChars: 0,
    usagePercent: undefined,
    status: 'idle'
  };
  private listeners: TokenStateChangeListener[] = [];
  private disposables: vscode.Disposable[] = [];
  private scheduleUpdate: DebouncedFunc<() => Promise<void>>;

  constructor(
    @inject(ConfigService)
    private readonly configService: ConfigService,
    @inject(LLMServerService)
    private readonly llmServerService: LLMServerService,
    @inject(ModelContextService)
    private readonly modelContextService: ModelContextService,
    @inject(PromptService)
    private readonly promptService: PromptService,
    @inject(new LazyServiceIdentifier(() => ProviderService))
    private readonly providerService: ProviderService
  ) {
    this.scheduleUpdate = debounce(this.updateTokenCount.bind(this), 500);
    this.disposables.push(this.configService.onDidChange(() => this.scheduleUpdate()));
    this.disposables.push(vscode.workspace.onDidChangeTextDocument(() => this.scheduleUpdate()));
    const gitApi = getGitApi();
    if (gitApi) {
      gitApi.onDidOpenRepository((repo) => {
        this.disposables.push(repo.state.onDidChange(() => this.scheduleUpdate()));
      });
      gitApi.repositories.forEach((repo) => {
        this.disposables.push(repo.state.onDidChange(() => this.scheduleUpdate()));
      });
    }
    this.scheduleUpdate();
  }

  get state() {
    return this._state;
  }

  async analyze(messages: string[]) {
    this.updateState({
      status: 'analyzing'
    });

    const servers = this.llmServerService.getServers();
    if (!servers.length) {
      throw new Error('No model configured');
    }
    const model = servers[0].model;
    const limit =
      model.maxInputTokens ?? this.modelContextService.getContextWindowLimit(model.name);
    const tokenCountMode = this.configService.getConfig<TokenCountMode>(
      ConfigKeys.TOKEN_COUNT_MODE
    );
    const tokenResult = await calculateTokens(messages, model.name, tokenCountMode);

    this.updateState({
      tokens: tokenResult.estimated,
      limit,
      totalChars: tokenResult.totalChars,
      modelName: model.name
    });

    return this._state;
  }

  /**
   * Subscribes to token state changes.
   * Returns a disposable to unsubscribe.
   */
  onChange(listener: TokenStateChangeListener): vscode.Disposable {
    this.listeners.push(listener);
    return {
      dispose: () => {
        this.listeners = this.listeners.filter((l) => l !== listener);
      }
    };
  }

  reset() {
    this.updateState({
      tokens: 0,
      limit: undefined,
      totalChars: 0,
      usagePercent: undefined,
      status: 'idle'
    });
  }

  private async updateTokenCount() {
    try {
      const repo = getCurrentGitRepository();
      if (!repo) {
        return this.reset();
      }
      const messages = await this.promptService.buildPromptMessages(repo);
      if (!messages) {
        return this.reset();
      }

      await this.analyze(messages.map((m) => m.content));
    } catch {
      // Silently fail to avoid interrupting user workflow
    }
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener(this._state);
      } catch {
        // Ignore listener errors
      }
    }
  }
  private updateState(state: Partial<TokenState>) {
    const newState = { ...this._state, ...state };

    if (isNil(newState.usagePercent) && newState.limit) {
      newState.usagePercent = (newState.tokens / newState.limit) * 100;
    }
    if (!state.status) {
      newState.status = this.getStatus(newState);
    }

    this._state = newState;
    this.notifyListeners();
  }
  private getStatus(state: TokenState): TokenState['status'] {
    const { usagePercent, tokens } = state;
    if (!tokens) {
      return 'idle';
    }
    if (usagePercent >= 100) {
      return 'exceeded';
    }
    if (usagePercent >= 90) {
      return 'warning';
    }
    if (usagePercent >= 70) {
      return 'caution';
    }
    return 'ok';
  }

  dispose() {
    this.disposables.forEach((disposable) => disposable.dispose());
    this.scheduleUpdate.cancel();
  }
}
