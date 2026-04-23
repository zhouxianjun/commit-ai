import { defineStore } from 'pinia';
import { useAsyncState } from '@vueuse/core';
import { useVSCode } from '@/composables/use-vscode';
import { computed } from 'vue';
import type { ServerConfig } from '@shared-types/shared';

export const useProviders = defineStore('providers', () => {
  const { invoke } = useVSCode();
  const {
    state: providers,
    isLoading,
    execute: refresh
  } = useAsyncState(() => invoke('listProviders'), [], {
    immediate: false
  });

  const total = computed(() => providers.value.length);
  const totalModels = computed(() =>
    providers.value.reduce((acc, provider) => acc + provider.models.length, 0)
  );

  const updateProvider = (index: number, config: ServerConfig) =>
    invoke('updateProvider', { index, config });

  const deleteProvider = (index: number) => invoke('deleteProvider', index);

  return {
    providers,
    isLoading,
    refresh,
    total,
    totalModels,

    updateProvider,
    deleteProvider
  };
});
