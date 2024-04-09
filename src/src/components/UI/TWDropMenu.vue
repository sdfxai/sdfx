<template>
  <div ref="dropMenuRef" class="relative inline-block text-left rounded-md shadow-sm">
    <button type="button" class="flex items-center justify-center h-full text-zinc-300 dark:text-zinc-600 w-full sm gray transparent" @click="toggleMenu()">
      <svg class="icon h-5 w-5 flex-shrink-0" :class="{open:open}" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="open" :style="{width:menuWidth}" class="origin-top-right absolute right-0 mt-2 rounded-md drop-shadow-xl shadow-lg z-50">
        <div class="rounded-md bg-white dark:bg-zinc-800 shadow-xs" @click="select()">
          <slot/>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

const props = defineProps({
  menuWidth: {
    type: String,
    default: '14rem'
  }
})

const dropMenuRef = ref(null)
const open = ref(false)

const toggleMenu = () => {
  open.value = !open.value
}

const hideMenu = () => {
  open.value = false
}

const select = () => {
  hideMenu()
}

onClickOutside(dropMenuRef, (e) => {
  hideMenu()
})
</script>

<style scoped>
.icon {
  transition: transform 350ms;
  transform: rotate(0deg);
}

.icon.open {
  transform: rotate(180deg);
}
</style>