<template>
  <div class="Interface divide-y divide-zinc-200 dark:divide-zinc-900">
    <div class="flex items-center justify-between space-x-3 pb-5">
      <span class="flex-1">Theme</span>
      <button @click="toggleDark()" class="w-5">
        <SunIcon class="tw-icon flex-shrink-0 h-6 w-6 dark:hidden"/>
        <MoonIcon class="tw-icon flex-shrink-0 hidden h-6 w-6 dark:block"/>
      </button>
    </div>
    <div class="flex items-center justify-between space-x-3 py-5">
      <span class="w-32">Font size</span>
      <TWSlider
        v-model="fontSize"
        color="green"
        :min="0.65"
        :max="1.05"
        :interval="0.01"
        :shiftInterval="0.01"
        :snapThreshold="0.01"
        :range="[0.65, 0.75, 0.85, 0.95, 1.00, 1.05]"
        :snap="[0.65, 0.75, 0.85, 0.95, 1.00, 1.05]"
        class="flex-1"
        @change="setFontSize"
      />
      <span class="w-12 text-right">{{ fontSize?.toFixed(2) }}</span>
    </div>
    <div></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { MoonIcon, SunIcon } from '@heroicons/vue/24/solid'
import { useMainStore, storeToRefs } from '@/stores'
import { useDark, useToggle } from '@vueuse/core'
import TWSlider from '@/components/UI/TWSlider.vue'

const mainStore = useMainStore()
const { fontSize } = storeToRefs(mainStore)

const isDark = useDark()
const toggleDark = useToggle(isDark)

const setFontSize = () => {
  document.documentElement.style.fontSize = fontSize.value + 'em'
  mainStore.setFontSize(fontSize.value)
}

onMounted(()=>{
})
</script>
