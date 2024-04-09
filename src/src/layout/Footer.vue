<template>
  <footer class="footer relative z-30 noselect flex items-center space-x-3 bg-zinc-50 dark:bg-zinc-900 p-2 text-sm h-10 flex-shrink-0">
    <div class="flex-1 flex justify-start text-zinc-500">
      <div v-if="progress.percent>0" class="progress-section font-mono w-full flex items-center space-x-3">
        <div class="w-24 text-zinc-600 dark:text-zinc-200 uppercase text-xs font-semibold">
          {{ `Step ${progress.currentStep} / ${progress.totalSteps}` }}
        </div>
        <div class="flex-1 progress">
          <div class="progress-bar green" :style="`width: ${progress.percent}%; transition: ${progress.percent>0 && progress.percent<100?'250ms':null};`">
          </div>
        </div>
        <span class="w-40 flex items-center space-x-2 text-xs font-semibold text-left">
          <dt class="text-zinc-600 dark:text-zinc-200">{{ progress.percent.toFixed(0)+'%' }}</dt>
          <dt>{{ `ETA ${progress.eta.toFixed(2)} sec.` }}</dt>
        </span>
      </div>
    </div>
    <div class="flex justify-end space-x-3 w-20 flex-shrink-0">
      <!-- generation status -->
      <span v-if="status.ready && status.isSocketConnected" class="uppercase text-xs font-semibold px-1.5 rounded-full" :class="status.generation">
        {{ status.generation }}
      </span>

      <!-- socket status -->
      <span v-if="!status.isSocketConnected" class="text-xs uppercase font-semibold text-red-600 dark:text-red-400">
        {{ status.socket }}
      </span>

      <!-- not ready -->
      <div v-if="!status.ready">
        <SpinLoader class="w-5 h-5 text-zinc-500 dark:text-zinc-500"/>
      </div>

      <WifiIcon class="w-5 h-5 flex-shrink-0" :class="status.isSocketConnected?'animate-pulse text-green-700 dark:text-green-400':'text-zinc-400 dark:text-zinc-700'"/>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import { useMainStore, storeToRefs } from '@/stores'
import { WifiIcon } from '@heroicons/vue/24/solid'
import SpinLoader from '@/components/UI/SpinLoader.vue'

const mainStore = useMainStore()
const { status, progress } = storeToRefs(mainStore)
</script>
