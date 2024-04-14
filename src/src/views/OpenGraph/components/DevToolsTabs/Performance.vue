<template>
  <section class="Performance p-6 h-full flex flex-col justify-between">
    <div>
      <h2 class="text-2xl">Performance Monitor</h2>
      <div class="text-zinc-500 text-sm">
        Monitor the performance of your machine while running the graph (need ComfyUI-Crystools custom node).
      </div>
    </div>

    <div v-if="performance && performance.device_type==='cuda'" class="mt-8 grid grid-cols-6 xl:grid-cols-6 gap-8">
      <TWGauge title="CPU" :percentage="performance.cpu_utilization" class="text-sm xl:text-base"/>
      <TWGauge title="RAM" :percentage="performance.ram_used_percent" class="text-sm xl:text-base"/>
      <TWGauge title="HDD" :percentage="performance.hdd_used_percent" class="text-sm xl:text-base"/>

      <TWGauge title="GPU Utilisation" :percentage="performance.gpus[0]?.gpu_utilization" class="text-sm xl:text-xl"/>
      <TWGauge title="GPU VRAM" :percentage="performance.gpus[0]?.vram_used_percent" class="text-sm xl:text-xl"/>
      <TWGauge title="GPU Temp" :percentage="performance.gpus[0]?.gpu_temperature" class="text-sm xl:text-xl"/>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { useMainStore, storeToRefs } from '@/stores'
import TWGauge from '@/components/UI/TWGauge.vue'

const { performance } = storeToRefs(useMainStore())
</script>
