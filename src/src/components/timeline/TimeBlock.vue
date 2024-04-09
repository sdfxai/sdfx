<template>
  <div 
    @dblclick.stop.prevent="dblClickBlock" 
    @click.stop.prevent="selectBlock" 
    v-contextmenu:blockContextMenu 
    class="pr-block relative border flex justify-between rounded-lg"
    :class="[
      selected?'bg-teal-700/40 border-teal-700':'bg-zinc-700/40 border-zinc-700',
      track.muted?'bg-zinc-300/20 border-zinc-500 opacity-20':null
    ]"
    :style="{
      height:`${track.height}px`,
      left:`${start*100}%`,
      minWidth:`${minWidth*100}%`,
      width:`${width*100}%`
    }"
  >
    <div class="w-4 flex-shrink-0 duration-300 rounded-l-lg p-1 bg-zinc-950/60 h-full flex items-center justify-center">
      <div :class="[dragging?'opacity-50':'opacity-25']" ref="leftBraceRef" class="relative space-x-px h-full flex cursor-col-resize py-px">
        <div v-if="dragging" class="absolute rounded-full z-10 bg-black -top-14 -left-4 w-10 h-10 flex items-center justify-center">
          <div class="absolute -bottom-[1px] z-0 left-[0.60rem] w-5 h-5 bg-black rotate-45"></div>
          <span class="relative z-20 text-sm">{{ displayStart }}</span>
        </div>
        <span class="border-r border-teal-400/30"></span>
        <span class="border-r border-teal-950/10"></span>
        <span class="border-r border-teal-400/30"></span>
      </div>
    </div>
    <div ref="blockRef" class="cursor-move px-3 py-2 flex-1 overflow-hidden text-sm tracking-wide font-semibold flex items-center">
      <div class="clamp2 w-full leading-5">
        {{ block.prompt }}
      </div>
    </div>
    <div class="w-4 flex-shrink-0 rounded-r-lg p-1 bg-zinc-950/60 h-full flex items-center justify-center">
      <div :class="[dragging?'opacity-50':'opacity-25']" ref="rightBraceRef" class="relative space-x-px h-full flex cursor-col-resize py-px">
        <div v-if="dragging" class="absolute rounded-full z-10 bg-black -top-14 -left-4 w-10 h-10 flex items-center justify-center">
          <div class="absolute -bottom-[1px] z-0 left-[0.60rem] w-5 h-5 bg-black rotate-45"></div>
          <span class="relative z-20 text-sm">{{ displayEnd }}</span>
        </div>
        <span class="border-r border-teal-400/30"></span>
        <span class="border-r border-teal-800/10"></span>
        <span class="border-r border-teal-400/30"></span>
      </div>
    </div>
    <v-contextmenu ref="blockContextMenu">
      <v-contextmenu-item v-if="false" @click="copyBlock">Copy</v-contextmenu-item>
      <v-contextmenu-item v-if="false" @click="pasteBlock">Paste</v-contextmenu-item>
      <v-contextmenu-divider v-if="false" />
      <v-contextmenu-submenu v-if="false" title="Send to">
        <v-contextmenu-item v-if="false" @click="sendToMainPrompt">Main Positive Prompt</v-contextmenu-item>
        <v-contextmenu-item v-if="false" @click="sendToNegativePrompt">Main Negative Prompt</v-contextmenu-item>
      </v-contextmenu-submenu>
      <v-contextmenu-divider />
      <v-contextmenu-item @click="deleteBlock">Delete Block</v-contextmenu-item>
    </v-contextmenu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits([
  'dblClickBlock',
  'selectBlock',
  'copyBlock',
  'pasteBlock',
  'deleteBlock',
  'sendToMainPrompt',
  'sendToNegativePrompt',
  'updateBlock',
  'releasePointer'
])

const props = defineProps({
  track: { type: Object, required: true },
  size: { type: Number, required: true },
  block: { type: Object, required: true },
  selectedBlock: { type: Object, required: false, default: null }
})

