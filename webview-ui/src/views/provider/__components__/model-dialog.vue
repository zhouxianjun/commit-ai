<template>
  <Dialog v-model:open="visible">
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Select Model</DialogTitle>
      </DialogHeader>
      <Input v-model.lazy.trim="filter" placeholder="Filter models" />
      <ScrollArea class="w-full h-82 border">
        <div class="p-4">
          <template v-for="model of models" :key="model.name">
            <div class="flex items-center gap-2 text-sm">
              <Checkbox :id="model.name" v-model="model.selected" />
              <label :for="model.name" class="text-foreground">{{ model.name }}</label>
            </div>
            <Separator class="my-2" />
          </template>
        </div>
      </ScrollArea>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline"> Cancel </Button>
        </DialogClose>
        <Button @click="submit"> Confirm </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ModelConfig } from '@shared-types/shared';
import { computed, ref, watchEffect } from 'vue';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

const emits = defineEmits<{
  selected: [ModelConfig[]];
}>();
const props = defineProps<{
  availableModels: string[];
  models?: ModelConfig[];
}>();

const visible = ref(false);
const filter = ref('');
const models = ref<{ name: string; selected: boolean }[]>([]);

const modelNames = computed(() => props.models?.map((model) => model.name) || []);
const submit = async () => {
  emits(
    'selected',
    models.value.filter((m) => m.selected).map((m) => ({ name: m.name, enabled: true }))
  );
  visible.value = false;
};

watchEffect(() => {
  models.value = props.availableModels
    .filter(
      (model) =>
        !modelNames.value.includes(model) &&
        (!filter || model.toLowerCase().includes(filter.value.toLowerCase()))
    )
    .map((name) => ({ name, selected: false }));
});
</script>
