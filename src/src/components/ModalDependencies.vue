<template>
  <teleport to="body">
    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="absolute inset-0 z-[100] bg-teal-700/20" @click="close()"></div>
    </transition>
    <TWDragWin v-if="open" :resizable="false" :maxWidth="500" :width="500" @close="close()" @enter="submit()" :position="position">
      <template #head>
        <div class="bg-gradient-to-r from-zinc-300 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 h-8 p-2 flex items-center justify-between rounded-t-lg">
          <div class="font-bold text-sm text-zinc-700 dark:text-white">
            Dependencies
          </div>
          <div class="flex items-center space-x-2">
            <dt class="rounded-full bg-zinc-700 w-4 h-4 opacity-25"></dt>
            <dt class="rounded-full bg-zinc-700 w-4 h-4 opacity-25"></dt>
            <button @click="close()"><dt class="rounded-full bg-pink-700 w-4 h-4"></dt></button>
          </div>
        </div>
      </template>

      <div class="flex-1 h-full noselect text-zinc-700 dark:text-white bg-white dark:bg-zinc-950 shadow-xl rounded-b-2xl">
        <div class="bg-zinc-50 dark:bg-zinc-950 min-h-[300px] p-4">
          <h2>The following dependencies are required:</h2>
        </div>

        <div class="flex items-center justify-end space-x-3 p-4 border-t border-zinc-200 dark:border-gray-950">
          <button @click="close()" class="tw-button gray transparent">Close</button>
          <button @click="submit()" class="tw-button">Install</button>
        </div>
      </div>
    </TWDragWin>
  </teleport>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import TWDragWin from '@/components/UI/TWDragWin.vue'
import { useMainStore, storeToRefs } from '@/stores'

const emit = defineEmits(['close', 'submit'])

const props = defineProps({
  open: { type: Boolean, required: false, default: false },
  position: { type: Object, required: false, default: null }
})

const mainStore = useMainStore()
const { status } = storeToRefs(mainStore)

const close = ()=>{
  mainStore.setDependenciesModal(false)
  emit('close')
}

const submit = ()=>{
  mainStore.setDependenciesModal(false)
  emit('submit')
}

onMounted(()=>{
})
</script>
