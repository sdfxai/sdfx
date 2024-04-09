<template>
  <div class="inputnumber">
    <div v-if="label" class="flex justify-between mb-1">
      <label class="block text-sm capitalize font-medium leading-5 text-zinc-700 dark:text-zinc-500">{{ label }}</label>
      <span v-if="!readonly && !required && showOptional" class="text-sm leading-5 text-zinc-500 dark:text-zinc-700">{{ t('labels.optional') }}</span>
    </div>
    <div class="mt-1 relative rounded-md shadow-sm">
      <div v-if="symbol" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span class="text-zinc-500 sm:text-sm">
          {{ symbol }}
        </span>
      </div>
      <input
        ref="inputRef"
        @click="$emit('active')"
        @focus="onFocus"
        @blur="blur"
        @input="change"
        :value="formattedValue"
        :disabled="disabled"
        :required="required"
        :readonly="readonly"
        :placeholder="placeholder"
        v-on:keydown.enter.stop.prevent
        class="rounded-md appearance-none block w-full py-2 border border-zinc-300 dark:border-zinc-700/80 placeholder-zinc-600 dark:placeholder-zinc-700 focus:placeholder-zinc-400 focus:outline-none focus:shadow-outline-teal focus:border-teal-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
        :class="[
          symbol?'pl-6':'pl-2', 
          suffix?'pr-12':'pr-2',
          {
            'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 cursor-not-allowed':disabled,
            'bg-white text-zinc-700 dark:text-zinc-200 dark:bg-zinc-950/60':!disabled
          }
        ]"
      />
      <div v-if="suffix" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span class="text-zinc-500 sm:text-sm">
          {{ suffix }}
        </span>
      </div>
    </div>
    <p v-if="description || error" class="mt-2 text-sm text-zinc-500" :class="{'text-pink-700':error}">{{ error ? error : description }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue'
import { useCurrencyInput, CurrencyInputOptions } from 'vue-currency-input'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  props: {
    id: { type: String, required: false, default: null },
    modelValue: { type: Number, required: false, default: null },
    label: { type: String, required: false, default: null },
    error: { type: String, required: false, default: null },
    description: { type: String, required: false, default: null },
    autocomplete: { type: String, required: false, default: null },
    placeholder: { type: String, required: false, default: null },
    symbol: { type: String, required: false, default: null },
    locale: { type: String, required: false, default: 'en' },
    currency: { type: String, required: false, default: 'USD' },
    suffix: { type: String, required: false, default: null },
    precision: { type: Number, required: false, default: 2 },
    min: { type: Number, required: false, default: 0 },
    max: { type: Number, required: false, default: Infinity },
    disabled: { type: Boolean, required: false, default: false },
    required: { type: Boolean, required: false, default: false },
    readonly: { type: Boolean, required: false, default: false },
    integer: { type: Boolean, required: false, default: false },
    showOptional: { type: Boolean, required: false, default: true }
  },

  setup(props, { emit }) {
    const { t } = useI18n()
    const options = {
      locale: props.locale,
      currency: props.currency,
      precision: props.precision,
      currencyDisplay: 'hidden',
      valueAsInteger: 'integer',
      allowNegative: false,
      valueRange: {
        min: props.min,
        max: props.max
      },
      distractionFree: true
    } as CurrencyInputOptions

    const { formattedValue, setValue, inputRef } = useCurrencyInput(options)

    const onFocus = () => {
      emit('active')
      emit('focus')
    }

    const change = (ev: any) => {
      const value = Number(ev.target.value)
      if (typeof value === 'number' && !isNaN(value)) emit('change', value)
    }

    const blur = (ev: any) => {
      emit('blur', ev.target.value)
    }

    watch(() => props.modelValue, (value) => {
      setValue(value)
      emit('change', value)
      emit('modified')
    })

    return {
      t,
      change,
      blur,
      onFocus,
      inputRef,
      formattedValue
    }
  }
})
</script>
