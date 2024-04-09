<template>
  <article class="SDFXPreview flex-1 w-full h-full relative flex items-center justify-center bg-white dark:bg-zinc-950 overflow-hidden">
    <imgz
      v-if="preview.currentPreviewImage"
      :src="preview.currentPreviewImage"
      alt="preview"
      class="w-full h-full object-contain"
    />
    <div v-else class="w-full h-full flex items-center justify-center">
      <svg class="text-zinc-500 w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"></path>
      </svg>
    </div>

    <div v-if="progress.percent>0" class="absolute p-1 left-0 bottom-0 w-full flex-1 text-zinc-600 dark:text-zinc-200 font-mono flex space-x-2 uppercase text-xs font-semibold">
      <!-- progress bar -->
      <div class="px-0 py-1 w-full bg-zinc-200 dark:bg-zinc-900/60">
        <div class="progress w-full relative">
          <div class="progress-bar nano pink" :style="`width: ${progress.percent}%; transition: ${progress.percent>0?'200ms':null};`">
          </div>
        </div>
      </div>
      <span v-if="progress.job_count>1">{{ `${Number(progress.job_no)+1} / ${progress.job_count}` }}</span>
      <span v-if="progress.totalSteps" class="w-10 text-right">{{ `(${(100*progress.currentStep / progress.totalSteps).toFixed(0)}%)` }}</span>
    </div>
  </article>
</template>

<script lang="ts" setup>
import imgz from '@/components/imgz.vue'
import { useMainStore, useGraphStore, storeToRefs } from '@/stores'

const props = defineProps({
  id: { type: String, required: false, default: null },
  label: { type: String, required: false, default: null },
  target: { type: Object, required: false },
  showLabel: { type: Boolean, required: false, default: true },
  disabled: { type: Boolean, required: false, default: false },
  loading: { type: Boolean, required: false, default: false },
  showDelete: { type: Boolean, required: false }
})

const mainStore = useMainStore()
const graphStore = useGraphStore()
const { progress } = storeToRefs(mainStore)
const { preview } = storeToRefs(graphStore)

const clearPreviewImages = () => {
  graphStore.cleanImages()
}
</script>
