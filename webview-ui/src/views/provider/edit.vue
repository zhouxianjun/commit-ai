<template>
  <div class="h-full flex flex-col justify-between">
    <div class="p-[32px] flex-1 flex flex-col gap-8">
      <div class="text-3xl font-bold text-foreground">Edit AI Provider</div>
      <div class="flex flex-col gap-6">
        <div class="flex items-center gap-2">
          <Settings />
          <span class="text-sm font-bold text-foreground">Provider Settings</span>
        </div>
        <form class="grid grid-cols-2 gap-6 items-start" @submit.prevent="onSubmit">
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
        </form>
      </div>
      <div class="flex flex-1 flex-col gap-4 overflow-y-auto">
        <Model v-for="model of models" :key="model.name" :model="model" />
      </div>
    </div>

    <div class="px-[32px] flex justify-between items-center">
      <Button variant="secondary" class="rounded-none px-8!">
        <Gauge class="text-primary" />
        TEST CONNECTION
      </Button>
      <div class="flex items-center gap-4">
        <Button variant="outline" class="rounded-none" @click="$router.back()">Cancel</Button>
        <Button variant="default" class="rounded-none" @click="onSubmit">Save</Button>
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
import { useProviders } from '@/store/provides';
import { computed, ref } from 'vue';
import Model from './__components__/model.vue';
import type { ModelConfig } from '@shared-types/shared';
import { isNil } from 'lodash-es';
import { useDefaultConfig } from '@/composables/use-default-config';
import { Checkbox } from '@/components/ui/checkbox';

const props = defineProps<{
  index?: number;
}>();

const providerStore = useProviders();

const provider = computed(() =>
  !isNil(props.index) ? providerStore.providers[props.index] : undefined
);
const schema = toTypedSchema(
  z.object({
    type: z.enum(['openai', 'gemini', 'azure']),
    baseURL: z.string().url(),
    apiKey: z.string().optional(),
    apiVersion: z.string().optional(),
    timeout: z.coerce.number().min(0).optional()
  })
);
const form = useForm({
  validationSchema: schema,
  initialValues: {
    type: 'openai',
    baseURL: '',
    apiKey: '',
    ...provider.value
  }
});
const { override: overrideTimeout, value: timeout } = useDefaultConfig({
  get: () => form.values.timeout,
  set: (value) => form.setFieldValue('timeout', value),
  key: 'timeout',
  defaultValue: 30000
});

const models = ref<ModelConfig[]>(provider.value?.models ?? []);

const onSubmit = form.handleSubmit((values) => {
  console.log(values);
});
</script>
