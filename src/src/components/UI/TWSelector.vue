<template>
  <Listbox :disabled="disabled" as="div" v-model="selected">
    <div v-if="showLabel" class="flex justify-between mb-1">
      <label class="block text-sm capitalize font-medium leading-5 text-zinc-700 dark:text-zinc-500 noselect">{{ label }}</label>
      <span v-if="!readonly && !required && showOptional" class="text-sm leading-5 text-zinc-500">{{ t('labels.optional') }}</span>
    </div>
    <div class="relative">
      <ListboxButton :class="[disabled?'bg-zinc-300 dark:bg-zinc-700':'bg-white dark:bg-zinc-950/60', xs?'pl-2 pr-12 py-1':'pl-2 pr-12 py-2']" class="relative w-full border border-zinc-300 dark:border-zinc-700/80 rounded-md shadow-sm text-left cursor-default focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm">
        <span v-if="selected" class="flex items-center">
          <img v-if="selected.img" :src="selected.img" alt="" :class="[xs?'h-5 w-5':'h-6 w-6']" class="flex-shrink-0 rounded-full" />
          <span class="ml-2 block truncate" :class="[xs?'text-xs font-semibold':null]">{{ selected.name }}</span>
        </span>
        <span v-else class="flex items-center">
          <QuestionMarkCircleIcon class="w-5 h-5 text-zinc-500"/>
          <span class="ml-3 block truncate">{{ placeholder }}</span>
        </span>
        <span :class="['ml-3 absolute inset-y-0 right-0 flex items-center pointer-events-none', xs?'pr-1':'pr-2']">
          <ChevronUpDownIcon :class="disabled ? 'text-zinc-600' : 'text-zinc-400'" class="h-5 w-5" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <ListboxOptions class="TWUIOptions absolute z-30 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <ListboxOption v-if="selected && resetable" as="template"  v-slot="{ active, selected }">
            <li :class="[active ? 'text-white bg-teal-600' : 'text-zinc-500 bg-zinc-100', 'cursor-default select-none border-b border-zinc-300 relative', xs?'pl-2 pr-10 py-1':'pl-3 pr-10 py-2']">
              <div class="flex items-center">
                <XMarkIcon :class="[xs?'h-4 w-4':'h-5 w-5']" aria-hidden="true" />
                <span class="font-normal ml-2 block truncate" :class="[xs?'text-xs font-semibold':null]">
                  Reset
                </span>
              </div>
            </li>
          </ListboxOption>

          <ListboxOption as="template" v-for="option in options" :key="option.value" :value="option" v-slot="{ active, selected }">
            <li :class="[active ? 'text-white bg-teal-600' : 'text-zinc-900', 'cursor-default select-none relative', xs?'pl-2 pr-10 py-1':'pl-3 pr-10 py-1.5']">
              <div class="flex items-center">
                <img v-if="option.img" :src="option.img" alt="" :class="[xs?'h-5 w-5':'h-6 w-6']" class="flex-shrink-0 rounded-full" />
                <span :class="['ml-2 block truncate', xs?'text-xs font-semibold':null]">
                  {{ option.name }}
                </span>
              </div>

              <span v-if="selected" :class="[active ? 'text-white' : 'text-teal-600', 'absolute inset-y-0 right-0 flex items-center', xs?'pr-2.5':'pr-3']">
                <CheckIcon :class="[xs?'h-4 w-4':'h-5 w-5']" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script lang="ts">
import { reactive, toRefs, watch, defineComponent, computed } from 'vue'
import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions
} from '@headlessui/vue'
import { XMarkIcon, CheckIcon, ChevronUpDownIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/solid'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: {
    Listbox,
    ListboxButton,
    ListboxLabel,
    ListboxOption,
    ListboxOptions,
    XMarkIcon,
    CheckIcon,
    ChevronUpDownIcon,
    QuestionMarkCircleIcon
  },

  props: {
    id: { type: String, required: false, default: null },
    modelValue: { type: [String, Number], required: false, default: null },
    value: { type: String, required: false, default: null },
    options: { type: Array, required: true },
    label: { type: String, required: false, default: null },
    placeholder: { type: String, required: false, default: 'Choose' },
    xs: { type: Boolean, required: false, default: false },
    showLabel: { type: Boolean, required: false, default: true },
    resetable: { type: Boolean, required: false, default: false },
    disabled: { type: Boolean, required: false, default: false },
    required: { type: Boolean, required: false, default: false },
    readonly: { type: Boolean, required: false, default: false },
    showOptional: { type: Boolean, required: false, default: true }
  },
  emits: ['modified', 'change', 'update:modelValue'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const getSelection = () => {
      const value = props.modelValue !== null ? props.modelValue : props.value
      return value === null ? null : props.options?.find((option: any) => option.value === value)
    }

    const state = reactive({
      selected: getSelection() as any,
      options: computed(() => props.options) as any
    })

    watch(
      () => state.selected,
      () => {
        emit('update:modelValue', state.selected?.value)
        emit('change', state.selected?.value)
        emit('modified')
      }
    )

    watch(() => state.options, () => {
      state.selected = getSelection()
    })

    watch(
      () => props.modelValue,
      () => {
        state.selected = getSelection()
      }
    )

    return {
      ...toRefs(state),
      t
    }
  }
})
</script>
<style type="text/css">
.TWUIOptions::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: #d4d4d8;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.TWUIOptions::-webkit-scrollbar-thumb {
  background: #52525b;
}  
</style>