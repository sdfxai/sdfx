<template>
<div class="CheckpointManager w-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-white">
  <div class="manager-body flex-1 h-[70vh] lg:h-[75vh] w-full flex justify-between">
    <section class="model-cards flex-1 flex flex-col">
      <div class="h-16 p-4 border-b border-zinc-200 dark:border-zinc-950 flex-shrink-0 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-between space-x-3">
        <div class="flex-1">
          <h2 class="text-lg font-semibold">{{ selectedCheckpoint?.name }}</h2>
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
          <ModelCard
            v-for="checkpoint in filteredCheckpointList"
            :key="checkpoint.modelId"
            :model="checkpoint"
            :loadedInVRAM="false"
            :selected="selectedCheckpoint?.modelId===checkpoint.modelId"
            :loading="loading"
            @dblclick="submit(checkpoint)"
            @dropped="onMediaDropped"
            @select="selectCheckpoint"
          />
        </div>
      </div>
    </section>
    <aside class="aside w-[25vw] max-w-[30rem] overflow-x-hidden flex flex-col overflow-y-auto border-l border-zinc-200 dark:border-zinc-950">
      <div class="gallery-wrapper flex-1 h-full flex flex-col">
        <div class="h-16 flex-shrink-0 p-4 truncate border-b border-zinc-200 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-between">
          <h2 class="text-lg font-semibold">Checkpoint Gallery</h2>
        </div>

        <!-- model gallery -->
        <article v-if="selectedCheckpoint" class="flex-1 h-full">
          <ImageGallery
            v-if="selectedCheckpoint.gallery?.length>0"
            :gallery="checkpointGallery"
            :thumbWidth="90"
            :thumbHeight="90"
            @selectImage="setGalleryCoverId"
            class="flex-1"
          />

          <UploadZone
            v-else
            class="h-full"
            :src="undefined"
            :cover="true"
            :border="false"
            :zoomable="false"
            :clickToUpload="true"
            :verbose="true"
            :maxwidth="2048"
            :maxheight="2048"
            @dropped="(dataURL, e) => onMediaDropped(selectedCheckpoint, dataURL, e)"
          >
            <template #noimage>
              <div class="max-w-sm h-full w-full flex flex-col items-center justify-center cursor-pointer">
                <p class="text-white">
                  Gallery is empty. 
                </p>
                <button class="tw-button transparent teal mt-6">Upload Image</button>
              </div>
            </template>
          </UploadZone>

        </article>
      </div>
    </aside>
  </div>
  <div class="manager-foot h-18 flex-shrink-0 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-950 flex items-center justify-between p-4">
    <div class=""><!-- dummy --></div>
    <div class="w-96 flex items-center space-x-2">
      <button @click="$emit('close')" class="tw-button gray transparent">
        Close
      </button>
      <button @click="submit(selectedCheckpoint)" class="tw-button pink flex-1 w-full">
        Select Checkpoint
      </button>
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useModelStore, storeToRefs } from '@/stores'
import TWSearch from '@/components/UI/TWSearch.vue'
import ModelCard from '@/components/ModelCard.vue'
import ImageGallery from '@/components/ImageGallery.vue'
import UploadZone from '@/components/UploadZone.vue'

const emit = defineEmits(['submit', 'close'])

const props = defineProps({
  loading: { type: Boolean, required: false, default: false },
  currentCheckpoint: { type: Object, required: true },
  disabled: { type: Boolean, required: false, default: false }
})

const hideNSFW = ref(false)
const query = ref('')
const scrollable = ref<any>(null)
const selectedCheckpoint = ref(props.currentCheckpoint)

const modelStore = useModelStore()
const { modelMap, parameters } = storeToRefs(modelStore)

watch(() => props.currentCheckpoint, ()=>{
  selectedCheckpoint.value = props.currentCheckpoint
})

const checkpointGallery = computed(() => {
  const gallery: any[] = selectedCheckpoint.value.gallery
  return gallery.map(i => ({
    ...i,
    src: i.path
  }))
})

const onMediaDropped = (model: any, dataURL: any, e: any) => {
  if (!e.file) {
    console.error('unable to find filetype and filename')
    return
  }

  const modelId = model.modelId
  const filename = e.file.name //`media-${model.modelId}-${performance.now()}.png`
  const filetype = e.file.type

  if (['image/jpeg', 'image/jpg', 'image/png'].includes(filetype)) {
    const type = 'image'
    const { blob, metadata } = e

    modelStore.uploadToMediaGallery({
      modelId, filename, blob, metadata, type
    })
  }
}

const setGalleryCoverId = (coverId: any) => {
  selectedCheckpoint.value.coverId = coverId
  modelStore.setCheckpointCoverId(selectedCheckpoint.value.modelId, coverId)
}

const selectCheckpoint = async (checkpoint: any) => {
  selectedCheckpoint.value = checkpoint
}

const submit = (checkpoint: any) => {
  selectedCheckpoint.value = checkpoint
  emit('submit', checkpoint)
}

const filteredCheckpointList = computed(() => {
  const list = modelStore.getCheckpointList()
  return list.filter(checkpoint => query.value ? checkpoint.name.indexOf(query.value)>-1 : true)
})

const deleteCheckpoint = (c: any) => {
}

const handleKeyDown = (e: any) => {
  if (e.keyCode===13 || e.key==='Enter') submit(selectedCheckpoint.value)
  if (e.keyCode===27 || e.key==='Escape') emit('close')
}

onMounted(()=>{
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(()=>{
  document.removeEventListener('keydown', handleKeyDown)
})
</script>
