<template>
  <DroppableSection @filedrop="handleFileDrop" :droppable="false" :opaque="isDroppable" class="AppView dark flex flex-col justify-between h-full bg-zinc-950">
    <WorkspaceBar :hasNextButton="false" :hasMenuButton="false" />

    <!-- no workflow, no mapping -->
    <div v-if="status.ready && !nodegraph.currentWorkflow && !mapping.mainpane" class="flex flex-col items-center justify-center h-full">
      <svg class="w-24 h-24 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" stroke-width="1.0" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3"></path>
      </svg>
      <span class="max-w-xs text-lg text-center mt-3">Please drag'n drop a SDFX app, an image or a Comfy Workflow.</span>
    </div>

    <!-- has workflow but no mainpane mapping -->
    <div v-if="status.ready && nodegraph.currentWorkflow && !hasMainpaneMapping" class="flex flex-col items-center justify-center h-full">
      <svg class="w-24 h-24 text-orange-500" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"></path>
      </svg>
      <h3 class="text-orange-500">No User Interface</h3>
      <span class="max-w-xs text-lg text-center mt-3">
        This workflow has no UI.
      </span>
    </div>

    <!-- has workflow and mapping -->
    <HTMLComponent
      v-if="status.ready && nodegraph.currentWorkflow && mapping.mainpane && hasMainpaneMapping"
      v-for="(item, idx) in mapping.mainpane" :key="idx"
      :label="item.label"
      :component="item.component"
      :attributes="item.attributes"
      :innerText="item.innerText"
      :childrin="item.childrin"
    />
  </DroppableSection>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import { useMainStore, useGraphStore, storeToRefs } from '@/stores'
import HTMLComponent from '@/components/controls/HTMLComponent.vue'
import DroppableSection from '@/components/DroppableSection.vue'
import WorkspaceBar from '@/layout/WorkspaceBar.vue'

const isDark = useDark()
const toggleDark = useToggle(isDark)

const graphStore = useGraphStore()
const mainStore = useMainStore()
const { nodegraph } = storeToRefs(graphStore)
const { status } = storeToRefs(mainStore)
const mapping = computed(() => nodegraph.value.currentMapping || {})
const hasMainpaneMapping = computed(() => nodegraph.value.currentWorkflow && mapping.value.mainpane && mapping.value.mainpane.length>0)
const isDroppable = computed(() => !nodegraph.value.currentWorkflow)

sdfx.addEventListener('ready', ()=>{
  console.log('------------- READY')
})

const handleFileDrop = async (file: File) => {
  mainStore.spinner(true)
  await sdfx.handleFile(file)
  mainStore.spinner(false)
}

onMounted(async ()=>{
  await sdfx.init()

  const workflow = graphStore.getCurrentWorkflow()
  if (workflow) {
    await sdfx.loadGraphData(workflow)
  }
})
</script>
