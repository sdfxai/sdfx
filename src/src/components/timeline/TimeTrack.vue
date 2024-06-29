<template>
  <section
    class="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex justify-between rounded-lg"
    :style="{ minHeight:`${8+(track.height)+8}px` }"
  >
    <dt class="w-64 px-4 pt-2 pb-2 flex justify-between bg-zinc-100 dark:bg-zinc-950/60 text-zinc-800 dark:text-white frounded-l-lg">
      <div class="truncate">
        <div>{{ track.name }}</div>
      </div>
      <div class="flex space-x-1">
        <button @click="soloToggle" v-tippy="{ delay: [500, null], content: 'Solo track' }" class="text-xs font-semibold border rounded-md w-6 h-6 flex items-center justify-center" :class="[track.solo?'border-red-700 dark:border-red-600 bg-red-600 text-red-100':'border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500']">S</button>
        <button @click="muteToggle" v-tippy="{ delay: [500, null], content: 'Mute track' }" class="text-xs font-semibold border rounded-md w-6 h-6 flex items-center justify-center" :class="[track.muted?'border-teal-700 dark:border-teal-800 bg-teal-800 text-teal-100':'border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500']">M</button>
        <button
          @click="dblClickTrack"
          v-wave
          v-tippy="{ delay: [500, null], content: 'Add new subtrack' }"
          class="w-6 h-6 flex items-center justify-center rounded-md bg-zinc-200 dark:bg-zinc-900 hover:bg-teal-600 text-zinc-500 dark:text-zinc-300 hover:text-white dark:hover:bg-teal-600 dark:hover:text-white"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
          </svg>
        </button>
      </div>
    </dt>

    <div
      @dblclick.stop.prevent="dblClickTrack"
      @click.stop.prevent="selectTrack" 
      class="flex-1 bg-white dark:bg-zinc-900/50 relative p-2"
    >
      <div v-for="block in track.blocks" :key="block.id">
        <TimeBlock
          :track="track"
          :block="block"
          :size="size"
          :selectedBlock="selectedBlock"
          :selectedTrack="selectedTrack"
          @dblClickBlock="dblClickBlock"
          @updateBlock="updateBlock"
          @selectBlock="selectBlock"
          @copyBlock="copyBlock"
          @pasteBlock="pasteBlock"
          @deleteBlock="deleteBlock"
          @createTrack="createTrack"
          @createBlock="createBlock"
          @releasePointer="releasePointer"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import TimeBlock from '@/components/timeline/TimeBlock.vue'

const emit = defineEmits([
  'dblClickTrack',
  'soloToggle',
  'muteToggle',
  'selectTrack',
  'updateBlock',
  'selectBlock',
  'dblClickBlock',
  'copyBlock',
  'pasteBlock',
  'deleteBlock',
  'createTrack',
  'createBlock',
  'releasePointer'
])

const props = defineProps({
  track: { type: Object, required: true },
  size: { type: Number, required: true },
  selectedTrack: { type: Object, required: false, default: null },
  selectedBlock: { type: Object, required: false, default: null },
})

const releasePointer = (e: any) => {
  emit('releasePointer', props.track, e)
}

const dblClickTrack = (e: any) => {
  emit('dblClickTrack', props.track, e)
}

const soloToggle = (e: any) => {
  emit('soloToggle', props.track, e)
}

const muteToggle = (e: any) => {
  emit('muteToggle', props.track, e)
}

const selectTrack = (e: any) => {
  emit('selectTrack', props.track, e)
}

const updateBlock = (block: any, e: any) => {
  emit('updateBlock', props.track, block, e)
}

const selectBlock = (block: any, e: any) => {
  emit('selectBlock', props.track, block, e)
}

const dblClickBlock = (block: any, e: any) => {
  emit('dblClickBlock', props.track, block, e)
}

const copyBlock = (block: any, e: any) => {
  emit('copyBlock', props.track, block, e)
}

const pasteBlock = (block: any, e: any) => {
  emit('pasteBlock', props.track, block, e)
}

const deleteBlock = (block: any, e: any) => {
  emit('deleteBlock', props.track, block, e)
}

const createTrack = (e: any) => {
  emit('createTrack', e)
}

const createBlock = (e: any) => {
  emit('createBlock', props.track, e)
}
</script>