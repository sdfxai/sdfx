<template>
  <TWModal :open="state.isOpen" @close="close">
    <div class="VuePrompt inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-zinc-800 shadow-lg rounded-md">
      <div class="p-8 sm:flex sm:items-start">
        <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
          <h3 class="text-base leading-6 font-semibold text-zinc-400">
            {{ state.title ? state.title : t('labels.confirmation') }}
          </h3>
          <form @submit.stop.prevent="answer(true)" class="mt-2">
            <TWInput
              v-model="state.value"
              :placeholder="state.placeholder"
              :showOptional="false"
              :autofocus="true"
              class="w-full"
            />
          </form>

          <div class="mt-4 flex-1 flex items-center justify-end space-x-3">
            <button v-if="state.buttons.cancel" type="button" class="tw-button sm gray transparent" @click="answer(false)">
              {{ state.buttons.cancel }}
            </button>
            <button v-if="state.buttons.submit" type="button" class="tw-button sm" @click="answer(true)">
              {{ state.buttons.submit }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </TWModal>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { usePrompt } from './Store'
import TWModal from '@/components/UI/TWModal.vue'
import TWInput from '@/components/UI/TWInput.vue'

const { t } = useI18n()
const { state, answer, close } = usePrompt()
</script>
