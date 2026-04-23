<template>
  <div
    :class="[
      'relative flex items-center justify-between gap-6 bg-secondary/20 p-4',
      'before:content-[] before:absolute before:left-0 before:top-0 before:w-px before:h-full',
      enabled ? 'before:bg-primary' : 'before:bg-secondary'
    ]"
  >
    <div class="flex flex-1 items-center gap-8">
      <div class="flex flex-col items-center gap-1">
        <Switch v-model="enabled" />
        <span
          class="text-xs font-bold"
          :class="{
            'text-primary': enabled,
            'text-foreground/20': !enabled
          }"
        >
          {{ enabled ? 'ENABLED' : 'DISABLED' }}
        </span>
      </div>
      <div class="flex flex-col gap-2">
        <div class="text-foreground font-bold text-2xl">{{ model.name }}</div>
        <div v-if="tokenStats" class="flex items-center gap-1">
          <span class="text-sm text-muted-foreground"
            >{{ formatToken(tokenStats.inputTokens) }}/{{
              formatToken(tokenStats.outputTokens)
            }}</span
          >
          <span class="text-xs text-muted-foreground/50">tokens</span>
        </div>
      </div>
      <div class="flex-1 grid grid-cols-[repeat(auto-fill,200px)] gap-4">
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <Checkbox id="temperature" v-model="overrideTemperature" />
              <label for="temperature" class="text-foreground/50 text-sm">TEMPERATURE</label>
            </div>
            <span class="text-foreground text-sm">{{ temperatureSlider }}</span>
          </div>
          <Slider
            v-model="temperatureSlider"
            :min="0.1"
            :max="2"
            :step="0.1"
            :disabled="!overrideTemperature"
          />
        </div>
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <Checkbox id="maxTokens" v-model="overrideMaxTokens" />
              <label for="maxTokens" class="text-foreground/50 text-sm">MAX TOKENS</label>
            </div>
            <span class="text-foreground text-sm">{{ maxTokensSlider }}</span>
          </div>
          <Slider
            v-model="maxTokensSlider"
            :min="0"
            :max="modelConfig?.max_tokens ?? 128000"
            :step="100"
            :disabled="!overrideMaxTokens"
          />
        </div>
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <Checkbox id="maxInputTokens" v-model="overrideMaxInputTokens" />
              <label for="maxInputTokens" class="text-foreground/50 text-sm">MAX INPUT</label>
            </div>
            <span class="text-foreground text-sm">{{ maxInputTokensSlider }}</span>
          </div>
          <Slider
            v-model="maxInputTokensSlider"
            :min="0"
            :max="modelConfig?.max_input_token ?? 4096"
            :step="100"
            :disabled="!overrideMaxInputTokens"
          />
        </div>
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <Checkbox id="reasoningEffort" v-model="overrideReasoningEffort" />
              <label for="reasoningEffort" class="text-foreground/50 text-sm">THINKING DEPTH</label>
            </div>
          </div>
          <Select v-model="reasoningEffort">
            <SelectTrigger class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none"> None </SelectItem>
              <SelectItem value="minimal"> Minimal </SelectItem>
              <SelectItem value="low"> Low </SelectItem>
              <SelectItem value="medium"> Medium </SelectItem>
              <SelectItem value="high"> High </SelectItem>
              <SelectItem value="xhigh"> Extra High </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
    <div>
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
              This action cannot be undone. This will permanently delete model {{ model.name }}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction @click="emit('delete', model)">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
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
import { useDefaultConfig } from '@/composables/use-default-config';
import { useModelConfig } from '@/composables/use-model-config';
import { useSingleSlider } from '@/composables/use-single-slider';
import type { ModelConfig, TokenUsageStats } from '@shared-types/shared';
import { Trash } from 'lucide-vue-next';
import { computed } from 'vue';
import { formatToken } from '@/utils';

const emit = defineEmits<{
  delete: [model: ModelConfig];
}>();
const props = defineProps<{
  model: ModelConfig;
  tokenStats?: TokenUsageStats;
}>();

const modelConfig = useModelConfig(props.model.name);
const { value: temperature, override: overrideTemperature } = useDefaultConfig({
  get: () => props.model.temperature,
  set: (value) => {
    props.model.temperature = value;
  },
  key: 'temperature',
  defaultValue: 0.7
});
const { value: temperatureSlider } = useSingleSlider(temperature);

const { value: maxTokens, override: overrideMaxTokens } = useDefaultConfig({
  get: () => props.model.maxTokens,
  set: (value) => {
    props.model.maxTokens = value;
  },
  key: 'maxTokens'
});
const { value: maxTokensSlider } = useSingleSlider(maxTokens);

const { value: maxInputTokens, override: overrideMaxInputTokens } = useDefaultConfig({
  get: () => props.model.maxInputTokens,
  set: (value) => {
    props.model.maxInputTokens = value;
  },
  key: 'maxInputTokens'
});
const { value: maxInputTokensSlider } = useSingleSlider(maxInputTokens);

const { value: reasoningEffort, override: overrideReasoningEffort } = useDefaultConfig({
  get: () => props.model.reasoningEffort,
  set: (value) => {
    props.model.reasoningEffort = value;
  },
  key: 'reasoningEffort'
});

const enabled = computed<boolean>({
  get: () => props.model.enabled !== false,
  set: (value) => {
    props.model.enabled = value;
  }
});
</script>
