import { inject, injectable } from 'inversify';
import * as vscode from 'vscode';
import { Context } from '../consts';
import type { TokenStats, TokenUsageStats } from '../../types/shared';

export interface ModelUsageStats {
  [modelName: string]: TokenUsageStats;
}

export interface ProviderUsageStats {
  [providerKey: string]: ModelUsageStats;
}

const STORAGE_KEY = 'commit-ai.token-usage-stats';

@injectable()
export class TokenStatsService {
  private stats: ProviderUsageStats = {};

  constructor(@inject(Context) private readonly context: vscode.ExtensionContext) {
    this.loadStats();
  }

  private loadStats() {
    const savedStats = this.context.globalState.get<ProviderUsageStats>(STORAGE_KEY);
    this.stats = savedStats ?? {};
  }

  private saveStats() {
    this.context.globalState.update(STORAGE_KEY, this.stats);
  }

  recordUsage(providerKey: string, modelName: string, inputTokens: number, outputTokens: number) {
    if (!this.stats[providerKey]) {
      this.stats[providerKey] = {};
    }
    if (!this.stats[providerKey][modelName]) {
      this.stats[providerKey][modelName] = { inputTokens: 0, outputTokens: 0 };
    }

    this.stats[providerKey][modelName].inputTokens += inputTokens;
    this.stats[providerKey][modelName].outputTokens += outputTokens;

    this.saveStats();
  }

  getProviderTotalUsage(providerKey: string): TokenUsageStats {
    const providerStats = this.stats[providerKey];
    if (!providerStats) {
      return { inputTokens: 0, outputTokens: 0 };
    }

    return Object.values(providerStats).reduce(
      (acc, modelStats) => {
        acc.inputTokens += modelStats.inputTokens;
        acc.outputTokens += modelStats.outputTokens;
        return acc;
      },
      { inputTokens: 0, outputTokens: 0 }
    );
  }

  getModelUsage(providerKey: string, modelName: string): TokenUsageStats {
    return this.stats[providerKey]?.[modelName] || { inputTokens: 0, outputTokens: 0 };
  }

  getAllStats(): TokenStats[] {
    return Object.entries(this.stats).map(([providerKey, modelStats]) => {
      const totalUsage = Object.values(modelStats).reduce(
        (acc, modelStats) => {
          acc.inputTokens += modelStats.inputTokens;
          acc.outputTokens += modelStats.outputTokens;
          return acc;
        },
        { inputTokens: 0, outputTokens: 0 }
      );
      return {
        providerKey,
        modelStats: Object.entries(modelStats).map(([modelName, modelStats]) => ({
          modelName,
          ...modelStats
        })),
        totalUsage
      };
    });
  }
}
