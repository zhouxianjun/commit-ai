import { merge } from 'lodash-es';
import https from 'https';

const LITELLM_JSON_URL =
  'https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json';
const OPENROUTER_JSON_URL = 'https://openrouter.ai/api/v1/models?output_modalities=text';

export interface ModelConfig {
  max_tokens?: number;
  max_input_token?: number;
}

export interface ModelContext {
  [modelName: string]: ModelConfig;
}

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          return;
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse JSON response'));
          }
        });
      })
      .on('error', reject);
  });
}

function processLiteLLMModels(data: any): ModelContext {
  const result: ModelContext = {};
  for (const [modelName, config] of Object.entries(data)) {
    if (typeof config !== 'object' || config === null) {
      continue;
    }
    const c = config as any;
    if (c.mode !== 'chat') {
      continue;
    }

    const max_tokens = c.max_tokens || c.max_output_tokens;
    const max_input_token = c.max_input_tokens;

    if (max_tokens || max_input_token) {
      result[modelName] = {
        max_tokens: typeof max_tokens === 'number' ? max_tokens : undefined,
        max_input_token: typeof max_input_token === 'number' ? max_input_token : undefined
      };
    }
  }
  return result;
}

function processOpenRouterModels(data: any): ModelContext {
  const result: ModelContext = {};
  if (!data || !Array.isArray(data.data)) {
    return result;
  }

  for (const model of data.data) {
    const modelName = model.id;
    const max_tokens = model.max_completion_tokens ?? model.top_provider?.max_completion_tokens;
    const max_input_token = model.context_length ?? model.top_provider?.context_length;

    if (max_tokens || max_input_token) {
      result[modelName] = {
        max_tokens: typeof max_tokens === 'number' ? max_tokens : undefined,
        max_input_token: typeof max_input_token === 'number' ? max_input_token : undefined
      };
    }
  }
  return result;
}

export async function fetchRemoteModelContext(): Promise<ModelContext | null> {
  try {
    const [liteData, orData] = await Promise.all([
      fetchJson(LITELLM_JSON_URL).catch((err) => {
        console.error('LiteLLM fetch failed:', (err as Error).message);
        return {};
      }),
      fetchJson(OPENROUTER_JSON_URL).catch((err) => {
        console.error('OpenRouter fetch failed:', (err as Error).message);
        return {};
      })
    ]);

    const liteModels = processLiteLLMModels(liteData || {});
    const orModels = processOpenRouterModels(orData || {});

    return merge(liteModels, orModels);
  } catch {
    return null;
  }
}
