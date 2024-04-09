<template>
  <Box :title="label" class="SDFXTabs TabBox" :isScrollable="true">
    <template #right>
      <div class="button-wrapper">
        <button
          v-for="(tab, index) in tabChildrenList"
          :key="index"
          class="tab-button"
          :class="[{ active: selectedIndex === index }]"
          @click="selectTab(index)"
        >
          <span class="tab-wrapper">
            <span class="tab-label">
              {{ tab.props.label }}
            </span>
          </span>
        </button>
      </div>
    </template>

    <component
      v-for="(tab, index) in tabChildrenList"
      :key="index"
      :is="tab"
      :active="selectedIndex === index"
    />
  </Box>
</template>
<script setup lang="ts">
import { ref, useSlots, computed } from 'vue'
import Box from '@/components/UI/Box.vue'

const emits = defineEmits(['update:modelValue'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  attributes: { type: Object, required: false, default: null },
  label: { type: String, required: false, default: null },
  modelValue: { type: Number, required: false, default: 0 }
})

const selectedIndex = ref(props.modelValue)
const slots = useSlots()

const tabChildrenList = computed<any[]>(() => {
  const result = slots.default?.()[0].children as any[]
  return result ? result : []
})

const selectTab = (index: number) => {
  selectedIndex.value = index
  emits('update:modelValue', index)
}

if (!props.label) {
  console.error(`Missing "label" property for "TabBox" HTML component`)
}
</script>
