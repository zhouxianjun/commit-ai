import type { ReasoningEffort } from 'openai/resources';
import type { ModelConfig as BuiltinModelConfig } from '../src/service/model-context';
export interface ModelConfig {
  name: string;
  enabled?: boolean;
  temperature?: number;
  maxTokens?: number;
  maxInputTokens?: number;
  reasoningEffort?: ReasoningEffort;
  options?: Record<string, unknown>;
}

export interface ProviderConfig {
  type: 'openai' | 'gemini' | 'azure';
  apiKey: string;
  baseURL?: string;
  apiVersion?: string;
  timeout?: number;
}
export interface ServerConfig extends ProviderConfig {
  models: ModelConfig[];
}

export type InvokeMap = {
  getConfiguration: { request: void; response: Record<string, unknown> };
  listProviders: { request: void; response: ServerConfig[] };
  updateProvider: {
    request: { index: number; config: ServerConfig };
    response: void;
  };
  deleteProvider: { request: number; response: void };
  fetchModels: { request: ProviderConfig; response: Promise<string[]> };
  fetchDomainIcon: { request: string; response: Promise<string | null> };
  getBuiltinModelConfig: { request: string; response: BuiltinModelConfig | undefined };
};

export type InvokeRequest = { [K in keyof InvokeMap]: InvokeMap[K]['request'] };
export type InvokeResponse = {
  [K in keyof InvokeMap]: InvokeMap[K]['response'];
};
