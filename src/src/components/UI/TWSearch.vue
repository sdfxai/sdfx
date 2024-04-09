<template>
  <div class="relative text-zinc-400 dark:text-zinc-300 focus-within:text-zinc-500" @click="focus">
    <input 
      ref="searchInput"
      type="search" 
      :value="modelValue"
      :placeholder="closed?'':t('actions.search')"
      @input="updateValue"
      @focus="$emit('focus', $event as FocusEvent)"
      @blur="$emit('blur', $event as FocusEvent)"
      :class="[closed?'pl-0':'pl-10']"
      class="block bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-200 w-full border-zinc-300 dark:border-zinc-700 rounded-md placeholder-zinc-500 dark:placeholder-zinc-600 focus:placeholder-zinc-300 focus:border-teal-600 focus:ring-teal-600"
    />
    <div class="absolute inset-y-0 left-0 flex items-center justify-center pl-3">
      <MagnifyingGlassIcon class="h-5 w-5" aria-hidden="true" />
    </div>
    <div v-if="modelValue" @click="clear()" class="absolute cursor-pointer text-zinc-500 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-200 inset-y-0 right-0 flex items-center justify-center pr-3">
      <XMarkIcon class="h-6 w-6" aria-hidden="true" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: { type: String, required: false, default: null },
  closed: { type: Boolean, required: false, default: false }
})

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur', 'modified'])

const { t } = useI18n()
const searchInput = ref<HTMLInputElement>()

const updateValue = (event: Event) => {
  const value = (event.target as HTMLInputElement)?.value
  emit('update:modelValue', value)
  emit('change', value)
  emit('modified')
}

const focus = () => {
  searchInput.value?.focus()
}

const clear = () => {
  emit('update:modelValue', null)
  emit('change', null)
  emit('modified')
}
</script>
