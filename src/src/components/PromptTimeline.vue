<template>
  <Timeline
    :id="id"
    :tracks="promptTracks"
    :progress="progressSteps"
    @createTrack="createTrack"
    @updateTrack="updateTrack"
    @soloToggle="soloToggle"
    @muteToggle="muteToggle"
    @createBlock="createBlock"
    @deleteBlock="deleteBlock"
    @updateBlock="updateBlock"
    @releasePointer="releasePointer"
    @drop="onDrop"
    @dragover="onDragover"
  />
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { ref, computed, watch, onMounted, PropType, nextTick } from 'vue'
import { useMainStore, storeToRefs } from '@/stores'
import { getBlocksFromPrompt, getTracksFromPromptBlocks, getPromptFromTimeline } from '@/utils/prompt'
import Timeline from '@/components/timeline/Timeline.vue'

const emit = defineEmits(['change', 'update:modelValue', 'modified'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  modelValue: { type: String, required: false, default: null },
  disabled: { type: Boolean, required:false, default: false }
})

let debounceTimer: any = null
const preventWatch = ref(false)
const { progress } = storeToRefs(useMainStore())
const promptTracks = ref<any[]>([])

const progressSteps = computed(() => {
  const s = progress.value.currentStep
  const n = progress.value.totalSteps
  return s/n
})

/**
 * deadlcock mechanism to prevent watch() to update
 */
const lockWatch = () => {
  preventWatch.value = true
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    preventWatch.value = false
  }, 100)
}

/**
 * release deadlcock when the mouse is released (i.e: after a drag)
 */
const releasePointer = (track: any, e: any) => {
 //preventWatch.value = false
}

const clearTimeline = () => {
  promptTracks.value = [
    {
      trackId: 0,
      name: 'Track 1',
      muted: false,
      solo: false,
      height: 38,
      blocks: []
    },
    {
      trackId: 1,
      name: 'Track 2',
      muted: false,
      solo: false,
      height: 38,
      blocks: []
    },
    {
      trackId: 2,
      name: 'Track 3',
      muted: false,
      solo: false,
      height: 38,
      blocks: []
    },
    {
      trackId: 3,
      name: 'Track 4',
      muted: false,
      solo: false,
      height: 38,
      blocks: []
    },
    {
      trackId: 4,
      name: 'Track 5',
      muted: false,
      solo: false,
      height: 38,
      blocks: []
    }
  ]
  emitUpdate('')
}

const onDragover = (e: any) => {
  e.preventDefault()
}

const onDrop = (e: any) => {
  const prompt = e.dataTransfer.getData("text")
  setTimelineFromPrompt(prompt)
  e.preventDefault()
}

const createTrack = () => {
  const trackId = promptTracks.value.length
  const track = {
    trackId: trackId,
    name: `Track ${trackId+1}`,
    muted: false,
    solo: false,
    height: 38,
    blocks: []
  }
  promptTracks.value.push(track)
  emitUpdate(getPromptFromTimeline(promptTracks.value))
}

const setTimelineFromPrompt = (prompt: any) => {
  const blocks: any[] = getBlocksFromPrompt(prompt)
  let tracks = []

  if (blocks.length>0) {
    tracks = getTracksFromPromptBlocks(blocks)
  } else {
    let trackId = 0
    let start = 0
    const totalChars = prompt.length
    const promptArray = prompt.split(',')
    const duration = 1 / promptArray.length

    tracks = promptArray.map((p: any) => {
      let end = Math.min(1, start + (2*duration) + 2*(promptArray[trackId].length/totalChars) + 0.10*Math.random())

      if (trackId === promptArray.length-1) {
        start = 0
        end = 1
      }

      const track = {
        trackId: trackId,
        name: `Track ${trackId+1}`,
        muted: false,
        solo: false,
        height: 38,
        blocks: [
          {
            id: uuidv4(),
            prompt: p.trim(),
            start: Math.max(0, start - 0.15*Math.random()),
            end: end
          }
        ]
      }
      trackId++
      start += duration - 0.05
      return track
    })

    const mutedPrompt: string = getPromptFromTimeline(tracks)
    const newBlocks: any[] = getBlocksFromPrompt(mutedPrompt)
    tracks = getTracksFromPromptBlocks(newBlocks)
  }

  promptTracks.value = tracks

  if (tracks.length<4) {
    for (let n=tracks.length; n<4; n++) {
      createTrack()
    }
  }

  emitUpdate(getPromptFromTimeline(promptTracks.value))
}

