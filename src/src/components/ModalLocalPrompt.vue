<template>
  <teleport to="body">
    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="absolute inset-0 z-[100] bg-teal-700/20" @click="close()"></div>
    </transition>
    <TWDragWin v-if="open" :resizable="false" :minHeight="200" :maxHeight="400" :minWidth="250" :maxWidth="450" :width="300" @close="$emit('close')" @enter="submit" :position="position">
      <template #head>
        <div class="bg-gradient-to-r from-zinc-300 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 h-8 p-2 flex items-center justify-between rounded-t-lg">
          <div class="font-bold text-sm text-zinc-700 dark:text-white">
            <span v-if="title">{{ title }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <dt class="rounded-full bg-zinc-700 w-4 h-4 opacity-25"></dt>
            <dt class="rounded-full bg-green-800 w-4 h-4 opacity-25"></dt>
            <button @click="$emit('close')"><dt class="rounded-full bg-pink-700 w-4 h-4"></dt></button>
          </div>
        </div>
      </template>

      <div class="flex-1 h-full noselect text-zinc-700 dark:text-white bg-white dark:bg-zinc-900/90 shadow-xl rounded-b-2xl">
        <section class="p-6">
          <form @submit.stop.prevent="submit">
            <TWTextarea v-model="local.prompt" :limit="250" label="Positive" :showOptional="true" :autofocus="true" :rows="2" class="flex-auto"/>
            <div v-if="showSteps" class="mt-4 flex items-center justify-between space-x-3">
              <span class="w-32">Steps</span>
              <TWSlider
                v-model="local.steps"
                color="green"
                :min="1"
                :max="100"
                :interval="1"
                :shiftInterval="1"
                :snapThreshold="0.05"
                :range="[1, 25, 50, 75, 100]"
                :snap="[1, 5, 10, 15, 20, 25, 30, 50, 75, 100]"
                class="flex-1"
              />
              <span class="w-12 text-right">{{ local.steps }}</span>
            </div>
            <div v-if="showCFG" class="mt-4 flex items-center justify-between space-x-3">
              <span class="w-32">Guidance</span>
              <TWSlider
                v-model="local.cfg_scale"
                :min="0"
                :max="30"
                :interval="0.25"
                :shiftInterval="0.05"
                :range="[0, 5, 10, 15, 20, 25, 30]"
                :snap="[0, 7.5, 15, 22, 30]"
                :snapThreshold="0.02"
                :tooltipFormatter="(v: number) => v.toFixed(2)"
                class="flex-1"
              />
              <span class="w-12 text-right">{{ local.cfg_scale.toFixed(2) }}</span>
            </div>
            <div v-if="showDenoising" class="mt-4 flex items-center justify-between space-x-3">
              <span class="w-32">Denoising</span>
              <TWSlider
                v-model="local.denoising_strength"
                :min="0"
                :max="1"
                :interval="0.01"
                :range="[0.00, 0.25, 0.50, 0.75, 1.00]"
                :snap="[0.25, 0.25, 0.50, 0.75]"
                :snapThreshold="0.05"
                :showTooltip="false"
                class="flex-1"
              />
              <span class="w-12 text-right">{{ local.denoising_strength.toFixed(2) }}</span>
            </div>
            <div class="mt-6">
              <button type="submit" class="tw-button w-full">Apply</button>
            </div>
          </form>
        </section>
      </div>

      <template #foot>
        <div class="w-full h12 overflow-hidden relative">
          <div class="w-12 h-12 rounded-lg bg-white dark:bg-zinc-900/80 rotate-45 translate-x-8 -translate-y-8"></div>
        </div>
      </template>
    </TWDragWin>
  </teleport>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import TWSlider from '@/components/UI/TWSlider.vue'
import TWTextarea from '@/components/UI/TWTextarea.vue'
import TWDragWin from '@/components/UI/TWDragWin.vue'

const props = defineProps({
  title: { type: String, required: false, default: null },
  position: { type: Object, required: false, default: null },
  payload: { type: Object, required: false, default: null },
  open: { type: Boolean, required: false, default: false },
  prompt: { type: String, required: false, default: null },
  steps: { type: Number, required: false, default: 20 },
  cfg_scale: { type: Number, required: false, default: 7.5 },
  denoising_strength: { type: Number, required: false, default: 0.75 },
  sampler_index: { type: String, required: false, default: 'Euler' },
  showSteps: { type: Boolean, required: false, default: true },
  showCFG: { type: Boolean, required: false, default: true },
  showDenoising: { type: Boolean, required: false, default: true },
  showSampler: { type: Boolean, required: false, default: true }
})

const emit = defineEmits(['close', 'submit'])

const local = ref({
  prompt: props.prompt,
  steps: props.steps,
  cfg_scale: props.cfg_scale,
  denoising_strength: props.denoising_strength,
  sampler_index: 'Euler'
})

const close = ()=>{
  emit('close')
}

const submit = () => {
  emit('submit', local.value, props.payload)
}
</script>