const start = ref(props.block.start as number)
const end = ref(props.block.end  as number)
const minWidth = ref(0.10) // 5%
const width = computed(() => end.value - start.value)
const selected = computed(() => props.selectedBlock === props.block)

const displayStart = computed(() => Math.round(start.value*100))
const displayEnd = computed(() => Math.round(end.value*100))

const blockRef = ref<any>(null)
const leftBraceRef = ref<any>(null)
const rightBraceRef = ref<any>(null)

const dragElement = ref<any>(null)
const dragging = ref<any>(null)
let lastx = 0
let ow = 0

const updateBlock = (updatedBlock: any, e: any) => {
  emit('updateBlock', updatedBlock, e)
}

const releasePointer = (e: any) => {
  emit('releasePointer', props.block, e)
}

const dblClickBlock = (e: any) => {
  emit('dblClickBlock', props.block, e)
}

const selectBlock = (e: any) => {
  emit('selectBlock', props.block, e)
}

const copyBlock = (e: any) => {
  emit('copyBlock', props.block, e)
}

const pasteBlock = (e: any) => {
  emit('pasteBlock', props.block, e)
}

const deleteBlock = (e: any) => {
  emit('deleteBlock', props.block, e)
}

const sendToMainPrompt = (e: any) => {
  emit('sendToMainPrompt', props.block, e)
}

const sendToNegativePrompt = (e: any) => {
  emit('sendToNegativePrompt', props.block, e)
}

const handleBlockMousedown = (e: any) => {
  dragElement.value = 'blockBody'
  lastx = e.clientX
  ow = width.value
  e.stopPropagation()
  e.preventDefault()
}

const handleLeftBraceMousedown = (e: any) => {
  dragElement.value = 'leftBrace'
  lastx = e.clientX
  e.stopPropagation()
  e.preventDefault()
}

const handleRightBraceMousedown = (e: any) => {
  dragElement.value = 'rightBrace'
  lastx = e.clientX
  e.stopPropagation()
  e.preventDefault()
}

const handleMouseMove = (e: any) => {
  if (!dragElement.value) return
  dragging.value = true

  const dx = e.clientX - lastx
  lastx = e.clientX

  if (dragElement.value==='leftBrace') {
    start.value = start.value + (dx / props.size)
    if (start.value > end.value - minWidth.value) start.value = end.value - minWidth.value
  }

  if (dragElement.value==='rightBrace') {
    end.value = end.value + (dx / props.size)
    if (end.value < start.value + minWidth.value) end.value = start.value + minWidth.value
  }

  if (dragElement.value==='blockBody') {
    start.value = start.value + (dx / props.size)
    end.value = start.value + ow
  }

  if (start.value <= 0) start.value = 0
  if (end.value >= 1) {
    end.value = 1
    if (dragElement.value==='blockBody') start.value = 1 - ow
  }

  updateBlock({
    ...props.block,
    start: start.value,
    end: end.value,
    width: width.value
  }, e)

  e.stopPropagation()
  e.preventDefault()
}

const handleMouseUp = (e: any) => {
  dragging.value = null
  if (!dragElement.value) return
  dragElement.value = null
  releasePointer(e)
  e.stopPropagation()
  e.preventDefault()
}

onMounted(() => {
  blockRef.value.addEventListener('mousedown', handleBlockMousedown)
  leftBraceRef.value.addEventListener('mousedown', handleLeftBraceMousedown)
  rightBraceRef.value.addEventListener('mousedown', handleRightBraceMousedown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onBeforeUnmount(() => {
  blockRef.value.removeEventListener('mousedown', handleBlockMousedown)
  leftBraceRef.value.removeEventListener('mousedown', handleLeftBraceMousedown)
  rightBraceRef.value.removeEventListener('mousedown', handleRightBraceMousedown)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>
