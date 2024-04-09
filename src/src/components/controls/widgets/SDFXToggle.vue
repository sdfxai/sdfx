<template>
  <ControllerWidget
    class="SDFXToggle"
    valueType="boolean"
    @change="$emit('change', $event)"
    v-bind="props" v-slot="{scope}"
  >
    <h2 v-if="showLabel" class="tw-formlabel capitalize flex-1 truncate">
      {{ label }}
    </h2>
    <TWToggle
      :modelValue="Boolean(scope.val)"
      :id="id"
      :color="scope.option?.color"
      :readonly="scope.option?.readonly"
      :disabled="disabled || loading"
      @change="scope.change($event)"
    />
  </ControllerWidget>
</template>
<script setup lang="ts">
import ControllerWidget from '@/components/controls/ControllerWidget.vue'
import TWToggle from '@/components/UI/TWToggle.vue'
import { PropType } from 'vue';

const emit = defineEmits(['toggle', 'change'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  uid: { type: String, required: false, default: null },
  label: { type: String, required: false, default: null },
  target: { type: Object, required: true },
  showLabel: { type: Boolean, required: false, default: true },
  disabled: { type: Boolean, required: false, default: false },
  loading: { type: Boolean, required: false, default: false },
})

</script>
