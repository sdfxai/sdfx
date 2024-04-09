<template>
  <ControllerNodeAction class="NodeToggle" valueType="boolean" @action="$emit('action', $event)" v-bind="props" v-slot="{scope}">
    <h2 v-if="showLabel" class="tw-formlabel capitalize flex-1 truncate">
      {{ label }}
    </h2>
    <TWToggle
      v-model="scope.val"
      :id="id"
      :color="scope.option?.color"
      :readonly="scope.option?.readonly"
      :disabled="disabled || loading"
      @change="scope.action($event)"
    />
  </ControllerNodeAction>
</template>
<script setup lang="ts">
import ControllerNodeAction from '@/components/controls/ControllerNodeAction.vue'
import TWToggle from '@/components/UI/TWToggle.vue'

const emit = defineEmits(['toggle', 'action'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  label: { type: String, required: false, default: null },
  target: { type: Object, required: true },
  showLabel: { type: Boolean, required: false, default: true },
  disabled: { type: Boolean, required: false, default: false },
  loading: { type: Boolean, required: false, default: false },
})
</script>
