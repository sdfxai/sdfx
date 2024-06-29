<template>
  <section class="NodeList space-y-1">
    <div v-for="node in filteredNodeList" :key="node.id" class="">
      <div @click="selectNode(node)">
        <div
          class="relative overflow-hidden px-3 py-2 border rounded-lg text-sm font-semibold"
          :class="[nodegraph.selectedNode?.id === node.id ?'bg-teal-600 dark:bg-teal-600/20 border-teal-600 text-white dark:text-teal-100':'cursor-pointer dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800']"
        >
          <div class="absolute inset-0 z-0 opacity-[0.15] dark:opacity-[0.40]" :style="{backgroundColor:node.bgcolor}"></div>
          
          <div class="relative flex items-center justify-between z-1 space-x-3">
            <div class="flex-1 flex justify-start">
              <span class="w-9 text-zinc-500">#{{ node.id }}</span>
              <span class="flex-1">{{ node.title ? node.title : node.type }}</span>
            </div>

            <!-- node image -->
            <div v-if="node.imgs && node.imgs.length>0" class="w-10 h-10 flex-shrink-0">
              <img :src="node.imgs[0].src" class="w-full h-full object-cover rounded" />
            </div>

            <span class="flex items-center justify-between space-x-2">
              <span v-if="node.imgs && node.imgs.length>0" class="rounded-full w-5 h-5 text-xs flex items-center justify-center font-semibold text-white bg-green-800/30">
                {{ node.imgs.length }}
              </span>

              <svg class="w-4 h-4 text-zinc-300 dark:text-zinc-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"></path>
              </svg>
            </span>
          </div>

          <div v-if="progress && String(progress.runningNodeId) === String(node.id)" class="mt-2 progress w-full relative">
            <div class="progress-bar nano pink" :style="`width: ${progress.percent}%; transition: ${progress.percent>0?'200ms':null};`">
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useMainStore, useGraphStore, storeToRefs } from '@/stores'

// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx.js'

const props = defineProps({
  query: { type: String, required: false, default: null }
})

const graphStore = useGraphStore()
const mainStore = useMainStore()
const { progress } = storeToRefs(mainStore)
const { nodegraph } = storeToRefs(graphStore)

const selectNode = (node: any) => {
  if (nodegraph.value.selectedNode === node) return
  graphStore.selectSDFXNode(node)
  sdfx.animateToNodeId(node.id)
}

const filteredType = [
  'Reroute', 'ImageScaleBy', 'VAEDecode', 'VAEEncode'
]

const filteredNodeList = computed(() => {
  if (!nodegraph.value.currentNodes) return []

  const results = nodegraph.value.currentNodes.map((node: any) => {
    return {
      id: node.id,
      pos: node.pos,
      imgs: node.imgs,
      size: node.size,
      type: node.type,
      bgcolor: node.bgcolor,
      title: node.title,
      hasWidgets: node.widgets ? true : false
    }
  }).filter((n: any) => {
    if (filteredType.includes(n.type) || !n.hasWidgets) return false
    return props.query ? n.type.toLowerCase().indexOf(props.query.toLowerCase())>-1 : true
  })

  if (props.query) {
    //.sort((a,b) => (a.type > b.type) ? 1 : ((b.type > a.type) ? -1 : 0))
  }
  return results.sort((a,b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0))
})
</script>
