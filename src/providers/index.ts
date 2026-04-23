import { AIProvider } from './types';
import { OpenAIProvider } from './openai-provider';
import { GeminiProvider } from './gemini-provider';
import type { ProviderConfig } from '../../types/shared';

export function createProvider(config: ProviderConfig): AIProvider {
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

export const createProviderKey = (provider: ProviderConfig) =>
  `${provider.type}|${provider.baseURL || ''}`;
