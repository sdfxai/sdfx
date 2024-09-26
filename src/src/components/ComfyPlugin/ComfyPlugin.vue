<template>
  <article class="ComfyPlugin fixed inset-0 flex items-center justify-center z-[100]">
    <dt class="ComfyPluginOverlay absolute inset-0 bg-zinc-950/50" @click="close"></dt>
    <section ref="ComfyPluginWrapper" :class="[plugin.transparent?'bg-transparent':'bg-white dark:bg-zinc-950']" class="ComfyPluginWrapper transition-all ease-in-out duration-100 relative rounded-lg shadow-xl overflow-hidden">
      <header v-if="!plugin.headless" class="ComfyPluginHeader flex justify-between items-center px-4 py-3 bg-gray-100">
        <h2 class="text-lg font-semibold text-gray-800">{{ plugin.name }}</h2>
        <div class="flex items-center space-x-2">
          <button @click="reload" class="text-gray-600 hover:text-gray-800 focus:outline-none">
            <i-material-symbols-refresh-rounded class="w-6 h-6"/>
          </button>
          <button @click="close" class="text-gray-600 hover:text-gray-800 focus:outline-none">
            <i-material-symbols-close-rounded class="w-6 h-6"/>
          </button>
        </div>
      </header>

      <main ref="iframeWrapperRef" class="ComfyPluginBody relative w-full h-[calc(100%-3rem)]">
        <div v-if="!loaded" class="absolute inset-0 bg-zinc-950/90 flex items-center justify-center">
          <SpinLoader class="w-8 h-8 text-zinc-300"/>
        </div>
      </main>
    </section>
  </article>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ComfyPlugin from './index'
import SpinLoader from '@/components/UI/SpinLoader.vue'

const emit = defineEmits(['close'])

const props = defineProps({
  plugin:<any> {
    headless: { type: Boolean, default: false },
    transparent: { type: Boolean, default: false },
    name: { type: String, default: '' },
    url: { type: String, required: true },
    width: { type: String, default: '1024px' },
    height: { type: String, default: '768px' }
  }
})

const loaded = ref(false)
const iframeWrapperRef = ref<HTMLElement | null>(null)
const ComfyPluginWrapper = ref<HTMLElement | null>(null)

const close = () => {
  ComfyPlugin.close()
  emit('close', props.plugin)
}

watch(() => props.plugin.url, (newUrl) => {
  if (newUrl) {
    console.log('New Plugin URL', newUrl)
  }
})

const resize = (width: string, height: string) => {
  console.log('Resize', width, height)
  ComfyPlugin.resize(width, height)

  if (ComfyPluginWrapper.value) {
    ComfyPluginWrapper.value.style.width = `${width}px`
    ComfyPluginWrapper.value.style.height = `${height}px`
  }
}

const reload = () => {
  loaded.value = false
  ComfyPlugin.reload()
} 

onMounted(() => {
  const pluginUrl = props.plugin.url

  ComfyPlugin.init()

  if (iframeWrapperRef.value && ComfyPlugin.iframe.value) {
    iframeWrapperRef.value.appendChild(ComfyPlugin.iframe.value)
    ComfyPlugin.loadUrl(pluginUrl)

    ComfyPlugin.iframe.value.addEventListener('load', () => {
      loaded.value = true
      console.log('Plugin Loaded')
    })
  }
  
  ComfyPlugin.on('close', close)

  ComfyPlugin.on('resize', (e)=>{
    resize(e.width, e.height)
  })

  resize(props.plugin.width, props.plugin.height)
})
</script>