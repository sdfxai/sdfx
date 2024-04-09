<template>
  <pane :id="id">
    <HTMLComponent
      v-for="(item, idx) in childrin"
      :key="idx"
      v-bind="item"
    />
  </pane>
</template>

<script setup lang="ts">
// @ts-ignore
import { Pane } from 'splitpanes'
import HTMLComponent from '@/components/controls/HTMLComponent.vue'
import { PropType } from 'vue';

const props = defineProps({
  id: { type: String, required: false, default: null },
  childrin: { type: Array as PropType<any[]>, required: false, default: null }
})
</script>