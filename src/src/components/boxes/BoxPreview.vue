<template>
  <Box title="Preview" :flexible="true" :isScrollable="false" class="box h-full">
    <template #right>
      <div v-if="progress.percent>0" class="flex-1 text-zinc-600 dark:text-zinc-200 font-mono h-5 flex space-x-2 uppercase text-xs font-semibold overflow-hidden">
        <!-- progress bar -->
        <div class="px-0 py-1 -mt-px w-28 bg-zinc-200 dark:bg-zinc-900/60">
          <div class="progress w-full relative">
            <div class="progress-bar nano pink" :style="`width: ${progress.percent}%; transition: ${progress.percent>0?'200ms':null};`">
            </div>
          </div>
        </div>
        <span v-if="progress.job_count>1">{{ `${Number(progress.job_no)+1} / ${progress.job_count}` }}</span>
        <span v-if="progress.totalSteps" class="w-10 text-right">{{ `(${(100*progress.currentStep / progress.totalSteps).toFixed(0)}%)` }}</span>
      </div>
      <div v-else class="flex items-center space-x-2">
        <button v-if="preview.lastBatch[0]" @click="openComparisonDrawer=!openComparisonDrawer">
          <ViewfinderCircleIcon class="tw-icon h-5 w-5" />
        </button>

        <button v-if="preview.currentPreviewImage || preview.currentBatch[0]" @click="clearPreviewImages()">
          <TrashIcon class="tw-icon h-5 w-5"/>
        </button>
      </div>
    </template>

    <!-- image -->
    <TWTabs
      v-if="false"
      v-model="tab"
      :tabs="[
        {id:'preview', name:'Preview'},
        {id:'output', name:'Output'}
      ]"
    />

    <div v-if="tab==='preview'" class="flex-1 relative h-full flex items-center justify-center rounded-b-lg bg-white dark:bg-zinc-950 overflow-hidden">
      <imgz
        v-if="preview.currentPreviewImage"
        :src="preview.currentPreviewImage"
        alt="preview"
        class="w-full h-full rounded object-contain"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <svg class="text-zinc-500 w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"></path>
        </svg>
      </div>

      <div v-if="progress.runningNodeId" class="absolute w-full left-0 top-0 px-3 h-14 flex items-center bg-gradient-to-b from-zinc-950 to-transparent">
        <article class="text-base text-left flex items-center space-x-2 pb-2">
          <SpinLoader class="w-6 h-6 text-green-400"/>
          <span class="txt font-semibold text-teal-400 whitespace-nowrap">{{ progress.runningNodeTitle }}</span>
          <span class="txt font-semibold text-zinc-200">(#{{ progress.runningNodeId }})</span>
        </article>
      </div>
    </div>

    <div v-if="tab==='output'" class="flex-1 relative h-full flex items-center justify-center rounded-b-lg bg-white dark:bg-zinc-950 overflow-hidden">
      <imgz
        v-if="preview.currentBatch"
        :src="preview.currentBatch[0]"
        alt="output"
        class="w-full h-full rounded object-contain"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <svg class="text-zinc-500 w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"></path>
        </svg>
      </div>
    </div>


    <SlideDrawer :open="openComparisonDrawer" :showFooter="false" minwidth="384px" :maxwidth="`${1024}px`" :title="`Before / After`" orientation="top" @close="openComparisonDrawer=false">
      <ImageComparator
        :image1="`${preview.lastBatch[0]}`"
        :image2="`${preview.currentBatch[0]}`"
      />
    </SlideDrawer>
  </Box>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useMainStore, useGraphStore, storeToRefs } from '@/stores'
import { useI18n } from 'vue-i18n'
import { TrashIcon, ViewfinderCircleIcon } from '@heroicons/vue/24/solid'
import Box from '@/components/UI/Box.vue'
import SlideDrawer from '@/components/UI/SlideDrawer.vue'
import ImageComparator from '@/components/ImageComparator.vue'
import imgz from '@/components/imgz.vue'
import TWTabs from '@/components/UI/TWTabs.vue'
import SpinLoader from '@/components/UI/SpinLoader.vue'

const { t } = useI18n()
const mainStore = useMainStore()
const graphStore = useGraphStore()
const { progress, status } = storeToRefs(mainStore)
const { preview } = storeToRefs(graphStore)

const tab = ref('preview')
const openComparisonDrawer = ref(false)

const clearPreviewImages = () => {
  graphStore.cleanImages()
}
</script>
