<template>
  <article>
    <div @click="imageDrawerOpen=!imageDrawerOpen" class="aspect-w-1 aspect-h-1 cursor-pointer bg-black rounded-lg border border-zinc-300 dark:border-zinc-700/80">
      <UploadZone
        class="flex flex-col"
        label="Source"
        :src="state.source"
        :verbose="true"
        :zoomable="false"
        :maxwidth="2048"
        :maxheight="2048"
        :showNoise="false"
        @processed="onImageDropped"
      />
    </div>
    <button v-if="showDropdown" @click="imageDrawerOpen=!imageDrawerOpen" class="mt-2 bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-700/70 hover:bg-teal-600 dark:hover:bg-teal-600 hover:text-white px-2 py-2 w-full rounded-md space-x-2 flex items-center justify-between group">
      <SpinLoader v-if="loading" class="w-4 h-4 text-green-400"/>
      <svg v-else class="w-4 h-4 flex-shrink-0 text-zinc-500 group-hover:text-teal-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path clip-rule="evenodd" fill-rule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"></path>
      </svg>
      <h2 class="text-[0.85rem] flex-1 text-left font-semibold truncate">
        {{ modelValue }}
      </h2>
      <svg class="h-5 w-5 text-zinc-400 group-hover:text-teal-400" :class="[imageDrawerOpen?'text-teal-100':null]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
      </svg>
    </button>

    <SlideDrawer
      title="Image Loader"
      :open="imageDrawerOpen"
      :showFooter="false"
      width="100%"
      maxwidth="85vw"
      orientation="top"
      @close="closeImageDrawer()"
    >
      <ImageManager
        :images="imageObjectList"
        :currentImage="currentImage"
        @close="closeImageDrawer()"
        @submit="selectImage($event)"
      />
    </SlideDrawer>
  </article>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import SlideDrawer from '@/components/UI/SlideDrawer.vue'
import SpinLoader from '@/components/UI/SpinLoader.vue'
import UploadZone from '@/components/UploadZone.vue'
import ImageManager from '@/components/ImageManager.vue'
import { PropType } from 'vue'

const emit = defineEmits(['update:modelValue', 'change', 'upload', 'modified'])

const props = defineProps({
  loading: { type: Boolean, required: false, default: false },
  showDropdown: { type: Boolean, required: false, default: true },
  options: { type: Array as PropType<any[]>, required: true },
  imageType: { type: String, required: false, default: 'input' },
  previewMode: { type: String, required: false, default: null },
  modelValue: { type: String, required: false, default: null },
  disabled: { type: Boolean, required: false, default: false }
})

const imageDrawerOpen = ref(false)

const getImageObject = (filename: string, subfolder = '') => {
  const type = props.imageType
  const previewMode = props.previewMode

  return {
    name: filename,
    src: sdfx.getImageUrlFromFilepath(filename, type, previewMode),
    alt: filename
  }
}

const currentImage = computed(()=>{
  const filename = props.modelValue
  return getImageObject(props.modelValue)
})

const imageObjectList = computed(()=>{
  const list = props.options.map(imageOption => {
    const filename = imageOption.name
    return getImageObject(filename)
  })

  return list
})

const state = ref({
  source: props.modelValue ? getImageObject(props.modelValue).src : null,
  width: null,
  height: null,
  aspectRatio: 1.0
})

const closeImageDrawer = () => {
  imageDrawerOpen.value = false
}

const selectImage = (imageObject: any) => {
  state.value.source = imageObject.src
  updateValue(imageObject.name)
  closeImageDrawer()
}

const clearImage = () => {
  state.value.source = null
  updateValue(null)
}

const onImageDropped = async (dataURL: any, e: any) => {
  state.value.width = e.width
  state.value.height = e.height
  state.value.aspectRatio = e.height >0 ? e.width/e.height : 1.00
  state.value.source = dataURL
  //console.log('onImageDropped', e)
  emit('upload', e)
}

const updateValue = (imageName: any) => {
  emit('update:modelValue', imageName)
  emit('change', imageName)
  emit('modified')
}

watch(() => props.modelValue, (filename) => {
  const imageObject = getImageObject(filename)
  state.value.source = imageObject.src
})
</script>
