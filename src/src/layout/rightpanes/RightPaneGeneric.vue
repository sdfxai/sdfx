<template>
  <Pane class="rightpane-generic" position="right" title="Settings">
    <template #head>
      <nav class="px-3 py-3 flex flex-col justify-between min-h-[4rem] flex-shrink-0">
      </nav>
    </template>

    <template #body>
    </template>

    <template #foot>
      <nav class="p-2 text-xs h-10 flex-shrink-0 dark:bg-zinc-900/80 flex items-center justify-between">
        <div class="uppercase text-zinc-400 dark:text-zinc-600 font-semibold">Made with love</div>
        <div class="flex space-x-2">
          <img src="@/assets/vue.svg" class="w-4 h-4" />
          <img src="@/assets/electron.svg" class="w-4 h-4" />
          <img src="@/assets/vite.svg" class="w-4 h-4" />
        </div>
      </nav>
    </template>
  </Pane>
</template>

<script lang="ts" setup>
import Pane from '@/layout/Pane.vue'
</script>
