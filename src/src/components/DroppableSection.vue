<template>
  <section
    ref="dropZoneRef"
    @dragover.prevent.stop="dragoverHandler"
    class="relative"
    :class="over?'outline-2 outline-dashed border-orange-500':''"
  >
    <slot/>

    <transition v-if="opaque"
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >    
    <div v-if="over" class="absolute inset-0 bg-teal-600/10 z-10 backdrop-blur-lg flex items-center justify-center">
      <svg class="w-24 h-24 text-teal-200/40" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path>
      </svg>
    </div>
    </transition>
    <div
      v-if="over"
      @dragover.prevent.stop="dragoverHandler"
      @dragleave.prevent.stop="dragleaveHandler"
      class="absolute inset-0 z-20">
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const emit = defineEmits(['dropped', 'dragover', 'dragleave', 'filedrop'])

const props = defineProps({
  droppable: {
    type: Boolean,
    required: false,
    default: true
  },
  opaque: {
    type: Boolean,
    required: false,
    default: true
  }
})

const over = ref(false)
const dropZoneRef = ref<HTMLElement | null>(null)

const handleURLDrop = async (e: DragEvent) => {
  if (!e.dataTransfer) return

  // Try loading the first URI in the transfer list
  const validTypes = ['text/uri-list', 'text/x-moz-url']
  const match = [...e.dataTransfer.types].find((t) => validTypes.find((v) => t === v))

  if (match) {
    const uri = e.dataTransfer.getData(match)?.split('\n')?.[0]
    if (uri) {
      const obj: Blob = await (await fetch(uri)).blob()
      emit('filedrop', obj)
    }
  }
}

const dragoverHandler = (e: DragEvent) => {
  if (!props.droppable) return

  if (props.opaque) {
    e.preventDefault()
    e.stopPropagation()
    over.value = true
    emit('dragover', e)
  }
}

const dragleaveHandler = (e: DragEvent) => {
  if (!props.droppable) return
  over.value = false
  e.preventDefault()
  e.stopPropagation()
  emit('dragleave', e)
}

const dropHandler = (e: DragEvent) => {
  if (!props.droppable) return
  over.value = false
  e.preventDefault()
  e.stopPropagation()
  emit('dropped', e)

  if (e.dataTransfer) {
    const files = e.dataTransfer.files

    if (files && files.length) {
      emit('filedrop', files[0])
    } else {
      handleURLDrop(e)
    }
  }
}

onMounted(async ()=>{
  if (dropZoneRef.value && props.droppable) {
    dropZoneRef.value.addEventListener('drop', dropHandler)
  }
})

onBeforeUnmount(async ()=>{
  if (dropZoneRef.value) {
    dropZoneRef.value.removeEventListener('drop', dropHandler)
  }
})

watch(() => props.droppable, (droppable) => {
  if (dropZoneRef.value) {
    dropZoneRef.value.removeEventListener('drop', dropHandler)
    if (droppable) {
      dropZoneRef.value.addEventListener('drop', dropHandler)
    }
  }
})
</script>