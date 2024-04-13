<template>
  <section class="BottomPanel duration-300 ease-in-out flex-shrink-0" :class="status.isBottomPaneVisible?'h-[240px] lg:h-[320px] xl:h-[380px]':'h-10'">
    <header @click="status.isBottomPaneVisible=!status.isBottomPaneVisible" class="header relative z-30 noselect flex items-center justify-between space-x-3 border-t border-white dark:border-zinc-950 bg-zinc-50 dark:bg-zinc-950/50 px-3 text-sm h-10 flex-shrink-0">
      <button class="font-bold text-zinc-800 dark:text-zinc-600">Developer Tools</button>
      <button class="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
        <svg class="w-5 h-5 duration-500" :class="status.isBottomPaneVisible?'rotate-180':''" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5"></path>
        </svg>        
      </button>
    </header>

    <nav class="flex items-center justify-between h-12 bg-white dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-950">
      <TWTabs
        v-model="tab"
        :xs="true"
        @click="status.isBottomPaneVisible=true"
        class="flex-shrink-0"
        :tabs="[
          {id:'bookmarks', name:'Bookmarks'},
          {id:'mapping', name:'Interface Map'},
          {id:'meta', name:'App Meta'},
          {id:'manager', name:'Manager'}
        ]"
      />
      <div class="flex space-x-3 pr-3">
        <button @click="findNode(nodegraph.status.runningNodeId)" v-wave :disabled="!nodegraph.status.runningNodeId || status.generation==='idle'" class="tw-button sm transparent relative">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"></path>
          </svg>

          <div v-if="nodegraph.status.runningNodeId" class="absolute text-xs -right-1 -top-1 bg-teal-500 font-semibold text-black rounded-full px-2 py-1">
            #{{ nodegraph.status.runningNodeId }}
          </div>
        </button>      

        <button @click="reboot()" v-wave :disabled="!status.isSocketConnected" class="tw-button sm red transparent relative mr-3">
          <span>Reboot</span>
        </button>
      </div>
    </nav>

    <div class="flex flex-1 h-[calc(100%-5.5rem)] scrollable overflow-y-auto flex-col space-y-2 border-t border-zinc-100 dark:border-zinc-950">
      <keep-alive>
        <Bookmarks v-if="tab==='bookmarks'"/>
      </keep-alive>

      <keep-alive>
        <MappingInspector v-if="tab==='mapping'"/>
      </keep-alive>

      <AppDetails v-if="tab==='meta'"/>

      <keep-alive>
        <NodeManager v-if="tab==='manager'"/>
      </keep-alive>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { api } from '@/apis'
import { ref } from 'vue'
import { useMainStore, useGraphStore, storeToRefs } from '@/stores'
import { useConfirm } from '@/components/UI/VueConfirm/VueConfirm'
import TWTabs from '@/components/UI/TWTabs.vue'
import Bookmarks from '@/views/OpenGraph/components/DevToolsTabs/Bookmarks.vue'
import MappingInspector from '@/views/OpenGraph/components/DevToolsTabs/MappingInspector.vue'
import AppDetails from '@/views/OpenGraph/components/DevToolsTabs/AppDetails.vue'
import NodeManager from '@/views/OpenGraph/components/DevToolsTabs/NodeManager.vue'
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'

const loading = ref<boolean>(false)
const tab = ref<string | undefined>('bookmarks')
const mainStore = useMainStore()
const { status } = storeToRefs(mainStore)
const { nodegraph } = storeToRefs(useGraphStore())
const { confirm } = useConfirm()

const findNode = async (nodeId: string) => {
  sdfx.animateToNodeId(nodeId)
}

const reboot = async () => {
  if (loading.value) return

  const answer = await confirm({
    title: "Danger Zone",
    message: "Reboot Server and SDFX?",
    buttons: {
      yes: 'Reboot',
      no: 'Cancel'
    }
  })

  if (answer) {
    loading.value = true
    const nodes = await api.reboot()
    loading.value = false
  }
}
</script>
