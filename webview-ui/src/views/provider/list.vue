<template>
  <div class="p-[32px] h-full flex flex-col">
    <div class="flex justify-between">
      <div class="flex flex-col gap-8px">
        <div class="text-3xl font-bold text-foreground">Provider List</div>
        <div class="text-sm text-muted-foreground">
          Manage and configure your global AI model endpoints.
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="default" @click="$router.push('/add')">
          <Plus />
          ADD PROVIDER
        </Button>
      </div>
    </div>
    <div class="mt-10">
      <div class="flex items-center gap-4 mb-4">
        <h2 class="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/30">
          Quick Presets
        </h2>
        <div class="h-0.25 flex-1 bg-foreground/10"></div>
      </div>
      <div class="mt-4 flex items-center gap-4">
        <Preset
          v-for="preset of presets"
          :key="preset.name"
          :name="preset.name"
          :description="preset.description"
          :config="preset.config"
        />
      </div>
    </div>
    <div class="mt-12 flex flex-col flex-1 overflow-hidden">
      <div class="flex items-center gap-4 mb-4">
        <h2 class="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/30">
          Providers
        </h2>
        <div class="h-0.25 flex-1 bg-foreground/10"></div>
      </div>
      <div class="mt-4 flex-1 overflow-y-auto">
        <VueDraggable
          v-model="providersStore.providers"
          :animation="150"
          class="flex flex-col gap-4"
        >
          <Provider
            v-for="(provider, index) of providersStore.providers"
            :key="provider.baseURL"
            :config="provider"
            :index="index"
            class="cursor-move"
            @delete="handleDelete"
          />
        </VueDraggable>
      </div>
    </div>
    <div
      class="mt-16 bg-secondary/20 p-6 flex flex-col md:flex-row gap-12 border-t border-secondary/90"
    >
      <div class="flex flex-col gap-2">
        <span class="text-[10px] uppercase font-bold tracking-widest">Total Servers</span>
        <span class="text-2xl font-black">{{ providersStore.total }}</span>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-[10px] uppercase font-bold tracking-widest">Total Models</span>
        <span class="text-2xl font-black text-primary">{{ providersStore.totalModels }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import Preset, { type Preset as PresetType } from './__components__/preset.vue';
import Provider from './__components__/provider.vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useProviders } from '@/store/provides';

const presets: PresetType[] = [
  {
    name: 'OpenRouter',
    description: 'Free and open-source AI model provider',
    config: {
      type: 'openai',
      baseURL: 'https://openrouter.ai/api/v1',
      models: [
        {
          name: 'openrouter/free',
          enabled: true,
          reasoningEffort: 'low',
          temperature: 0.7
        }
      ]
    }
  },
  {
    name: 'NVIDIA Build',
    description: 'Try NVIDIA NIM APIs',
    config: {
      type: 'openai',
      baseURL: 'https://integrate.api.nvidia.com/v1',
      models: []
    }
  },
  {
    name: 'Github',
    description: 'Github Copilot Models',
    config: {
      type: 'openai',
      baseURL: 'https://models.github.ai/inference',
      models: []
    }
  }
];

const providersStore = useProviders();

providersStore.refresh();

const handleDelete = async (index: number) => {
  await providersStore.deleteProvider(index);
  providersStore.refresh();
};
</script>
