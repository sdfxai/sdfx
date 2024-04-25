<template>
  <ControllerWidget class="SDFXImageLoader" valueType="string" @change="$emit('change', $event)" v-bind="props" v-slot="{scope}">
    <Box :title="label" :expand="expand" class="Image Loader" :isScrollable="false">
      <ImageLoader
        v-model="scope.val"
        :loading="loading"
        :options="scope.selectorOptionList"
        :disabled="disabled || loading"
        :expand="expand"
        :label="label"
        :showLabel="showLabel"
        @change="scope.change($event)"
        @upload="scope.upload($event)"
        class="p-4 w-full"
      />
    </Box>
  </ControllerWidget>
</template>
<script setup lang="ts">
import ControllerWidget from '@/components/controls/ControllerWidget.vue'
import ImageLoader from '@/components/ImageLoader.vue'
import Box from '@/components/UI/Box.vue'

const emit = defineEmits(['change'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  label: { type: String, required: false, default: null },
  options: { type: Array, required: true },
  target: { type: Object, required: true },
  expand: { type: Boolean, required: false, default: false },
  showLabel: { type: Boolean, required: false, default: true },
  disabled: { type: Boolean, required: false, default: false },
  loading: { type: Boolean, required: false, default: false },
})
</script>
