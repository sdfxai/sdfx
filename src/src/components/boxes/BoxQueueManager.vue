<template>
  <div class="QueueManager space-y-4">
    <ul v-if="queue.running.length>0" class="space-y-1">
      <h2 class="text-sm text-zinc-600 dark:text-zinc-100">Running</h2>
      <li v-for="item in queue.running" class="flex items-center justify-center bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-800 px-2 py-1 rounded-lg">
        <div class="flex-1 text-sm">{{ item[0] }}</div>
        <button @click="interrupt()" class="text-zinc-500 hover:text-red-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </li>
    </ul>

    <ul v-if="queue.pending.length>0" class="space-y-1">
      <h2 class="text-sm text-zinc-600 dark:text-zinc-100">Pending</h2>
      <li v-for="item in queue.pending" class="flex items-center justify-center bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-800 px-2 py-1 rounded-lg">
        <div class="flex-1 text-sm">{{ item[0] }}</div>
        <button @click="deleteQueueItem(item[1])" class="text-zinc-500 hover:text-red-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useGraphStore, storeToRefs } from '@/stores'
import { useI18n } from 'vue-i18n'
import { TrashIcon } from '@heroicons/vue/24/solid'
import Box from '@/components/UI/Box.vue'

const { t } = useI18n()
const graphStore = useGraphStore()
const { queue } = storeToRefs(graphStore)

const loading = ref(false)

const deleteQueueItem = async (itemId: number) => {
  await graphStore.deleteQueueItem(itemId)
}

const clearQueue = async () => {
  graphStore.clearQueue()
  await graphStore.interrupt()
}

const interrupt = async () => {
  await graphStore.interrupt()
}

onMounted(async ()=>{
})
</script>
