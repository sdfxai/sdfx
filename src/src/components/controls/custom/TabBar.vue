<template>
  <article class="SDFXTabs TabBar">
    <nav v-if="$slots && $slots.default && $slots.default()[0]" class="button-wrapper">
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
    </nav>

    <component
      v-for="(tab, index) in tabChildrenList"
      :key="index"
      :is="tab"
      :active="selectedIndex === index"
    />
  </article>
</template>
<script setup lang="ts">
import { ref, useSlots, computed } from 'vue'
const props = defineProps({
  id: { type: String, required: false, default: null },
  modelValue: { type: Number, required: false, default: 0 }
})

const selectedIndex = ref(props.modelValue)
const emits = defineEmits(['update:modelValue'])

const slots = useSlots()

const tabChildrenList = computed<any[]>(() => {
  const result = slots.default?.()[0].children as any[]
  return result ? result : []
})

const selectTab = (index: number) => {
  selectedIndex.value = index
  emits('update:modelValue', index)
}
</script>