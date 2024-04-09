<template>
  <DroppableSection @filedrop="handleFileDrop">
    <Pane class="leftpane-app" position="left" title="Applications">
      <template #head>
        <TWTabs
          v-if="false"
          v-model="tab"
          :tabs="[
            {id:'apps', name:'Apps'},
            {id:'templates', name:'Templates'}
          ]"
        />

        <nav v-if="tab==='apps' && appList.length>4" class="px-3 py-2 h-16 flex-shrink-0 flex items-center">
          <TWSearch v-model="queryApp" class="w-full" />
        </nav>  
      </template>

      <template #body>
        <ScrollableSection class="flex flex-1 h-full flex-col space-y-2 p-3 bg-zinc-100 dark:bg-zinc-800/80">
          <div v-if="tab==='apps'">
            <AppList :query="queryApp"/>
          </div>
          <div v-if="tab==='templates'">
            Dummy
          </div>
        </ScrollableSection>
      </template>

      <template #foot>
        <nav class="text-xs p-2 flex items-center justify-between font-semibold h-10 flex-shrink-0 uppercase">
          © {{ new Date().getFullYear() }} - SDFX 
          <span class="text-zinc-500">Build {{ config.app_version }}</span>
        </nav>
      </template>
    </Pane>
  </DroppableSection>
</template>

<script lang="ts" setup>
import { api } from '@/apis'
import config from "@/utils/app.config"
import { ref, computed, onMounted } from 'vue'
import { useModelStore, useGraphStore, storeToRefs } from '@/stores'
import Pane from '@/layout/Pane.vue'
import TWTabs from '@/components/UI/TWTabs.vue'
import TWSearch from '@/components/UI/TWSearch.vue'
import AppList from '@/components/AppList.vue'
import ScrollableSection from '@/components/ScrollableSection.vue'
import DroppableSection from '@/components/DroppableSection.vue'

const tab = ref('apps')
const queryApp = ref('')
const loadingModels = ref(false)

const graphStore = useGraphStore()
const modelStore = useModelStore()
const { appList } = storeToRefs(graphStore)

const handleFileDrop = async (file: File) => {
  const reader: FileReader = new FileReader()

  reader.onload = async () => {
    const json = JSON.parse(reader.result as string)
    graphStore.addApp(json)
  }
  reader.readAsText(file)
}

onMounted(async ()=>{
  loadingModels.value = true
  await modelStore.fetchModels()
  loadingModels.value = false
})
</script>
