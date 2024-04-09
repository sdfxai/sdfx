<template>
  <Splitpanes :id="id" vertical :push-other-panes="true">
    <HTMLComponent
      v-for="(item, idx) in childrin"
      :key="idx"
      v-bind="item"
    />
  </Splitpanes>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
// @ts-ignore
import { Splitpanes } from 'splitpanes'
import HTMLComponent from '@/components/controls/HTMLComponent.vue'

const props = defineProps({
  id: { type: String, required: false, default: null },
  childrin: { type: Array as PropType<any[]>, required: false, default: null }
})
</script>