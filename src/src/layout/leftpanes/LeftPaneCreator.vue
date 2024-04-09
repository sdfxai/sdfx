<template>
  <Pane class="leftpane-creator" position="left" title="Settings">
    <template #head>
      <nav class="px-3 py-3 flex flex-col justify-between min-h-[4rem] flex-shrink-0">
      </nav>
    </template>

    <template #body>

    </template>

    <template #foot>
      <nav class="text-xs p-2 flex items-center justify-between font-semibold h-10 flex-shrink-0 uppercase">
        © {{ new Date().getFullYear() }} - SDFX 
        <span class="text-zinc-500">{{ config.app_title }} Build {{ config.app_version }}</span>
      </nav>
    </template>
  </Pane>
</template>

<script lang="ts" setup>
import config from "@/utils/app.config"
import Pane from '@/layout/Pane.vue'
</script>
