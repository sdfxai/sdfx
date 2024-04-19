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
    <TWDragWin v-if="open" :resizable="false" :maxWidth="380" :width="380" :height="200" @close="close()" @enter="close()" :position="position">
      <template #head>
        <div class="bg-gradient-to-r from-zinc-300 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 h-8 p-2 flex items-center justify-between rounded-t-lg">
          <div class="font-bold text-sm text-zinc-700 dark:text-white">
            Rebooting
          </div>
        </div>
      </template>

      <div class="flex-1 noselect text-zinc-700 dark:text-white bg-white dark:bg-zinc-950 shadow-xl rounded-b-2xl">
        <div class="p-12 flex flex-col items-center justify-center">
          <h2>Please wait while the application is rebooting</h2>
          <SpinLoader class="mt-8 w-12 h-12 text-orange-700 dark:text-orange-400"/>
        </div>
      </div>
    </TWDragWin>
  </teleport>
</template>
<script lang="ts" setup>
import { useMainStore, storeToRefs } from '@/stores'
import TWDragWin from '@/components/UI/TWDragWin.vue'
import SpinLoader from '@/components/UI/SpinLoader.vue'

const emit = defineEmits(['close'])

const props = defineProps({
  open: { type: Boolean, required: false, default: false },
  position: { type: Object, required: false, default: null },
  uid: { type: String, required: false, default: null }
})

const mainStore = useMainStore()
const { status } = storeToRefs(mainStore)

const close = ()=>{
  emit('close')
}
</script>
