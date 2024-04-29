<template>
  <article>
    <button @click="checkpointDrawerOpen=!checkpointDrawerOpen" class="bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-700/70 hover:bg-teal-600 dark:hover:bg-teal-600 hover:text-white px-2 py-2 w-full rounded-md space-x-2 flex items-center justify-between group">
      <SpinLoader v-if="loading" class="w-4 h-4 text-green-400"/>
      <svg v-else class="w-4 h-4 flex-shrink-0 text-zinc-500 group-hover:text-teal-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path clip-rule="evenodd" fill-rule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"></path>
      </svg>
      <h2 class="text-[0.85rem] flex-1 text-left font-semibold truncate">{{ cleanModelName(modelValue) }}</h2>
      <svg class="h-5 w-5 text-zinc-400 group-hover:text-teal-400" :class="[checkpointDrawerOpen?'text-teal-100':null]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
      </svg>
    </button>

    <SlideDrawer
      v-if="currentCheckpoint"
      title="Checkpoint Manager"
      :open="checkpointDrawerOpen"
      :showFooter="false"
      width="100%"
      maxwidth="85vw"
      orientation="top"
      @close="closeCheckpointDrawer()"
    >
      <CheckpointManager
        :currentCheckpoint="currentCheckpoint"
        @close="closeCheckpointDrawer()"
        @submit="selectCheckpoint"
      />
    </SlideDrawer>
  </article>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useModelStore } from '@/stores'
import SlideDrawer from '@/components/UI/SlideDrawer.vue'
import CheckpointManager from '@/components/CheckpointManager.vue'
import SpinLoader from '@/components/UI/SpinLoader.vue'

const cleanModelName = (name: string) => {
  return !name ? null : name
    .replace('.safetensors', '')
    .replace('.ckpt', '')
    .replace('.pth', '')
    .replace('.pt', '')
    .replace('.onnx', '')
    .replace('.bin', '')
}

const emit = defineEmits(['update:modelValue', 'change', 'modified'])

const props = defineProps({
  loading: { type: Boolean, required: false, default: false },
  modelValue: { type: String, required: false, default: null },
  disabled: { type: Boolean, required: false, default: false }
})

const modelStore = useModelStore()
const checkpointDrawerOpen = ref(false)

const currentCheckpoint = computed(() => {
  const checkpointName = props.modelValue
  return modelStore.getCheckpointByName(checkpointName)
})

const closeCheckpointDrawer = () => {
  checkpointDrawerOpen.value = false
}

const selectCheckpoint = (checkpoint: any) => {
  updateValue(checkpoint.name)
  closeCheckpointDrawer()
}

const updateValue = (checkpointName: string) => {
  emit('update:modelValue', checkpointName)
  emit('change', checkpointName)
  emit('modified')
}
</script>
