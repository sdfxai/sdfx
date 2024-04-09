<template>
  <ControllerWidget class="PromptTimeline" valueType="string" @change="$emit('change', $event)" v-bind="props" v-slot="{scope}">
    <Box :title="label" class="timeline flex-1 h-full" :isScrollable="false">
      <template #right>
        <div class="flex items-center justify-between space-x-3">
          <button @click="scope.change('')">
            <TrashIcon class="tw-icon h-5 w-5"/>
          </button>
        </div>
      </template>
      <PromptTimeline
        :id="id"
        :modelValue="scope.val"
        :disabled="disabled || loading"
        @change="scope.change($event)"
      />
    </Box>
  </ControllerWidget>
</template>
<script setup lang="ts">
import { PropType } from 'vue'
import { TrashIcon } from '@heroicons/vue/24/solid'
import Box from '@/components/UI/Box.vue'
import ControllerWidget from '@/components/controls/ControllerWidget.vue'
import PromptTimeline from '@/components/PromptTimeline.vue'

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
