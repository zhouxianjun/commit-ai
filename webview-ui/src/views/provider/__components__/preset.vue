<template>
  <Button variant="secondary" class="group h-auto p-4 flex justify-between gap-6">
    <div class="flex flex-col gap-1 text-left">
      <p class="text-xs font-bold text-foreground">{{ name }}</p>
      <p class="text-[10px] text-muted-foreground">{{ description }}</p>
    </div>
    <Zap class="group-hover:text-primary transition-colors" />
  </Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-vue-next';
import type { ServerConfig } from '@shared-types/shared';

export type Preset = {
  name: string;
  description: string;
  config: Partial<ServerConfig>;
};

const props = defineProps<Preset>();
</script>
