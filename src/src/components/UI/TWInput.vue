<template>
  <div class="input">
    <div v-if="label" class="flex justify-between mb-1">
      <label class="block text-sm font-medium leading-5 text-zinc-700 dark:text-zinc-500 noselect">{{ label }}</label>
      <span v-if="!readonly && !required && showOptional" class="text-sm leading-5 text-zinc-500 dark:text-zinc-700">{{ t('labels.optional') }}</span>
    </div>
    <div class="rounded-md shadow-sm" :class="{flex:prefix||suffix}">
      <span v-if="prefix" class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-zinc-300 dark:border-zinc-700/80 bg-zinc-50 text-zinc-500 dark:text-zinc-700 dark:bg-zinc-900 sm:text-sm" style="min-width:56px;">
        <slot name="prefix">{{ prefix }}</slot>
      </span>
      
      <div class="relative w-full" :class="{'flex-1':prefix||suffix}">
        <input 
          ref="inputRef"
          :id="id"
          :type="type"
          :placeholder="placeholder"
          :autocomplete="autocomplete"
          :value="modelValue"
          :required="required"
          :disabled="disabled"
          :checked="checked"
          :readonly="readonly"
          :maxlength="maxlength"
          @input="updateValue"
          @focus="$emit('focus', modelValue)"
          @blur="$emit('blur', modelValue)"
          :class="{
            'capitalize':capitalize,
            'rounded-md':!prefix&&!suffix, 
            'rounded-none':prefix&&suffix, 
            'rounded-none rounded-r-md':prefix&&!suffix,
            'rounded-none rounded-l-md':!prefix&&suffix,
            'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-pink-600 cursor-not-allowed':disabled,
            'bg-white text-zinc-700 dark:text-zinc-200 dark:bg-zinc-950/60':!disabled
          }"
          class="appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700/80 placeholder-zinc-600 dark:placeholder-zinc-700 focus:placeholder-zinc-400 focus:outline-none focus:ring-teal-600 focus:border-teal-400 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
        />
      </div>
      <span v-if="suffix" class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-zinc-300 dark:border-zinc-700 bg-zinc-50 text-zinc-500 dark:text-zinc-700 dark:bg-zinc-900 sm:text-sm">
        <slot name="suffix">{{ suffix }}</slot>
      </span>
    </div>
    <p v-if="description || (error&&error.length>1)" class="mt-2 text-sm text-zinc-500" :class="{'text-pink-700':error}">{{ error ? error : description }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['update:modelValue', 'change', 'modified', 'blur', 'focus'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  type: { type: String, required: false, default: 'text' },
  placeholder: { type: String, required: false, default: null },
  modelValue: { type: [String, Number, Boolean], required: false, default: null },
  label: { type: String, required: false, default: null },
  error: { type: String, required: false, default: null },
  description: { type: String, required: false, default: null },
  autocomplete: { type: String, required: false, default: null },
  prefix: { type: String, required: false, default: null },
  suffix: { type: String, required: false, default: null },
  disabled: { type: Boolean, required: false, default: false },
  autofocus: { type: Boolean, required: false, default: false },
  checked: { type: Boolean, required: false, default: false },
  required: { type: Boolean, required: false, default: false },
  readonly: { type: Boolean, required: false, default: false },
  maxlength: { type: Number, required: false, default: null },
  capitalize: { type: Boolean, required: false, default: false },
  showOptional: { type: Boolean, required: false, default: true }
})

const { t } = useI18n()
const inputRef = ref<null | HTMLInputElement>()

const updateValue = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
  emit('change', value)
  emit('modified')
}

onMounted(() => {
  if (props.autofocus && inputRef && 'focus' in inputRef.value!) {
    inputRef.value.focus()
  }
})
</script>
