<template>
  <Box title="Generate" class="generate" :isScrollable="false">
    <template #right v-if="!status.ready">
      <SpinLoader class="w-5 h-5 text-zinc-500"/>
    </template>
    <div class="p-4">
      <section>
        <div class="tw-formlabel">
          Batch count
        </div>
        <div class="p-3 flex items-center justify-between space-x-3">
          <TWSlider
            v-model="nodegraph.settings.batchCount"
            :min="1"
            :max="150"
            :interval="1"
            :range="[1, 50, 100, 150]"
            :snap="[1, 5, 10, 15, 20, 30, 50, 80, 100]"
            :snapThreshold="0.05"
            class="flex-1"
          />
          <span class="w-10 text-right">{{ nodegraph.settings.batchCount }}</span>
        </div>
      </section>

      <div class="flex space-x-2 mt-2">
        <!-- generate button (when idle) -->
        <button v-if="status.generation==='idle'" :disabled="!status.ready" @click="generate(true)" class="tw-button w-full md">
          <span v-if="nodegraph.settings.batchCount===1">Start</span>
          <span v-else>Start {{ `(${nodegraph.settings.batchCount})` }}</span>
        </button>

        <!-- loading (when started or pending) -->
        <button v-if="status.generation==='started' || status.generation==='interrupting'" disabled class="tw-button transparent w-full md">
          <SpinLoader class="w-6 h-6" :class="[status.generation==='started'?'text-orange-500':'text-green-500']"/>
        </button>

        <!-- interrupt button (when generating) -->
        <button v-if="status.generation==='generating'" @click="interrupt()" :disabled="!status.ready" class="tw-button w-full pink md">
          <span v-if="nodegraph.status.queueSize>1">Skip</span>
          <span v-else>Stop</span>
        </button>

        <!-- interrupt and regenerate button -->
        <button @click="next()" v-wave :disabled="!status.ready || status.generation==='interrupting' || status.generation==='idle'" class="tw-button transparent">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"></path>
          </svg>
        </button>

        <!-- tartget running node button -->
        <button @click="findNode(nodegraph.status.runningNodeId)" v-wave :disabled="!nodegraph.status.runningNodeId || status.generation==='idle'" class="tw-button transparent relative">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"></path>
          </svg>

          <div v-if="nodegraph.status.runningNodeId" class="absolute text-xs -right-1 -top-1 bg-teal-500 font-semibold text-black rounded-full px-2 py-1">
            #{{ nodegraph.status.runningNodeId }}
          </div>
        </button>
      </div>

      <div v-if="nodegraph.status.queueSize>1" class="mt-4 flex items-center justify-between">
        <span>Remaining</span>
        <span>{{ nodegraph.status.queueSize }}</span>
      </div>
    </div>
  </Box>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useMainStore, useGraphStore, storeToRefs } from '@/stores'
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import SpinLoader from '@/components/UI/SpinLoader.vue'
import TWSlider from '@/components/UI/TWSlider.vue'
import Box from '@/components/UI/Box.vue'

const { nodegraph } = storeToRefs(useGraphStore())
const { status, progress } = storeToRefs(useMainStore())

const interrupting = ref(false)

const generate = (onTop=false) => {
  status.value.generation = 'started'
  const position = onTop ? -1 : 0
  sdfx.queuePrompt(
    position,
    nodegraph.value.settings.batchCount
  )
}

const interrupt = async () => {
  await sdfx.interrupt()
}

const next = async () => {
  if (status.value.generation !== 'idle') {
    await sdfx.interrupt()
  }
  await generate(true)
}

const findNode = async (nodeId: string) => {
  sdfx.animateToNodeId(nodeId)
}
</script>
