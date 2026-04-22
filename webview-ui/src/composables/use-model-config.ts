import { useVSCode } from './use-vscode';
import { useAsyncState } from '@vueuse/core';

export const useModelConfig = (name: string) => {
  const { invoke } = useVSCode();
  const { state } = useAsyncState(() => invoke('getBuiltinModelConfig', name), undefined);
  return state;
};
