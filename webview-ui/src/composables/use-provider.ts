import type { ServerConfig } from '@shared-types/shared';
import { computed, shallowRef } from 'vue';
import { useVSCode } from './use-vscode';
import { getProviderConfig } from '@/utils/provider';

const defaultBaseURL = {
  openai: 'https://api.openai.com',
  gemini: 'https://generativelanguage.googleapis.com',
  azure: ''
};

export const useProvider = (server: ServerConfig) => {
  const provider = getProvider(server);
  const icon = shallowRef<string | null>(provider.icon);
  const { invoke } = useVSCode();
  const baseURL = server.baseURL || defaultBaseURL[server.type];
  if (!provider.icon && baseURL) {
    const url = new URL(baseURL);
    invoke('fetchDomainIcon', url.hostname).then((base64) => {
      icon.value = base64;
    });
  }

  const activeModels = computed(() => server.models.filter((model) => model.enabled !== false));

  return {
    ...provider,
    icon,
    activeModels
  };
};

const getProvider = (server: ServerConfig) => {
  const baseURL = server.baseURL || defaultBaseURL[server.type];
  const item = getProviderConfig(server.type, server.baseURL);
  if (!item) {
    if (!baseURL) {
      return {
        name: server.type,
        icon: ''
      };
    }
    const url = new URL(baseURL);
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
