<template>
  <ControllerWidget class="SDFXInput" valueType="string" @change="$emit('change', $event)" v-bind="props" v-slot="{scope}">
    <h2 v-if="showLabel" class="tw-formlabel capitalize w-1/3 truncate">
      {{ label }}
    </h2>
    <TWInput
      v-model="scope.val"
      :id="id"
      :color="scope.option?.color" 
      :prefix="scope.option?.prefix"
      :suffix="scope.option?.suffix" 
      :showOptional="scope.option?.showOptional"
      :placeholder="scope.option?.placeholder"
      :readonly="scope.option?.readonly"
      :required="scope.option?.required"
      :maxlength="scope.option?.maxlength"
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
import TWInput from '@/components/UI/TWInput.vue'

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
