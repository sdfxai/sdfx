<template>
  <div class="h-5">
    <button type="button" @click="updateValue()" :disabled="disabled" role="checkbox" tabindex="0" :aria-checked="modelValue" :class="{'bg-teal-500':modelValue, 'bg-zinc-300 dark:bg-zinc-600':!modelValue}" class="relative inline-flex flex-shrink-0 h-5 w-10 border-teal-900 border-1 rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-teal-600">
      <span aria-hidden="true" :class="{'translate-x-5':modelValue, '-translate-x-1':!modelValue}" class="inline-block h-5 w-5 border-2 border-white rounded-full bg-white shadow dark:shadow-none transform transition ease-in-out duration-200"></span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    modelValue: { type: Boolean, required: false, default: false },
    disabled: { type: Boolean, required: false, default: false }
  },

  methods: {
    updateValue() {
      this.$emit('update:modelValue', !this.modelValue)
      this.$emit('click')
      this.$emit('change', !this.modelValue)
      this.$emit('modified')
    }
  }
})
</script>
