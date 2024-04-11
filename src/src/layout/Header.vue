<template>
  <header class="noselect relative z-50 flex items-center justify-between px-3 h-10 foverflow-hidden flex-shrink-0 border-t border-zinc-300 dark:border-black bg-zinc-50 dark:bg-zinc-900">
    <div class="flex space-x-2">
      <div class="flex space-x-2">
        <router-link to="/" class="tw-nav-item">
          App
        </router-link>
        <router-link to="/graph" class="tw-nav-item">
          Graph
        </router-link>
      </div>
    </div>
    <div class="ml-auto flex space-x-3">
      <a href="https://sdfx.ai" target="_blank" class="flex items-center group font-semibold text-zinc-500 hover:text-teal-800 dark:text-zinc-400 dark:hover:text-teal-200 rounded-md border border-zinc-300 hover:border-teal-600 dark:border-zinc-800 dark:hover:border-teal-700 text-xs space-x-2 px-2 h-8 justify-center">
        <svg class="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-teal-500 dark:group-hover:text-teal-400" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"></path>
        </svg>
        <span>Website</span>
      </a>

      <a href="https://t.me/sdfxai" target="_blank" class="flex items-center group font-semibold text-zinc-500 hover:text-teal-800 dark:text-zinc-400 dark:hover:text-teal-200 rounded-md border border-zinc-300 hover:border-teal-600 dark:border-zinc-800 dark:hover:border-teal-700 text-xs space-x-2 px-2 h-8 justify-center">
        <svg class="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-teal-500 dark:group-hover:text-teal-400" fill="currentColor" viewBox="0 0 512 512"><path d="M477 43.86L13.32 223.29a5.86 5.86 0 0 0-.8.38c-3.76 2.13-30 18.18 7 32.57l.38.14 110.41 35.67a6.08 6.08 0 0 0 5.09-.62l273.85-170.86a6 6 0 0 1 2.2-.83c3.81-.63 14.78-1.81 7.84 7-7.85 10-194.9 177.62-215.66 196.21a6.3 6.3 0 0 0-2.07 4.17l-9.06 108a7.08 7.08 0 0 0 2.83 5.67 6.88 6.88 0 0 0 8.17-.62l65.6-58.63a6.09 6.09 0 0 1 7.63-.39l114.45 83.1.37.25c2.77 1.71 32.69 19.12 41.33-19.76l79-375.65c.11-1.19 1.18-14.27-8.17-22-9.82-8.08-23.72-4-25.81-3.56a6 6 0 0 0-.9.33z"/></svg>
        <span>Telegram</span>
      </a>

      <a href="https://discord.gg/C3GVetwxnU" target="_blank" class="flex items-center group font-semibold text-zinc-500 hover:text-teal-800 dark:text-zinc-400 dark:hover:text-teal-200 rounded-md border border-zinc-300 hover:border-teal-600 dark:border-zinc-800 dark:hover:border-teal-700 text-xs space-x-2 px-2 h-8 justify-center">
        <svg class="w-5 h-5 text-zinc-400 dark:text-zinc-600 group-hover:text-teal-500 dark:group-hover:text-teal-400" fill="currentColor" viewBox="0 0 71 80">
          <path d="M60.1045 13.8978C55.5792 11.8214 50.7265 10.2916 45.6527 9.41542C45.5603 9.39851 45.468 9.44077 45.4204 9.52529C44.7963 10.6353 44.105 12.0834 43.6209 13.2216C38.1637 12.4046 32.7345 12.4046 27.3892 13.2216C26.905 12.0581 26.1886 10.6353 25.5617 9.52529C25.5141 9.44359 25.4218 9.40133 25.3294 9.41542C20.2584 10.2888 15.4057 11.8186 10.8776 13.8978C10.8384 13.9147 10.8048 13.9429 10.7825 13.9795C1.57795 27.7309 -0.943561 41.1443 0.293408 54.3914C0.299005 54.4562 0.335386 54.5182 0.385761 54.5576C6.45866 59.0174 12.3413 61.7249 18.1147 63.5195C18.2071 63.5477 18.305 63.5139 18.3638 63.4378C19.7295 61.5728 20.9469 59.6063 21.9907 57.5383C22.0523 57.4172 21.9935 57.2735 21.8676 57.2256C19.9366 56.4931 18.0979 55.6 16.3292 54.5858C16.1893 54.5041 16.1781 54.304 16.3068 54.2082C16.679 53.9293 17.0513 53.6391 17.4067 53.3461C17.471 53.2926 17.5606 53.2813 17.6362 53.3151C29.2558 58.6202 41.8354 58.6202 53.3179 53.3151C53.3935 53.2785 53.4831 53.2898 53.5502 53.3433C53.9057 53.6363 54.2779 53.9293 54.6529 54.2082C54.7816 54.304 54.7732 54.5041 54.6333 54.5858C52.8646 55.6197 51.0259 56.4931 49.0921 57.2228C48.9662 57.2707 48.9102 57.4172 48.9718 57.5383C50.038 59.6034 51.2554 61.5699 52.5959 63.435C52.6519 63.5139 52.7526 63.5477 52.845 63.5195C58.6464 61.7249 64.529 59.0174 70.6019 54.5576C70.6551 54.5182 70.6887 54.459 70.6943 54.3942C72.1747 39.0791 68.2147 25.7757 60.1968 13.9823C60.1772 13.9429 60.1437 13.9147 60.1045 13.8978ZM23.7259 46.3253C20.2276 46.3253 17.3451 43.1136 17.3451 39.1693C17.3451 35.225 20.1717 32.0133 23.7259 32.0133C27.308 32.0133 30.1626 35.2532 30.1066 39.1693C30.1066 43.1136 27.28 46.3253 23.7259 46.3253ZM47.3178 46.3253C43.8196 46.3253 40.9371 43.1136 40.9371 39.1693C40.9371 35.225 43.7636 32.0133 47.3178 32.0133C50.9 32.0133 53.7545 35.2532 53.6986 39.1693C53.6986 43.1136 50.9 46.3253 47.3178 46.3253Z"/>
        </svg>
        <span>Discord</span>
      </a>

      <button v-if="false" @click="toggleBothPanes()">
        <ChevronUpDownIcon class="tw-icon h-6 w-6 duration-500 ease-out rotate-90" />
      </button>

      <div v-if="!status.isRightPaneVisible" class="h-8 flex items-center justify-center">
        <button @click="toggleRightPane()" class="nav-toggle">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/stores'
import { Cog8ToothIcon, ChevronUpDownIcon } from '@heroicons/vue/24/solid'
import TopMenu from '@/layout/TopMenu.vue'

const mainStore = useMainStore()
const { status } = storeToRefs(mainStore)

const toggleBothPanes = () => {
  const bool = (status.value.isLeftPaneVisible && status.value.isRightPaneVisible) ? false : true
  mainStore.setLeftPane(bool)
  mainStore.setRightPane(bool)
}

const toggleRightPane = () => {
  mainStore.toggleRightPane()
}

</script>
