import { defineStore } from 'pinia';
import { useAsyncState } from '@vueuse/core';
import { useVSCode } from '@/composables/use-vscode';

export const useConfiguration = defineStore('configuration', () => {
  const { invoke } = useVSCode();
  const {
    state: configuration,
    isLoading,
    execute: refresh
  } = useAsyncState(() => invoke('getConfiguration'), {});

  return {
    configuration,
    isLoading,
    refresh
  };
});
