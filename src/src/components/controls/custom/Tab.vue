<template>
  <div v-if="active" class="Tab">
    <slot></slot>
  </div>
</template>

<script lang="ts">
  export default { name: 'Tab' }
</script>

<script lang="ts" setup>
const props = defineProps({
  active: { type: Boolean, required: false, default: false },
  label: { type: String, required: false, default: null }
})
</script>