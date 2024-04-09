<template>
  <section class="litegraph relative w-full h-full overflow-hidden">
    <canvas ref="canvasRef" class="absolute" />
    <div v-if="loading" class="bg-zinc-950/75 z-10 absolute inset-0 flex items-center justify-center">
      <SpinLoader class="w-8 h-8 text-zinc-500"/>
    </div>

    <!-- search bar -->
    <NodeSearch class="absolute left-0 bottom-0 z-[30]"/>

    <!-- bottom toolbar -->
    <div class="absolute right-0 bottom-0 z-[200] overflow-hidden shadow border border-zinc-100 dark:border-zinc-800/60 font-semibold bg-white dark:bg-zinc-950/80 m-3 flex rounded-full divide-x divide-zinc-200 dark:divide-zinc-800/80">
      <button @click="zoomIn()" class="overflow-hidden px-5 py-3 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-200">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 122.879 119.801" enable-background="new 0 0 122.879 119.801" xml:space="preserve"><g><path d="M49.991,0h0.015v0.006c13.794,0.004,26.294,5.601,35.336,14.645c9.026,9.031,14.618,21.515,14.628,35.303h0.006v0.034v0.04 h-0.006c-0.005,5.557-0.918,10.905-2.594,15.892c-0.281,0.837-0.576,1.641-0.877,2.409v0.007c-1.446,3.661-3.315,7.12-5.548,10.307 l29.08,26.14l0.018,0.015l0.157,0.146l0.012,0.012c1.641,1.563,2.535,3.656,2.648,5.779c0.11,2.1-0.538,4.248-1.976,5.971 l-0.011,0.016l-0.176,0.204l-0.039,0.046l-0.145,0.155l-0.011,0.011c-1.563,1.642-3.656,2.539-5.782,2.651 c-2.104,0.111-4.254-0.54-5.975-1.978l-0.012-0.012l-0.203-0.175l-0.029-0.024L78.764,90.865c-0.88,0.62-1.779,1.207-2.687,1.763 c-1.234,0.756-2.51,1.467-3.816,2.117c-6.699,3.342-14.266,5.223-22.27,5.223v0.006h-0.016v-0.006 c-13.797-0.005-26.297-5.601-35.334-14.644l-0.004,0.005C5.608,76.3,0.016,63.81,0.007,50.021H0v-0.033v-0.016h0.007 c0.005-13.799,5.601-26.297,14.646-35.339C23.684,5.607,36.169,0.015,49.958,0.006V0H49.991L49.991,0z M67.787,43.397 c1.21-0.007,2.353,0.312,3.322,0.872l-0.002,0.002c0.365,0.21,0.708,0.454,1.01,0.715c0.306,0.264,0.594,0.569,0.851,0.895h0.004 c0.873,1.11,1.397,2.522,1.394,4.053c-0.003,1.216-0.335,2.358-0.906,3.335c-0.454,0.78-1.069,1.461-1.791,1.996 c-0.354,0.261-0.751,0.496-1.168,0.688v0.002c-0.823,0.378-1.749,0.595-2.722,0.6l-11.051,0.08l-0.08,11.062 c-0.004,1.034-0.254,2.02-0.688,2.886c-0.188,0.374-0.417,0.737-0.678,1.074l-0.006,0.007c-0.257,0.329-0.551,0.644-0.866,0.919 c-1.169,1.025-2.713,1.649-4.381,1.649v-0.007c-0.609,0-1.195-0.082-1.743-0.232c-1.116-0.306-2.115-0.903-2.899-1.689 c-0.788-0.791-1.377-1.787-1.672-2.893v-0.006c-0.144-0.543-0.22-1.128-0.215-1.728v-0.005l0.075-10.945l-10.962,0.076 c-1.209,0.011-2.354-0.31-3.327-0.873l0.002-0.002c-0.37-0.212-0.715-0.458-1.016-0.722c-0.306-0.264-0.589-0.567-0.844-0.891 h-0.004c-0.873-1.112-1.397-2.522-1.393-4.053c0.002-1.213,0.337-2.354,0.906-3.328l-0.004-0.002 c0.376-0.642,0.869-1.225,1.442-1.714h0.004c0.574-0.489,1.236-0.883,1.942-1.151c0.704-0.266,1.484-0.418,2.296-0.423 l11.051-0.082l0.08-11.062c0.004-1.207,0.345-2.345,0.921-3.309l0.004,0.002c0.224-0.374,0.467-0.715,0.727-1.003 c0.264-0.296,0.576-0.584,0.908-0.839l0.005-0.004v0.002c1.121-0.861,2.533-1.379,4.055-1.375c1.211,0.002,2.352,0.332,3.317,0.897 c0.479,0.279,0.928,0.631,1.32,1.025l0.004-0.004c0.383,0.383,0.73,0.834,1.019,1.333c0.56,0.968,0.879,2.104,0.868,3.304 l-0.075,10.942L67.787,43.397L67.787,43.397z M50.006,11.212v0.006h-0.015h-0.034v-0.006C39.274,11.219,29.59,15.56,22.581,22.566 l0.002,0.002c-7.019,7.018-11.365,16.711-11.368,27.404h0.006v0.016v0.033h-0.006c0.006,10.683,4.347,20.365,11.354,27.377 l0.002-0.002c7.018,7.018,16.711,11.365,27.404,11.367v-0.007h0.016h0.033v0.007c10.685-0.007,20.367-4.348,27.381-11.359 c7.012-7.009,11.359-16.702,11.361-27.401H88.76v-0.015v-0.034h0.007C88.76,39.273,84.419,29.591,77.407,22.58v-0.007 C70.398,15.562,60.705,11.214,50.006,11.212L50.006,11.212z"/></g></svg>
      </button>
      <button @click="zoomFull()" class="overflow-hidden w-20 px-5 py-3 text-zinc-500 text-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-200 uppercase">
        {{ `${(canvasSettings.zoom*100).toFixed(0)}%` }}
      </button>
      <button @click="zoomFit()" class="overflow-hidden px-5 py-3 text-zinc-500 text-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-200 uppercase">
        Fit
      </button>
      <button @click="zoomOut()" class="overflow-hidden px-5 py-3 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-200">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 122.879 119.801" enable-background="new 0 0 122.879 119.801" xml:space="preserve"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M49.991,0h0.015v0.006c13.794,0.004,26.294,5.601,35.336,14.645 c9.026,9.031,14.618,21.515,14.628,35.303h0.006v0.034v0.04h-0.006c-0.005,5.557-0.918,10.905-2.594,15.892 c-0.281,0.837-0.576,1.641-0.877,2.409v0.007c-1.446,3.661-3.315,7.12-5.548,10.307l29.08,26.14l0.018,0.015l0.157,0.146 l0.012,0.012c1.641,1.563,2.535,3.656,2.648,5.779c0.11,2.1-0.538,4.248-1.976,5.971l-0.011,0.016l-0.176,0.204l-0.039,0.046 l-0.145,0.155l-0.011,0.011c-1.563,1.642-3.656,2.539-5.782,2.651c-2.104,0.111-4.254-0.54-5.975-1.978l-0.012-0.012l-0.203-0.175 l-0.029-0.024L78.764,90.865c-0.88,0.62-1.779,1.207-2.687,1.763c-1.234,0.756-2.51,1.467-3.816,2.117 c-6.699,3.342-14.266,5.223-22.27,5.223v0.006h-0.016v-0.006c-13.797-0.005-26.297-5.601-35.334-14.644l-0.004,0.005 C5.608,76.3,0.016,63.81,0.007,50.021H0v-0.033v-0.016h0.007c0.005-13.799,5.601-26.297,14.646-35.339 C23.684,5.607,36.169,0.015,49.958,0.006V0H49.991L49.991,0z M67.787,43.397c1.21-0.007,2.353,0.312,3.322,0.872l-0.002,0.002 c0.365,0.21,0.708,0.454,1.01,0.715c0.306,0.264,0.594,0.569,0.851,0.895h0.004c0.873,1.11,1.397,2.522,1.394,4.053 c-0.003,1.216-0.335,2.358-0.906,3.335c-0.454,0.78-1.069,1.461-1.791,1.996c-0.354,0.261-0.751,0.496-1.168,0.688v0.002 c-0.823,0.378-1.749,0.595-2.722,0.6l-35.166,0.248c-1.209,0.011-2.354-0.31-3.327-0.873l0.002-0.002 c-0.37-0.212-0.715-0.458-1.016-0.722c-0.306-0.264-0.589-0.567-0.844-0.891h-0.004c-0.873-1.112-1.397-2.522-1.393-4.053 c0.002-1.213,0.337-2.354,0.906-3.328l-0.004-0.002c0.376-0.642,0.869-1.225,1.442-1.714h0.004 c0.574-0.489,1.236-0.883,1.942-1.151c0.704-0.266,1.484-0.418,2.296-0.423L67.787,43.397L67.787,43.397z M50.006,11.212v0.006 h-0.015h-0.034v-0.006C39.274,11.219,29.59,15.56,22.581,22.566l0.002,0.002c-7.019,7.018-11.365,16.711-11.368,27.404h0.006v0.016 v0.033h-0.006c0.006,10.683,4.347,20.365,11.354,27.377l0.002-0.002c7.018,7.018,16.711,11.365,27.404,11.367v-0.007h0.016h0.033 v0.007c10.685-0.007,20.367-4.348,27.381-11.359c7.012-7.009,11.359-16.702,11.361-27.401H88.76v-0.015v-0.034h0.007 C88.76,39.273,84.419,29.591,77.407,22.58v-0.007C70.398,15.562,60.705,11.214,50.006,11.212L50.006,11.212z"/></g></svg>
      </button>
    </div>
    </section>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useGraphStore, storeToRefs } from '@/stores'
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import SpinLoader from '@/components/UI/SpinLoader.vue'
import NodeSearch from '@/views/OpenGraph/components/NodeSearch.vue'
import '@/components/LiteGraph/LiteGraph.css'

