import { inject, injectable } from 'inversify';
import { LLMServerService } from './llm-server-service';
import { createProvider, type ChatMessage } from '../providers';
import { NAME, DISPLAY_NAME } from '../consts';
import type { ModelConfig } from '../../types/shared';

@injectable()
export class ProviderService {
  #lastModel: ModelConfig | null = null;
  constructor(@inject(LLMServerService) private llmServerService: LLMServerService) {}

  get lastModel() {
    return this.#lastModel;
  }

  async chatCompletion(messages: ChatMessage[], signal?: AbortSignal): Promise<string> {
    const servers = this.buildServerProvider();
    if (servers.length === 0) {
      throw new Error(
        `No AI servers configured. Please configure at least one server in ${NAME}.servers.`
      );
    }

    const errors: string[] = [];

    for (const server of servers) {
      let rawResponse: unknown;
      // Per-server abort: combines external signal + per-server timeout
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), server.timeout);
      const onExternalAbort = () => controller.abort();
      signal?.addEventListener('abort', onExternalAbort, { once: true });

      try {
        const processMessages =
          server.provider.beforeChatCompletion?.(messages, server.modelConfig) ?? messages;
        rawResponse = await server.provider.chatCompletion(
          processMessages,
          server.modelConfig,
          controller.signal
        );
        clearTimeout(timer);
        server.provider.afterChatCompletion?.(rawResponse, server.modelConfig);

        this.#lastModel = server.modelConfig;
        console.info(`use [${server.label}] success`);
        return server.provider.extractText(rawResponse);
      } catch (err) {
        clearTimeout(timer);

        // If the external signal triggered the abort, stop everything immediately
        if (signal?.aborted) {
          throw err;
        }

        // Per-server timeout: try the next server
        if (controller.signal.aborted) {
          errors.push(`[${server.label}] Request timeout`);
          continue;
        }

        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[${DISPLAY_NAME}] Error from ${server.label}:`, {
          error: errorMsg,
          rawResponse
        });
        errors.push(`[${server.label}] ${errorMsg}`);
      } finally {
        signal?.removeEventListener('abort', onExternalAbort);
      }
    }

    throw new Error(`All ${servers.length} server(s) failed:\n${errors.join('\n')}`);
  }

  private buildServerProvider() {
    const servers = this.llmServerService.getServers();
    return servers.map((server) => {
      const provider = createProvider(server.config);
      return {
        provider,
        modelConfig: server.model,
        timeout: server.config.timeout,
        label: server.label
      };
    });
  }
}
