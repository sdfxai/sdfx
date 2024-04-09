<template>
<div class="ImageManager w-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-white">
  <div class="manager-body flex-1 h-[70vh] lg:h-[75vh] w-full flex justify-between">
    <section class="model-cards flex-1 flex flex-col">
      <div class="h-16 p-4 border-b border-zinc-200 dark:border-zinc-950 flex-shrink-0 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-between space-x-3">
        <div class="flex-1">
          <h2 class="text-lg font-semibold">{{ selectedImageObject?.name }}</h2>
        </div>
        <div class="flex justify-between space-x-3">
          <TWSearch v-model="query" class="w-64" />
          <button class="tw-icon sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
            </svg>              
          </button>
        </div>
      </div>
      <div class="flex-1 p-6 lg:p-8 w-full scrollable overflow-x-hidden overflow-y-auto">
        <div class="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
          <article
            v-for="imageObject in filteredImageObjectList"
            @dblclick="submit(imageObject)"
            @click="selectImage(imageObject)"
          >
            <div
              :class="[
                selectedImageObject.name===imageObject.name?'ring-teal-400 ring-opacity-60 ring-offset-2 ring-offset-teal-400 outline-none ring-2':'cursor-pointer',
                imageObject.nsfw?'blur-lg hover:blur-0 duration-300 transition-gpu':''
              ]"
              class="noselect relative aspect-w-1 aspect-h-1 rounded-md overflow-hidden"
            >
              <img v-lazy="imageObject.src" :alt="imageObject.name" class="w-full h-full object-cover" />
            </div>
            <div class="text-sm text-zinc-400 dark:text-zinc-500 font-semibold mt-2 truncate">
              {{ imageObject.name }}
            </div>
          </article>
        </div>
      </div>
    </section>
    <aside class="aside w-[25vw] max-w-[30rem] overflow-x-hidden flex flex-col overflow-y-auto border-l border-zinc-200 dark:border-zinc-950">
      <div class="h-16 flex-shrink-0 p-4 truncate border-b border-zinc-200 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-between">
        <h2 class="text-lg font-semibold">Image Detail</h2>
      </div>

      <div class="image-preview">
        <imgz :src="selectedImageObject.src" />
      </div>
    </aside>
  </div>
  <div class="manager-foot h-18 flex-shrink-0 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-950 flex items-center justify-between p-4">
    <div class=""><!-- dummy --></div>
    <div class="w-96 flex items-center space-x-2">
      <button @click="$emit('close')" class="tw-button gray transparent">
        Close
      </button>
      <button @click="submit(selectedImageObject)" class="tw-button pink flex-1 w-full">
        Select Image
      </button>
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import TWSearch from '@/components/UI/TWSearch.vue'
import imgz from '@/components/imgz.vue'
import { PropType } from 'vue'

const emit = defineEmits(['submit', 'close'])

const props = defineProps({
  loading: { type: Boolean, required: false, default: false },
  images: { type: Array as PropType<any[]>, required: true },
  currentImage: { type: Object, required: true }
})

const query = ref('')
const selectedImageObject = ref(props.currentImage)

const filteredImageObjectList = computed(() => {
  return props.images.filter(image => query.value ? image.name.indexOf(query.value)>-1 : true)
})

const selectImage = (image: any) => {
  selectedImageObject.value = image
}

const submit = (imageObject: any) => {
  selectedImageObject.value = imageObject
  emit('submit', imageObject)
}

const handleKeyDown = (e: any) => {
  if (e.keyCode===13 || e.key==='Enter') submit(selectedImageObject.value)
  if (e.keyCode===27 || e.key==='Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

watch(() => props.currentImage, () => {
  selectedImageObject.value = props.currentImage
})
</script>
