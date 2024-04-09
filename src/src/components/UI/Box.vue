<template>
  <section :class="[rounded?'rounded-lg':null, border?'border border-zinc-200 dark:border-zinc-800':null]" class="box w-full noselect flex flex-col">
    <h2 v-if="title" class="px-4 py-2.5 text-zinc-900 dark:text-white flex items-center justify-between border-b dark:border-zinc-800 text-sm font-semibold bg-white dark:bg-zinc-900/80 rounded-t-lg">
      <span>{{ title }}</span>
      <span>
        <slot name="right"></slot>
        <div v-if="showAdvanced" class="space-x-3">
          <div>Advanced</div>
          <TWToggle v-model="advanced"/>
        </div>
      </span>
    </h2>
    <slot name="loading"></slot>
    <div ref="scrollable" :class="[
      'bg-white dark:bg-zinc-900/80 rounded-b-lg',
      flexible ? 'h-full' : 'h-full',
      isScrollable ? 'overflow-hidden' : null
    ]">
      <slot>
      </slot>
      <slot v-if="advanced" name="advanced"/>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import TWToggle from '@/components/UI/TWToggle.vue'
import Scrollbar from 'smooth-scrollbar'

const props = defineProps({
  title: { type: String, required: false, default:null },
  rounded: { type: Boolean, required: false, default:true },
  border: { type: Boolean, required: false, default:true },
  isScrollable: { type: Boolean, required: false, default:true },
  showAdvanced: { type: Boolean, required: false, default:false },
  flexible: { type: Boolean, required: false, default:true },
})

const scrollable = ref<any>(null)
const advanced = ref(false)

onMounted(() => {
  if (props.isScrollable && scrollable.value) {
    Scrollbar.init(scrollable.value, {damping:0.015})
  }
})
</script>
