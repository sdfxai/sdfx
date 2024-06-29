<template>
  <ScrollableSection class="Timeline h-full flex-1 overflow-hidden">
    <div ref="timelineRef" class="relative flex-1 space-y-0">
      <div
        v-if="cursorX>0"
        class="absolute transform duration-1000 top-0 h-[calc(100%-6px)] w-[1px] bg-green-300 z-10"
        :style="{left: `${cursorX}px`}"
      >
      </div>

      <TimeTrack
        v-for="track in tracks"
        :key="track.id"
        :track="track"
        :size="timelineWidth"
        :selectedBlock="selectedBlock"
        :selectedTrack="selectedTrack"
        @dblClickTrack="dblClickTrack"
        @soloToggle="soloToggle"
        @muteToggle="muteToggle"
        @createTrack="createTrack"
        @updateTrack="updateTrack"
        @createBlock="createBlock"
        @updateBlock="updateBlock"
        @selectBlock="selectBlock"
        @deleteBlock="deleteBlock"
        @dblClickBlock="dblClickBlock"
        @releasePointer="releasePointer"
      />

      <!-- add track -->
      <section class="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex justify-between" style="min-height: 54px;">
        <dt class="w-64 px-2 pt-4 flex justify-between">
          <button @click="createTrack()" class="truncate">
            <svg class="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
            </svg>
          </button>
        </dt>
      </section>

      <!-- track placeholders -->
      <section class="bg-white dark:bg-zinc-900 flex justify-between rounded-lg" style="min-height: 54px;">
        <dt class="w-64 px-4 pt-4 flex justify-between"></dt>
      </section>
      <section class="bg-white dark:bg-zinc-900 flex justify-between rounded-lg" style="min-height: 54px;">
        <dt class="w-64 px-4 pt-4 flex justify-between"></dt>
      </section>
      <section class="bg-white dark:bg-zinc-900 flex justify-between rounded-lg" style="min-height: 54px;">
        <dt class="w-64 px-4 pt-4 flex justify-between"></dt>
      </section>
    </div>
    <ModalLocalPrompt
      v-if="editedBlock"
      :open="true"
      title="Prompt"
      :position="localPromptPosition"
      :payload="localPromptPayload"
      :prompt="editedBlock.prompt"
      :showSteps="false"
      :showCFG="false"
      :showDenoising="false"
      @close="editedBlock=null"
      @submit="onLocalPromptSubmit"
    />
  </ScrollableSection>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { ref, computed, onMounted, onBeforeUnmount, PropType } from 'vue'
import TimeTrack from '@/components/timeline/TimeTrack.vue'
import ModalLocalPrompt from '@/components/ModalLocalPrompt.vue'
import ScrollableSection from '@/components/ScrollableSection.vue'

const emit = defineEmits([
  'createTrack',
  'updateTrack',
  'selectTrack',
  'dblClickTrack',
  'dblClickBlock',
  'soloToggle',
  'muteToggle',
  'createBlock',
  'updateBlock',
  'selectBlock',
  'copyBlock',
  'pasteBlock',
  'deleteBlock',
  'releasePointer'
])

const props = defineProps({
  tracks: { type: Array as PropType<any[]>, required: true },
  progress: { type: Number, required: false, default:0.00 },
})

let resizeObserver: any = null
const editedBlock = ref<any>(null)
const selectedBlock = ref<any>(null)
const selectedTrack = ref<any>(null)
const timelineRef = ref<any>(null)
const timelineWidth = ref(1280)
const localPromptPayload = ref<any>(null)

const cursorX = computed(() => {
  return 198 + (props.progress * (timelineWidth.value-198))
})

const ruler = ref({
  thick: 20,
  isShowRuler: true,
  isShowReferLine: false,
  scale: 1,
  startX: 0,
  startY: 0
})

const rulerLines = ref({
  h: [],
  v: []
})

const rulerShadow = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0
})

const handleRulerCornerClick = () => {
  console.log('handleCornerClick')
}

const localPromptPosition = ref({
  x: 0,
  y: 0
})

const createTrack = () => {
  emit('createTrack')
}

const releasePointer = (track: any, e: any) => {
  emit('releasePointer', track, e)
}

const dblClickTrack = (track: any, e: any) => {
  createBlock(track, e)
  emit('dblClickTrack', track, e)
}

const soloToggle = (track: any, e: any) => {
  emit('soloToggle', track, e)
}

const muteToggle = (track: any, e: any) => {
  emit('muteToggle', track, e)
}

const updateTrack = (track: any, e: any) => {
  emit('updateTrack', track, e)
}

const selectTrack = (track: any, e: any) => {
  emit('selectTrack', track, e)
}

const dblClickBlock = (track: any, block: any, e: any) => {
  openPromptModal(track, block, e)
  emit('dblClickBlock', track, block, e)
}

const updateBlock = (track: any, block: any, e: any) => {
  emit('updateBlock', track, block, e)
  emit('updateTrack', track, e)
}

const selectBlock = (track: any, block: any, e: any) => {
  selectedBlock.value = block
  emit('selectBlock', track, block, e)
}

const deleteBlock = (track: any, block: any, e: any) => {
  emit('deleteBlock', track, block, e)
}

const unselectBlock = () => {
  selectedBlock.value = null
}

const createBlock = (track: any, e: any) => {
  const mx = e.offsetX / timelineWidth.value

  const block = {
    id: uuidv4(),
    prompt: "",
    start: mx,
    end: Math.min(1, mx + 0.15)
  }

  emit('createBlock', track, block, e)

  openPromptModal(track, block, {
    clientX: e.clientX,
    clientY: e.clientY
  })
}

const openPromptModal = (track: any, block: any, e: any) => {
  editedBlock.value = block

  localPromptPayload.value = {
    track: track,
    block: block
  }

  localPromptPosition.value = {
    x: (e.clientX-40)<0 ? (e.clientX + 40) : (e.clientX - 40),
    y: (e.clientY-200)<0 ? (e.clientY + 40) : (e.clientY - 200)
  }
}

const onLocalPromptSubmit = (localdata: any, payload: any) => {
  const track = payload.track

  const block = {
    ...payload.block,
    prompt: localdata.prompt
  }

  updateBlock(track, block, localdata)
  editedBlock.value = false
}

const initResizeObserver = () => {
  if (!timelineRef.value) return

  resizeObserver = new ResizeObserver(() => {
    timelineWidth.value = timelineRef.value.clientWidth
  })
  resizeObserver.observe(timelineRef.value)
}

onMounted(() => {
  timelineWidth.value = timelineRef.value.clientWidth
  initResizeObserver()
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>