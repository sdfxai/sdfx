<template>
  <div class="Pane flex-1 max-h-full flex flex-col justify-between divide-y divide-zinc-200 dark:divide-black bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-100" :class="[isWindows?'h-[calc(100vh-3.2rem)]':'h-screen', position==='right'?'border-l border-zinc-200 dark:border-black':null]">
    <nav class="h-10 flex-shrink-0 border-t border-zinc-300 dark:border-black flex items-center justify-between px-3">
      <span class="text-xs font-bold">
        {{ title }}
      </span>
      <button v-if="position==='left'" @click="toggleLeftPane()">
        <ChevronDoubleLeftIcon class="tw-icon h-6 w-6"/>
      </button>
      <button v-if="position==='right'" @click="toggleRightPane()">
        <ChevronDoubleRightIcon class="tw-icon h-6 w-6"/>
      </button>
    </nav>
    <slot name="head"/>
    <slot name="body"/>
    <slot name="foot"/>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ChevronDoubleLeftIcon } from '@heroicons/vue/24/solid'
import { ChevronDoubleRightIcon } from '@heroicons/vue/24/solid'
import { useMainStore } from '@/stores'

const props = defineProps({
  title: { type: String, required: false, default: 'Untitled' },
  position: { type: String, required: false, default: null },
})

const scrollable = ref(null)

const isElectron = (window as any).electron ? true : false
const isWindows = isElectron && (window as any).electron.isWindows

const mainStore = useMainStore()

const toggleLeftPane = ()=>{
  mainStore.toggleLeftPane()
}

const toggleRightPane = ()=>{
  mainStore.toggleRightPane()
}
</script>
