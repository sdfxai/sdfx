<template>
  <section class="TemplateList grid grid-cols-2 gap-3">
    <div
      v-for="template in filteredTemplateList"
      :key="template.uid"
      :draggable="true"
      @dragstart="dragstart($event, template.uid)"
      @dragend="dragend($event, template.uid)"
      @mouseup="isDragging=false"
    >
      <dt
        @click="loadTemplateId(template.uid)"
        class="relative rounded-md border-2 border-zinc-200 dark:border-zinc-800 aspect-w-1 aspect-h-1 bg-zinc-200 dark:bg-zinc-900"
        :class="[isDragging?'cursor-grabbing':'cursor-grab']"
      >
        <div class="relative w-full h-full bg-green-300">
          <div class="absolute top-0 right-0 p-1">
            <button v-if="!isDragging" @click.stop.prevent="removeTemplate(template.uid)" class="text-zinc-400 hover:text-zinc-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </dt>

      <div class="p-2 text-xs truncate text-center">
        {{ template.name }}
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useGraphStore, storeToRefs } from '@/stores'
import { useConfirm } from '@/components/UI/VueConfirm/VueConfirm'

const graphStore = useGraphStore()
const { nodegraph, templateList } = storeToRefs(graphStore)

const { confirm } = useConfirm()
const isDragging = ref(false)

const loadTemplateId = (uid: string) => {
  graphStore.getTemplate(uid)
}

const dragstart = (e: any, uid: string) => {
  isDragging.value = true
  const type = 'nodetemplate'
  e.dataTransfer.setData('text', JSON.stringify({type, uid}))
}

const dragend = (e: any, uid: string) => {
  isDragging.value = false
}

const removeTemplate = async (uid: string) => {
  const answer = await confirm({
    message: "Delete template from server? This can't be undone.",
    buttons: {
      delete: 'Delete',
      no: 'Cancel'
    }
  })

  if (answer) {
    await graphStore.removeTemplate(uid)
  }
}

const filteredTemplateList = computed(() => {
  return templateList.value
})

onMounted(() => {
  graphStore.getTemplateList()
})
</script>
