<template>
  <ImgComparisonSlider class="comp-slider rendered">
    <!-- eslint-disable -->
    <figure slot="first" class="before">
      <img :src="image1" class="w-full min-h-[384px] max-h-[calc(82vh-3rem)] object-contain" />
      <figcaption>Before</figcaption>
    </figure>
    <figure slot="second" class="after">
      <img :src="image2" class="w-full min-h-[384px] max-h-[calc(82vh-3rem)] object-contain" />
      <figcaption>After</figcaption>
    </figure>
    <!-- eslint-enable -->
  </ImgComparisonSlider>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ImgComparisonSlider } from '@img-comparison-slider/vue'

const props = defineProps({
  image1: { type: String, required: true },
  image2: { type: String, required: true }
})

</script>
<style>
.comp-slider {
  transition: box-shadow 200ms ease-in-out;
}

.comp-slider:focus {
  outline: none;
}

.comp-slider .before,
.comp-slider .after {
  margin: 0;
}

.comp-slider .before figcaption,
.comp-slider .after figcaption {
  @apply bg-zinc-950/80 text-2xl text-white absolute p-4 rounded-xl;
  top: 50%;
  transform: translateY(-50%);
  line-height: 100%;
}

.comp-slider .before figcaption {
  left: 12px;
}

.comp-slider .after figcaption {
  right: 12px;
}
</style>