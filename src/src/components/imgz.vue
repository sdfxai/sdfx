<template>
  <img ref="image"
    :src="src"
    :alt="alt"
    :filename="alt"
  />
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

// @ts-ignore
import mediumZoom from '@/components/mediumZoomCustom/index'

const props = defineProps({
  src: { type: String, required: false, default: null },
  zoomable: { type: Boolean, required: false, default: true },
  alt: { type: String, required: false, default: null }
})

const emit = defineEmits(['open', 'close'])

const zoom = ref<any>(null)
const open = ref(false)
const image = ref<any>(null)

const closePictureZoomModal = ()=>{
  if (zoom.value) {
    zoom.value.close()
  }
}

const updateZoomable = () => {
  if (zoom.value) zoom.value.detach()
  if (!props.zoomable) return

  zoom.value = mediumZoom(image.value, {
    background: 'rgba(34, 34, 37, 0.65)',
  })

  zoom.value.on('open', () => {
    open.value = true
    const img = zoom.value.getZoomedImage()
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

onBeforeUnmount(() => {
  if (zoom.value) zoom.value.detach()
})

</script>
