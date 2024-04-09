<template>
  <ControllerWidget class="SDFXSlider" valueType="number" @change="$emit('change', $event)" v-bind="props" v-slot="{scope}">
    <h2 v-if="showLabel" class="tw-formlabel capitalize w-12 lg:w-16 xl:w-24 truncate">
      {{ label }}
    </h2>
    <TWSlider
      v-model="scope.val"
      :id="id"
      :name="target?.widgetNames?.[0]"
      :color="scope.option?.color"
      :min="scope.option?.min"
      :max="scope.option?.max"
      :interval="scope.option?.interval"
      :shiftInterval="scope.option?.shiftInterval"
      :range="scope.option?.range"
      :snap="scope.option?.snap"
      :snapThreshold="scope.option?.snapThreshold"
      :zeroPoint="scope.option?.zeroPoint"
      :readonly="scope.option?.readonly"
      :disabled="disabled || loading"
      :animate="scope.animate"
      @change="scope.change($event)"
      class="flex-1 w-full"
    />
    <span class="w-8 xl:w-10 flex-shrink-0 font-mono text-right">
      {{ scope.val!==undefined && scope.val!==null && typeof scope.val === 'number' ? scope.val.toFixed(scope.option?.precision) : 0 }}
    </span>
  </ControllerWidget>
</template>
<script setup lang="ts">
import { PropType } from 'vue'
import ControllerWidget from '@/components/controls/ControllerWidget.vue'
import TWSlider from '@/components/UI/TWSlider.vue'

const emit = defineEmits(['change'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  label: { type: String, required: false, default: null },
  options: { type: Array as PropType<any[]>, required: true },
  target: { type: Object, required: true },
  showLabel: { type: Boolean, required: false, default: true },
  disabled: { type: Boolean, required: false, default: false },
  loading: { type: Boolean, required: false, default: false }
})
</script>
