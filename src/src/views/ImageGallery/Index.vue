<template>
  <div class="w-full flex flex-col noselect">
    <!-- menu -->
    <nav class="relative z-10 h-10 flex-shrink-0 pl-3 pr-4 bg-zinc-900 border-b border-zinc-200 dark:border-black flex items-center justify-between">
      <dt class="flex items-center justify-between space-x-3">
        <button @click="parameters.gallery.mode='slider'">
          <ViewColumnsIcon class="w-6 h-6" :class="[parameters.gallery.mode==='slider'?'text-teal-500':'text-zinc-500']"/>
        </button>
        <button @click="parameters.gallery.mode='gallery'">
          <SquaresPlusIcon class="w-6 h-6" :class="[parameters.gallery.mode==='gallery'?'text-teal-500':'text-zinc-500']"/>
        </button>
      </dt>
      <dt class="ml-3 flex-1 flex items-center space-x-2">        
        <div v-if="imageGallery.length>0" class="flex-1 text-base font-semibold">
          {{ imageGallery.length }} pictures
        </div>
        <div v-else class="flex-1 text-base font-semibold">
          No pictures
        </div>
      </dt>

      <div class="w-84 flex items-center justify-end space-x-3">
        <TWSlider
          v-if="parameters.gallery.mode==='gallery'"
          v-model="parameters.gallery.nb_images"
          :min="2"
          :max="12"
          :interval="1"
          :range="[2, 4, 6, 8, 10, 12]"
          @change="setDynamicColumns"
          class="flex-1 pr-6"
        />

        <dt class=" flex items-center justify-between space-x-3">
          <button @click="cleanImageGallery()">
            <TrashIcon class="tw-icon h-6 w-6"/>
          </button>
        </dt>
      </div>
    </nav>

    <!-- slider -->
    <div v-if="parameters.gallery.mode==='slider'" class="grow">
      <ImageCarousel v-if="imageGallery.length>0" :images="imageGallery"/>
    </div>

    <!-- gallery -->
    <div ref="scrollable" class="h-[calc(100vh-140px)]">
      <ul ref="griddy" v-if="parameters.gallery.mode==='gallery'" class="grid grid-cols-8 gap-px">
        <li v-for="(image, idx) in imageGallery" :key="`p${idx}`" class="bg-black">
          <div class="">
            <imgz :src="`${image}`" class="object-contain" />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useModelStore, storeToRefs } from '@/stores'
import { useConfirm } from '@/components/UI/VueConfirm/VueConfirm'
import { TrashIcon, SquaresPlusIcon, ViewColumnsIcon } from '@heroicons/vue/24/solid'
import imgz from '@/components/imgz.vue'
import ImageCarousel from '@/components/ImageCarousel.vue'
import TWSlider from '@/components/UI/TWSlider.vue'
import Scrollbar from 'smooth-scrollbar'

const { confirm } = useConfirm()
const { parameters, imageGallery } = storeToRefs(useModelStore())

const griddy = ref<HTMLElement | null>(null)
const scrollable = ref<any>(null)

const cleanImageGallery = async ()=>{
  const answer = await confirm({
    message: "Delete all images? Can't be undone.",
    buttons: {
      delete: 'Delete',
      no: 'No'
    }
  })

  if (answer) {
    imageGallery.value = []
  }
}

const setDynamicColumns = (cols: number)=>{
  const grid = griddy.value
  if (grid) {
    // @ts-ignore
    grid.style['grid-template-columns'] = `repeat(${12-cols}, minmax(0, 1fr))`
  }
}

onMounted(()=>{
  Scrollbar.init(scrollable.value, {damping:0.04})
  setDynamicColumns(parameters.value.gallery.nb_images)
})
</script>

