<template>
  <ControllerBox class="BoxDimensions" @change="$emit('change', $event)" v-bind="props" v-slot="{scope}">
    <Box :title="label" :isScrollable="false">
      <div class="p-4">
        <ImageInputDimensions
          :id="id"
          :values="scope.values"
          :options="scope.options"
          :disabled="disabled || loading"
          @change="scope.change($event)"
        />
      </div>
    </Box>
  </ControllerBox>
</template>
<script setup lang="ts">
import { PropType } from 'vue'
import Box from '@/components/UI/Box.vue'
import ControllerBox from '@/components/controls/ControllerBox.vue'
import ImageInputDimensions from '@/components/ImageInputDimensions.vue'

const emit = defineEmits(['change'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  uid: { type: String, required: false, default: null },
  label: { type: String, required: false, default: null },
  options: { type: Array as PropType<any[]>, required: true },
  target: { type: Object, required: true },
  showLabel: { type: Boolean, required: false, default: true },
  disabled: { type: Boolean, required: false, default: false },
  loading: { type: Boolean, required: false, default: false },
})
</script>
