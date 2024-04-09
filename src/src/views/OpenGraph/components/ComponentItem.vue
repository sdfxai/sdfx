<template>
  <dt
    :comp="comp.component"
    :label="comp.label"
    :target="comp.target?.nodeId"
    class="group truncate flex items-center bg-gradient-to-r dark:hover:from-transparent dark:hover:to-zinc-900"
    @click.stop.prevent="select(comp)"
  >
    <!-- collapsable arrow before HTMLComponent with children -->
    <button v-if="comp.childrin" @click="showChildren=!showChildren">
      <svg :class="[showChildren?'rotate-90':'']" class="duration-300 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"></path>
      </svg>
    </button>
    <!-- vertical line before SDFXWidget -->
    <div v-else class="ml-2 w-2 flex-shrink-0 border-l border-zinc-300 dark:border-zinc-800">&nbsp;</div>

    <!-- opening component tag -->
    <span class="font-bold" :class="comp.type==='control'?'text-green-800 dark:text-green-300':'text-pink-800 dark:text-pink-300'">
      <span class="text-zinc-400 dark:text-zinc-600">{{ '<' }}</span>{{ comp.component }}<span v-if="comp.label" class="ml-2 text-zinc-400 dark:text-zinc-500 font-normal italic">{{ 'label="' }}<span class="text-zinc-700 dark:text-zinc-200 font-semibold">{{ comp.label }}</span>{{ '"' }}</span><span class="text-zinc-400 dark:text-zinc-600">{{ '>' }}</span>
    </span>
    
    <!-- target -->
    <span v-if="comp.target" class="ml-2 hidden group-hover:block">
      <span v-if="comp.target?.nodeId">-->[{{ '#'+comp.target?.nodeId }}]</span>
      <span v-if="comp.target?.widgetNames" class="ml-2">-->({{ comp.target?.widgetNames?.[0] }})</span>
    </span>
  </dt>

  <ul v-if="comp.childrin && showChildren" :comp="comp.component" class="ml-2">
    <li v-for="(child, idx) in comp.childrin" :key="idx" :comp="child.component" :label="comp.label">
      <ComponentItem :comp="child" @select="select($event)"/>
    </li>
  </ul>

  <!-- closing component tag -->
  <span v-if="comp.childrin && showChildren" class="ml-4 font-bold" :class="comp.type==='control'?'text-green-800 dark:text-green-300':'text-pink-800 dark:text-pink-300'">
    <span class="text-zinc-400 dark:text-zinc-600">{{ '</' }}</span>{{ comp.component }}<span class="text-zinc-400 dark:text-zinc-600">{{ '>' }}</span>
  </span>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import ComponentItem from '@/views/OpenGraph/components/ComponentItem.vue'

const emit = defineEmits(['select'])

const showChildren = ref(true)

const props = defineProps({
  comp: { type: Object, required: true }
})

const select = (comp: any) => {
  emit('select', comp)
}
</script>
<style scoped>
ul {
  list-style-type: none;
  padding-left: 1.00rem;
}
</style>
