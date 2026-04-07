import { injectable } from 'inversify';
import * as vscode from 'vscode';
import { NAME } from '../consts';

export { NAME };

export enum ConfigKeys {
  SERVERS = 'servers',
  TIMEOUT = 'timeout',
  TEMPERATURE = 'temperature',
  MAX_TOKENS = 'maxTokens',
  MAX_INPUT_TOKENS = 'maxInputTokens',
  REASONING_EFFORT = 'reasoningEffort',

  AI_COMMIT_LANGUAGE = 'AI_COMMIT_LANGUAGE',
  SYSTEM_PROMPT = 'AI_COMMIT_SYSTEM_PROMPT',
  USE_GITMOJI = 'USE_GITMOJI',
  TOKEN_COUNT_MODE = 'TOKEN_COUNT_MODE',
  SHOW_TOKEN_COUNT = 'SHOW_TOKEN_COUNT'
}

@injectable()
export class ConfigService implements vscode.Disposable {
  private configCache: Map<string, any> = new Map();
  private disposable: vscode.Disposable;

  constructor() {
    this.disposable = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(NAME)) {
        this.configCache.clear();
      }
    });
  }

  getConfig<T>(key: string, defaultValue?: T): T {
    if (!this.configCache.has(key)) {
      const config = vscode.workspace.getConfiguration(NAME);
      this.configCache.set(key, config.get<T>(key, defaultValue));
    }
    return this.configCache.get(key);
  }

  dispose() {
    this.disposable.dispose();
  }
}
