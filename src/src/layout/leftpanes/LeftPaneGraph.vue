<template>
  <DroppableSection :droppable="tab==='apps'" @filedrop="handleFileDrop">
    <Pane class="leftpane-graph" position="left" title="Settings">
      <template #head>
        <TWTabs
          v-model="tab"
          :tabs="[
            {id:'nodes', name:'Nodes'},
            {id:'apps', name:'Applications'},
            {id:'templates', name:'Templates'}
          ]"
        />

        <nav v-if="tab==='nodes' && nodegraph.currentWorkflow" class="px-3 py-2">
          <TWSearch v-model="queryNode" class="w-full" />
        </nav>

        <nav v-if="tab==='apps' && nodegraph.currentWorkflow" class="px-3 py-2">
          <TWSearch v-model="queryApp" class="w-full" />
        </nav>
      </template>

      <template #body>
        <ScrollableSection class="flex flex-1 h-full flex-col space-y-2 p-3 bg-zinc-100 dark:bg-zinc-800/80">
          <div v-if="false && tab==='main'" class="space-y-4">
            <HTMLComponent
              v-for="(item, idx) in mapping.leftpane"
              :key="idx"
              v-bind="item"
            />
          </div>

          <div v-if="tab==='nodes'" class="space-y-4">
            <NodeList v-if="nodegraph.currentWorkflow" :query="queryNode"/>
          </div>

          <div v-if="tab==='apps'" class="space-y-4">
            <AppList :query="queryApp"/>
          </div>

          <div v-if="tab==='templates'">
            <TemplateList/>
          </div>
        </ScrollableSection>
      </template>

      <template #foot>
        <NavigatorPanel />

        <nav class="text-xs relative z-10 bg-white dark:bg-zinc-900 p-2 flex items-center justify-between font-semibold h-10 flex-shrink-0 uppercase">
          © {{ new Date().getFullYear() }} - SDFX 
          <span class="text-zinc-500">Build {{ config.app_version }}</span>
        </nav>
      </template>
    </Pane>
  </DroppableSection>
</template>

<script lang="ts" setup>
import config from "@/utils/app.config"
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useGraphStore, storeToRefs } from '@/stores'
import Pane from '@/layout/Pane.vue'
import NodeList from '@/views/OpenGraph/components/NodeList.vue'
import HTMLComponent from '@/components/controls/HTMLComponent.vue'
import NavigatorPanel from '@/views/OpenGraph/components/NavigatorPanel.vue'
import TWTabs from '@/components/UI/TWTabs.vue'
import TWSearch from '@/components/UI/TWSearch.vue'
import AppList from '@/components/AppList.vue'
import TemplateList from '@/views/OpenGraph/components/TemplateList.vue'
import ScrollableSection from '@/components/ScrollableSection.vue'
import DroppableSection from '@/components/DroppableSection.vue'

const graphStore = useGraphStore()
const { nodegraph } = storeToRefs(graphStore)
const mapping = computed(() => nodegraph.value.currentMapping || {})

const tab = ref('nodes')
const queryNode = ref('')
const queryApp = ref('')

const loadedMappingHandler = (e: any) => {
  const mapping = e.detail
}

const handleFileDrop = async (file: File) => {
  const reader: FileReader = new FileReader()

  reader.onload = async () => {
    const json = JSON.parse(reader.result as string)
    graphStore.addApp(json)
  }
  reader.readAsText(file)
}

onMounted(()=>{
  sdfx.addEventListener('loadedMapping', loadedMappingHandler)
})

onBeforeUnmount(() => {
  sdfx.removeEventListener('loadedMapping', loadedMappingHandler)
})

</script>
