<template>
  <ControllerWidget class="SDFXImageLoader" valueType="string" @change="$emit('change', $event)" v-bind="props" v-slot="{scope}">
    <Box :title="label" class="Image Loader" :isScrollable="false">
      <div class="p-4">
        <ImageLoader
          v-model="scope.val"
          :loading="loading"
          :options="scope.selectorOptionList"
          :disabled="disabled || loading"
          :label="label"
          :showLabel="showLabel"
          @change="scope.change($event)"
          @upload="scope.upload($event)"
          class="w-full"
        />
      </div>
    </Box>
  </ControllerWidget>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useModelStore } from '@/stores'
import ControllerWidget from '@/components/controls/ControllerWidget.vue'
import ImageLoader from '@/components/ImageLoader.vue'
import Box from '@/components/UI/Box.vue'

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
