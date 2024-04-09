<template>
  <ul v-if="components" class="componentMappingTree text-base">
    <li v-for="(comp, idx) in components" :key="idx" class="text-zinc-500">
      <ComponentItem :comp="comp" @select="$emit('select', $event)"/>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import ComponentItem from '@/views/OpenGraph/components/ComponentItem.vue'
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'

const props = defineProps({
  components: { type: Array as PropType<any[]>, required: false }
})
</script>
