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
          <h2 class="text-xl">This app requires the following dependencies:</h2>

          <ul class="mt-6 pb-2 border-b border-zinc-300 dark:border-zinc-900">
            <li class="flex space-x-3 justify-between font-semibold text-sm">
              <dt class="flex-1">Name</dt>
              <dt class="w-40">Type</dt>
              <dt class="w-20 text-right">Status</dt>
            </li>
          </ul>
          <ul class="mt-2 h-[200px] max-h-[200px] overflow-y-auto">
            <li v-for="dep in dependencies" :key="dep.name" class="flex hover:bg-zinc-200 dark:hover:bg-zinc-900 space-x-3 space-y-1 justify-between">
              <dt class="flex-1 text-zinc-500 truncate flex items-center space-x-2">
                <PhotoIcon v-if="dep.type==='media'" class="w-5 h-5 text-zinc-400 dark:text-zinc-500"/>
                <PuzzlePieceIcon v-if="dep.type==='model'" class="w-5 h-5 text-zinc-400 dark:text-zinc-500"/>
                <Square3Stack3DIcon v-if="dep.type==='custom_node'" class="w-5 h-5 text-zinc-400 dark:text-zinc-500"/>
                <span class="text-zinc-950 font-semibold dark:text-zinc-200">{{ dep.name || dep.filename }}</span>
              </dt>
              <dt class="w-40">
                <span v-if="dep.type==='media'">Media</span>
                <span v-if="dep.type==='model'">AI model</span>
                <span v-if="dep.type==='custom_node'">Node Pack</span>
              </dt>
              <dt class="w-20 text-right">
                <div v-if="dep.status==='installed'" class="flex items-center justify-end space-x-2 text-green-600 dark:text-green-500">
                  <span>{{ dep.status }}</span>
                  <CheckCircleIcon class="w-6 h-6 flex-shrink-0"/>
                </div>
                <div v-if="dep.status==='missing'" class="flex items-center justify-end space-x-2 text-rose-700 dark:text-rose-500">
                  <span>{{ dep.status }}</span>
                  <ExclamationTriangleIcon class="w-6 h-6 flex-shrink-0"/>
                </div>
                <div v-if="dep.status==='mismatch'" class="flex items-center justify-end space-x-2 text-orange-500 dark:text-orange-400">
                  <span>{{ dep.status }}</span>
                  <FlagIcon class="w-6 h-6 flex-shrink-0"/>
                </div>
                <div v-if="dep.status==='failed'" class="flex items-center justify-end space-x-2 text-rose-700 dark:text-rose-500">
                  <span>{{ dep.status }}</span>
                  <FaceFrownIcon class="w-6 h-6 flex-shrink-0"/>
                </div>
              </dt>
            </li>
          </ul>
        </div>

        <div class="flex items-center justify-end space-x-3 p-4 border-t border-zinc-200 dark:border-gray-950">
          <button @click="close()" class="tw-button gray transparent">Later</button>
          <button @click="submit()" class="tw-button">Apply Now</button>
        </div>
      </div>
    </TWDragWin>
  </teleport>
</template>
<script lang="ts" setup>
import { api } from '@/apis'
import { ref, computed, onMounted } from 'vue'
import TWDragWin from '@/components/UI/TWDragWin.vue'
import { useMainStore, useGraphStore, storeToRefs } from '@/stores'
import { PhotoIcon, CheckCircleIcon, ExclamationTriangleIcon, FlagIcon, FaceFrownIcon, PuzzlePieceIcon, Square3Stack3DIcon } from '@heroicons/vue/24/solid'

const emit = defineEmits(['close', 'submit'])

const props = defineProps({
  open: { type: Boolean, required: false, default: false },
  position: { type: Object, required: false, default: null }
})

const mainStore = useMainStore()
const graphStore = useGraphStore()
const { status } = storeToRefs(mainStore)
const { nodegraph } = storeToRefs(graphStore)
const dependencies = ref(nodegraph.value.currentDependencies)

const close = ()=>{
  mainStore.setDependenciesModal(false)
  emit('close')
}

const submit = async ()=>{
  const json = await api.applyDependencies(dependencies.value)
  mainStore.setDependenciesModal(false)
  emit('submit')
}

const checkDependencies = async () => {
  dependencies.value = await api.checkDependencies(dependencies.value)
  graphStore.setCurrentDependencies(dependencies.value)
}

onMounted(()=>{
  checkDependencies()
})
</script>
