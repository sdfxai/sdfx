<template>
  <div class="relative h-screen">
    <router-view />
    <div v-if="loading" class="absolute inset-0 bg-zinc-900/60 z-50 flex items-center justify-center">
      <Loader class="text-[30px] text-zinc-300/80"/>
    </div>
  </div>

  <VueConfirm />
  <VuePrompt />
  <VueToast />

  <template id="template-imgbox">
    <section class="imgbox-wrapper fixed inset-0 m-auto z-[200] flex top-6 w-[95vw] h-[85vh] rounded-2xl overflow-hidden">
      <svg class="imgbox-close fixed"></svg>
      <div class="imgbox-main h-full flex-1 bg-black" data-zoom-container></div>
      <aside id="imgbox-sidebar" class="w-84 xl:w-96 bg-zinc-100 dark:bg-zinc-900">
        
      </aside>
    </section>
  </template>
  
  <section v-if="false" class="sm:block md:block lg:block xl:block">
    <!-- do not remove this section, it's used to make some tailwind classes statically accessible to mapping components -->
  </section>

  <teleport to="#blockui">
    <BlockUI :open="status.spinning" />
  </teleport>
</template>

<script setup lang="ts">
import config from '@/utils/app.config'
import { SDFXAPI } from '@/api'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMainStore, resetAllStores, storeToRefs } from '@/stores'
import { VueConfirm } from '@/components/UI/VueConfirm/VueConfirm'
import { VuePrompt } from '@/components/UI/VuePrompt/VuePrompt'
import { VueToast, useToast } from '@/components/UI/VueToast/VueToast'
import { formatPromptError } from '@/utils/errors'

// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import BlockUI from '@/components/UI/BlockUI.vue'
import Loader from '@/components/UI/Loader.vue'

const route = useRoute()
const router = useRouter()
const { toast } = useToast()

const mainStore = useMainStore()
const { status, fontSize } = storeToRefs(mainStore)
const loading = ref(false)

if (window) {
  const url = new URL(window.location.href)
  const params = new URLSearchParams(url.search)
  const host = params.get('host')
  const ws = params.get('ws')
  const clientId = params.get('clientId')!
  const token = params.get('token')!

  if (token) {
    mainStore.setAuthToken(token)
  }

  if (clientId) {
    mainStore.setClientId(clientId)
  }

  if (host || ws) {
    if (host) mainStore.setupHTTPHost(host)
    if (ws)   mainStore.setupWSHost(ws)
    resetAllStores()
    console.log('[SDFX] reset stores', host, ws)
    router.replace('/')
  } else {
    if (!mainStore.server.host) {
      mainStore.setEndpointURLs({
        http_endpoint: config.http_endpoint,
        ws_endpoint: config.ws_endpoint
      })
    }
  }
}

console.log('[SDFX] running on host', mainStore.server.host)

const start = async () => {
  SDFXAPI.connect()
  SDFXAPI.onready = async () => {
    console.log('[SDFX] connected')
  }
}

const errorHandler = (e: any) => {
  const error = formatPromptError(e.detail)
  toast.error(error, true)
}

onMounted(()=>{
  document.documentElement.style.fontSize = fontSize.value + 'em'
  sdfx.addEventListener('error', errorHandler)
})

onBeforeUnmount(()=>{
  sdfx.removeEventListener('error', errorHandler)
})

start()
</script>
