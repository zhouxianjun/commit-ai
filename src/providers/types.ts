import type { ModelConfig } from '../service/llm-server-service';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProvider<T = unknown> {
  type: string;
  chatCompletion(
    messages: ChatMessage[],
    modelConfig: ModelConfig,
    signal?: AbortSignal
  ): Promise<T>;
  extractText(response: T): string;
  beforeChatCompletion?: (messages: ChatMessage[], modelConfig: ModelConfig) => ChatMessage[];
  afterChatCompletion?: (response: T, modelConfig: ModelConfig) => void;
}
