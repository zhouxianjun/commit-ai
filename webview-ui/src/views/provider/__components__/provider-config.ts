import openrouter from '@/assets/logo/openrouter.png?inline';
import type { ServerConfig } from '@shared-types/shared';

const providers = [
  {
    name: 'openrouter',
    icon: openrouter,
    regex: [/http[s]?:\/\/openrouter\.ai/]
  }
];

export const getProvider = (server: ServerConfig) => {
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
