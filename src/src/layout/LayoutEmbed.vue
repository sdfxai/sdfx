<template>
  <main class="h-screen w-full flex text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950/50">
    <div class="flex-1 flex flex-col">
      <router-view />
      <Footer />
    </div>
    <div class="hidden xl:flex xl:flex-col xl:justify-between xl:w-80 2xl:w-96 h-screen max-h-full border-l border-zinc-200 dark:border-black divide-y divide-zinc-200 dark:divide-black bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-100">
      <nav class="flex-shrink-0 p-3 bg-zinc-100 dark:bg-zinc-800/80 space-y-3">
        <BoxPreview class="min-h-[250px] max-h-[250px] overflow-hidden"/>
      </nav>

      <ScrollableSection v-if="mapping && mapping.rightpane" class="flex flex-1 h-full flex-col space-y-2 p-3 bg-zinc-100 dark:bg-zinc-800/80">
        <HTMLComponent
          v-for="(item, idx) in mapping.rightpane"
          :key="idx"
          :label="item.label"
          :component="item.component"
          :attributes="item.attributes"
          :innerText="item.innerText"
          :childrin="item.childrin"
        />        
      </ScrollableSection>

      <nav class="p-2 text-xs h-10 flex-shrink-0 dark:bg-zinc-900/80 flex items-center justify-between">
        <div class="uppercase text-zinc-400 dark:text-zinc-600 font-semibold">Server</div>
        <div class="flex space-x-2">
          {{ server.host }}
        </div>
      </nav>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useMainStore, useGraphStore, storeToRefs } from '@/stores'
import Footer from '@/layout/Footer.vue'
import HTMLComponent from '@/components/controls/HTMLComponent.vue'
import ScrollableSection from '@/components/ScrollableSection.vue'
import BoxPreview from '@/components/boxes/BoxPreview.vue'

const mainStore = useMainStore()
const graphStore = useGraphStore()
const { server } = storeToRefs(mainStore)
const { nodegraph } = storeToRefs(graphStore)

const mapping = computed(() => nodegraph.value.currentMapping || {})
</script>
