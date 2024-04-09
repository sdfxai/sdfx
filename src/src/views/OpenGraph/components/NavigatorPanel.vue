<template>
  <section class="NavigatorPanel duration-300 ease-in-out flex-shrink-0" :class="status.isNavigatorPaneVisible?'h-[200px] lg:h-[231px] 2xl:h-[276px]':'h-10'">
    <header @click="status.isNavigatorPaneVisible=!status.isNavigatorPaneVisible" class="header relative z-30 noselect flex items-center justify-between space-x-3 border-white dark:border-zinc-950 bg-zinc-50 dark:bg-zinc-950/50 px-3 text-sm h-10 flex-shrink-0">
      <button class="font-bold text-zinc-800 dark:text-zinc-600">Navigator</button>
      <button class="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
        <svg class="w-5 h-5 duration-500" :class="status.isNavigatorPaneVisible?'rotate-180':''" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5"></path>
        </svg>        
      </button>
    </header>
    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-show="status.isNavigatorPaneVisible" class="p-3 bg-zinc-200 dark:bg-zinc-800">
        <GraphPad/>
      </div>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { useMainStore, storeToRefs } from '@/stores'
import GraphPad from '@/views/OpenGraph/components/GraphPad.vue'

const mainStore = useMainStore()
const { status } = storeToRefs(mainStore)
</script>
