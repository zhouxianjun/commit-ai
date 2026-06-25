import type { ReasoningEffort } from 'openai/resources';
import type { ModelConfig as BuiltinModelConfig } from '../scripts/model';
export interface ModelConfig {
  name: string;
  enabled?: boolean;
  temperature?: number;
  maxTokens?: number;
  maxInputTokens?: number;
  reasoningEffort?: ReasoningEffort | 'default';
  options?: Record<string, unknown>;
}

export interface ProviderConfig {
  type: 'openai' | 'gemini' | 'azure';
  apiKey: string;
  providerKey: string;
  baseURL?: string;
  apiVersion?: string;
  timeout?: number;
}
export interface ServerConfig extends ProviderConfig {
  models: ModelConfig[];
}

export interface TokenUsageStats {
  inputTokens: number;
  outputTokens: number;
}

export interface TokenStats {
  providerKey: string;
  modelStats: {
    inputTokens: number;
    outputTokens: number;
    modelName: string;
  }[];
  totalUsage: TokenUsageStats;
}

export type InvokeMap = {
  getConfiguration: { request: void; response: Record<string, unknown> };
  listProviders: { request: void; response: ServerConfig[] };
  updateProvider: {
    request: { index: number; config: ServerConfig };
    response: void;
  };
  deleteProvider: { request: number; response: void };
  saveServers: { request: ServerConfig[]; response: void };
  fetchModels: { request: ProviderConfig; response: Promise<string[]> };
  fetchDomainIcon: { request: string; response: Promise<string | null> };
  getBuiltinModelConfig: { request: string; response: BuiltinModelConfig | undefined };
  getTokenStats: { request: void; response: TokenStats[] };
};

export type InvokeRequest = { [K in keyof InvokeMap]: InvokeMap[K]['request'] };
export type InvokeResponse = {
  [K in keyof InvokeMap]: InvokeMap[K]['response'];
};
