<template>
  <div class="Pane flex-1 max-h-full flex flex-col justify-between divide-y divide-zinc-200 dark:divide-black bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-100" :class="[isWindows?'h-[calc(100vh-5.6rem)]':'h-[calc(100vh-2.6rem)]', position==='right'?'border-l border-zinc-200 dark:border-black':null]">
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
