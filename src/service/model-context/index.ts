import { inject, injectable } from 'inversify';
import * as vscode from 'vscode';
import BUILTIN_MODEL_CONTEXT from '../../../data/model-config.json';
import { Context } from '../../consts';
import { fetchRemoteModelContext } from '../../../scripts/model';
import type { ModelConfig } from '../../../scripts/model';

const CACHE_KEY = 'modelContextCache_v2';
const CACHE_TIMESTAMP_KEY = 'modelContextCacheTimestamp_v2';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;



interface ModelContextCache {
  [modelName: string]: ModelConfig;
}

@injectable()
export class ModelContextService implements vscode.Disposable {
  private updateTimer: NodeJS.Timeout | null = null;
  private fullContextMap: Record<string, ModelConfig> | null = null;
  private normalizedIndex: Map<string, string> | null = null;

  constructor(@inject(Context) private readonly context: vscode.ExtensionContext) {
    this.updateTimer = setInterval(() => this.updateCacheIfNeeded(), CACHE_TTL_MS);
    this.updateCacheIfNeeded();
  }

  dispose() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
  }

  getModelConfig(model: string): ModelConfig | undefined {
    if (!this.fullContextMap || !this.normalizedIndex) {
      this.rebuildIndex();
    }

    const map = this.fullContextMap!;
    const index = this.normalizedIndex!;

    const input = model.toLowerCase();
    // 1. Exact or Case-insensitive match
    if (index.has(input)) {
      return map[index.get(input)!];
    }

    // 2. Normalize and match (removes - . _ etc)
    const normalizedInput = this.normalize(input);
    if (index.has(normalizedInput)) {
      return map[index.get(normalizedInput)!];
    }

    // 3. Try with model name only (after /)
    if (input.includes('/')) {
      const modelOnly = input.split('/').pop()!;
      if (index.has(modelOnly)) {
        return map[index.get(modelOnly)!];
      }
      const normalizedModelOnly = this.normalize(modelOnly);
      if (index.has(normalizedModelOnly)) {
        return map[index.get(normalizedModelOnly)!];
      }
    }

    return undefined;
  }

  getContextWindowLimit(model: string): number | undefined {
    return this.getModelConfig(model)?.max_input_token;
  }

  async updateCacheIfNeeded() {
    const timestamp = this.context.globalState.get<number>(CACHE_TIMESTAMP_KEY, 0);
    const now = Date.now();

    if (now - timestamp < CACHE_TTL_MS) {
      return;
    }

    try {
      const remote = await fetchRemoteModelContext();
      if (remote && Object.keys(remote).length > 0) {
        await this.context.globalState.update(CACHE_KEY, remote);
        await this.context.globalState.update(CACHE_TIMESTAMP_KEY, now);
        this.rebuildIndex(); // Invalidate and rebuild index
      }
    } catch {
      // Silently fail -- use built-in mapping
    }
  }

  private normalize(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private rebuildIndex() {
    const models = BUILTIN_MODEL_CONTEXT.models || {};
    const cached = this.context.globalState.get<ModelContextCache>(CACHE_KEY);
    const rawMap = cached ? { ...models, ...cached } : models;

    const index = new Map<string, string>();
    for (const key of Object.keys(rawMap)) {
      const lowerKey = key.toLowerCase();
      index.set(lowerKey, key);

      const normKey = this.normalize(key);
      if (!index.has(normKey)) {
        index.set(normKey, key);
      }

      // If key has provider prefix like "openai/gpt-4", also index "gpt-4"
      if (key.includes('/')) {
        const parts = key.split('/');
        const modelOnly = parts[parts.length - 1].toLowerCase();
        if (!index.has(modelOnly)) {
          index.set(modelOnly, key);
        }
        const normModelOnly = this.normalize(modelOnly);
        if (!index.has(normModelOnly)) {
          index.set(normModelOnly, key);
        }
      }
    }

    this.fullContextMap = rawMap;
    this.normalizedIndex = index;
  }
}
