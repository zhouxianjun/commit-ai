import openrouter from '@/assets/logo/openrouter.png?inline';
import nvidia from '@/assets/logo/nvidia.png?inline';
import github from '@/assets/logo/github.svg?inline';
import anthropic from '@/assets/logo/anthropic.svg?inline';
import deepseek from '@/assets/logo/DeepSeek.png?inline';
import zAI from '@/assets/logo/zhipu.png?inline';
import aliyun from '@/assets/logo/Qwen.png?inline';
import gemini from '@/assets/logo/GoogleGemini.svg?inline';
import xAI from '@/assets/logo/xAI.png?inline';
import openAI from '@/assets/logo/OpenAI.svg?inline';

import type { ServerConfig } from '@shared-types/shared';
import { shallowRef } from 'vue';
import { useVSCode } from './use-vscode';

const providers = [
  {
    name: 'OpenRouter',
    icon: openrouter,
    regex: [/http[s]?:\/\/openrouter\.ai/]
  },
  {
    name: 'NVIDIA Build',
    icon: nvidia,
    regex: [/http[s]?:\/\/integrate\.api\.nvidia\.com/]
  },
  {
    name: 'Github',
    icon: github,
    regex: [/http[s]?:\/\/models\.github\.ai/]
  },
  {
    name: 'Anthropic',
    icon: anthropic,
    regex: [/http[s]?:\/\/api\.anthropic\.com/]
  },
  {
    name: 'DeepSeek',
    icon: deepseek,
    regex: [/http[s]?:\/\/api\.deepseek\.com/]
  },
  {
    name: 'Z.ai',
    icon: zAI,
    regex: [/http[s]?:\/\/open\.bigmodel\.cn/]
  },
  {
    name: 'Alibaba Cloud Int',
    icon: aliyun,
    regex: [/http[s]?:\/\/dashscope\.aliyuncs\.com/]
  },
  {
    name: 'Google',
    icon: gemini,
    regex: [/http[s]?:\/\/generativelanguage\.googleapis\.com/]
  },
  {
    name: 'xAI',
    icon: xAI,
    regex: [/http[s]?:\/\/api\.x\.ai/]
  },
  {
    name: 'OpenAI',
    icon: openAI,
    regex: [/http[s]?:\/\/api\.openai\.com/]
  }
];

export const useProvider = (server: ServerConfig) => {
  const provider = getProvider(server);
  const icon = shallowRef<string | null>(provider.icon);
  const { invoke } = useVSCode();
  if (!provider.icon) {
    const url = new URL(server.baseURL);
    invoke('fetchDomainIcon', url.hostname).then((base64) => {
      icon.value = base64;
    });
  }

  return {
    ...provider,
    icon
  };
};

const getProvider = (server: ServerConfig) => {
  const item = providers.find((provider) => {
    return provider.regex.some((regex) => regex.test(server.baseURL));
  });
  if (!item) {
    const url = new URL(server.baseURL);
    const name = url.hostname.split('.').at(-2) || url.hostname;
    return {
      name,
      icon: ''
    };
  }
  return {
    name: item.name,
    icon: item.icon
  };
};
