import OpenAI, { type ClientOptions } from 'openai';
import {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam
} from 'openai/resources';
import { AIProvider, ChatMessage } from './types';
import type { ModelConfig, ProviderConfig } from '../../types/shared';

export class OpenAIProvider implements AIProvider<ChatCompletion> {
  readonly type = 'openai';
  private client: OpenAI;

  constructor(private config: ProviderConfig) {
    const clientConfig: ClientOptions = {
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: config.timeout
    };

    if (config.type === 'azure' && config.apiVersion) {
      clientConfig.defaultQuery = { 'api-version': config.apiVersion };
      clientConfig.defaultHeaders = { 'api-key': config.apiKey };
    }

    this.client = new OpenAI(clientConfig);
  }

  async listModels(): Promise<string[]> {
    const models = await this.client.models.list({
      query: {
        output_modalities: 'text'
      }
    });
    return models.data.map((model) => model.id);
  }

  async chatCompletion(
    messages: ChatMessage[],
    modelConfig: ModelConfig,
    signal?: AbortSignal
  ): Promise<ChatCompletion> {
    const openaiMessages = messages.map(
      (msg) =>
        ({
          role: msg.role,
          content: msg.content
        }) as ChatCompletionMessageParam
    );

    const requestParams: ChatCompletionCreateParamsNonStreaming = {
      model: modelConfig.name,
      messages: openaiMessages,
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.maxTokens,
      reasoning_effort: modelConfig.reasoningEffort
    };

    if (modelConfig.options) {
      Object.assign(requestParams, modelConfig.options);
    }

    return this.client.chat.completions.create(requestParams, {
      signal,
      timeout: this.config.timeout
    });
  }

  extractText(response: ChatCompletion): string {
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned empty response');
    }
    return content;
  }

  extractUsage(response: ChatCompletion): { inputTokens?: number; outputTokens?: number } {
    return {
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens
    };
  }
}
