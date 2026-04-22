import { inject, injectable } from 'inversify';
import { ConfigKeys, ConfigService, NAME } from './config-service';
import type { ReasoningEffort } from 'openai/resources';
import * as vscode from 'vscode';
import { zeroToUndefined } from '../utils/utils';
import type { ModelConfig, ServerConfig } from '../../types/shared';

export interface Server {
  config: ServerConfig;
  model: ModelConfig;
  label: string;
}

@injectable()
export class LLMServerService implements vscode.Disposable {
  private disposable: vscode.Disposable;
  private servers: Server[] = [];

  private onDidChangeServer: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  readonly onDidChange = this.onDidChangeServer.event;

  constructor(
    @inject(ConfigService)
    private configService: ConfigService
  ) {
    this.disposable = this.configService.onDidChange(() => {
      this.servers = [];
      this.buildServers();
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
    const globalMaxTokens = this.configService.getConfig<number>(ConfigKeys.MAX_TOKENS);
    const globalMaxInputTokens = this.configService.getConfig<number>(ConfigKeys.MAX_INPUT_TOKENS);
    const globalReasoningEffort = this.configService.getConfig<ReasoningEffort>(
      ConfigKeys.REASONING_EFFORT,
      'low'
    );

    this.servers = configs.flatMap((config) => {
      return config.models
        .filter((m) => m.enabled !== false)
        .map((model) => {
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
    this.onDidChangeServer.fire();
  }

  dispose() {
    this.disposable.dispose();
  }
}
