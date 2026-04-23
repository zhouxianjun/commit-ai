import type { ProviderConfig } from '@shared-types/shared';
import { useVSCode } from './use-vscode';
import { useAsyncState } from '@vueuse/core';

export const useProviderModels = () => {
  const { invoke } = useVSCode();
  const { state, isLoading, execute } = useAsyncState(
    (provider: ProviderConfig) => {
      if (!provider) {
        return Promise.resolve([]);
      }
      return invoke('fetchModels', provider);
    },
    [],
    {
      immediate: false,
      throwError: true
    }
  );
  return {
    models: state,
    isLoading,
    fetchModels: (provider: ProviderConfig) => execute(0, provider)
  };
};
