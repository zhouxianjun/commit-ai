<template>
  <div
    class="flex items-center justify-between gap-6 h-24 px-6 bg-secondary/20 hover:bg-secondary/40"
  >
    <div class="flex items-center gap-4">
      <img v-if="provider.icon" class="size-6" :src="provider.icon" alt="" />
      <Bot v-else />
      <div class="flex flex-col">
        <span class="text-lg font-medium text-foreground capitalize">{{ provider.name }}</span>
        <span class="text-xs text-muted-foreground">{{ config.baseURL }}</span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <Button variant="outline">
        <Gauge />
      </Button>
      <Button variant="outline">
        <SquarePen />
      </Button>
      <Button variant="outline">
        <Menu />
      </Button>
      <Button variant="outline" class="hover:bg-destructive">
        <Trash />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ServerConfig } from '@shared-types/shared';
import { getProvider } from './provider-config';
import { computed } from 'vue';
import { Bot, Gauge, SquarePen, Trash, Menu } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

const props = defineProps<{
  config: ServerConfig;
}>();

const provider = computed(() => {
  return getProvider(props.config);
});
</script>