const graphStore = useGraphStore()
const { nodegraph, canvasSettings } = storeToRefs(graphStore)

const loading = ref(false)
const canvasRef = ref(null)

const zoomIn = () => {
  sdfx.zoomIn()
}

const zoomOut = () => {
  sdfx.zoomOut()
}

const zoomFull = () => {
  sdfx.setGraphZoom(1.0)
}

const zoomFit = () => {
  sdfx.zoomFit()
}

onMounted(async ()=>{
  loading.value = true
  await sdfx.setup(canvasRef.value)
  loading.value = false

  const workflow = graphStore.getCurrentWorkflow()
  if (workflow) {
    await sdfx.loadGraphData(workflow)
  }
})

onBeforeUnmount(() => {
  sdfx.removeListeners()
})
</script>

<style type="text/css">
.sdfx-img-preview {
  pointer-events: none;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: center;
}

.sdfx-img-preview img {
  object-fit: contain;
  width: var(--sdfx-img-preview-width);
  height: var(--sdfx-img-preview-height);
}

.sdfx-textarea {
  @apply absolute p-3 bg-zinc-900 text-white text-lg leading-6;
  color: var(--input-text);
  overflow: hidden;
  overflow-y: auto;
  resize: none;
  border: none;
  box-sizing: border-box;
}

