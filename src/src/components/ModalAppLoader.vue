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
    <TWDragWin v-if="open" :resizable="false" :maxWidth="450" :width="450" @close="$emit('close')" @enter="submit" :position="position">
      <template #head>
        <div class="bg-gradient-to-r from-zinc-300 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 h-8 p-2 flex items-center justify-between rounded-t-lg">
          <div class="font-bold text-sm text-zinc-700 dark:text-white">
            Load App
          </div>
          <div class="flex items-center space-x-2">
            <dt class="rounded-full bg-zinc-700 w-4 h-4 opacity-25"></dt>
            <dt class="rounded-full bg-zinc-700 w-4 h-4 opacity-25"></dt>
            <button @click="$emit('close')"><dt class="rounded-full bg-pink-700 w-4 h-4"></dt></button>
          </div>
        </div>
      </template>

      <div class="flex-1 h-full noselect text-zinc-700 dark:text-white bg-white dark:bg-zinc-950 shadow-xl rounded-b-2xl">
        <AppMeta :workflow="workflow" class="p-8 space-x-8"/>
        <div class="flex items-center justify-end space-x-3 mt-2 p-4 border-t border-zinc-200 dark:border-gray-950">
          <button @click="close()" class="tw-button gray transparent">Cancel</button>
          <button @click="submit()" class="tw-button">Load</button>
        </div>
      </div>
    </TWDragWin>
  </teleport>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import TWDragWin from '@/components/UI/TWDragWin.vue'
import { useGraphStore } from '@/stores'
import AppMeta from '@/components/AppMeta.vue'

const props = defineProps({
  open: { type: Boolean, required: false, default: false },
  position: { type: Object, required: false, default: null },
  uid: { type: String, required: false, default: null }
})

const emit = defineEmits(['close', 'submit'])
const graphStore = useGraphStore()
const workflow = ref<any | null>(null)

const close = ()=>{
  emit('close')
}

const submit = () => {
  emit('submit', props.uid)
}

watch(() => props.uid, async ()=>{
  if (props.uid) {
    workflow.value = await graphStore.getAppDetails(props.uid)
  }
})
</script>
