<template>
  <div class="p-4 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-black flex items-center justify-between">
    <dt class="flex items-center space-x-2">
      <button v-if="false" @click="$emit('setTool', 'none')" class="w-10 h-10 border rounded-md flex items-center justify-center" :class="[tool==='none'?'border-teal-900 bg-teal-700 text-white':'border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400']">
      </button>

      <!-- select -->
      <button @click="$emit('setTool', 'select')" class="w-10 h-10 border rounded-md flex items-center justify-center" :class="[tool==='select'?'border-teal-900 bg-teal-700 text-white':'border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400']">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 50 50"><path d="M 29.699219 47 C 29.578125 47 29.457031 46.976563 29.339844 46.933594 C 29.089844 46.835938 28.890625 46.644531 28.78125 46.398438 L 22.945313 32.90625 L 15.683594 39.730469 C 15.394531 40.003906 14.96875 40.074219 14.601563 39.917969 C 14.238281 39.761719 14 39.398438 14 39 L 14 6 C 14 5.601563 14.234375 5.242188 14.601563 5.082031 C 14.964844 4.925781 15.390625 4.996094 15.683594 5.269531 L 39.683594 27.667969 C 39.972656 27.9375 40.074219 28.355469 39.945313 28.726563 C 39.816406 29.101563 39.480469 29.363281 39.085938 29.398438 L 28.902344 30.273438 L 35.007813 43.585938 C 35.117188 43.824219 35.128906 44.101563 35.035156 44.351563 C 34.941406 44.601563 34.757813 44.800781 34.515625 44.910156 L 30.113281 46.910156 C 29.980469 46.96875 29.84375 47 29.699219 47 Z"/></svg>
      </button>

      <!-- move -->
      <button @click="$emit('setTool', 'move')" class="w-10 h-10 border rounded-md flex items-center justify-center" :class="[tool==='move'?'border-teal-900 bg-teal-700 text-white':'border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400']">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 48 44">
          <path style="line-height:normal;text-indent:0;text-align:start;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000;text-transform:none;block-progression:tb;isolation:auto;mix-blend-mode:normal" d="M 25 3.2441406 L 18.59375 9.578125 A 2.0002 2.0002 0 1 0 21.40625 12.421875 L 23 10.845703 L 23 18 A 2.0002 2.0002 0 1 0 27 18 L 27 10.845703 L 28.59375 12.421875 A 2.0002 2.0002 0 1 0 31.40625 9.578125 L 25 3.2441406 z M 39.017578 18.007812 A 2.0002 2.0002 0 0 0 37.605469 21.433594 L 39.181641 23.027344 L 32.027344 23.027344 A 2.0002 2.0002 0 1 0 32.027344 27.027344 L 39.181641 27.027344 L 37.605469 28.621094 A 2.0002 2.0002 0 1 0 40.449219 31.433594 L 46.785156 25.027344 L 40.449219 18.621094 A 2.0002 2.0002 0 0 0 39.017578 18.007812 z M 10.921875 18.009766 A 2.0002 2.0002 0 0 0 9.5488281 18.621094 L 3.2167969 25.027344 L 9.5488281 31.433594 A 2.0005113 2.0005113 0 1 0 12.394531 28.621094 L 10.818359 27.027344 L 17.970703 27.027344 A 2.0002 2.0002 0 1 0 17.970703 23.027344 L 10.818359 23.027344 L 12.394531 21.433594 A 2.0002 2.0002 0 0 0 10.921875 18.009766 z M 24.970703 30.029297 A 2.0002 2.0002 0 0 0 23 32.056641 L 23 39.210938 L 21.40625 37.634766 A 2.0002 2.0002 0 0 0 19.966797 37.037109 A 2.0002 2.0002 0 0 0 18.59375 40.478516 L 23.414062 45.244141 A 2.0002 2.0002 0 0 0 23.798828 45.625 L 25 46.8125 L 26.199219 45.626953 A 2.0002 2.0002 0 0 0 26.59375 45.236328 L 31.40625 40.478516 A 2.0002 2.0002 0 0 0 29.990234 37.029297 A 2.0002 2.0002 0 0 0 28.59375 37.634766 L 27 39.210938 L 27 32.056641 A 2.0002 2.0002 0 0 0 24.970703 30.029297 z"/>
        </svg>
      </button>

      <span class="w-4"></span>

      <!-- long fur brush -->
      <button v-if="false" @click="$emit('setTool', 'longfur')" class="w-10 h-10 border rounded-md flex items-center justify-center" :class="[tool==='longfur'?'border-teal-900 bg-teal-700 text-white':'border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400']">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 50 50">
          <path d="M 36.875 4.0625 C 36.547 4.0625 36.2505 4.19875 36.0625 4.46875 L 23.90625 22 C 23.82625 22.115 23.776 22.26825 23.75 22.40625 C 23.493 23.77525 23.9825 25.26775 25.1875 26.71875 C 27.1505 29.08475 30.6765 30.9375 33.1875 30.9375 C 33.4725 30.9375 33.745 30.88975 34 30.84375 C 34.302 30.78875 34.5435 30.61475 34.6875 30.34375 L 47.84375 5.53125 C 48.00775 5.22125 47.9935 4.83125 47.8125 4.53125 C 47.6325 4.23125 47.2885 4.0625 46.9375 4.0625 L 36.875 4.0625 z M 21.71875 23.71875 C 14.99875 25.25975 13.36625 30.6795 11.78125 35.9375 C 10.21625 41.1285 8.7345 46.0305 2.6875 48.0625 C 2.2235 48.2185 1.921 48.67325 2 49.15625 C 2.079 49.63925 2.51 50 3 50 C 22.549 50 32.46375 47.335 33.59375 32.875 C 33.44875 32.884 33.3355 32.9375 33.1875 32.9375 C 30.0995 32.9375 25.99325 30.817 23.65625 28 C 22.33525 26.409 21.83775 24.93075 21.71875 23.71875 z"/>
        </svg>
      </button>

      <!-- spray -->
      <button v-if="false" @click="$emit('setTool', 'spray')" class="w-10 h-10 border rounded-md flex items-center justify-center" :class="[tool==='spray'?'border-teal-900 bg-teal-700 text-white':'border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400']">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 50 50" enable-background="new 0 0 50 50">
          <path d="M 30.6875 2.5 C 30.3875 2.5 30.2 2.6125 30 2.8125 L 24.15625 8.625 L 24.125 8.59375 L 19.8125 12.90625 L 39.46875 32.5625 L 42.25 29.78125 L 42.3125 29.8125 L 49.6875 22.40625 C 49.8875 22.20625 50 21.9875 50 21.6875 L 30.6875 2.5 z M 18.59375 14.5 L 12.59375 27.90625 L 7.5 33 C 7.1 33.4 7.1 34.00625 7.5 34.40625 L 18 44.90625 C 18.2 45.10625 18.4875 45.1875 18.6875 45.1875 C 18.8875 45.1875 19.20625 45.10625 19.40625 44.90625 L 24.5 39.8125 L 37.90625 33.8125 L 18.59375 14.5 z M 6.6875 36.40625 L 0.3125 42.8125 C 0.1125 43.1125 -3.7007434e-17 43.5125 0 43.8125 C 0.1 44.1125 0.29375 44.4 0.59375 44.5 L 11.90625 48.90625 C 12.00625 48.90625 12.1125 49 12.3125 49 C 12.6125 49 12.8 48.8875 13 48.6875 L 16 45.6875 L 6.6875 36.40625 z"/>
        </svg>
      </button>

      <!-- pencil -->
      <button @click="$emit('setTool', 'pencilbrush')" class="w-10 h-10 border rounded-md flex items-center justify-center" :class="[tool==='pencilbrush'?'border-teal-900 bg-teal-700 text-white':'border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400']">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 50 50">
          <path d="M 35.8125 2 C 35.5625 2 35.29375 2.1125 35.09375 2.3125 L 9.09375 28.3125 C 8.99375 28.4125 8.90625 28.4875 8.90625 28.6875 L 2.09375 46.6875 C 1.89375 46.9875 2.0125 47.3875 2.3125 47.6875 C 2.5125 47.8875 2.7 48 3 48 C 3.1 48 3.20625 48.00625 3.40625 47.90625 L 21.40625 41.09375 C 21.50625 40.99375 21.7125 41.00625 21.8125 40.90625 L 23.40625 39.3125 L 47.6875 15 C 47.8875 14.7 48 14.4875 48 14.1875 C 48 13.8875 47.8875 13.7 47.6875 13.5 L 36.5 2.3125 C 36.3 2.1125 36.0625 2 35.8125 2 z M 11.09375 29.1875 C 11.59375 30.1875 11.4 31.2875 11 32.1875 C 10.8 32.5875 11.00625 33.1125 11.40625 33.3125 C 11.80625 33.6125 12.29375 33.5125 12.59375 33.3125 C 13.29375 32.8125 15.89375 31.60625 17.09375 32.90625 C 18.29375 34.10625 17.3125 36.60625 16.8125 37.40625 C 16.5125 37.70625 16.5125 38.19375 16.8125 38.59375 C 17.1125 38.89375 17.50625 39.1 17.90625 39 C 19.20625 38.6 20.20625 38.8 20.90625 39 L 20.5 39.40625 L 9.375 43.5625 L 6.5 40.59375 L 10.6875 29.59375 L 11.09375 29.1875 z"/>
        </svg>
      </button>

      <button v-if="false" @click="$emit('setTool', 'eraser')" class="w-10 h-10 border rounded-md flex items-center justify-center" :class="[tool==='eraser'?'border-teal-900 bg-teal-700 text-white':'border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400']">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 50 50">
          <path d="M 32.59375 4.03125 C 31.809125 4.03125 31.03875 4.2985 30.46875 4.875 L 3.875 31.75 C 2.705 32.933 2.704 34.8765 3.875 36.0625 L 13.4375 45.71875 C 13.6275 45.90975 13.88725 46 14.15625 46 L 17.1875 46 L 22.625 46 L 41 46 A 1.010601 1.010601 0 1 0 41 44 L 25.03125 44 L 34.5 34.4375 L 47.125 21.6875 C 48.296 20.5025 48.297 18.558 47.125 17.375 L 34.75 4.875 C 34.1785 4.2985 33.378375 4.03125 32.59375 4.03125 z M 18 20.375 L 32.3125 33.78125 L 22.21875 44 L 17.125 44 L 14.5625 44 L 5.3125 34.625 C 4.9165 34.224 4.9175 33.5865 5.3125 33.1875 L 18 20.375 z"/>
        </svg>
      </button>

      <span class="w-4"></span>

      <div class="w-64">
        <TWSlider
          v-model="editor.parameters.brushSize"
          :min="2"
          :max="300"
          :interval="2"
          :shiftInterval="1"
          :range="[2, 75, 150, 225, 300]"
          :snap="[2, 75, 150, 225, 300]"
          :snapThreshold="0.05"
          @change="$emit('setBrushSize', $event)"
          class="flex-1 pr-6"
        />
      </div>

      <span class="w-4"></span>

      <!-- crop -->
      <button v-if="false" @keydown.space.stop.prevent @click="$emit('crop')" class="w-10 h-10 border rounded-md flex items-center justify-center border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 50 50">
          <path d="M 9 3 C 8.448 3 8 3.448 8 4 L 8 41 C 8 41.553 8.448 42 9 42 L 46 42 C 46.553 42 47 41.553 47 41 L 47 35 C 47 34.447 46.553 34 46 34 L 16 34 L 16 4 C 16 3.448 15.552 3 15 3 L 9 3 z M 4 8 C 3.448 8 3 8.448 3 9 L 3 15 C 3 15.552 3.448 16 4 16 L 6 16 L 6 8 L 4 8 z M 18 8 L 18 16 L 34 16 L 34 32 L 42 32 L 42 9 C 42 8.448 41.553 8 41 8 L 18 8 z M 34 44 L 34 46 C 34 46.553 34.447 47 35 47 L 41 47 C 41.553 47 42 46.553 42 46 L 42 44 L 34 44 z"/>
        </svg>
      </button>

      <!-- undo -->
      <button v-if="false" @keydown.space.stop.prevent @click="$emit('undo')" class="w-10 h-10 border rounded-md flex items-center justify-center border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"></path>
        </svg>
      </button>

      <!-- redo -->
      <button v-if="false" @keydown.space.stop.prevent @click="$emit('redo')" class="w-10 h-10 border rounded-md flex items-center justify-center border-zinc-300 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"></path>
        </svg>
      </button>
    </dt>

    <div class="w-64 flex items-center justify-end space-x-3">
      <button ref="loadImageButton">
        <FolderPlusIcon class="tw-icon w-6 h-6"/>
      </button>

      <!-- reset state -->
      <button @click="$emit('reset')">
        <TrashIcon class="tw-icon h-6 w-6"/>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEditorStore, storeToRefs } from '@/stores'
import TWSlider from '@/components/UI/TWSlider.vue'
import { TrashIcon, FolderPlusIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  canvas: { type: String, required: false, default: null },
  tool: { type: String, required: true },
  width: { type: Number, required: false, default: 768 },
  height: { type: Number, required: false, default: 768 },
})

const { editor } = storeToRefs(useEditorStore())


</script>
