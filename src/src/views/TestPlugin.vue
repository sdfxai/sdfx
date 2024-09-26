<template> 
  <div class="w-full h-full bg-purple-600 flex flex-col items-center justify-center">
    <div class="text-2xl">testPlugin</div>
    <p>http://192.168.1.7:5173/plugin</p>

    <button @click="close" class="mt-4 bg-white rounded-lg px-2 py-1">Close</button>

    <div class="mt-4 flex items-center justify-between space-x-3">
      <button @click="setSize(640, 380)" class="bg-white rounded-lg px-2 py-1">Resize to 640x380</button>
      <button @click="setSize(300, 500)" class="bg-white rounded-lg px-2 py-1">Resize to 300x500</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import ComfySDK from '@/components/ComfyPlugin/ComfySDK'
ComfySDK.init()

const close = () => {
  ComfySDK.close()
}

const setSize = (width: number, height: number) => {
  ComfySDK.resize(width, height)
}
</script>