import { useConfiguration } from '@/store/configuration';
import { isNil } from 'lodash-es';
import { computed, ref, watch } from 'vue';

export const useDefaultConfig = <V>({
  get,
  set,
  key,
  defaultValue
}: {
  get: () => V | undefined;
  set: (value: V | undefined) => void;
  key: string;
  defaultValue?: V;
}) => {
  const override = ref<boolean>(!isNil(get()));
  const configuration = useConfiguration();
  const configValue = computed(() => configuration.configuration[key] as V);
  const value = computed<V | undefined>({
    get: () => (override.value ? get() : configValue.value) ?? defaultValue,
    set
  });

  watch(override, (value) => {
    if (value) {
      if (isNil(get())) {
        set(configValue.value);
      }
      return;
    }
    set(undefined);
  });
  return { value, override };
};
