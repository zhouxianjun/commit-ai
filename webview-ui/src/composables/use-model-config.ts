import { toValue, watchEffect, type MaybeRefOrGetter } from 'vue';
import { useVSCode } from './use-vscode';
import { useAsyncState } from '@vueuse/core';

export const useModelConfig = (name: MaybeRefOrGetter<string | undefined>) => {
  const { invoke } = useVSCode();
  const { state, execute } = useAsyncState(
    (model) => {
      if (!model) {
        return Promise.resolve(undefined);
      }
      return invoke('getBuiltinModelConfig', model);
    },
    undefined,
    { immediate: false }
  );
  watchEffect(() => execute(0, toValue(name)));
  return state;
};
