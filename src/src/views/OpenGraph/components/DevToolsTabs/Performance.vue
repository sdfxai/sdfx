<template>
  <section class="Performance p-6 h-full flex flex-col justify-between">
    <div>
      <h2 class="text-2xl">Performance Monitor</h2>
      <div class="text-zinc-500 text-sm">
        Monitor the performance of your machine while running the graph (need ComfyUI-Crystools custom node).
      </div>
    </div>

    <div v-if="performance && performance.device_type==='cuda'" class="mt-8 grid grid-cols-6 xl:grid-cols-6 gap-8">
      <TWGauge title="CPU" unit="%" :value="performance.cpu_utilization" :decimal="2" class="text-sm xl:text-xl"/>
      <TWGauge title="RAM" unit="%" :value="performance.ram_used_percent" :decimal="0" class="text-sm xl:text-xl"/>
      <TWGauge title="HDD" unit="%" :value="performance.hdd_used_percent" :decimal="0" class="text-sm xl:text-xl"/>

      <TWGauge title="GPU Utilization" unit="%" :value="performance.gpus[0]?.gpu_utilization" :decimal="2" class="text-sm xl:text-xl"/>
      <TWGauge title="GPU VRAM" unit="%" :value="performance.gpus[0]?.vram_used_percent" :decimal="2" class="text-sm xl:text-xl"/>
      <TWGauge title="GPU Temp" unit="°C" :value="performance.gpus[0]?.gpu_temperature" :decimal="0" class="text-sm xl:text-xl"/>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { useMainStore, storeToRefs } from '@/stores'
import TWGauge from '@/components/UI/TWGauge.vue'

const { performance } = storeToRefs(useMainStore())
</script>
