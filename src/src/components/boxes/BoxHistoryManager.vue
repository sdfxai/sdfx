<template>
  <div class="HistoryManager">
    <div v-if="!loading && historyList.length<=0" class="px-1">
      History is empty.
    </div>
    <ul v-if="!loading && historyList.length>0" class="p-2 grid grid-cols-2 gap-3">
      <li v-for="item in historyList" :key="item.id" @click.stop.prevent="loadHistoryItem(item)" class="relative rounded-lg overflow-hidden">
        <div class="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
          <img v-if="item.outputImages.length>0" :src="sdfx.getImageUrl(item.outputImages[0])" class="w-full h-hull flex-shrink-0 rounded-lg object-cover"/>
          <img v-if="item.outputImages.length<=0 && item.tempImages.length>0" :src="sdfx.getImageUrl(item.tempImages[0])" class="w-full h-hull flex-shrink-0 rounded-lg object-cover"/>
          <article v-if="item.outputImages.length<=0 && item.tempImages.length<=0" class="w-full h-full flex-shrink-0 rounded-lg bg-zinc-200 dark:bg-zinc-700"></article>
          <div class="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950 p-1 flex items-end justify-start">
            <span class="text-lg text-white font-semibold bg-zinc-950 px-2 py-1 rounded-lg">
              {{ item.pos }}
            </span>
          </div>
        </div>

        <button @click.stop.prevent="deleteHistoryItem(item.id)" class="absolute p-1 rounded-bl-lg bg-zinc-100 dark:bg-zinc-900 top-0 right-0 text-zinc-500 hover:text-red-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </li>
    </ul>
    <div v-if="loading" class="pt-32 flex items-center justify-center">
      <SpinLoader class="w-8 h-8"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useGraphStore, storeToRefs } from '@/stores'
import SpinLoader from '@/components/UI/SpinLoader.vue'
import Box from '@/components/UI/Box.vue'

const graphStore = useGraphStore()
const { history, nodegraph } = storeToRefs(graphStore)

const loading = ref(false)

const historyList = computed(()=>{
  const list = history.value.map(item => {
    const { outputImages, tempImages } = getHistoryImages(item)

    return {
      id: item.prompt[1],
      pos: Math.abs(item.prompt[0]),
      workflow: item.prompt[3].extra_pnginfo.workflow,
      client_id: item.prompt[3].client_id,
      outputs: item.outputs,
      outputImages: outputImages,
      tempImages: tempImages
    }
  })

  return list.sort((a, b) => (b.pos - a.pos))
})

const deleteHistoryItem = async (itemId: number) => {
  await graphStore.deleteHistoryItem(itemId)
}

const getHistoryImages = (historyItem: any) => {
  const images = {
    outputImages: [] as any[],
    tempImages: [] as any[]
  }

  const tempImages = []


  const { outputs } = historyItem

  Object.values(outputs).forEach((node: any) => {
    if (node && node.images) {
      node.images.forEach((image: any) => {
        if (image.type==='output') images.outputImages.push(image)
        if (image.type==='temp') images.tempImages.push(image)
      })
    }
  })

  return images
}

const loadHistoryItem = async (historyItem: any) => {
  if (!historyItem.workflow) {
    console.error('Missing history workflow')
    return
  }

  if (!historyItem.outputs) {
    console.error('Missing history outputs')
    return
  }

  graphStore.cleanImages()

  const currentAppId = nodegraph.value.currentAppId
  const newAppId = historyItem.workflow.uid
  const needReset = newAppId !== currentAppId

  sdfx.loadGraphData(historyItem.workflow, needReset)
  sdfx.setGraphOutputs(historyItem.outputs)
}

const refreshHistory = async () => {
  loading.value = true
  await graphStore.getHistory()
  loading.value = false
}

const executionHandler = async ({ detail }: any) => {
  const { status } = detail
  await refreshHistory()
}

sdfx.addEventListener('executionstatus', executionHandler)

onMounted(async ()=>{
  loading.value = true
  await graphStore.getHistory()
  loading.value = false
})

onBeforeUnmount(()=>{
  sdfx.removeEventListener('executionstatus', executionHandler)
})
</script>
