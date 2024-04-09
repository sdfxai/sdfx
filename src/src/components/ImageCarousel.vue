<template>
  <div class="h-full">
    <Splide v-if="images.length>1" ref="thumbnailsRef" :options="thumbsOptions" class="bg-white dark:bg-zinc-950">
      <SplideSlide v-for="(image, idx) in images" :key="`t${idx}`" @click="slideTo(idx)" class="thumbnail">
        <img :src="`${image}`" />
      </SplideSlide>
    </Splide>

    <div class="h-full bg-white dark:bg-black">
      <Splide ref="splideRef" :options="mainOptions">
        <SplideSlide v-for="(image, idx) in images" :key="`p${idx}`" class="bg-black">
          <imgz :src="`${image}`" class="w-full h-full object-contain"/>
        </SplideSlide>
      </Splide>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Splide, SplideSlide, Options } from '@splidejs/vue-splide'
import imgz from '@/components/imgz.vue'
import '@splidejs/vue-splide/css'
import '@splidejs/vue-splide/css/core'

const props = defineProps({
  images: { type: Array, required: true },
  cover: { type: Boolean, required: false, default: false },
  pagination: { type: Boolean, required: false, default: false },
  fixedHeight: { type: String, required: false, default: 'calc(100vh - 17rem)'},
  thumbWidth: { type: Number, required: false, default: 140 },
  thumbHeight: { type: Number, required: false, default: 100 }
})

const splideRef = ref<any>(null)
const thumbnailsRef = ref<any>(null)

const mainOptions: Options = {
  type      : 'slide',
  // commented as it is overloaded by the 2nd cover option
  // TODO: check if it is false or props.cover
  // cover: props.cover,
  heightRatio: 0.7,
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

const onSplideReady = () => {
  // console.log('splide is ready')
}

const slideTo = (index: number) => {
  if (thumbnailsRef.value) {
    splideRef.value.go(index)
  }
}

const initSplide = (splide: any) => {
  splide.on('move', (index: number) => {
    if (thumbnailsRef.value) {
      thumbnailsRef.value.go(index)
    }
  })
}

onMounted(() => {
  if (splideRef.value && splideRef.value.splide) {
    initSplide(splideRef.value.splide)
  }
})
</script>
