<template>
  <section class="AppList">
    <div v-if="filteredAppList.length<=0" class="mt-8 p-6 flex flex-col items-center justify-center h-full">
      <svg class="w-20 h-20 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" stroke-width="1.0" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3"></path>
      </svg>
      <span class="max-w-xs text-lg text-center mt-3 ">
        Please drag'n drop a SDFX app or a Comfy workflow.
      </span>
    </div>

    <div v-if="filteredAppList.length>0" class="grid grid-cols-2 gap-3">
      <div
        v-for="app in filteredAppList"
        :key="app.uid"
      >
        <dt
          @click="showAppLoader(app.uid)"
          :class="[
            nodegraph.currentAppId===app.uid?'border-teal-400':'border-transparent cursor-pointer',
            app?.meta?.icon?'bg-white dark:bg-zinc-900/60':'shadow-sm bg-white dark:bg-zinc-900'
          ]"
          class="relative rounded-[1rem] border-2 group aspect-w-1 aspect-h-1"
        >

          <!-- app has icon -->
          <div v-if="app?.meta?.icon" class="h-full w-full flex-1 flex items-center justify-center">
            <img :src="app?.meta?.icon" class="w-full h-full rounded-xl object-contain"/>
            <svg class="h-12 w-12 text-zinc-200 dark:text-zinc-800" fill="none" stroke="currentColor" stroke-width="1.0" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"></path>
            </svg>
          </div>

          <!-- no icon -->
          <div v-else class="h-full w-full flex-1 flex items-center justify-center">
            <svg class="h-12 w-12 text-zinc-200 dark:text-zinc-800" fill="none" stroke="currentColor" stroke-width="1.0" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"></path>
            </svg>
          </div>


          <div class="relative hidden group-hover:flex items-center w-full h-full">
            <div class="absolute top-0 right-0 p-1">
              <button @click.stop.prevent="removeApp(app.uid)" class="text-zinc-400 hover:text-zinc-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </dt>

        <div class="p-2 text-xs truncate text-center">
          {{ app.name || 'Untitled' }}
        </div>
      </div>
    </div>

    <ModalAppLoader
      :open="openAppModal"
      :uid="appUid"
      @close="closeAppLoader"
      @submit="loadAppId"
    />

  </section>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useGraphStore, storeToRefs } from '@/stores'
import { useConfirm } from '@/components/UI/VueConfirm/VueConfirm'
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import ModalAppLoader from '@/components/ModalAppLoader.vue'

const props = defineProps({
  query: { type: String, required: false, default: null }
})

const { confirm } = useConfirm()
const openAppModal = ref(false)
const appUid = ref<string | undefined>()
const graphStore = useGraphStore()
const { nodegraph, appList } = storeToRefs(graphStore)

const showAppLoader = (uid: string) => {
  if (nodegraph.value.currentAppId === uid) return

  /*
  if (!nodegraph.value.currentWorkflow) {
    loadAppId(uid)
    return
  }
  */

  openAppModal.value = true
  appUid.value = uid
}

const closeAppLoader = () => {
  openAppModal.value = false
  appUid.value = undefined
}

const loadAppId = (uid: string) => {
  if (nodegraph.value.currentAppId === uid) return
  sdfx.loadAppId(uid)
  closeAppLoader()
}

const getAppList = async () => {
  await graphStore.getAppList()
}

const removeApp = async (uid: string) => {
  const answer = await confirm({
    message: "Delete app from server? This can't be undone.",
    buttons: {
      delete: 'Delete',
      no: 'Cancel'
    }
  })

  if (answer) {
    await graphStore.removeApp(uid)
  }
}

const filteredAppList = computed(() => {
  return appList.value.filter((n: any) => {
    const q = props.query.toLowerCase()

    if (n.name) {
      const cond = n.name.toLowerCase().indexOf(q) > -1
      return props.query ? cond : true
    } else {
      return props.query ? false : true
    }
  })
})

getAppList()
</script>
