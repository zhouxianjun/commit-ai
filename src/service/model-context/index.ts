import { inject, injectable } from 'inversify';
import * as vscode from 'vscode';
import BUILTIN_MODEL_CONTEXT from './model-context.json';
import https from 'https';
import { Context } from '../../consts';

const LITELLM_JSON_URL =
  'https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json';
const CACHE_KEY = 'modelContextCache';
const CACHE_TIMESTAMP_KEY = 'modelContextCacheTimestamp';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface ModelContextCache {
  [modelName: string]: number;
}

@injectable()
export class ModelContextService implements vscode.Disposable {
  private updateTimer: NodeJS.Timeout | null = null;

  constructor(@inject(Context) private readonly context: vscode.ExtensionContext) {
    this.updateTimer = setInterval(() => this.updateCacheIfNeeded(), CACHE_TTL_MS);
    this.updateCacheIfNeeded();
  }

  dispose() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
  }

  getContextWindowLimit(model: string): number | undefined {
    const modelContextMap = this.getModelContextMap();
    const modelKeys = Object.keys(modelContextMap);
    const modelKey = this.searchModelKey(model.toLocaleLowerCase(), modelKeys);
    return modelContextMap[modelKey];
  }

  async updateCacheIfNeeded() {
    const timestamp = this.context.globalState.get<number>(CACHE_TIMESTAMP_KEY, 0);
    const now = Date.now();

    if (now - timestamp < CACHE_TTL_MS) {
      return;
    }

    try {
      const remote = await this.fetchRemoteModelContext();
      if (remote && Object.keys(remote).length > 0) {
        await this.context.globalState.update(CACHE_KEY, remote);
        await this.context.globalState.update(CACHE_TIMESTAMP_KEY, now);
      }
    } catch {
      // Silently fail -- use built-in mapping
    }
  }

  private searchModelKey(model: string, modelKeys: string[]) {
    if (modelKeys.includes(model)) {
      return model;
    }
    const includeModelKeys = modelKeys.filter((key) => key.includes(model));
    const provider = model.split('/')[0];
    const matchProviderKey = includeModelKeys.find((key) => key.startsWith(provider));
    if (matchProviderKey) {
      return matchProviderKey;
    }
    return includeModelKeys[0];
  }

  private getModelContextMap() {
    const cached = this.context.globalState.get<ModelContextCache>(CACHE_KEY);
    if (!cached) {
      return BUILTIN_MODEL_CONTEXT;
    }
    return { ...BUILTIN_MODEL_CONTEXT, cached };
  }

  private async fetchRemoteModelContext() {
    try {
      return new Promise((resolve) => {
        https
          .get(LITELLM_JSON_URL, { timeout: 10000 }, (res) => {
            if (res.statusCode !== 200) {
              resolve(null);
              return;
            }
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                const parsed = JSON.parse(data);
                resolve(this.extractChatModels(parsed));
              } catch {
                resolve(null);
              }
            });
          })
          .on('error', () => resolve(null))
          .on('timeout', () => resolve(null));
      });
    } catch {
      return null;
    }
  }

  private extractChatModels(data: Record<string, any>) {
    const result: ModelContextCache = {};
    for (const [modelName, config] of Object.entries(data)) {
      if (typeof config !== 'object' || config === null) {
        continue;
      }
      if (config.mode !== 'chat') {
        continue;
      }
      const maxInputTokens = config.max_input_tokens;
      if (typeof maxInputTokens === 'number' && maxInputTokens > 0) {
        result[modelName] = maxInputTokens;
      }
    }
    return result;
  }
}
