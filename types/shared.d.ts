export interface ModelConfig {
  name: string;
  enabled?: boolean;
  temperature?: number;
  maxTokens?: number;
  maxInputTokens?: number;
  reasoningEffort?: ReasoningEffort;
  options?: Record<string, unknown>;
}

export interface ServerConfig {
  type: 'openai' | 'gemini' | 'azure';
  baseURL: string;
  apiKey: string;
  apiVersion?: string;
  timeout?: number;
  models: ModelConfig[];
}

export type InvokeMap = {
  listProviders: { request: void; response: ServerConfig[] };
  addProvider: { request: ServerConfig; response: void };
  updateProvider: {
    request: { index: number; config: ServerConfig };
    response: void;
  };
  deleteProvider: { request: number; response: void };
  testProvider: { request: ServerConfig; response: boolean };
  testAllProviders: { request: void; response: boolean[] };
  fetchModels: { request: string; response: ModelConfig[] };
};

export type InvokeRequest = { [K in keyof InvokeMap]: InvokeMap[K]['request'] };
export type InvokeResponse = {
  [K in keyof InvokeMap]: InvokeMap[K]['response'];
};
