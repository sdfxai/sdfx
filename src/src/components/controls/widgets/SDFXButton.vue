<template>
  <ControllerWidget class="SDFXButton" @click="$emit('click', $event)" v-bind="props" v-slot="{scope}">
    <button
      class="tw-button flex-1 w-full transparent capitalize"
      :disabled="disabled || loading"
      @click="scope.click($event)"
    >
      {{ label }}
    </button>
  </ControllerWidget>
</template>
<script setup lang="ts">
import ControllerWidget from '@/components/controls/ControllerWidget.vue'

const emit = defineEmits(['click'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  label: { type: String, required: false, default: null },
  options: { type: Array, required: true },
  target: { type: Object, required: true },
  showLabel: { type: Boolean, required: false, default: true },
  disabled: { type: Boolean, required: false, default: false },
  loading: { type: Boolean, required: false, default: false },
})
</script>
