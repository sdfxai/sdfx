<template>
  <div class="Bookmarks">
    <section class="mt-4 p-3 text-xs space-y-3 text-zinc-600 dark:text-zinc-400">
      <div><span class="txt font-semibold text-zinc-300 rounded-md bg-zinc-700 px-1.5 py-1">CTRL + D</span> on a node to toggle bookmark</div>
      <div><span class="txt font-semibold text-zinc-300 rounded-md bg-zinc-700 px-1.5 py-1">Double Click</span> on a bookmark to navigate</div>
    </section>

    <ul class="mt-6 nodeList noselect grid grid-cols-6 lg:grid-cols-8 xl:grid-cols-8 2xl:grid-cols-8 gap-4 p-3">
      <li v-for="node in bookmarkedNodeList" :key="node.id" @click="selectNode(node)" @dblclick="selectNode(node, true)" class="col-span-1">
        <span class="text-xs">{{ `[#${node.id}]` }}</span>
        <article
          class="aspect-w-1 aspect-h-1 relative overflow-hidden border rounded-lg text-sm font-semibold"
          :class="[nodegraph.selectedNode?.id === node.id ?'bg-teal-600 dark:bg-teal-600/20 border-teal-600 text-white dark:text-teal-100':'cursor-pointer dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800']"
        >
          <dt class="w-full h-full">
            <h2 class="bg-zinc-950 px-2 py-2 text-xs truncate">{{ `${node.title || node.type}` }}</h2>
            <div class="absolute inset-0 z-0 opacity-[0.15] dark:opacity-[0.40]" :style="{backgroundColor:node.bgcolor}"></div>
            
            <!-- node image -->
            <div v-if="node.imgs && node.imgs.length>0 && node.imgs[0].src" class="w-full h-full flex-shrink-0">
              <img v-lazy="node.imgs[0].src" class="w-full h-full object-cover rounded" />
            </div>

            <div v-if="progress && String(progress.runningNodeId) === String(node.id)" class="mt-2 progress absolute px-3 mb-2 left-0 bottom-0 w-full">
              <div class="progress-bar nano pink" :style="`width: ${progress.percent}%; transition: ${progress.percent>0?'200ms':null};`">
              </div>
            </div>
          </dt>
        </article>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useMainStore, useGraphStore, storeToRefs } from '@/stores'
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx.js'

const graphStore = useGraphStore()
const mainStore = useMainStore()
const { progress } = storeToRefs(mainStore)
const { nodegraph } = storeToRefs(graphStore)

const selectNode = (node: any, animate: boolean = false) => {
  graphStore.selectSDFXNode(node)
  if (animate) {
    sdfx.animateToNode(node)
  }
}

const bookmarkedNodeList = computed(() => {
  const nodes = nodegraph.value.currentNodes || [] //sdfx.graph?._nodes

  return nodes.filter((n: any) => {
    return n.docked ? true : false
  })
})
</script>
