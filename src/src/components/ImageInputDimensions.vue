<template>
  <section class="flex items-center space-x-2">
    <TWInputNumber v-model="dw" class="flex-1" @keyup.enter="onBlur" :disabled="disabled" @focus="focus='dw'" @blur="onBlur" @input="updateHeight" :label="options && options[0] ? options[0].name : null" required  :max="options && options[0] ? options[0].max : null" :precision="0"/>
    <button @click="togglePreserveRatio()" :disabled="disabled" class="mt-6">
      <LinkIcon class="w-5 h-5"
      :class="[preserve && !disabled?'text-teal-500':'text-zinc-500']"
      />
    </button>
    <TWInputNumber v-model="dh" class="flex-1" @keyup.enter="onBlur" :disabled="disabled" @focus="focus='dh'" @blur="onBlur" @input="updateWidth" :label="options && options[1] ? options[1].name: null" required  :max="options && options[1] ? options[1].max : null" :precision="0"/>
    <button class="mt-6" @click="toggleDimensions()" :disabled="dw === dh || disabled">
      <ArrowPathIcon class="w-5 h-5 text-zinc-500" :class="[dw === dh || disabled?'cursor-normal text-zinc-300 dark:text-zinc-700/75':'']"/>
    </button>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, PropType } from 'vue'
import { LinkIcon, ArrowPathIcon  } from '@heroicons/vue/24/solid'
import TWInputNumber from '@/components/UI/TWInputNumber.vue'

const props = defineProps({
  values: { type: Array as PropType<any[]>, required: true },
  options: { type: Array as PropType<any[]>, required: true },
  preserveAspectRatio: { type: Boolean, required:false, default: true },
  disabled: { type: Boolean, required:false, default: false },
})

const emit = defineEmits(['change'])

const focus = ref<any>(null)
const dw = ref<any>(props.values[0])
const dh = ref<any>(props.values[1])
const preserve = ref<boolean>(props.preserveAspectRatio)
const ar = ref<number>(dw.value && dh.value ? dw.value/dh.value : 1)

watch(() => props.values[0], ()=>{
  if (focus.value) return
  dw.value = props.values[0]
  updateAspectRatio()
})

watch(() => props.values[1], ()=>{
  if (focus.value) return
  dh.value = props.values[1]
  updateAspectRatio()
})

watch(() => props.preserveAspectRatio, ()=>{
  preserve.value = props.preserveAspectRatio
})

const onBlur = ()=>{
  focus.value = null

  dw.value = Math.min(props.options[0].max, Math.max(props.options[0].min, dw.value))
  dh.value = Math.min(props.options[1].max, Math.max(props.options[1].min, dh.value))

  if (!preserve.value) {
    updateAspectRatio()
  }

  onChange()
}

const onChange = ()=>{
  const w = Math.min(props.options[0].max, dw.value)
  const h = Math.min(props.options[1].max, dh.value)

  emit('change', {
    values: [w, h],
    width: w,
    height: h,
    aspectRatio: ar.value,
    preserveAspectRatio: preserve.value
  })
  // console.log(dw.value, dh.value, w, h)
}

const togglePreserveRatio = ()=>{
  preserve.value = !preserve.value
  ar.value = dw.value/dh.value
  onChange()
}

const toggleDimensions = ()=>{
  [dw.value, dh.value] = [dh.value, dw.value]
  ar.value = dw.value/dh.value
  onChange()
}

const updateWidth = () => {
  if (focus.value === 'dh') {
    if (preserve.value) {
      if (!dh.value) {
        dh.value = null
        dw.value = null
        return
      }
      const a = ar.value
      dw.value = Math.floor(dh.value * a)
    } else {
      updateAspectRatio()
    }
  }

  onChange()
}

const updateHeight = () => {
  if (focus.value === 'dw') {
    if (preserve.value) {
      if (!dw.value) {
        dh.value = null
        dw.value = null
        return
      }
      const a = ar.value
      dh.value = Math.floor(dw.value / a)
    } else {
      updateAspectRatio()
    }
  }

  onChange()
}

const updateAspectRatio = () => {
  const w = props.values[0]
  const h = props.values[1]
  ar.value = w && h ? w/h : 1
}
</script>
