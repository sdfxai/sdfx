<template>
  <button class="nav-trigger relative block" :class="{ active:active }" @click.stop.prevent="$emit('change')">
    <span></span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    active: { type: Boolean, required: false, default: false }
  }
})
</script>

<style type="text/css" scoped>
.nav-trigger {
  width: 32px;
  height: 32px;
  color: inherit;
  line-height: inherit;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
  outline: none;
}

.nav-trigger span {
  top: calc(50% - 2px);
  right: 2px;
  transition: background 200ms;
}

.nav-trigger span,
.nav-trigger span::before,
.nav-trigger span::after {
  position: absolute;
  height: 3px;
  width: 28px;
  @apply bg-zinc-800;
}

.nav-trigger span::before,
.nav-trigger span::after {
  content: '';
  right: 0;
  transform-origin: 0 50%;
  transition: transform 250ms;
}

.nav-trigger span::before {
  top: -8px;
}

.nav-trigger span::after {
  top: 8px;
}

.nav-trigger.active span {
  background: none;
}

.nav-trigger.active span::before {
  transform: translateX(4px) translateY(-2px) rotate(45deg);
}

.nav-trigger.active span::after {
  transform: translateX(4px) translateY(2px) rotate(-45deg);
}
</style>
