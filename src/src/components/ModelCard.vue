<template>
  <div ref="dropZone" class="ModelCard">
    <div 
      @click="$emit('select', model)"
      :class="[selected?'ring-teal-400 ring-opacity-60 ring-offset-2 ring-offset-teal-400 outline-none ring-2':'cursor-pointer']"
      class="noselect relative aspect-w-1 aspect-h-1 rounded-md overflow-hidden"
    >
      <UploadZone
        class="w-full h-full bg-zinc-100 dark:bg-zinc-950/75"
        :class="[hideNSFW?'blur-lg hover:blur-0 duration-300 transition-gpu':'']"
        :src="customPoster"
        :draggable="false"
        :cover="true"
        :border="false"
        :zoomable="false"
        :clickToUpload="false"
        :verbose="false"
        :maxwidth="2048"
        :maxheight="2048"
        @dropped="onImageDropped"
      >
        <template #noimage>
          <svg class="w-16 h-16 text-zinc-400 dark:text-zinc-700" fill="none" stroke="currentColor" stroke-width="0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"></path>
          </svg>
        </template>
      </UploadZone>

      <div v-if="loadedInVRAM" class="absolute inset-0 flex justify-end">
        <span class="bg-green-900/80 w-20 h-20 rotate-45 translate-x-10 -translate-y-10"></span>
      </div>
      <div v-if="loadedInVRAM" class="absolute inset-0 flex justify-end p-2.5">
        <span class="bg-green-400 rounded-full w-4 h-4"></span>
      </div>

      <div v-if="loading" class="absolute inset-0 bg-zinc-900/75 flex items-center justify-center">
        <SpinLoader class="w-6 h-6 text-green-400"/>
      </div>
    </div>
    <div class="text-sm font-semibold mt-2 truncate">
      <div class="text-sm text-zinc-400 dark:text-zinc-600">{{ model.path }}</div>
      <div class="text-base">{{ cleanModelName(model.name) }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/solid'
import { useModelStore, storeToRefs } from '@/stores'
import SpinLoader from '@/components/UI/SpinLoader.vue'
import UploadZone from '@/components/UploadZone.vue'

const emit = defineEmits(['select', 'updated', 'dropped'])

const hideNSFW = ref(false)

const modelStore = useModelStore()
const { modelMap } = storeToRefs(modelStore)

const props = defineProps({
  model: { type: Object, required: true },
  loadedInVRAM: { type: Boolean, required: false, default: false },
  selected: { type: Boolean, required: false, default: false },
  loading: { type: Boolean, required: false, default: false }
})

const cleanModelName = (name: string) => {
  return name
    .replace('.safetensors', '')
    .replace('.ckpt', '')
    .replace('.pth', '')
    .replace('.pt', '')
    .replace('.onnx', '')
    .replace('.bin', '')
}

const customPoster = computed(()=>{
  const model = modelMap.value[props.model.modelId]
  const media = model?.gallery[model.coverId]
  return media?.path
})

const onImageDropped = async (dataURL: string, e: any) => {
  emit('dropped', props.model, dataURL, e)
}

onMounted(()=>{
})
</script>
