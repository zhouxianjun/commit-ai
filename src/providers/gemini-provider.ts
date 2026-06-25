import { AIProvider, ChatMessage } from './types';
import type { ModelConfig, ProviderConfig } from '../../types/shared';
import {
  GoogleGenAI,
  ThinkingLevel,
  type GenerateContentConfig,
  type GenerateContentResponse,
  type GoogleGenAIOptions
} from '@google/genai';
import type { ReasoningEffort } from 'openai/resources';

export class GeminiProvider implements AIProvider<GenerateContentResponse> {
  readonly type = 'gemini';
  private client: GoogleGenAI;

  constructor(private config: ProviderConfig) {
    const cfg: GoogleGenAIOptions = {
      apiKey: config.apiKey,
      apiVersion: config.apiVersion,
      httpOptions: {
        baseUrl: config.baseURL,
        timeout: config.timeout
      }
    };
    this.client = new GoogleGenAI(cfg);
  }

  async listModels(): Promise<string[]> {
    const models = await this.client.models.list({});
    return models.page.map((model) => model.name);
  }

  async chatCompletion(
    messages: ChatMessage[],
    modelConfig: ModelConfig,
    signal?: AbortSignal
  ): Promise<GenerateContentResponse> {
    const generationConfig: {
      temperature: number;
      thinkingConfig: { thinkingBudget: number };
      maxOutputTokens?: number;
    } = {
      temperature: modelConfig.temperature,
      thinkingConfig: { thinkingBudget: 0 }
    };
    if (modelConfig.maxTokens) {
      generationConfig.maxOutputTokens = modelConfig.maxTokens;
    }

    const requestParams: GenerateContentConfig = {
      abortSignal: signal,
      httpOptions: { timeout: this.config.timeout },
      temperature: modelConfig.temperature,
      maxOutputTokens: modelConfig.maxTokens
    };

    if (modelConfig.reasoningEffort && modelConfig.reasoningEffort !== 'default') {
      requestParams.thinkingConfig =
        modelConfig.reasoningEffort === 'none'
          ? { thinkingBudget: 0 }
          : {
              thinkingBudget: -1,
              thinkingLevel: this.transformThinkLevel(modelConfig.reasoningEffort)
            };
    }

    return this.client.models.generateContent({
      model: modelConfig.name,
      contents: messages,
      config: requestParams
    });
  }

  extractText(response: GenerateContentResponse): string {
    const text = response.text;
    if (!text) {
      throw new Error('Gemini returned empty response');
    }
    return text;
  }

  extractUsage(response: GenerateContentResponse): {
    inputTokens?: number;
    outputTokens?: number;
  } {
    return {
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount
    };
  }

  private transformThinkLevel(effort: ReasoningEffort) {
    if (effort === 'minimal') {
      return ThinkingLevel.MINIMAL;
    }
    if (effort === 'low') {
      return ThinkingLevel.LOW;
    }
    if (effort === 'medium') {
      return ThinkingLevel.MEDIUM;
    }
    if (effort === 'high') {
      return ThinkingLevel.HIGH;
    }
    return ThinkingLevel.LOW;
  }
}
