<template>
  <transition enter-from-class="translate-x-full" leave-to-class="translate-x-full">
    <div v-if="status.isRightPaneVisible" class="rightpane noselect z-40 fixed right-0 max-h-full w-80 lg:w-80 xl:w-90 2xl:w-100 3xl:w-110 transition-transform" :class="[isWindows?'h-[calc(100vh-3.2rem)]':'h-screen']">
      <RightPaneApp v-if="rightpane==='app'" />
      <RightPaneCreator v-else-if="rightpane==='creator'" />
      <RightPaneGraph v-else-if="rightpane==='graph'" />
      <RightPaneGeneric v-else />
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMainStore, storeToRefs } from '@/stores'
import RightPaneApp from '@/layout/rightpanes/RightPaneApp.vue'
import RightPaneCreator from '@/layout/rightpanes/RightPaneCreator.vue'
import RightPaneGraph from '@/layout/rightpanes/RightPaneGraph.vue'
import RightPaneGeneric from '@/layout/rightpanes/RightPaneGeneric.vue'

const { status } = storeToRefs(useMainStore())
const route = useRoute()

const isElectron = (window as any).electron ? true : false
const isWindows = isElectron && (window as any).electron.isWindows

const rightpane = computed(() => route.meta.rightpane)
</script>
