<template>
  <div class="flex flex-col items-center justify-center">
    <img ref="image" :src="src" :alt="alt" :filename="alt" class="imgbox-image w-full h-full object-contain" />
    <teleport v-if="open" to="#imgbox-sidebar">
      <div class="imgbox-sidebar h-full flex flex-col justify-between">
        <slot name="head"/>
        <div ref="scrollable" class="flex-1 overflow-y-auto">
          <button @click="closeZoomable()" class="tw-button">closeZoomable</button>
          <slot/>
        </div>
        <slot name="foot"/>
      </div>
    </teleport>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useDark } from '@vueuse/core'
// @ts-ignore
import mediumZoom from '@/components/mediumZoomCustom/index'
import Scrollbar from 'smooth-scrollbar'

const props = defineProps({
  src: { type: String, required: false, default: null },
  zoomable: { type: Boolean, required: false, default: true },
  alt: { type: String, required: false, default: null }
})

const emit = defineEmits(['open', 'close'])

const isDark = useDark()
const zoom = ref<any>(null)
const open = ref(false)
const image = ref<any>(null)
const scrollable = ref<any>(null)

const closePictureZoomModal = ()=>{
  if (zoom.value) {
    zoom.value.close()
  }
}

const closeZoomable = () => {
  zoom.value.close()
}

const updateZoomable = () => {
  if (zoom.value) zoom.value.detach()
  if (!props.zoomable) return

  zoom.value = mediumZoom(image.value, {
    background: isDark.value ? 'rgba(54, 54, 57, 0.85)' : 'rgba(24, 24, 27, 0.85)',
    template: '#template-imgbox',
    container: '[data-zoom-container]'
  })

  zoom.value.on('opened', () => {
    nextTick(()=>{
      Scrollbar.init(scrollable.value, {damping:0.04})
      const closeButton = document.querySelector('[data-zoom-close]')
      if (closeButton) {
        closeButton.addEventListener('click', () => zoom.value.close())
      }
    })
  });

  zoom.value.on('open', () => {
    open.value = true
    emit('open')
  })

  zoom.value.on('close', () => {
    open.value = false
    emit('close')
  })
}

watch(() => props.src, () => {
  nextTick(()=>{
    updateZoomable()
  })
})

onMounted(()=>{
  updateZoomable()
})

onBeforeUnmount(()=>{
  if (zoom.value) zoom.value.detach()
})

</script>