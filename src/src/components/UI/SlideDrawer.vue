<template>
  <teleport to="body">
    <transition
      enter-active-class="duration-500 ease-out"
      enter-from-class="transform opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="transform opacity-0"
    >
      <div v-if="open" ref="drawerOverlayRef" @click="close()" class="slide-drawer-overlay fixed z-[50] inset-0 bg-zinc-800/70 dark:bg-zinc-950/80"></div>
    </transition>
    <transition :enter-from-class="orientation==='bottom'?'translate-y-full':'-translate-y-full'" :leave-to-class="orientation==='bottom'?'translate-y-full':'-translate-y-full'">
      <div v-if="open" class="slide-drawer-modal overflow-hidden transition-transform fixed mx-auto inset-x-0 top-12 z-[700] flex items-center justify-center" :class="[orientation==='bottom'?`-bottom-20`:`top-24`]">
        <section ref="drawerRef" class="overflow-hidden rounded-lg bg-white dark:bg-zinc-900 shadow-2xl dark:shadow-none" :style="[width?`width:${width};`:'', minwidth?`min-width:${minwidth};`:'', maxwidth?`max-width:${maxwidth};`:'']">
          <div class="sd-head relative z-10 noselect bg-zinc-200 h-8 p-2 flex items-center justify-between">
            <div class="font-bold text-sm text-zinc-800">
              <span v-if="title">{{ title }}</span>
            </div>
            <div v-if="subtitle" class="font-bold text-sm text-zinc-700">
              <span>{{ subtitle }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <dt class="rounded-full bg-zinc-700 w-4 h-4 opacity-25"></dt>
              <dt class="rounded-full bg-green-800 w-4 h-4 opacity-25"></dt>
              <button @click="close()"><dt class="rounded-full bg-pink-700 w-4 h-4"></dt></button>
            </div>
          </div>
          <div class="sd-body" :style="[height?`height:${height};`:'', minheight?`min-height:${minheight};`:'', maxheight?`max-height:${maxheight};`:'']">
            <slot/>
          </div>
          <div v-if="showFooter" class="sd-foot relative z-10 bg-zinc-200 dark:bg-zinc-900 border-t dark:border-black">
            <slot name="footer">
              <div class="flex items-center justify-between p-4">
                <div class="">
                 
                </div>
                <div class="flex items-center space-x-2">
                  <button @click="close()" class="tw-button gray transparent">
                    Close
                  </button>
                  <button @click="save()" class="tw-button">
                    Save
                  </button>
                </div>
              </div>
            </slot>
          </div>
        </section>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

const props = defineProps({
  open: { type: Boolean, required: false, default:false },
  showFooter: { type: Boolean, required: false, default:true },
  title: { type: String, required: false, default:'SDFX' },
  subtitle: { type: String, required: false, default:null },

  width: { type: String, required: false, default:null },
  height: { type: String, required: false, default:null },

  minwidth: { type: String, required: false, default:null },
  maxwidth: { type: String, required: false, default:null },

  minheight: { type: String, required: false, default:null },
  maxheight: { type: String, required: false, default:null },

  orientation: { type: String, required: false, default:'top' }
})

const drawerRef = ref(null)
const drawerOverlayRef = ref(null)

const emit = defineEmits(['close', 'save'])

// not used
// const compWidth = computed(() => {
//   return 0.8*window.clientWidth
// })

const close = ()=>{
  emit('close')
}

const save = ()=>{
  emit('save')
}

onClickOutside(drawerRef, (e) => {
  // @ts-ignore
  const k = e.target?.className
  if (!k) return
  if (String(k).indexOf('slide-drawer-overlay')>-1 || String(k).indexOf('slide-drawer-modal')>-1) {
    close()
  }
})
</script>
