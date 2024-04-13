<template>
  <nav 
    class="fixed shadow-3xl dark:shadow-none border-t border-r border-zinc-200 dark:border-black z-50 bg-white dark:bg-gradient-to-b dark:from-zinc-900 dark:to-zinc-950 text-indigo-300 flex flex-col"
    :class="[
      isWindows?'top-12 h-[calc(100vh-3.2rem)]':'top-0 h-screen',
      status.isLeftPaneVisible?'w-16':'w-16'
    ]"
  >
    <div class="h-10 flex items-center justify-center">
      <button @click="toggleLeftPane()" class="nav-toggle">
        <span class="bar" :class="[status.isLeftPaneVisible?'x':'']"></span>
        <span class="bar" :class="[status.isLeftPaneVisible?'x':'']"></span>
        <span class="bar" :class="[status.isLeftPaneVisible?'x':'']"></span>
      </button>
    </div>

    <nav class="flex-1 noselect flex justify-center">
      <!-- dummy -->
    </nav>

    <nav v-if="false" class="flex-1 noselect text-xs font-semibold text-zinc-600 dark:text-zinc-300">
      <router-link to="/" class="tw-nav-icon">
        <img src="/img/app.png" draggable="false"/>
        <div>App</div>
      </router-link>

      <router-link to="/graph" class="tw-nav-icon">
        <img src="/img/graph.png" draggable="false"/>
        <div>Graph</div>
      </router-link>

      <router-link to="/editor" class="tw-nav-icon">
        <img src="/img/edit.png" draggable="false"/>
        <div>Editor</div>
      </router-link>      
      
      <router-link to="/gallery" class="tw-nav-icon">
        <img src="/img/gallery.png" draggable="false"/>
        <div>Gallery</div>
      </router-link>

      <router-link to="/creator" class="tw-nav-icon">
        <img src="/img/creator.png" draggable="false"/>
        <div>Apps</div>
      </router-link>      
    </nav>

    <nav class="p-2.5 flex flex-col space-y-2.5">
      <button @click="toggleDark()" class="tw-button gray w-full transparent">
        <SunIcon class="tw-icon flex-shrink-0 h-5 w-5 dark:hidden"/>
        <MoonIcon class="tw-icon flex-shrink-0 hidden h-5 w-5 dark:block"/>
      </button>
      <button @click="openSettingsModal()" class="tw-button gray w-full transparent">
        <CogIcon class="tw-icon flex-shrink-0 h-6 w-6"/>
      </button>
    </nav>

    <teleport to="body">
      <ModalSettings
        :open="settingsModalVisible"
        @close="closeSettingsModal"
      />
    </teleport>
  </nav>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useMainStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { useDark, useToggle } from '@vueuse/core'
import { MoonIcon, SunIcon, CogIcon } from '@heroicons/vue/24/solid'
import ModalSettings from '@/components/ModalSettings.vue'

const isDark = useDark()

const isElectron = (window as any).electron ? true : false
const isWindows = isElectron && (window as any).electron.isWindows

const settingsModalVisible = ref(false)

const toggleDark = useToggle(isDark)
const mainStore = useMainStore()
const { status } = storeToRefs(mainStore)

const toggleLeftPane = ()=>{
  mainStore.toggleLeftPane()
}

const openSettingsModal = ()=>{
  settingsModalVisible.value = true
}

const closeSettingsModal = ()=>{
  settingsModalVisible.value = false
}
</script>
