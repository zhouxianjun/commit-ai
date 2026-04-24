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
              <Button ref="addBtn" variant="default" :disabled="!availableModels.length">
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
              <FormLabel class="text-foreground/50 flex justify-between">
                <span>Base URL</span>
                <a
                  v-if="providerConfig?.website"
                  :href="providerConfig.website"
                  class="text-primary hover:underline underline-offset-4"
                  target="_blank"
                  >learn more</a
                >
              </FormLabel>
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
              <FormLabel class="text-foreground/50 flex justify-between">
                <span>API Key</span>
                <a
                  v-if="providerConfig?.getKeyURL"
                  :href="providerConfig.getKeyURL"
                  class="text-primary hover:underline underline-offset-4"
                  target="_blank"
                  >Get API Key</a
                >
              </FormLabel>
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
      <div class="flex-1 overflow-y-auto min-h-[300px]">
        <VueDraggable
          v-if="models.length > 0"
          v-model="models"
          :animation="150"
          class="flex flex-col gap-4"
        >
          <Model
            v-for="model of models"
            :key="model.name"
            :model="model"
            :token-stats="modelTokenStats[model.name]"
            class="cursor-move"
            @delete="handleDeleteModel"
          />
        </VueDraggable>
        <div
          v-else
          class="h-full flex flex-col items-center justify-center border-2 border-dashed border-foreground/5 rounded-3xl bg-foreground/1 p-8 text-center"
        >
          <div
            class="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group"
          >
            <div
              class="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse opacity-50"
            ></div>
            <Sparkles
              class="w-8 h-8 text-primary relative z-10 transition-transform group-hover:scale-110 duration-500"
            />
          </div>
          <h3 class="text-xl font-bold mb-2">No Models Added</h3>
          <p class="text-muted-foreground text-xs max-w-[280px] mb-6 leading-relaxed">
            Configure models to start using this provider.
          </p>
          <div class="flex gap-3">
            <Button
              variant="default"
              size="lg"
              class="h-12 px-10 rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
              @click="testAndAdd()"
            >
              <Plus class="mr-2 h-4 w-4" />
              TEST & ADD MODELS
            </Button>
          </div>
        </div>
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
import { Gauge, Plus, Minus, Settings, Sparkles } from 'lucide-vue-next';
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
import { computed, ref, useTemplateRef, watchEffect } from 'vue';
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
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { getPreset, getProviderConfig } from '@/utils/provider';

const props = defineProps<{
  index?: number;
}>();

const addBtn = useTemplateRef('addBtn');
const router = useRouter();
const route = useRoute();
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

const preset = computed(() => {
  const { preset } = route.query;
  if (preset) {
    return getPreset(preset as string);
  }
  return null;
});
const providerConfig = computed(() => {
  if (!form.values.type || !form.values.baseURL) {
    return null;
  }
  return getProviderConfig(form.values.type, form.values.baseURL);
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
    return toast
      .promise(fetchModels(result.values as ProviderConfig), {
        loading: 'Testing provider...',
        success: 'Provider tested successfully!',
        error: (e: any) => e.error?.message ?? e.message ?? 'Failed to test provider'
      })
      ?.unwrap();
  }
};
const testAndAdd = async () => {
  await test();
  addBtn.value?.$el?.click();
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

watchEffect(() => {
  if (!preset.value || provider.value) {
    return;
  }
  form.setValues(preset.value.config as any, false);
  models.value = preset.value.config.models ?? [];
});
</script>
