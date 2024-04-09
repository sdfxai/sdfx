<template>
  <nav id="appbar" class="titlebar noselect relative z-[500] px-4 flex items-center justify-between h-12 rounded-t-xl flex-shrink-0 bg-gradient-to-r from-zinc-50 to-zinc-200/90 dark:from-zinc-700 dark:to-zinc-950/90">
    <div class="font-bold text-base">
      <span class="text-black dark:text-white">SD</span><span class="text-green-600 dark:text-green-400">FX</span>
    </div>
    <div class="appNoDrag flex items-center space-x-2">
      <button @click="minimizeApp()"><dt class="rounded-full bg-zinc-400/90 dark:bg-zinc-500/80 w-4 h-4 opacity-80 hover:opacity-100"></dt></button>
      <button @click="maximizeApp()"><dt class="rounded-full bg-green-600 dark:bg-green-600 w-4 h-4 opacity-80 hover:opacity-100"></dt></button>
      <button @click="closeApp()"><dt class="rounded-full bg-pink-700 dark:bg-pink-500 w-4 h-4 opacity-80 hover:opacity-100"></dt></button>
    </div>
  </nav>
</template>

<script lang="ts" setup>
const isElectron = (window as any).electron ? true : false
const isWindows = isElectron && (window as any).electron.isWindows
const isWeb = (window as any).isWeb

const closeApp = () => {
  if (!isWeb.value) {
    window.close()
  }
}

const minimizeApp = ()=>{
  if (isElectron) {
    (window as any).electron.minimize()
  }
}

const maximizeApp = ()=>{
  if (isElectron) {
    (window as any).electron.maximize()
  }
}

const setAlwaysOnTop = (flag: boolean)=>{
  if (isElectron) {
    (window as any).electron.setAlwaysOnTop(flag)
  }
}
</script>
