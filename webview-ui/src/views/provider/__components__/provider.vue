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
        <div
          v-if="!config.models?.length"
          class="flex items-center gap-1 mt-1 text-destructive/80 animate-pulse"
        >
          <AlertCircle class="size-3" />
          <span class="text-[10px] font-bold uppercase tracking-wider"
            >No Models Configured</span
          >
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div v-if="stats" class="flex items-center gap-1">
        <span class="text-sm text-muted-foreground"
          >{{ formatToken(stats.totalUsage.inputTokens) }}/{{
            formatToken(stats.totalUsage.outputTokens)
          }}</span
        >
        <span class="text-xs text-muted-foreground/50">tokens</span>
      </div>
      <Button variant="outline" @click="test">
        <Gauge />
      </Button>
      <Button variant="outline" @click="$router.push(`/edit/${props.index}`)">
        <template v-if="config.models?.length">
          <span class="text-lg font-black text-primary">{{ activeModels.length }}</span>
          <span class="text-xs">/</span>
          <span class="text-xs">{{ config.models?.length }}</span>
        </template>
        <div v-else class="flex items-center gap-1 px-1">
          <Plus class="size-3 text-primary" />
          <span class="text-[10px] font-bold text-primary uppercase tracking-wider"
            >Add Model</span
          >
        </div>
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
import { AlertCircle, Bot, Gauge, Plus, Trash } from 'lucide-vue-next';
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
import { toast } from 'vue-sonner';
import { useProviderModels } from '@/composables/use-provider-models';
import { useProviders } from '@/store/provides';
import { computed } from 'vue';
import { formatToken } from '@/utils';

const emit = defineEmits<{
  delete: [index: number];
}>();
const props = defineProps<{
  config: ServerConfig;
  index: number;
}>();

const providersStore = useProviders();
const { name, icon, activeModels } = useProvider(props.config);
const { fetchModels } = useProviderModels();

const stats = computed(() => providersStore.providerStats.get(props.config.providerKey));

const test = () => {
  toast.promise(() => fetchModels(props.config), {
    loading: 'Testing provider...',
    success: 'Provider test passed!',
    error: (e: any) => e.error?.message ?? e.message ?? 'Failed to test provider'
  });
};
</script>
