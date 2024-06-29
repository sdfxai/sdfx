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
    <TWDragWin v-if="open" :resizable="false" :minHeight="300" :minWidth="350" :maxWidth="500" :width="350" @close="$emit('close')" @enter="submit" :position="position">
      <template #head>
        <div class="bg-gradient-to-r from-zinc-300 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 h-8 p-2 flex items-center justify-between rounded-t-lg">
          <div class="font-bold text-sm text-zinc-700 dark:text-white">
            <span v-if="title">{{ title }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <dt class="rounded-full bg-zinc-700 w-4 h-4 opacity-25"></dt>
            <dt class="rounded-full bg-green-800 w-4 h-4 opacity-25"></dt>
            <button @click="$emit('close')"><dt class="rounded-full bg-pink-700 w-4 h-4"></dt></button>
          </div>
        </div>
      </template>

      <div class="p-6 flex-1 flex flex-col h-full noselect text-zinc-700 dark:text-white bg-white dark:bg-zinc-900/90 shadow-xl rounded-b-2xl">
        <form @submit.stop.prevent="submit">
          <TWTextarea v-model="local.text" :readonly="readonly" :limit="limit" :label="readonly?undefined:label" :showOptional="!readonly" :autofocus="true" :rows="rows" class="flex-auto"/>
          <div class="mt-6">
            <button type="submit" class="tw-button w-full">Submit</button>
          </div>
        </form>
      </div>
    </TWDragWin>
  </teleport>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import TWTextarea from '@/components/UI/TWTextarea.vue'
import TWDragWin from '@/components/UI/TWDragWin.vue'

const props = defineProps({
  title: { type: String, required: false, default: null },
  label: { type: String, required: false, default: 'Prompt' },
  limit: { type: Number, required: false, default: 2500 },
  readonly: { type: Boolean, required: false, default: false },
  rows: { type: Number, required: false, default: 10 },
  position: { type: Object, required: false, default: null },
  payload: { type: Object, required: false, default: null },
  open: { type: Boolean, required: false, default: false },
  text: { type: String, required: false, default: null }
})

const emit = defineEmits(['close', 'submit'])

const local = ref({
  text: props.text
})

const close = ()=>{
  emit('close')
}

const submit = () => {
  emit('submit', local.value.text, props.payload)
}
</script>