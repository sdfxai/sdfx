<template>
  <nav class="WorkspaceBar relative z-10 h-16 flex-shrink-0 px-3 bg-transparent border-b border-zinc-200 dark:border-black flex items-center justify-between">
    <div v-if="false" class="flex items-center space-x-2">
      <button @click="testPlugin()" class="tw-button sm transparent">Plugin Test</button>
      <h2 v-if="nodegraph && nodegraph.currentWorkflow" class="text-zinc-600 dark:text-zinc-400 text-2xl font-semibold">
        <span v-if="hasMapping">{{ nodegraph.currentWorkflow.name }}</span>
        <span v-if="!hasMapping">Untitled</span>
      </h2>
    </div>
    <dt v-if="route?.name === 'graphview'" class="flex items-center space-x-2">   
      <!-- move -->
      <button @click="setTool('move')" class="w-10 h-10 border rounded-md flex items-center justify-center" :class="[tool==='move'?'border-teal-400 dark:border-teal-500/30 text-teal-700 dark:text-teal-200 bg-teal-400/30 dark:bg-teal-700/30':'border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400']">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 48 44">
          <path d="M 25 3.2441406 L 18.59375 9.578125 A 2.0002 2.0002 0 1 0 21.40625 12.421875 L 23 10.845703 L 23 18 A 2.0002 2.0002 0 1 0 27 18 L 27 10.845703 L 28.59375 12.421875 A 2.0002 2.0002 0 1 0 31.40625 9.578125 L 25 3.2441406 z M 39.017578 18.007812 A 2.0002 2.0002 0 0 0 37.605469 21.433594 L 39.181641 23.027344 L 32.027344 23.027344 A 2.0002 2.0002 0 1 0 32.027344 27.027344 L 39.181641 27.027344 L 37.605469 28.621094 A 2.0002 2.0002 0 1 0 40.449219 31.433594 L 46.785156 25.027344 L 40.449219 18.621094 A 2.0002 2.0002 0 0 0 39.017578 18.007812 z M 10.921875 18.009766 A 2.0002 2.0002 0 0 0 9.5488281 18.621094 L 3.2167969 25.027344 L 9.5488281 31.433594 A 2.0005113 2.0005113 0 1 0 12.394531 28.621094 L 10.818359 27.027344 L 17.970703 27.027344 A 2.0002 2.0002 0 1 0 17.970703 23.027344 L 10.818359 23.027344 L 12.394531 21.433594 A 2.0002 2.0002 0 0 0 10.921875 18.009766 z M 24.970703 30.029297 A 2.0002 2.0002 0 0 0 23 32.056641 L 23 39.210938 L 21.40625 37.634766 A 2.0002 2.0002 0 0 0 19.966797 37.037109 A 2.0002 2.0002 0 0 0 18.59375 40.478516 L 23.414062 45.244141 A 2.0002 2.0002 0 0 0 23.798828 45.625 L 25 46.8125 L 26.199219 45.626953 A 2.0002 2.0002 0 0 0 26.59375 45.236328 L 31.40625 40.478516 A 2.0002 2.0002 0 0 0 29.990234 37.029297 A 2.0002 2.0002 0 0 0 28.59375 37.634766 L 27 39.210938 L 27 32.056641 A 2.0002 2.0002 0 0 0 24.970703 30.029297 z"/>
        </svg>
      </button>

      <!-- select -->
      <button @click="setTool('select')" class="w-10 h-10 border rounded-md flex items-center justify-center" :class="[tool==='select'?'border-teal-400 dark:border-teal-500/30 text-teal-700 dark:text-teal-200 bg-teal-400/30 dark:bg-teal-700/30':'border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400']">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 50 50"><path d="M 29.699219 47 C 29.578125 47 29.457031 46.976563 29.339844 46.933594 C 29.089844 46.835938 28.890625 46.644531 28.78125 46.398438 L 22.945313 32.90625 L 15.683594 39.730469 C 15.394531 40.003906 14.96875 40.074219 14.601563 39.917969 C 14.238281 39.761719 14 39.398438 14 39 L 14 6 C 14 5.601563 14.234375 5.242188 14.601563 5.082031 C 14.964844 4.925781 15.390625 4.996094 15.683594 5.269531 L 39.683594 27.667969 C 39.972656 27.9375 40.074219 28.355469 39.945313 28.726563 C 39.816406 29.101563 39.480469 29.363281 39.085938 29.398438 L 28.902344 30.273438 L 35.007813 43.585938 C 35.117188 43.824219 35.128906 44.101563 35.035156 44.351563 C 34.941406 44.601563 34.757813 44.800781 34.515625 44.910156 L 30.113281 46.910156 C 29.980469 46.96875 29.84375 47 29.699219 47 Z"/></svg>
      </button>

      <span class="w-4"></span>

      <!-- undo -->
      <button v-if="false" @keydown.space.stop.prevent @click="undo()" class="w-10 h-10 border rounded-md flex items-center justify-center border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"></path>
        </svg>
      </button>

      <!-- redo -->
      <button v-if="false" @keydown.space.stop.prevent @click="redo()" class="w-10 h-10 border rounded-md flex items-center justify-center border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"></path>
        </svg>
      </button>
    </dt>
    <dt v-else>
      <h2 v-if="nodegraph && nodegraph.currentWorkflow" class="text-zinc-600 dark:text-zinc-400 text-2xl font-semibold">
        <span v-if="hasMapping">{{ nodegraph.currentWorkflow.name }}</span>
        <span v-if="!hasMapping">Untitled</span>
      </h2>
    </dt>

    <div class="flex items-center justify-between space-x-3">
      <ButtonGenerate :hasNextButton="hasNextButton"/>
      <ButtonActionsMenu v-if="hasMenuButton"/>
    </div>

    <teleport to="body">
      <ComfyPlugin v-if="isPluginOpen" :plugin="plugin" @close="isPluginOpen=false"/>
    </teleport>
  </nav>
</template>

<script lang="ts" setup>
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMainStore, useGraphStore, storeToRefs } from '@/stores'
import ButtonGenerate from '@/components/boxes/ButtonGenerate.vue'
import ButtonActionsMenu from '@/components/boxes/ButtonActionsMenu.vue'
import ComfyPlugin from '@/components/ComfyPlugin/ComfyPlugin.vue'

const plugin = ref({
  headless: false,
  transparent: false,
  name: 'Test Plugin',
  url: 'http://192.168.1.7:5173/plugin',
  width: '1024px',
  height: '768px'
})

const props = defineProps({
  hasMenuButton: { type: Boolean, required: false, default: true },
  hasNextButton: { type: Boolean, required: false, default: true }
})

const route = useRoute()
const graphStore = useGraphStore()
const { nodegraph } = storeToRefs(graphStore)
const { workspaces } = storeToRefs(useMainStore())
const tool = ref(sdfx.getTool())
const isPluginOpen = ref(false)

const hasMapping = computed(() => {
  return nodegraph.value.currentWorkflow 
    && nodegraph.value.currentWorkflow.mapping
    && Object.keys(nodegraph.value.currentWorkflow.mapping).length>0
})

const testPlugin = () => {
  isPluginOpen.value = true
}

const setWorkspace = (id: string) => {
  workspaces.value.selectedId = id
}

const setTool = (t: any) => {
  tool.value = t
  sdfx.setTool(t)
}

const undo = () => {
  /* dummy */
}

const redo = () => {
  /* dummy */
}
</script>
