import { get_encoding, get_encoding_name_for_model, type TiktokenModel } from 'tiktoken';
import TOKEN_MODELS from './token-models.json';

export interface TokenCountResult {
  estimated: number;
  totalChars: number;
}
export const TOKEN_COUNT_FAST = 'fast';
export const TOKEN_COUNT_ACCURATE = 'accurate';
export type TokenCountMode = typeof TOKEN_COUNT_FAST | typeof TOKEN_COUNT_ACCURATE;

const DEFAULT_ENCODING = 'cl100k_base';

export const calculateTokens = (
  messages: string[],
  model: string,
  mode: TokenCountMode = TOKEN_COUNT_FAST
) => {
  if (mode === TOKEN_COUNT_FAST) {
    return estimateTokensFast(messages);
  }
  return estimateTokensAccurate(messages, model);
};

export const estimateTokensFast = (messages: string[]): TokenCountResult => {
  const totalChars = getTotalChars(messages);
  return {
    estimated: Math.ceil(totalChars / 4),
    totalChars
  };
};

export const estimateTokensAccurate = async (
  messages: string[],
  model: string
): Promise<TokenCountResult> => {
  const totalChars = getTotalChars(messages);

  try {
    const encodingName = getTokenEncoding(model);
    const enc = get_encoding(encodingName);
    // 对齐 OpenAI cookbook 公式 + 3
    const estimated = messages.reduce((sum, msg) => sum + enc.encode_ordinary(msg).length + 3, 3);
    enc.free();
    return { estimated, totalChars };
  } catch {
    return estimateTokensFast(messages);
  }
};

const getTotalChars = (messages: string[]) => messages.reduce((sum, msg) => sum + msg.length, 0);

const getTokenEncoding = (model: string) => {
  const lower = model.toLowerCase();
  if (TOKEN_MODELS.includes(lower)) {
    try {
      return get_encoding_name_for_model(model as TiktokenModel);
    } catch {}
  }
  return DEFAULT_ENCODING;
};
