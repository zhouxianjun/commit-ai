<template>
  <div
    class="flex items-center justify-between gap-6 h-24 px-6 bg-secondary/20 hover:bg-secondary/40"
  >
    <div class="flex items-center gap-4">
      <img v-if="icon" class="size-6" :src="icon" alt="" />
      <Bot v-else />
      <div class="flex flex-col">
        <span class="text-lg font-medium text-foreground capitalize">{{ name }}</span>
        <span class="text-xs text-muted-foreground">{{ config.baseURL }}</span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <Button variant="outline">
        <Gauge />
      </Button>
      <Button variant="outline" @click="$router.push(`/edit/${props.index}`)">
        <span class="text-xl font-black text-primary">{{ activeModels.length }}</span>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger>
          <Button variant="outline" class="hover:bg-destructive">
            <Trash />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete provider {{ name }} and all
              models under it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction @click="emit('delete', index)">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ServerConfig } from '@shared-types/shared';
import { Bot, Gauge, Trash } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { useProvider } from '@/composables/use-provider';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';

const emit = defineEmits<{
  delete: [index: number];
}>();
const props = defineProps<{
  config: ServerConfig;
  index: number;
}>();

const { name, icon, activeModels } = useProvider(props.config);
</script>
