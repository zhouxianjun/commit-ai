import { inject, injectable } from 'inversify';
import { ConfigKeys, ConfigService, NAME } from './config-service';
import type { ReasoningEffort } from 'openai/resources';
import * as vscode from 'vscode';
import { zeroToUndefined } from '../utils/utils';

export interface ModelConfig {
  name: string;
  temperature?: number;
  maxTokens?: number;
  maxInputTokens?: number;
  reasoningEffort?: ReasoningEffort;
  options?: Record<string, unknown>;
}

export interface ServerConfig {
  type: 'openai' | 'gemini' | 'azure';
  baseURL?: string;
  apiKey: string;
  apiVersion?: string;
  timeout?: number;
  models: ModelConfig[];
}
export interface Server {
  config: ServerConfig;
  model: ModelConfig;
  label: string;
}

@injectable()
export class LLMServerService implements vscode.Disposable {
  private disposable: vscode.Disposable;
  private servers: Server[] = [];

  constructor(
    @inject(ConfigService)
    private configService: ConfigService
  ) {
    this.disposable = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(NAME)) {
        this.servers = [];
        this.buildServers();
      }
    });
    this.buildServers();
  }

  getServers() {
    return this.servers;
  }

  private buildServers() {
    const configs = this.configService.getConfig<ServerConfig[]>(ConfigKeys.SERVERS, []);
    const globalTimeout = this.configService.getConfig<number>(ConfigKeys.TIMEOUT, 60000);
    const globalTemperature = this.configService.getConfig<number>(ConfigKeys.TEMPERATURE, 0.7);
    const globalMaxTokens = this.configService.getConfig<number>(ConfigKeys.MAX_TOKENS, 2048);
    const globalMaxInputTokens = this.configService.getConfig<number>(
      ConfigKeys.MAX_INPUT_TOKENS,
      2048
    );
    const globalReasoningEffort = this.configService.getConfig<ReasoningEffort>(
      ConfigKeys.REASONING_EFFORT,
      'low'
    );

    this.servers = configs.flatMap((config) => {
      return config.models.map((model) => {
        return {
          config: {
            ...config,
            timeout: config.timeout ?? globalTimeout
          },
          model: {
            ...model,
            temperature: model.temperature ?? globalTemperature,
            maxTokens: zeroToUndefined(model.maxTokens) ?? zeroToUndefined(globalMaxTokens),
            maxInputTokens:
              zeroToUndefined(model.maxInputTokens) ?? zeroToUndefined(globalMaxInputTokens),
            reasoningEffort: model.reasoningEffort ?? globalReasoningEffort
          },
          label: `${config.type}:${model.name} (${config.baseURL || 'default'})`
        };
      });
    });
  }

  dispose() {
    this.disposable.dispose();
  }
}
