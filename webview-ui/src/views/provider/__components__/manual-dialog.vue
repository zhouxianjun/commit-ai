<template>
  <Dialog v-model:open="visible">
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogContent class="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>Add Model Manually</DialogTitle>
      </DialogHeader>
      <div class="flex flex-col gap-4 py-4">
        <div class="flex flex-col gap-2">
          <label for="manual-model-name" class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Model Name
          </label>
          <Input
            id="manual-model-name"
            v-model.trim="name"
            placeholder="e.g. gpt-4o, claude-3-5-sonnet"
            @keydown.enter.prevent="submit"
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline"> Cancel </Button>
        </DialogClose>
        <Button :disabled="!name" @click="submit"> Confirm </Button>
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
import { Input } from '@/components/ui/input';
import { ref, watch } from 'vue';
import { toast } from 'vue-sonner';

const emits = defineEmits<{
  add: [string];
}>();

const props = defineProps<{
  existingModelNames: string[];
}>();

const visible = ref(false);
const name = ref('');

const submit = () => {
  const modelName = name.value.trim();
  if (!modelName) {
    toast.error('Please enter a model name');
    return;
  }
  if (props.existingModelNames.includes(modelName)) {
    toast.error('This model is already added');
    return;
  }
  emits('add', modelName);
  visible.value = false;
};

watch(visible, (val) => {
  if (val) {
    name.value = '';
  }
});
</script>
