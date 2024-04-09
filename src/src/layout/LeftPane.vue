<template>
  <transition enter-from-class="-translate-x-full" leave-to-class="-translate-x-full">
    <div v-show="status.isLeftPaneVisible" class="leftpane noselect z-40 fixed left-16 flex max-h-full w-72 2xl:w-84 flex-col justify-between divide-y divide-zinc-200 dark:divide-black bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-100 border-r border-zinc-200 dark:border-black transition-transform" :class="[isWindows?'h-[calc(100vh-3.2rem)]':'h-screen']">
      <LeftPaneApp v-if="leftpane==='app'" />
      <LeftPaneCreator v-else-if="leftpane==='creator'" />
      <LeftPaneGraph v-else-if="leftpane==='graph'" />
      <LeftPaneGeneric v-else />
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMainStore, storeToRefs } from '@/stores'
import LeftPaneApp from '@/layout/leftpanes/LeftPaneApp.vue'
import LeftPaneCreator from '@/layout/leftpanes/LeftPaneCreator.vue'
import LeftPaneGraph from '@/layout/leftpanes/LeftPaneGraph.vue'
import LeftPaneGeneric from '@/layout/leftpanes/LeftPaneGeneric.vue'

const { status } = storeToRefs(useMainStore())
const route = useRoute()

const isElectron = (window as any).electron ? true : false
const isWindows = isElectron && (window as any).electron.isWindows

const leftpane = computed(() => route.meta.leftpane)
</script>
