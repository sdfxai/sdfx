<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog :open="true" as="div" @close="$emit('close')">
      <div class="TWModal fixed inset-0 z-[100] overflow-y-auto">
        <div class="min-h-screen px-4 text-center">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
            <DialogOverlay class="fixed inset-0 bg-zinc-950 bg-opacity-50" />
          </TransitionChild>

          <span class="inline-block h-screen text-white align-middle" aria-hidden="true">
            &#8203;
          </span>

          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <slot/>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts" setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogOverlay,
  DialogTitle
} from '@headlessui/vue'

const props = defineProps({
  open: { type: Boolean, required: false, default: false }
})
</script>
