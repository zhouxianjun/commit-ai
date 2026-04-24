import type { ProviderConfig, ServerConfig } from '@shared-types/shared';
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

export type Preset = {
  name: string;
  label: string;
  description: string;
  config: Partial<ServerConfig>;
};

const PROVIDER_CONFIG = [
  {
    name: 'OpenRouter',
    icon: openrouter,
    website: 'https://openrouter.ai',
    getKeyURL: 'https://openrouter.ai/keys',
    check: (type: ProviderConfig['type'], baseURL?: string) => {
      return type === 'openai' && /http[s]?:\/\/openrouter\.ai/.test(baseURL || '');
    }
  },
  {
    name: 'NVIDIA Build',
    icon: nvidia,
    website: 'https://build.nvidia.com/explore/discover',
    getKeyURL: 'https://build.nvidia.com/settings/api-keys',
    check: (type: ProviderConfig['type'], baseURL?: string) => {
      return type === 'openai' && /http[s]?:\/\/build\.nvidia\.com/.test(baseURL || '');
    }
  },
  {
    name: 'Github',
    icon: github,
    website: 'https://models.github.ai/',
    getKeyURL: 'https://github.com/settings/personal-access-tokens',
    check: (type: ProviderConfig['type'], baseURL?: string) => {
      return type === 'openai' && /http[s]?:\/\/models\.github\.ai/.test(baseURL || '');
    }
  },
  {
    name: 'Anthropic',
    icon: anthropic,
    check: (type: ProviderConfig['type'], baseURL?: string) => {
      return type === 'openai' && /http[s]?:\/\/api\.anthropic\.com/.test(baseURL || '');
    }
  },
  {
    name: 'DeepSeek',
    icon: deepseek,
    check: (type: ProviderConfig['type'], baseURL?: string) => {
      return type === 'openai' && /http[s]?:\/\/api\.deepseek\.com/.test(baseURL || '');
    }
  },
  {
    name: 'Z.ai',
    icon: zAI,
    check: (type: ProviderConfig['type'], baseURL?: string) => {
      return type === 'openai' && /http[s]?:\/\/open\.bigmodel\.cn/.test(baseURL || '');
    }
  },
  {
    name: 'Alibaba Cloud Int',
    icon: aliyun,
    check: (type: ProviderConfig['type'], baseURL?: string) => {
      return type === 'openai' && /http[s]?:\/\/dashscope\.aliyuncs\.com/.test(baseURL || '');
    }
  },
  {
    name: 'Google',
    icon: gemini,
    check: (type: ProviderConfig['type'], baseURL?: string) => {
      return (
        type === 'gemini' &&
        (!baseURL || /http[s]?:\/\/generativelanguage\.googleapis\.com/.test(baseURL || ''))
      );
    }
  },
  {
    name: 'xAI',
    icon: xAI,
    check: (type: ProviderConfig['type'], baseURL?: string) => {
      return type === 'openai' && /http[s]?:\/\/api\.x\.ai/.test(baseURL || '');
    }
  },
  {
    name: 'OpenAI',
    icon: openAI,
    check: (type: ProviderConfig['type'], baseURL?: string) => {
      return type === 'openai' && (!baseURL || /http[s]?:\/\/api\.openai\.com/.test(baseURL || ''));
    }
  }
];

export const presets: Preset[] = [
  {
    name: 'openrouter',
    label: 'OpenRouter',
    description: 'Free and open-source AI model provider',
    config: {
      type: 'openai',
      baseURL: 'https://openrouter.ai/api/v1',
      models: [
        {
          name: 'openrouter/free',
          enabled: true
        }
      ]
    }
  },
  {
    name: 'nvidia',
    label: 'NVIDIA Build',
    description: 'Try NVIDIA NIM APIs',
    config: {
      type: 'openai',
      baseURL: 'https://integrate.api.nvidia.com/v1',
      models: []
    }
  },
  {
    name: 'github',
    label: 'Copilot',
    description: 'Github Copilot Models',
    config: {
      type: 'openai',
      baseURL: 'https://models.github.ai/inference',
      models: []
    }
  }
];

export const getProviderConfig = (type: ProviderConfig['type'], baseURL?: string) => {
  return PROVIDER_CONFIG.find((item) => item.check(type, baseURL));
};

export const getPreset = (name: string) => {
  return presets.find((item) => item.name === name);
};
