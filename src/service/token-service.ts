import { inject, injectable } from 'inversify';
import * as vscode from 'vscode';
import { ConfigKeys, ConfigService } from './config-service';
import { LLMServerService } from './llm-server-service';
import { ModelContextService } from './model-context';
import { calculateTokens, type TokenCountMode } from '../utils/tokens';
import { getCurrentGitRepository, getGitApi } from '../utils/git-utils';
import { isNil } from 'lodash-es';
import { PromptService } from './prompt-service';
import { debouncePromise, type DebouncedPromiseFunc } from '../utils/utils';
import type { Repository } from '../utils/git';
import type { SimplifyStats } from './diff-simplify/types';

export interface TokenState {
  tokens: number;
  limit: number | undefined;
  totalChars: number;
  usagePercent: number | undefined;
  status: 'idle' | 'analyzing' | 'ready' | 'exceeded' | 'warning' | 'caution' | 'ok';
  modelName?: string;
  diffStats?: SimplifyStats;
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
  private scheduleUpdate: DebouncedPromiseFunc<() => Promise<void>>;
  private abortController?: AbortController;
  private lastMessagesHash?: string;

  constructor(
    @inject(ConfigService)
    private readonly configService: ConfigService,
    @inject(LLMServerService)
    private readonly llmServerService: LLMServerService,
    @inject(ModelContextService)
    private readonly modelContextService: ModelContextService,
    @inject(PromptService)
    private readonly promptService: PromptService
  ) {
    this.scheduleUpdate = debouncePromise(this.updateTokenCount.bind(this), 800);
    this.disposables.push(this.configService.onDidChange(() => this.scheduleUpdate()));
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        if (
          e.document.uri.scheme === 'vscode-scm' ||
          /^git\/scm.*\/input$/.test(e.document.uri.fsPath)
        ) {
          this.scheduleUpdate();
        }
      })
    );

    const gitApi = getGitApi();
    if (gitApi) {
      const registeredRepos = new Set<string>();
      const setupRepo = (repo: Repository) => {
        const path = repo.rootUri.fsPath;
        if (registeredRepos.has(path)) {
          return;
        }
        registeredRepos.add(path);

        this.disposables.push(repo.state.onDidChange(() => this.scheduleUpdate()));
      };

      this.disposables.push(gitApi.onDidOpenRepository(setupRepo));
      gitApi.repositories.forEach(setupRepo);
    }
    this.scheduleUpdate();
  }

  get state() {
    return this._state;
  }

  async analyze(messages: string[], diffStats?: SimplifyStats, signal?: AbortSignal) {
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
    const tokenResult = await calculateTokens(messages, model.name, tokenCountMode, signal);

    this.updateState({
      tokens: tokenResult.estimated,
      limit,
      totalChars: tokenResult.totalChars,
      modelName: model.name,
      diffStats
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
    this.lastMessagesHash = undefined;
    this.updateState({
      tokens: 0,
      limit: undefined,
      totalChars: 0,
      usagePercent: undefined,
      status: 'idle'
    });
  }

  private async updateTokenCount() {
    this.abortController?.abort();
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      const repo = getCurrentGitRepository();
      if (!repo) {
        return this.reset();
      }
      const result = await this.promptService.buildPromptMessages(repo);
      if (!result || !result.messages) {
        return this.reset();
      }

      const contentList = result.messages.map((m) => m.content);
      const messagesHash = JSON.stringify(contentList);
      if (messagesHash === this.lastMessagesHash) {
        return;
      }
      this.lastMessagesHash = messagesHash;

      await this.analyze(contentList, result.diffStats, signal);
    } catch (err) {
      console.error(err);
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
    this.abortController?.abort();
  }
}
