<template>
  <div class="GenerateButton flex-1 h-10 flex space-x-2">
    <!-- generate button (when idle) -->
    <button v-if="status.generation==='idle'" :disabled="!status.ready || !nodegraph.currentWorkflow" @click="generate(true)" class="tw-button w-28 sm">
      <span v-if="nodegraph.settings.batchCount===1">Start</span>
      <span v-else>Start {{ `(${nodegraph.settings.batchCount})` }}</span>
    </button>

    <!-- loading (when started or pending) -->
    <button v-if="status.generation==='started' || status.generation==='interrupting'" disabled class="tw-button w-28 transparent sm">
      <SpinLoader class="w-5 h-5" :class="[status.generation==='started'?'text-orange-500':'text-green-500']"/>
    </button>
    <!-- interrupt button (when generating) -->
    <button v-if="status.generation==='generating'" @click="interrupt()" :disabled="!status.ready" class="tw-button w-28 pink sm">
      <span v-if="nodegraph.status.queueSize>1">Skip</span>
      <span v-else>Stop</span>
    </button>

    <!-- next (interrupt and regenerate button) -->
    <button v-tippy="{ delay: [500, null], content: 'Restart button (same as Stop + Start). Use this while generating to quickly restart or test another seed.' }" @click="next()" v-wave :disabled="!status.ready || !nodegraph.currentWorkflow || status.generation==='interrupting'" class="tw-button gray transparent sm">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"></path>
      </svg>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useMainStore, useGraphStore, storeToRefs } from '@/stores'
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import SpinLoader from '@/components/UI/SpinLoader.vue'

const { nodegraph } = storeToRefs(useGraphStore())
const { status } = storeToRefs(useMainStore())

const generate = (onTop: boolean = false) => {
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

const addToQueue = () => {
  generate(false)
}

const handleKeydown = (e: any) => {
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return false

  if (e.keyCode===13 && (e.ctrlKey || e.altKey)) {
    addToQueue()
    e.preventDefault()
  }
}

onMounted(()=>{
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(()=>{
  document.removeEventListener('keydown', handleKeydown)
})

</script>
