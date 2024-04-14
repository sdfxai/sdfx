<template>
  <nav ref="navRef" class="TWTabs relative flex px-3 justify-between" :class="[xs?'h-12':'h-16']">
    <button
      v-for="(tab, idx) in visibleTabs"
      :key="tab.id"
      ref="tabRefs"
      @click="setTab(idx)"
      class="relative w-full font-semibold text-left mr-4 whitespace-nowrap"
      :class="[
        modelValue===tab.id
          ? 'text-teal-500 dark:text-teal-300 z-1 cursor-default'
          : 'text-zinc-500 dark:text-zinc-500',
        xs ? 'text-xs' : 'text-sm'
      ]"
    >
      <span class="relative">
        {{ tab.name }}
        <span
          v-if="tab.badge"
          class="absolute -right-6 -top-3 scale-90 font-semibold rounded-full w-6 h-6 flex items-center justify-center text-xs bg-pink-900 text-white"
        >
          tab.badge
        </span>
      </span>
    </button>
    <span
      class="absolute bottom-0 bg-teal-400 dark:bg-teal-300 duration-200"
      :class="[xs?'h-[0.18em]':'h-[0.20em]']"
      :style="{ left: barPosition.left + 'px', width: barPosition.width + 'px' }"
    ></span>
  </nav>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
// @ts-ignore
import { PropType } from 'vue'

const emit = defineEmits(['change', 'update:modelValue'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  modelValue: { type: String, required: false, default: null },
  xs: { type: Boolean, required: false, default: false },
  tabs: { type: Array as PropType<any[]>, required: false, default:null }
})

const navRef = ref<null | HTMLElement>(null)
const tabRefs = ref<HTMLElement[]>([])
const barPosition = reactive({ left: 0, width: 0 })

const visibleTabs = computed(() => props.tabs.filter((tab: any) => tab.visible !== false))

const setTab = (idx: number) => {
  const tab = props.tabs[idx]
  emit('update:modelValue', tab.id)
  emit('change', tab.id)
   updateBarPosition(idx)
}

const updateBarPosition = (idx: number) => {
  if (!navRef.value) return

  const nav = navRef.value
  const target = tabRefs.value[idx]
  const targetRect = target.getBoundingClientRect()
  const navRect = nav.getBoundingClientRect()
  barPosition.left = targetRect.left - navRect.left
  barPosition.width = targetRect.width
}

onMounted(()=>{
  const idx = props.tabs.findIndex((tab: any) => tab.id === props.modelValue)
  if (idx>-1) {
    setTab(idx)
  }
})
</script>
