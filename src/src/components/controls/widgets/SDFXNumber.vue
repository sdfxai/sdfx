<template>
  <ControllerWidget class="SDFXNumber" valueType="number" @change="$emit('change', $event)" v-bind="props" v-slot="{scope}">
    <h2 v-if="showLabel" class="tw-formlabel capitalize w-1/3 truncate">
      {{ label }}
    </h2>
    <TWInputNumber
      :modelValue="Number(scope.val)"
      :id="id"
      :min="scope.option?.min"
      :max="scope.option?.max"
      :precision="scope.option?.precision"
      :showOptional="scope.option?.showOptional"
      :readonly="scope.option?.readonly"
      :disabled="disabled || loading"
      @change="scope.change($event)"
      @blur="scope.change($event)"
      class="flex-1"
      :class="[showLabel?'w-2/3':'w-full']"
    />
  </ControllerWidget>
</template>
<script setup lang="ts">
import ControllerWidget from '@/components/controls/ControllerWidget.vue'
import TWInputNumber from '@/components/UI/TWInputNumber.vue'

const emit = defineEmits(['change'])

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
