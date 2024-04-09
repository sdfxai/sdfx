<template>
  <div class="tw-textarea bg-transparent p-0 border-0">
    <div v-if="label" class="flex justify-between mb-1">
      <label class="block text-sm font-medium leading-5 text-zinc-700 dark:text-zinc-500">{{ label }}</label>
      <span v-if="!required && showOptional && !limit" class="text-sm leading-5 text-zinc-500 dark:text-zinc-700">
        {{ t('labels.optional') }}
      </span>
      <span v-if="limit" class="text-sm leading-5 text-zinc-500 dark:text-zinc-600">
        <span>{{ t('labels.char_left')+':' }}</span>
        <span class="font-semibold text-zinc-700 dark:text-zinc-400 ml-2">{{ charLeftCount }}</span>
      </span>
    </div>
    <div class="relative w-full rounded-md shadow-sm">
      <textarea 
        ref="txElement"
        :id="id"
        :rows="rows"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :value="modelValue"
        :required="required"
        :readonly="readonly"
        :disabled="disabled"
        :style="{height:height, minHeight:minheight}"
        @select="handleSelect"
        @dragstart="onDragging"
        @input="updateValue"
        @focus="$emit('focus', modelValue)"
        @blur="$emit('blur', modelValue)"
        :class="{
          'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 cursor-not-allowed':disabled,
          'bg-white dark:bg-zinc-950/60 text-zinc-700 dark:text-zinc-200':!disabled
        }"
        class="hidden-scrollbars rounded-md appearance-none block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700/80 placeholder-zinc-600 dark:placeholder-zinc-700 focus:placeholder-zinc-400 focus:outline-none focus:shadow-outline-teal focus:border-teal-300 transition duration-150 text-md ease-in-out sm:leading-5"
      />
      <div v-if="error" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-pink-700" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    <p v-if="description || error" class="mt-2 text-sm text-zinc-500" :class="{'text-pink-700':error}">{{ error ? error : description }}</p>
  </div>
</template>

<script lang="ts">
import { ref, watch, onMounted, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  props: {
    id: { type: String, required: false, default: null },
    limit: { type: Number, required: false, default: null },
    rows: { type: Number, required: false, default: 4 },
    height: { type: String, required: false, default: null },
    minheight: { type: String, required: false, default: null },
    placeholder: { type: String, required: false, default: null },
    modelValue: { type: String, required: false, default: null },
    label: { type: String, required: false, default: null },
    error: { type: String, required: false, default: null },
    description: { type: String, required: false, default: null },
    autocomplete: { type: String, required: false, default: null },
    required: { type: Boolean, required: false, default: false },
    readonly: { type: Boolean, required: false, default: false },
    disabled: { type: Boolean, required: false, default: false },
    autofocus: { type: Boolean, required: false, default: false },
    showOptional: { type: Boolean, required: false, default: true }
  },

  setup(props, { emit }) {
    const { t } = useI18n()

    const txElement = ref<HTMLTextAreaElement>()
    const charLeftCount = ref(props.limit || 0)
    const selectedText = ref('')

    const limitChars = (trigModified: any) => {
      const areaElement = txElement.value

      if (props.modelValue && props.limit && Number(props.limit) > 0 && areaElement) {
        const text = props.modelValue.slice(0, Number(props.limit))
        charLeftCount.value = props.limit - text.length
        areaElement.value = text
        emit('update:modelValue', text)
        emit('change', text)
        if (trigModified) emit('modified')
      }
    }

    const updateValue = (event: Event) => {
      const target = event.target as HTMLTextAreaElement
      const text = target?.value

      if (props.limit) {
        charLeftCount.value = props.limit - text.length
      }

      emit('update:modelValue', text)
      emit('change', text)
      emit('modified')
    }

    const handleSelect = (e: any) => {
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      selectedText.value = e.target.value.substring(start, end)
    }

    const onDragging = (e: any) => {
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const wholeText = e.target.value
      const selectedText = wholeText.substring(start, end)

      e.dataTransfer.setData("text", wholeText)
    }

    onMounted(() => {
      if (props.limit) {
        limitChars(false)
      }
      if (props.autofocus) {
        txElement.value?.focus()
      }
    })

    watch(
      () => props.modelValue,
      () => {
        if (props.limit) {
          limitChars(true)
        }
      }
    )

    return {
      t,
      handleSelect,
      onDragging,
      txElement,
      charLeftCount,
      updateValue
    }
  }
})
</script>
