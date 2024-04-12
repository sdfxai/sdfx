<template>
  <TWDropMenu menuWidth="20rem" class="w-10 h-10 flex-shrink-0 border rounded-md border-zinc-300 dark:border-zinc-700/80">
    <section @click.stop.prevent class="p-3 flex items-center border-b border-zinc-300 dark:border-zinc-950 bg-zinc-900/80 rounded-t-lg">
      <div class="tw-formlabel">
        Batch
      </div>
      <div class="ml-6 px-2 py-1 flex items-center justify-between space-x-1 w-full">
        <TWSlider
          v-model="nodegraph.settings.batchCount"
          :min="1"
          :max="32"
          :interval="1"
          :range="[1, 8, 16, 24, 32]"
          :snap="[1, 2, 4, 8, 16, 24, 32]"
          :snapThreshold="0.05"
          class="flex-1"
        />
        <span class="w-10 text-sm text-right">{{ nodegraph.settings.batchCount }}</span>
      </div>
    </section>

    <ul class="py-2 font-semibold text-base text-zinc-800 dark:text-zinc-300 divide-y divide-zinc-300 dark:divide-zinc-900">
      <!-- refresh App -->
      <li @click="refreshSDFX()" class="px-3 py-2.5 flex w-full hover:bg-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 cursor-pointer items-center space-x-2">
        <ArrowPathIcon class="w-5 h-5 flex-shrink-0 text-zinc-400/80 dark:text-zinc-500"/>
        <span>Refresh SDFX</span>
      </li>
      
      <!-- save app -->
      <li @click="saveCurrentWorkflow()" class="px-3 py-2.5 flex w-full hover:bg-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 cursor-pointer items-center space-x-2">
        <ArrowUpTrayIcon class="w-5 h-5 flex-shrink-0 text-zinc-400/80 dark:text-zinc-500"/>
        <span>Save App</span>
      </li>

      <!-- export app -->
      <li @click="exportCurrentWorkflow()" class="px-3 py-2.5 flex w-full hover:bg-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 cursor-pointer items-center space-x-2">
        <ArrowDownTrayIcon class="w-5 h-5 flex-shrink-0 text-zinc-400/80 dark:text-zinc-500"/>
        <span>Export App</span>
      </li>

      <!-- reset app -->
      <li v-if="false" @click="resetCurrentApp()" class="px-3 py-2.5 flex w-full hover:bg-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 cursor-pointer items-center space-x-2">
        <CursorArrowRaysIcon class="w-5 h-5 flex-shrink-0 text-zinc-400/80 dark:text-zinc-500"/>
        <span>Reload Settings</span>
      </li>

      <!-- delete current workflow -->
      <li v-if="showDelete" @click="cleanAll()" class="px-3 py-2.5 flex w-full hover:bg-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 cursor-pointer items-center space-x-2">
        <TrashIcon class="w-5 h-5 flex-shrink-0 text-zinc-400/80 dark:text-zinc-500"/>
        <span>Clean All</span>
      </li>
    </ul>
  </TWDropMenu>
</template>

<script setup lang="ts">
import { TrashIcon, ArrowPathIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, CursorArrowRaysIcon } from '@heroicons/vue/24/solid'
import { saveJSONFile } from '@/utils'
import { useConfirm } from '@/components/UI/VueConfirm/VueConfirm'
import { usePrompt } from '@/components/UI/VuePrompt/VuePrompt'
import { useMainStore, useGraphStore, storeToRefs } from '@/stores'

// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import TWDropMenu from '@/components/UI/TWDropMenu.vue'
import TWSlider from '@/components/UI/TWSlider.vue'

const props = defineProps({
  showDelete: { type: Boolean, default: true }
})

const { confirm } = useConfirm()
const { prompt } = usePrompt()

const mainStore = useMainStore()
const graphStore = useGraphStore()
const { nodegraph } = storeToRefs(graphStore)

const exportCurrentWorkflow = async () => {
  const name: string = nodegraph.value.currentWorkflow?.name || 'workflow'
  const filename = await prompt({
    title: 'App name',
    placeholder: 'Name',
    value: name.toLowerCase().replaceAll(' ', '-') + '.sdfx.json',
    buttons: {
      submit: 'Download',
      cancel: 'Cancel'
    }
  })

  // @ts-ignore
  if (!filename || !filename.trim()) return

  const json = sdfx.getGraphData()
  sdfx.saveGraphData()
  saveJSONFile(filename, json)
}

const saveCurrentWorkflow = async () => {
  const name: string = nodegraph.value.currentWorkflow?.name || 'workflow'
  const filename = await prompt({
    title: 'App name',
    placeholder: 'Name',
    value: name,
    buttons: {
      submit: 'Save',
      cancel: 'Cancel'
    }
  })

  // @ts-ignore
  if (!filename || !filename.trim()) return

  const json = sdfx.getGraphData()
  json.name = filename
  sdfx.saveGraphData()
  graphStore.addApp(json)
}

const resetCurrentApp = async () => {
  const answer = await confirm({
    message: "Reset to factory settings?",
    buttons: {
      delete: 'Reset',
      no: 'Cancel'
    }
  })

  if (answer) {
    const uid = nodegraph.value.currentAppId
    sdfx.loadAppId(uid, true)
  }
}

const refreshSDFX = () => {
  window.location.reload()
}

const cleanAll = () => {
  sdfx.deleteGraph()
  mainStore.setBottomPane(false)
}
</script>