.sdfx-context-menu-filter {
  box-sizing: border-box;
  border: 1px solid #999;
  margin: 0 0 5px 5px;
  width: calc(100% - 10px);
}

/* Input popup */

.litegraph .graphdialog {
  @apply bg-zinc-800 rounded-md flex items-center justify-between;
  z-index: 9999 !important;
}

.litegraph .graphdialog .name {
  @apply text-lg text-zinc-200;
}

.litegraph .graphdialog input.value {
  @apply bg-zinc-900 px-4 py-2 border border-zinc-800 text-zinc-100 text-lg rounded-md;
}

.litegraph .graphdialog button {
  @apply mt-0 flex items-center justify-center text-sm px-4 py-2 bg-teal-700 hover:bg-teal-500 text-white rounded-md;
}

.litegraph .graphdialog textarea, .graphdialog select {
  background-color: var(--input-bg);
  border: 1px solid;
  border-color: var(--border-color);
  color: var(--input-text);
  border-radius: 12px 0 0 12px;
}

/* Dialogs */

dialog {
  box-shadow: 0 0 20px #888888;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

/* Context menu */

.litegraph .dialog {
  z-index: 1;
}

.litegraph .litemenu-entry.has_submenu {
  @apply relative border-none pr-4;
}

.litemenu-entry.has_submenu::after {
  content: url("data:image/svg+xml,%3Csvg fill='none' width='0.8rem' height='0.8rem' stroke='%2352525b' stroke-width='1.5' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5'%3E%3C/path%3E%3C/svg%3E");
  @apply absolute top-px right-1 flex items-center h-full;
}

.litegraph.litecontextmenu,
.litegraph.litecontextmenu.dark {
  z-index: 9999 !important;
  @apply rounded-md px-0 m-0;
}

.litegraph.litecontextmenu::-webkit-scrollbar,
.litegraph .helper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: #d4d4d8;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.litegraph.litecontextmenu::-webkit-scrollbar-thumb,
.litegraph .helper::-webkit-scrollbar-thumb {
  background: #52525b;
}

.litegraph.litecontextmenu {
  @apply min-w-[180px] max-w-[240px] py-2 bg-zinc-900;
}

.litegraph.litecontextmenu .litemenu-entry.submenu {
  @apply truncate px-0 m-0;
}

.litegraph.litecontextmenu .litemenu-entry:not(.disabled):not(.separator) {
  @apply bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white;
}

.litegraph.litecontextmenu .litemenu-entry.submenu.disabled {
  @apply bg-transparent text-zinc-600;
}

.litegraph.litecontextmenu .litemenu-entry.submenu.separator {
  @apply bg-zinc-800 h-[1px] p-0 mt-1 mb-1 border-none;
}

/*
.litegraph.litecontextmenu .litemenu-entry:first-child {
  @apply rounded-t-md;
}
.litegraph.litecontextmenu .litemenu-entry:last-child {
  @apply rounded-b-md;
}
*/

.litegraph.litecontextmenu .litemenu-entry.submenu,
.litegraph.litecontextmenu.dark .litemenu-entry.submenu {
  @apply my-0 bg-white px-3 py-[0.30rem] text-xs capitalize text-zinc-700 font-semibold;
}

.litegraph.litecontextmenu input {
  @apply bg-white px-3 py-1.5 mt-2;
}

.graphdialog button.rounded,
.graphdialog input.rounded {
   border-radius: 0 12px 12px 0;
}

/* Search box */

.litegraph.litesearchbox {
  z-index: 9999 !important;
  @apply overflow-hidden rounded-md block bg-zinc-700 text-zinc-700;
}

.litegraph.litesearchbox .name {
  @apply text-zinc-100;
}

.litegraph.litesearchbox input,
.litegraph.litesearchbox select {
  @apply rounded-sm bg-zinc-900;
}

.litegraph.lite-search-item {
  @apply text-zinc-100 pl-1;
  background-color: var(--input-bg);
}

.litegraph.lite-search-item.generic_type {
  color: var(--input-text);
  filter: brightness(50%);
}
</style>
