<template>
  <div class="TWGauge text-3xl">
    <div class="TWGauge__inner border-b-2 border-zinc-200 dark:border-zinc-950">
      <div class="TWGauge__fill" :style="{ transform: `rotate(${cssTransformRotateValue})` }"></div>
      <div class="TWGauge__border"></div>
      <div class="TWGauge__cover">
        {{ percentage.toFixed(2) }}%
      </div>
    </div>
    <h2 class="text-center mt-3 font-semibold text-zinc-600 dark:text-zinc-400">{{ title }}</h2>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: false,
    default: 'Untitled'
  },
  percentage: {
    type: Number,
    required: true
  }
})

const cssTransformRotateValue = computed(() => {
  const percentageAsFraction = props.percentage / 100
  const halfPercentage = percentageAsFraction / 2

  return `${halfPercentage}turn`
})

</script>

<style scoped>
.TWGauge {
  max-width: 250px;
}

.TWGauge__inner {
  @apply bg-zinc-800;
  width: 100%;
  height: 0;
  padding-bottom: 50%;
  position: relative;
  border-top-left-radius: 100% 200%;
  border-top-right-radius: 100% 200%;
  overflow: hidden;
}

.TWGauge__fill {
  @apply bg-gradient-to-l from-green-600 via-orange-400 to-rose-700;
  position: absolute;
  top: 100%;
  left: 0;
  width: inherit;
  height: 100%;
  transform-origin: center top;
  transform: rotate(0turn);
  transition: transform 250ms ease-out;
}

.TWGauge__cover {
  @apply bg-gradient-to-b from-zinc-950 to-zinc-900/75 text-white;
  width: 75%;
  height: 150%;
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  border-color: black;
  border-width: 0.25rem;
  border-radius: 50%;

  /* Text */
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 25%;
  box-sizing: border-box;
  font-family: 'Lexend', sans-serif;
  font-weight: bold;
}

.TWGauge__border {
  @apply bg-transparent;
  width: 75%;
  height: 150%;
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50%;
}
</style>