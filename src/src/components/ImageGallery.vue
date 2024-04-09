<template>
  <section class="ImageGallery">
    <div class="h-full flex items-center justify-center bg-black">
      <Splide ref="splideRef" :options="mainOptions">
        <SplideSlide v-for="(image, idx) in gallery" :key="`p${idx}`" class="relative group bg-black">
          <imgz :src="image.src" class="w-full h-full object-contain"/>
        </SplideSlide>
      </Splide>
    </div>
    <Splide ref="thumbnailsRef" v-if="gallery.length>1" :options="thumbsOptions" class="">
      <SplideSlide v-for="(image, idx) in gallery" :key="`t${idx}`" @click="slideTo(idx)" class="thumbnail">
        <img :src="image.src" />
      </SplideSlide>
    </Splide>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, PropType } from 'vue'
import { useModelStore, storeToRefs } from '@/stores'
import { Splide, SplideSlide, Options } from '@splidejs/vue-splide'
import { XMarkIcon } from '@heroicons/vue/24/solid'
import imgz from '@/components/imgz.vue'
import ImageMetadata from '@/components/ImageMetadata.vue'
import '@splidejs/vue-splide/css'
import '@splidejs/vue-splide/css/core'

const emit = defineEmits(['select', 'selectImage'])

const props = defineProps({
  gallery: { type: Array as PropType<any>, required: true },
  pagination: { type: Boolean, required: false, default: false },
  fixedHeight: { type: String, required: false, default: 'calc(50vh - 3rem)'},
  thumbWidth: { type: Number, required: false, default: 140 },
  thumbHeight: { type: Number, required: false, default: 100 }
})

const splideRef = ref<any>(null)
const thumbnailsRef = ref<any>(null)

const mainOptions: Options = {
  type      : 'slide',
  heightRatio: 0.8,
  cover     : false,
  fixedHeight: props.fixedHeight,
  pagination: props.pagination,
}

const thumbsOptions: Options = {
  type        : 'slide',
  rewind      : false,
  gap         : '1px',
  pagination  : false,
  fixedWidth  : props.thumbWidth,
  fixedHeight : props.thumbHeight,
  cover       : true,
  focus       : 'center',
  isNavigation: true,
  updateOnMove: true,
}

const onSplideReady = ()=>{
  // console.log('splide is ready')
}

const slideTo = (index: number) => {
  if (thumbnailsRef.value) {
    splideRef.value.go(index)
  }
}

const initSplide = (splide: any)=>{
  splide.on('move', (index: number)=>{
    if (thumbnailsRef.value) {
      thumbnailsRef.value.go(index)
      emit('selectImage', index)
    }
  })
}

onMounted(()=>{
  if (splideRef.value && splideRef.value.splide) {
    initSplide(splideRef.value.splide)
  }
})
</script>
