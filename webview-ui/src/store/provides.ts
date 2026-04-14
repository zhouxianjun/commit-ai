import { defineStore } from 'pinia';
import { useAsyncState } from '@vueuse/core';
import { useVSCode } from '@/composables/use-vscode';
import { computed } from 'vue';

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

  return {
    providers,
    isLoading,
    refresh,
    total,
    totalModels
  };
});
