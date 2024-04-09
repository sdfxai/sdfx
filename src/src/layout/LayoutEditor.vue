<template>
  <div class="flex flex-col transition-colors">
    <AppBar v-if="isWindows"/>
    <div class="flex" :class="[isWindows?'h-[calc(100vh-3.2rem)]':'h-screen']">
      <SideBar />
      <main 
        class="w-full flex flex-1 flex-col bg-zinc-100 text-zinc-900 transition-all divide-y divide-zinc-200 dark:divide-black dark:bg-zinc-900 dark:text-zinc-100"
        :class="[
          'pl-16',
          { 'pr-80 lg:pr-80 xl:pr-90 2xl:pr-100 3xl:pr-110': status.isRightPaneVisible }
        ]"
      >
        <article class="grow flex-col overflow-hidden bg-white dark:bg-zinc-950/50">
          <router-view />
        </article>
        <Footer />
      </main>
      <RightPane />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useMainStore, storeToRefs } from '@/stores'
import Header from '@/layout/Header.vue'
import Footer from '@/layout/Footer.vue'
import LeftPane from '@/layout/LeftPane.vue'
import RightPane from '@/layout/RightPane.vue'
import AppBar from '@/layout/AppBar.vue'
import SideBar from '@/layout/SideBar.vue'

const { status } = storeToRefs(useMainStore())

const isElectron = (window as any).electron ? true : false
const isWindows = isElectron && (window as any).electron.isWindows
const isWeb = (window as any).isWeb
</script>
