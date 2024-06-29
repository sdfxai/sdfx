<template>
  <ControllerWidget class="PromptTimeline" valueType="string" @change="$emit('change', $event)" v-bind="props" v-slot="{scope}">
    <Box :title="label" class="timeline flex-1 h-full" :isScrollable="false">
      <template #right>
        <div class="flex items-center justify-between space-x-3">

          <TWDropMenu menuWidth="14rem" class="w-6 h-6 flex-shrink-0 border rounded border-zinc-300 dark:border-zinc-700/80">
            <ul class="py-2 font-semibold text-sm text-zinc-800 dark:text-zinc-300 divide-y divide-zinc-300 dark:divide-zinc-900">
              <!-- import -->
              <li @click="importPrompt(scope)" class="px-3 py-2 flex w-full hover:bg-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 cursor-pointer items-center space-x-2">
                <ClipboardDocumentCheckIcon class="w-5 h-5 flex-shrink-0 text-zinc-400/80 dark:text-zinc-500"/>
                <span>Import prompt</span>
              </li>

              <!-- export -->
              <li @click="exportPrompt(scope)" class="px-3 py-2 flex w-full hover:bg-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 cursor-pointer items-center space-x-2">
                <ArrowsRightLeftIcon class="w-5 h-5 flex-shrink-0 text-zinc-400/80 dark:text-zinc-500"/>
                <span>Convert to prompt</span>
              </li>

              <!-- download -->
              <li @click="downloadTracks(scope)" class="px-3 py-2 flex w-full hover:bg-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 cursor-pointer items-center space-x-2">
                <ArrowDownTrayIcon class="w-5 h-5 flex-shrink-0 text-zinc-400/80 dark:text-zinc-500"/>
                <span>Save as timeline</span>
              </li>
              
              <!-- reset timeline -->
              <li  @click="resetTimeline(scope)" class="px-3 py-2 flex w-full hover:bg-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 cursor-pointer items-center space-x-2">
                <TrashIcon class="w-5 h-5 flex-shrink-0 text-zinc-400/80 dark:text-zinc-500"/>
                <span>Reset tracks</span>
              </li>
            </ul>
          </TWDropMenu>
        </div>
      </template>
      <PromptTimeline
        :id="id"
        :modelValue="scope.val"
        :disabled="disabled || loading"
        @change="scope.change($event)"
      />
    </Box>
    <ModalTextPrompt
      v-if="visiblePromptModal"
      :open="true"
      title="Prompt"
      :rows="12"
      :text="promptText"
      :payload="scope"
      :readonly="readonly"
      @close="visiblePromptModal=null"
      @submit="onTextPromptSubmit"
    />
</ControllerWidget>
</template>
<script setup lang="ts">
import { ref, PropType } from 'vue'
import Box from '@/components/UI/Box.vue'
import ControllerWidget from '@/components/controls/ControllerWidget.vue'
import PromptTimeline from '@/components/PromptTimeline.vue'
import TWDropMenu from '@/components/UI/TWDropMenu.vue'
import ModalTextPrompt from '@/components/ModalTextPrompt.vue'
import { saveJSONFile } from '@/utils'
import { useConfirm } from '@/components/UI/VueConfirm/VueConfirm'
import { usePrompt } from '@/components/UI/VuePrompt/VuePrompt'
import { TrashIcon, ArrowDownTrayIcon, ClipboardDocumentCheckIcon, ArrowsRightLeftIcon, CursorArrowRaysIcon } from '@heroicons/vue/24/solid'
import { getCleanPrompt } from '@/utils/prompt'

const emit = defineEmits(['change'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  uid: { type: String, required: false, default: null },
  label: { type: String, required: false, default: null },
  options: { type: Array as PropType<any[]>, required: true },
  target: { type: Object, required: true },
  showLabel: { type: Boolean, required: false, default: true },
  disabled: { type: Boolean, required: false, default: false },
  loading: { type: Boolean, required: false, default: false },
})

const promptText = ref('')

const visiblePromptModal = ref<any>(null)
const readonly = ref<boolean>(false)

const { confirm } = useConfirm()
const { prompt } = usePrompt()

const importPrompt = (scope: any) => {
  readonly.value = false
  promptText.value = ''
  visiblePromptModal.value = true
}

const exportPrompt = (scope: any) => {
  readonly.value = true
  promptText.value = getCleanPrompt(scope.val)
  visiblePromptModal.value = true
}

const onTextPromptSubmit = (text: string, scope: any) => {
  scope.change(text)
  visiblePromptModal.value = false
}

const downloadTracks = async (scope: any) => {
  const name: string = 'timeline'
  const filename = await prompt({
    title: 'Save timeline tracks',
    placeholder: 'Filename',
    value: name.toLowerCase().replaceAll(' ', '-') + '.opentracks.json',
    buttons: {
      submit: 'Download',
      cancel: 'Cancel'
    }
  })

  // @ts-ignore
  if (!filename || !filename.trim()) return

  const json = scope.val
  saveJSONFile(filename, json)
}

const resetTimeline = async (scope: any) => {
  const answer = await confirm({
    message: "Reset and empty all timeline tracks?",
    buttons: {
      delete: 'Reset',
      no: 'Cancel'
    }
  })

  if (answer) {
    scope.change('')
  }
}

</script>