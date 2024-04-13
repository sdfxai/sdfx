<template>
  <div class="Interface space-y-3">
    <div class="flex items-center justify-between space-x-3">
      <span class="w-48">HTTP Endpoint</span>
      <TWInput
        v-model="http_endpoint"
        suffix="-"
        class="flex-1"
        @change="updateNetwork"
      >
        <template #suffix>
          <CheckIcon v-if="validHTTPURL" class="w-5 h-5 flex-shrink-0 text-teal-600 dark:text-teal-400"/>
          <ExclamationTriangleIcon v-else class="w-5 h-5 flex-shrink-0 text-orange-600 dark:text-orange-400"/>
        </template>
      </TWInput>
    </div>
    <div class="flex items-center justify-between space-x-3">
      <span class="w-48">Websocket Endpoint</span>
      <TWInput
        v-model="ws_endpoint"
        suffix="-"
        class="flex-1"
        @change="updateNetwork"
      >
        <template #suffix>
          <CheckIcon v-if="validWSURL" class="w-5 h-5 flex-shrink-0 text-teal-600 dark:text-teal-400"/>
          <ExclamationTriangleIcon v-else class="w-5 h-5 flex-shrink-0 text-orange-600 dark:text-orange-400"/>
        </template>
      </TWInput>
    </div>
    <div v-if="!validHTTPURL" class="text-orange-500">
      <p>Invalid HTTP endpoint URL.</p>
    </div>
    <div v-if="!validWSURL" class="text-orange-500">
      <p>Invalid Websocket endpoint URL.</p>
    </div>

    <div v-if="changed && validHTTPURL && validWSURL" class="text-zinc-500">
      <p>Please refresh the app after changing the network settings.</p>
      <button @click="applyNetworkChanges()" class="tw-button sm red transparent mt-6 space-x-3">
        <ArrowPathIcon class="w-5 h-5 flex-shrink-0"/>
        <span>Apply & Refresh</span>
      </button>      
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useMainStore, storeToRefs } from '@/stores'
import { ArrowPathIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid'
import TWInput from '@/components/UI/TWInput.vue'

const mainStore = useMainStore()
const { server } = storeToRefs(mainStore)

const changed = ref(false)
const http_endpoint = ref<string>(server.value.http_endpoint ?? '')
const ws_endpoint = ref<string>(server.value.ws_endpoint ?? '')

const isValidURL = (url: string)=> {
  if (!url) return false

  try {
    const u = new URL(url)
    return u && u.origin ? true : false
  } catch (e) {
    return false
  }
}

const validHTTPURL = computed(() => isValidURL(http_endpoint.value) && http_endpoint.value.startsWith('http'))
const validWSURL = computed(() => isValidURL(ws_endpoint.value) && ws_endpoint.value.startsWith('ws'))

const updateNetwork = (apply: boolean = false) => {
  if (!validHTTPURL.value) return
  if (!validWSURL.value) return

  const h = http_endpoint.value.trim()
  const w = ws_endpoint.value.trim()

  changed.value = server.value.http_endpoint !== h || server.value.ws_endpoint !== w
}

const applyNetworkChanges = () => {
  if (!validHTTPURL.value) return
  if (!validWSURL.value) return

  const h = http_endpoint.value.trim()
  const w = ws_endpoint.value.trim()

  mainStore.setEndpointURLs({
    http_endpoint: h,
    ws_endpoint: w
  })

  window.location.reload()
}

onMounted(()=>{
  changed.value = false
})
</script>
