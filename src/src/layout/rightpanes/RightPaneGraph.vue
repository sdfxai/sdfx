<template>
  <Pane class="rightpane-graph" position="right" title="Generation">
    <template #head>
      <nav class="flex-shrink-0 p-3 bg-zinc-100 dark:bg-zinc-800/80 space-y-3">
        <BoxPreview class="min-h-[250px] max-h-[250px] overflow-hidden"/>
      </nav>

      <TWTabs
        v-model="tab"
        :tabs="[
          {id:'node', name:'Node'},
          {id:'queue', name:'Queue'},
          {id:'history', name:'History'}
        ]"
      />

      <!-- node tab header -->
      <nav v-if="tab==='node' && nodegraph.selectedNode" class="px-4 py-2 flex items-center justify-between">
        <h3>{{ nodegraph.selectedNode.title || nodegraph.selectedNode.type }}</h3>
        <div class="flex items-center space-x-2">
          <button @click="centerOnSelectedNode()" class="w-10 h-10 border rounded-md flex items-center justify-center" :class="['border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900']">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"></path>
            </svg>
          </button>
        </div>
      </nav>

      <!-- queue tab header -->
      <nav v-if="tab==='queue'" class="px-4 py-2 flex items-center justify-between">
        <h3>Queue</h3>
        <div class="flex items-center space-x-2">
          <button @click="addToQueue()" class="w-10 h-10 border rounded-md flex items-center justify-center" :class="['border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900']">
            <svg class="tw-icon w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"></path>
            </svg>
          </button>
          <button @click="clearQueue()" class="w-10 h-10 border rounded-md flex items-center justify-center" :class="['border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900']">
            <TrashIcon class="tw-icon h-5 w-5"/>
          </button>
        </div>
      </nav>

      <!-- history tab header -->
      <nav v-if="tab==='history'" class="px-4 py-2 flex items-center justify-between">
        <h3>History</h3>
        <div class="flex items-center space-x-2">
          <button @click="clearHistory()" class="w-10 h-10 border rounded-md flex items-center justify-center" :class="['border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900']">
            <TrashIcon class="tw-icon h-5 w-5"/>
          </button>
        </div>
      </nav>
    </template>

    <template #body>
      <ScrollableSection class="flex flex-1 h-full flex-col space-y-2 p-3 bg-zinc-100 dark:bg-zinc-800/80">
        <div v-if="tab==='node'">
          <NodeDetails
            v-if="nodegraph.selectedNode"
            :node="nodegraph.selectedNode"
            :key="nodegraph.selectedNode.id"
          />
        </div>

        <div v-if="tab==='queue'">
          <BoxQueueManager />
        </div>

        <div v-if="tab==='history'">
          <BoxHistoryManager />
        </div>
      </ScrollableSection>
    </template>
  </Pane>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useMainStore, useGraphStore, storeToRefs } from '@/stores'
import { TrashIcon } from '@heroicons/vue/24/solid'

// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import { useConfirm } from '@/components/UI/VueConfirm/VueConfirm'
import Pane from '@/layout/Pane.vue'
import BoxPreview from '@/components/boxes/BoxPreview.vue'
import BoxQueueManager from '@/components/boxes/BoxQueueManager.vue'
import BoxHistoryManager from '@/components/boxes/BoxHistoryManager.vue'
import NodeDetails from '@/views/OpenGraph/components/NodeDetails.vue'
import TWTabs from '@/components/UI/TWTabs.vue'
import ScrollableSection from '@/components/ScrollableSection.vue'

const { confirm } = useConfirm() 
const graphStore = useGraphStore()
const { nodegraph, preview } = storeToRefs(graphStore)
const { status } = storeToRefs(useMainStore())

const tab = ref('node')
const displaySelectedNode = ref(true)

const centerOnSelectedNode = () => {
  const node = nodegraph.value.selectedNode
  node && sdfx.animateToNode(node)
}

const addToQueue = () => {
  status.value.generation = 'started'
  const position = -1
  sdfx.queuePrompt(
    position,
    nodegraph.value.settings.batchCount
  )
}

const clearQueue = async () => {
  graphStore.clearQueue()
  await graphStore.interrupt()
}

const clearHistory = async () => {
  const answer = await confirm({
    message: "Delete history? Cannot be undone.",
    buttons: {
      delete: 'Delete',
      no: 'Cancel'
    }
  })

  if (answer) {
    graphStore.clearHistory()
  }
}
</script>
