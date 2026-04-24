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
        <Button variant="outline" size="icon" @click="providersStore.refresh()">
          <RefreshCcw />
        </Button>
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
          v-bind="preset"
          :key="preset.name"
          @click="$router.push({ path: '/add', query: { preset: preset.name } })"
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
          v-if="providersStore.providers.length > 0"
          v-model="providersStore.providers"
          :animation="150"
          class="flex flex-col gap-4"
          @sort="handleSorted"
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
        <div
          v-else
          class="h-full flex flex-col items-center justify-center border-2 border-dashed border-foreground/5 rounded-[32px] bg-foreground/1 p-12 text-center"
        >
          <div
            class="relative w-20 h-20 rounded-[24px] bg-primary/10 flex items-center justify-center mb-8 group"
          >
            <div
              class="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse opacity-50"
            ></div>
            <Sparkles
              class="w-10 h-10 text-primary relative z-10 transition-transform group-hover:scale-110 duration-500"
            />
          </div>
          <h3 class="text-2xl font-bold mb-3 tracking-tight">Begin Your AI Experience</h3>
          <p class="text-muted-foreground text-sm max-w-[340px] mb-10 leading-relaxed">
            Configure your first AI provider to enable smart commit message generation. Select a
            preset above or add a custom endpoint.
          </p>
          <Button
            variant="default"
            size="lg"
            class="h-12 px-10 rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
            @click="$router.push('/add')"
          >
            <Plus class="mr-2 h-4 w-4" />
            ADD PROVIDER
          </Button>
        </div>
      </div>
    </div>
    <div
      class="mt-16 bg-secondary/20 p-6 flex flex-col md:flex-row gap-12 border-t border-secondary/90"
    >
      <div class="flex flex-col gap-2">
        <span class="text-[10px] uppercase font-bold tracking-widest">Total Providers</span>
        <span class="text-2xl font-black">{{ providersStore.total }}</span>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-[10px] uppercase font-bold tracking-widest">Total Models</span>
        <span class="text-2xl font-black text-primary">{{ providersStore.totalModels }}</span>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-[10px] uppercase font-bold tracking-widest">Total Tokens</span>
        <span class="text-2xl font-black text-primary uppercase">{{
          formatToken(totalTokens)
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, RefreshCcw, Sparkles } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import Preset from './__components__/preset.vue';
import Provider from './__components__/provider.vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useProviders } from '@/store/provides';
import { cloneDeep } from 'lodash-es';
import { computed } from 'vue';
import { formatToken } from '@/utils';
import { presets } from '@/utils/provider';

const providersStore = useProviders();

const totalTokens = computed(() =>
  Array.from(providersStore.providerStats.values()).reduce(
    (acc, stat) => acc + stat.totalUsage.inputTokens + stat.totalUsage.outputTokens,
    0
  )
);

providersStore.refresh();

const handleDelete = async (index: number) => {
  await providersStore.deleteProvider(index);
  providersStore.refresh();
};
const handleSorted = () => {
  providersStore.saveServers(cloneDeep(providersStore.providers));
};
</script>
