<template>
  <div class="h-full flex flex-col justify-between">
    <div class="p-[32px] flex-1 flex flex-col gap-8">
      <div class="text-3xl font-bold text-foreground">Edit AI Provider</div>
      <div class="flex flex-col gap-6">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2">
            <Settings />
            <span class="text-sm font-bold text-foreground">Provider Settings</span>
          </div>
          <div class="flex items-center gap-2">
            <ModelDialog
              :available-models="availableModels"
              :models="models"
              @selected="handleSelectedModels"
            >
              <Button variant="default" :disabled="!availableModels.length">
                <Plus />
                ADD MODEL
              </Button>
            </ModelDialog>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-6 items-start">
          <FormField v-slot="{ componentField }" name="type">
            <FormItem class="flex-1">
              <FormLabel class="text-foreground/50">Provider type</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger class="w-full bg-secondary rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="openai"> OpenAI </SelectItem>
                      <SelectItem value="gemini"> Gemini </SelectItem>
                      <SelectItem value="azure"> Azure </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="baseURL">
            <FormItem class="flex-1">
              <FormLabel class="text-foreground/50">Base URL</FormLabel>
              <FormControl>
                <Input
                  class="w-full bg-secondary rounded-none"
                  type="url"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="apiKey">
            <FormItem class="flex-1">
              <FormLabel class="text-foreground/50">API Key</FormLabel>
              <FormControl>
                <Input class="w-full bg-secondary rounded-none" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField
            v-if="form.values.type === 'azure'"
            v-slot="{ componentField }"
            name="apiVersion"
          >
            <FormItem class="flex-1">
              <FormLabel class="text-foreground/50">API Version</FormLabel>
              <FormControl>
                <Input class="w-full bg-secondary rounded-none" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ value, handleChange }" name="timeout">
            <FormItem class="flex-1">
              <FormLabel class="text-foreground/50">
                <Checkbox v-model="overrideTimeout" />
                <span>Timeout (ms)</span>
              </FormLabel>
              <FormControl>
                <NumberField
                  class="w-full bg-secondary"
                  :model-value="value ?? timeout"
                  :min="0"
                  :disabled="!overrideTimeout"
                  @update:model-value="handleChange"
                >
                  <NumberFieldContent>
                    <button
                      v-if="overrideTimeout"
                      type="button"
                      class="absolute top-1/2 -translate-y-1/2 left-0 p-3 hover:bg-accent hover:text-accent-foreground disabled:opacity-20 transition-colors"
                      :disabled="value === 0"
                      @click="handleChange(Math.max(0, (value || 0) - 1000))"
                    >
                      <Minus class="h-4 w-4" />
                    </button>
                    <NumberFieldInput />
                    <button
                      v-if="overrideTimeout"
                      type="button"
                      class="absolute top-1/2 -translate-y-1/2 right-0 p-3 hover:bg-accent hover:text-accent-foreground disabled:opacity-20 transition-colors"
                      @click="handleChange((value || 0) + 1000)"
                    >
                      <Plus class="h-4 w-4" />
                    </button>
                  </NumberFieldContent>
                </NumberField>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto">
        <VueDraggable v-model="models" :animation="150" class="flex flex-col gap-4">
          <Model
            v-for="model of models"
            :key="model.name"
            :model="model"
            :token-stats="modelTokenStats[model.name]"
            class="cursor-move"
            @delete="handleDeleteModel"
          />
        </VueDraggable>
      </div>
    </div>

    <div class="px-[32px] flex justify-between items-center">
      <Button variant="secondary" class="rounded-none px-8!" @click="test()">
        <Spinner v-if="isTestLoading" />
        <Gauge v-else class="text-primary" />
        TEST & FETCH MODELS
      </Button>
      <div class="flex items-center gap-4">
        <Button variant="outline" class="rounded-none" @click="$router.back()">Cancel</Button>
        <Button variant="default" class="rounded-none" @click="save">Save</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Gauge, Plus, Minus, Settings } from 'lucide-vue-next';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useForm } from 'vee-validate';
import { VueDraggable } from 'vue-draggable-plus';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { NumberField, NumberFieldContent, NumberFieldInput } from '@/components/ui/number-field';
import { Spinner } from '@/components/ui/spinner';
import { useProviders } from '@/store/provides';
import { computed, ref, watchEffect } from 'vue';
import Model from './__components__/model.vue';
import type {
  ModelConfig,
  ProviderConfig,
  ServerConfig,
  TokenUsageStats
} from '@shared-types/shared';
import { cloneDeep, isNil } from 'lodash-es';
import { useDefaultConfig } from '@/composables/use-default-config';
import { Checkbox } from '@/components/ui/checkbox';
import ModelDialog from './__components__/model-dialog.vue';
import { useProviderModels } from '@/composables/use-provider-models';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

const props = defineProps<{
  index?: number;
}>();

const router = useRouter();
const providerStore = useProviders();
const { models: availableModels, isLoading: isTestLoading, fetchModels } = useProviderModels();

const provider = computed(() =>
  !isNil(props.index) ? providerStore.providers[props.index] : undefined
);
const models = ref<ModelConfig[]>(provider.value?.models ?? []);

const modelTokenStats = computed(() => {
  if (!provider.value) {
    return {};
  }
  const tokenStats = providerStore.providerStats.get(provider.value.providerKey);
  if (!tokenStats) {
    return {};
  }
  return tokenStats.modelStats.reduce(
    (acc, stat) => {
      acc[stat.modelName] = stat;
      return acc;
    },
    {} as Record<string, TokenUsageStats>
  );
});

watchEffect(() => console.log(modelTokenStats.value));

const schema = z.object({
  type: z.enum(['openai', 'azure', 'gemini']),
  baseURL: z.union([z.string().url(), z.literal('')]).optional(),
  apiKey: z.string().min(1, 'Please provide an API key'),
  apiVersion: z.string().optional(),
  timeout: z.coerce.number().min(0).optional()
});
const form = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    type: 'openai',
    ...provider.value
  }
});
const { override: overrideTimeout, value: timeout } = useDefaultConfig({
  get: () => form.values.timeout,
  set: (value) => form.setFieldValue('timeout', value),
  key: 'timeout',
  defaultValue: 30000
});

const handleSelectedModels = (selectedModels: ModelConfig[]) => {
  models.value.push(...selectedModels);
};
const handleDeleteModel = (model: ModelConfig) => {
  models.value = models.value.filter((m) => m.name !== model.name);
};
const test = async () => {
  const result = await form.validate();
  if (result.valid && result.values) {
    toast.promise(fetchModels(result.values as ProviderConfig), {
      loading: 'Testing provider...',
      success: 'Provider tested successfully!',
      error: (e: any) => e.error?.message ?? e.message ?? 'Failed to test provider'
    });
  }
};
const save = async () => {
  const result = await form.validate();
  if (!result.valid) {
    return;
  }
  await providerStore.updateProvider(
    props.index ?? -1,
    cloneDeep({
      ...form.values,
      models: models.value
    }) as ServerConfig
  );
  router.back();
};
</script>
