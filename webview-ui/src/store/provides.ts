import { defineStore } from 'pinia';
import { useAsyncState } from '@vueuse/core';
import { useVSCode } from '@/composables/use-vscode';
import { computed } from 'vue';
import type { ServerConfig, TokenStats } from '@shared-types/shared';

export const useProviders = defineStore('providers', () => {
  const { invoke } = useVSCode();
  const {
    state: providers,
    isLoading,
    execute
  } = useAsyncState(() => invoke('listProviders'), [], {
    immediate: false
  });
  const { state: tokenStats, execute: refreshTokenStats } = useAsyncState(
    () => invoke('getTokenStats'),
    [],
    {
      immediate: false
    }
  );

  const total = computed(() => providers.value.length);
  const totalModels = computed(() =>
    providers.value.reduce((acc, provider) => acc + provider.models.length, 0)
  );
  const providerStats = computed(() => {
    return new Map<string, TokenStats>(tokenStats.value.map((stat) => [stat.providerKey, stat]));
  });

  const updateProvider = (index: number, config: ServerConfig) =>
    invoke('updateProvider', { index, config });

  const deleteProvider = (index: number) => invoke('deleteProvider', index);
  const saveServers = (servers: ServerConfig[]) => invoke('saveServers', servers);

  const refresh = () => Promise.all([execute(), refreshTokenStats()]);

  return {
    providers,
    isLoading,
    refresh,
    total,
    totalModels,
    providerStats,

    updateProvider,
    deleteProvider,
    saveServers
  };
});
