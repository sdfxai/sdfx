<template>
  <DroppableSection @filedrop="handleFileDrop">
    <Pane class="leftpane-app" position="left" title="Applications">
      <template #body>
        <ScrollableSection class="flex flex-1 h-full flex-col space-y-2 p-3 bg-zinc-100 dark:bg-zinc-800/80">
          <AppList :query="queryApp"/>
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
import config from "@/utils/app.config"
import { ref, onMounted } from 'vue'
import { useModelStore, useGraphStore, storeToRefs } from '@/stores'
import Pane from '@/layout/Pane.vue'
import AppList from '@/components/AppList.vue'
import ScrollableSection from '@/components/ScrollableSection.vue'
import DroppableSection from '@/components/DroppableSection.vue'

const queryApp = ref('')
const loadingModels = ref(false)

const graphStore = useGraphStore()
const modelStore = useModelStore()

const handleFileDrop = async (file: File) => {
  const reader: FileReader = new FileReader()

  reader.onload = async () => {
    const json = JSON.parse(reader.result as string)
    graphStore.addApp(json)
  }
  reader.readAsText(file)
}

onMounted(async ()=>{
  /*
  loadingModels.value = true
  await modelStore.fetchModels()
  loadingModels.value = false
  */
})
</script>
