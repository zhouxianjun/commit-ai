import { computed, type Ref } from 'vue';
import { isNil } from 'lodash-es';

export const useSingleSlider = (source: Ref<number | undefined>) => {
  const value = computed({
    get: () => (isNil(source.value) ? null : [source.value]),
    set: (v) => {
      source.value = v?.[0];
    }
  });
  return { value };
};
