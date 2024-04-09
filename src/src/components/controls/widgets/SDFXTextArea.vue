<template>
  <ControllerWidget class="SDFXTextArea" valueType="string" @change="$emit('change', $event)" v-bind="props" v-slot="{scope}">
    <TWTextarea
      v-model="scope.val"
      :id="id"
      :label="label"
      :limit="scope.option?.limit" 
      :rows="scope.option?.rows"
      :height="scope.option?.height" 
      :minheight="scope.option?.minheight"
      :showOptional="scope.option?.showOptional"
      :placeholder="scope.option?.placeholder"
      :readonly="scope.option?.readonly"
      :required="scope.option?.required"
      :disabled="disabled || loading"
      @change="scope.change($event)"
      @blur="scope.change($event)"
      class="flex-1 w-full"
    />
  </ControllerWidget>
</template>
<script setup lang="ts">
import ControllerWidget from '@/components/controls/ControllerWidget.vue'
import TWTextarea from '@/components/UI/TWTextarea.vue'

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
