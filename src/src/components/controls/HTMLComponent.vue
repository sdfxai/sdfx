<template>
  <SDFXWidget
    v-if="type==='control'"
    :id="id"
    :label="label"
    :class="props.class"
    :type="type"
    :component="component"
    :defaults="defaults"
    :target="target"
    :showLabel="showLabel"
    :loading="loading"
    :disabled="disabled"
    @action="action($event)"
    @change="change($event)"
    @click="click($event)"
    @dblclick="dblclick($event)"
  />
  <template v-else-if="component==='textNode'">
    {{ innerText }}
  </template>
  <HTMLComp
    v-else
    :id="id"
    :label="label"
    :class="props.class"
    :type="type"
    :component="component"
    :defaults="defaults"
    :target="target"
    :showLabel="showLabel"
    :attributes="attributes"
    :innerText="innerText"
    :childrin="childrin"
    :loading="loading"  
    :disabled="disabled"
    @action="action($event)"
    @change="change($event)"
    @click="click($event)"
    @dblclick="dblclick($event)"
  />
</template>
<script setup lang="ts">
import { PropType } from 'vue'
import HTMLComp from '@/components/controls/HTMLComp.vue'
import SDFXWidget from '@/components/controls/SDFXWidget.vue'

const emit = defineEmits(['change', 'action', 'click', 'dblclick'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  label: { type: String, required: false, default: null },
  class: { type: String as any, required: false, default: null },
  type: { type: String as any, required: false, default: null },
  component: { type: String as any, required: true },
  defaults: { type: Object, required: false, default: null },
  target: { type: Object, required: false, default: null },
  showLabel: { type: Boolean, required: false, default: true },
  attributes: { type: Object as any, required: false, default:()=>({}) },
  innerText: { type: String as any, required: false, default: null },
  childrin: { type: Array as PropType<any[]>, required: false, default:null },
  loading: { type: Boolean, required: false, default: false },
  disabled: { type: Boolean, required: false, default: false }
})

const action = (e: any) => {
  emit('action', e)
}

const change = (e: any) => {
  emit('change', e)
}

const click = (e: any) => {
  emit('click', e)
}

const dblclick = (e: any) => {
  emit('dblclick', e)
}
</script>
