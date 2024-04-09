<template>
  <transition
    enter-active-class="transition ease-out duration-500 transform"
    enter-from-class="opacity-0 scale-125"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition ease-in duration-250 transform"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-125"
  >
    <div v-if="show" class="modal-mask fixed z-50 top-0 left-0 w-full h-screen" :class="{toolbar:toolbar, noheader:!header, nofooter:!footer, overlay:overlay }" @mouseup="mdup" @click.stop.prevent="clickOverlay">
      <div class="modal-wrapper lg:flex lg:flex-row lg:items-start p-4">
        <div class="modal-container p-0 rounded-md" :style="{ width:width, maxWidth:maxWidth }" @mousedown="mdown" @click.stop="clickModal">
          <div v-if="header" class="modal-header rounded-t-md border-b flex items-center justify-between px-1 py-3 noselect border-zinc-200 bg-zinc-50 dark:border-transparent dark:bg-zinc-950">
            <slot name="header"></slot>
            <slot name="headerRight" class="tools">
              <a class="close cursor-pointer group mr-2" @click.stop.prevent="$emit('close')">
                <svg class="w-6 h-6 text-zinc-400 group-hover:text-zinc-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
              </a>
            </slot>
          </div>

          <slot name="toolbar"><!-- <div class="modal-toolbar"> --></slot>

          <div class="modal-body" :class="[bgTransparent ? 'bg-transparent dark:bg-transparent' : 'bg-white dark:bg-zinc-900']">
            <slot name="body" class="rounded-lg"></slot>
          </div>

          <div v-if="footer" class="modal-footer bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-950">
            <slot name="footer">
              <button class="tw-button gray transparent sm" @click="$emit('close')">{{ t('actions.cancel') }}</button>
              <button class="tw-button sm" @click="$emit('submit')">{{ t('actions.ok') }}</button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  props: {
    show: { type: Boolean, required: false, default: false },
    overlay: { type: String, required: false, default: 'hsla(180, 60%, 20%, 0.75)' },
    width: { type: String, required: false, default: '600px' },
    maxWidth: { type: String, required: false, default: 'inherit' },
    height: { type: String, required: false, default: '350px' },
    header: { type: Boolean, required: false, default: true },
    toolbar: { type: Boolean, required: false, default: false },
    footer: { type: Boolean, required: false, default: true },
    bgTransparent: { type: Boolean, required: false, default: false },
  },

  setup(props, { emit }) {
    const { t } = useI18n()
    const clickedModal = ref(false)
    const clickModal = (e: any) => {
      clickedModal.value = false
      emit('modalclick', e.target.value)
    }

    const mdown = (e: any) => {
      clickedModal.value = true
    }

    const mdup = (e: any) => {
      if (clickedModal.value) return
      clickedModal.value = false
    }

    const clickOverlay = (e: any) => {
      clickedModal.value = false
      if (clickedModal.value) {
        return
      }
      emit('overlayclick', e.target.value)
    }

    return {
      clickedModal,
      clickModal,
      mdown,
      mdup,
      clickOverlay,
      t
    }
  }
})
</script>

<style>
.modal-mask {
  display: table;
  opacity: 1;
  transition: opacity 450ms ease;
}

.modal-mask.overlay {
  background-color: v-bind(overlay);
}

.modal-container {
  width: 95%;
  max-width: 520px;
  margin: 0px auto;
  box-shadow: 0 4px 10px 2px rgba(0, 0, 0, 0.2);
  transition: transform opacity 300ms ease;
}

.modal-header .tools {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.modal-header h3 {
  @apply text-base font-semibold ml-3 text-zinc-700;
}

.modal-mask.noheader .modal-toolbar {
  border-radius: 0.425em 0.425em 0 0;
  position: relative;
  z-index: 2;
}

.modal-body {
  /* overflow: hidden; this is breaking calendar popup */
}

.modal-body .modal-content {
  padding: 1em 1em;
}

.modal-body .modal-content.nopad {
  padding: 0em;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.6em;
  border-bottom-right-radius: 0.25em;
  border-bottom-left-radius: 0.25em;
}

.modal-footer .footerbar {
  display: flex;
  align-items: center;
}

.modal-mask.noheader .modal-body {
  border-radius: 0.425em 0.425em 0 0;
}
.modal-mask.noheader.toolbar .modal-body {
  border-radius: 0 0 0 0;
}

.modal-mask.nofooter .modal-body {
  border-radius: 0 0 0.425em 0.425em;
}

.modal-container {
  margin: auto auto;
}

.modal-wrapper {
  width: 100%;
  position: fixed;
  overflow-y: auto;
  min-height: 100vh;
  height: 100%;
}

@media (max-width: 600px) {
  .modal-wrapper {
    position: fixed;
    min-height: 100vh;
    overflow-y: auto;
    top: 0;
    height: 100%;
    width: 100%;
  }

  .modal-container {
    margin: 0 auto;
  }
}
</style>
