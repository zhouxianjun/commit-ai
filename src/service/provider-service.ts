import { inject, injectable } from 'inversify';
import { LLMServerService } from './llm-server-service';
import { createProvider, type ChatMessage } from '../providers';
import { NAME } from '../consts';

@injectable()
export class ProviderService {
  constructor(@inject(LLMServerService) private llmServerService: LLMServerService) {}

  async chatCompletion(messages: ChatMessage[]): Promise<string> {
    const servers = this.buildServerProvider();
    if (servers.length === 0) {
      throw new Error(
        `No AI servers configured. Please configure at least one server in ${NAME}.servers.`
      );
    }

    const errors: string[] = [];

    for (const server of servers) {
      let rawResponse: unknown;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), server.timeout);

        const processMessages =
          server.provider.beforeChatCompletion?.(messages, server.modelConfig) ?? messages;
        rawResponse = await server.provider.chatCompletion(
          processMessages,
          server.modelConfig,
          controller.signal
        );
        clearTimeout(timer);
        server.provider.afterChatCompletion?.(rawResponse, server.modelConfig);

        console.info(`use [${server.label}] success`);
        return server.provider.extractText(rawResponse);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[AI Commit] Error from ${server.label}:`, {
          error: errorMsg,
          rawResponse
        });
        errors.push(`[${server.label}] ${errorMsg}`);
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