const setMuteAllTracks = (muted: boolean) => {
  promptTracks.value.forEach(t => {
    t.muted = muted
  })
  emitUpdate(getPromptFromTimeline(promptTracks.value))
}

const soloTrack = (track: any) => {
  promptTracks.value.forEach(t => {
    t.muted = true
    t.solo = false
    if (t.trackId === track.trackId) {
      t.muted = false
      t.solo = true
    }
  })
}

const unSoloAllTracks = () => {
  promptTracks.value.forEach(t => {
    t.solo = false
  })
  emitUpdate(getPromptFromTimeline(promptTracks.value))
}

const resetAllTracksSoloMute = (track?: any) => {
  promptTracks.value.forEach(t => {
    t.muted = false
    t.solo = false
  })
  emitUpdate(getPromptFromTimeline(promptTracks.value))
}

const soloToggle = (track: any, e: any) => {
  if (track.solo) {
    resetAllTracksSoloMute()
  } else {
    soloTrack(track)
  }

  emitUpdate(getPromptFromTimeline(promptTracks.value))
}

const muteToggle = (track: any, e: any) => {
  const t = promptTracks.value.find(t => t.trackId === track.trackId)
  if (!t) return

  if (track.muted) {
    unSoloAllTracks()
    t.muted = false
  } else {
    t.muted = true
    t.solo = false
  }

  emitUpdate(getPromptFromTimeline(promptTracks.value))
}

const createBlock = (track: any, black: any) => {
  const promptTrack = promptTracks.value.find(t => t.trackId === track.trackId)
  if (promptTrack) {
    promptTrack.blocks.push(black)
  }
}

const deleteBlock = (track: any, block: any, e: any) => {
  const promptTrack = promptTracks.value.find(t => t.trackId === track.trackId)

  if (promptTrack) {
    const idx = promptTrack.blocks.findIndex((e: any) => e.id === block.id)
    if (idx>-1) {
      promptTrack.blocks.splice(idx, 1)
      emitUpdate(getPromptFromTimeline(promptTracks.value))
    }
  }
}

const updateBlock = (track: any, block: any, e: any) => {
  const promptTrack = promptTracks.value.find(t => t.trackId === track.trackId)

  if (promptTrack) {
    const ev = promptTrack.blocks.find((e: any) => e.id === block.id)
    if (ev) {
      ev.start = block.start
      ev.end = block.end
      ev.prompt = block.prompt
    }
  }
}

const updateTrack = (track: any, e: any) => {
  const idx = promptTracks.value.findIndex(t => t.trackId === track.trackId)
  if (idx>-1) promptTracks.value[idx] = track
  emitUpdate(getPromptFromTimeline(promptTracks.value))
}

const emitUpdate = (value: any) => {
  lockWatch()
  emit('update:modelValue', value)
  emit('change', value)
  emit('modified')
}

watch(() => props.modelValue, ()=>{
  // deadlock mechanism to prevent watch to update while we are updating the timeline
  if (preventWatch.value) {
    return
  }

  if (props.modelValue) {
    setTimelineFromPrompt(props.modelValue)
  } else {
    clearTimeline()
  }
})

onMounted(() => {
  preventWatch.value = false
  if (props.modelValue) {
    setTimelineFromPrompt(props.modelValue)
  }
})

</script>