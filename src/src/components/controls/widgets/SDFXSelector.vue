<template>
  <ControllerWidget class="SDFXSelector" valueType="string" @change="$emit('change', $event)" v-bind="props" v-slot="{scope}">
    <h2 v-if="showLabel" class="tw-formlabel capitalize w-1/3 truncate">
      {{ label }}
    </h2>
    <TWSelector
      v-model="scope.val"
      :id="id"
      :label="label"
      :options="scope.selectorOptionList"
      :showLabel="false"
      :showOptional="false"
      :disabled="disabled || loading"
      @change="scope.change($event)"
      class="flex-1"
      :class="[showLabel?'w-2/3':'w-full']"
    />
  </ControllerWidget>
</template>
<script setup lang="ts">
import ControllerWidget from '@/components/controls/ControllerWidget.vue'
import TWSelector from '@/components/UI/TWSelector.vue'

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
