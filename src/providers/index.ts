import { AIProvider } from './types';
import { OpenAIProvider } from './openai-provider';
import { GeminiProvider } from './gemini-provider';
import type { ServerConfig } from '../../types/shared';

export function createProvider(config: ServerConfig): AIProvider {
  switch (config.type) {
    case 'openai':
    case 'azure':
      return new OpenAIProvider(config);
    case 'gemini':
      return new GeminiProvider(config);
    default:
      throw new Error(`Unknown provider type: ${config.type}`);
  }
}

export type { AIProvider, ChatMessage } from './types';
