<template>
  <div v-if="metadata" class="space-y-6 text-zinc-800 dark:text-zinc-100">
    <!-- prompts -->
    <div class="space-y-4">
      <TWTextarea v-if="metadata.prompt" label="Positive Prompt" v-model="metadata.prompt" readonly :showOptional="false" :height="promptHeight" class="flex-auto"/>
      <TWTextarea v-if="metadata.negative_prompt" label="Negative Prompt" v-model="metadata.negative_prompt" readonly :showOptional="false" :height="promptHeight" class="flex-auto"/>
    </div>

    <div class="space-y-3">
      <!-- sampler -->
      <div class="flex items-center justify-between space-x-6">
        <dt class="noselect font-semibold text-sm w-12">Sampler</dt>
        <code class="flex-1 bg-white shadow-sm dark:shadow-none dark:bg-zinc-800 px-2 py-1 rounded-md text-right">
          {{ metadata.sampler }}
        </code>
      </div>

      <!-- model name -->
      <div class="flex items-center justify-between space-x-6">
        <dt class="noselect font-semibold text-sm w-12">Model</dt>
        <code class="flex-1 bg-white shadow-sm dark:shadow-none dark:bg-zinc-800 px-2 py-1 rounded-md text-right">
          {{ metadata.model_name }}
        </code>
      </div>

      <!-- seed -->
      <div class="flex items-center justify-between space-x-6">
        <dt class="noselect font-semibold text-sm w-32">Seed</dt>
        <code class="flex-1 bg-white shadow-sm dark:shadow-none dark:bg-zinc-800 px-2 py-1 rounded-md text-right">
          {{ metadata.seed }}
        </code>
      </div>

      <!-- CFG scale / Steps -->
      <div class="flex items-center justify-between space-x-10">
        <div class="w-1/2 flex items-center justify-between space-x-6">
          <dt class="noselect font-semibold text-sm w-12">CFG</dt>
          <code class="flex-1 bg-white shadow-sm dark:shadow-none dark:bg-zinc-800 px-2 py-1 rounded-md text-right">
            {{ metadata.cfg_scale }}
          </code>
        </div>
        <div class="w-1/2 flex items-center justify-between space-x-6">
          <dt class="noselect font-semibold text-sm w-12">Steps</dt>
          <code class="flex-1 bg-white shadow-sm dark:shadow-none dark:bg-zinc-800 px-2 py-1 rounded-md text-right">
            {{ metadata.steps }}
          </code>
        </div>
      </div>

      <!-- image width / height -->
      <div v-if="metadata.image_size" class="flex items-center justify-between space-x-10">
        <div class="w-1/2 flex items-center justify-between space-x-6">
          <dt class="noselect font-semibold text-sm w-12">Width</dt>
          <code class="flex-1 bg-white shadow-sm dark:shadow-none dark:bg-zinc-800 px-2 py-1 rounded-md text-right">
            {{ metadata.image_size.width }}
          </code>
        </div>
        <div class="w-1/2 flex items-center justify-between space-x-6">
          <dt class="noselect font-semibold text-sm w-12">Height</dt>
          <code class="flex-1 bg-white shadow-sm dark:shadow-none dark:bg-zinc-800 px-2 py-1 rounded-md text-right">
            {{ metadata.image_size.height }}
          </code>
        </div>
      </div>

      <!-- model hash -->
      <div class="flex items-center justify-between space-x-6">
        <dt class="noselect font-semibold text-sm w-32">Model Hash</dt>
        <code class="flex-1 bg-white shadow-sm dark:shadow-none dark:bg-zinc-800 px-2 py-1 rounded-md text-right">
          {{ metadata.model_hash }}
        </code>
      </div>

      <!-- version -->
      <div class="flex items-center justify-between space-x-6">
        <dt class="noselect font-semibold text-sm w-32">Version</dt>
        <code class="flex-1 bg-white shadow-sm dark:shadow-none dark:bg-zinc-800 px-2 py-1 rounded-md text-right">
          {{ metadata.version ? metadata.version : 'n/a' }}
        </code>
      </div>

      <!-- face restoration -->
      <div class="flex items-center justify-between space-x-6">
        <dt class="noselect font-semibold text-sm w-32">Face Restoration</dt>
        <code class="flex-1 bg-white shadow-sm dark:shadow-none dark:bg-zinc-800 px-2 py-1 rounded-md text-right">
          {{ metadata.face_restoration ? metadata.face_restoration : 'n/a'  }}
        </code>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import TWTextarea from '@/components/UI/TWTextarea.vue'

const props = defineProps({
  metadata: { type: Object, required: false, default: null },
  promptHeight: { type: String, required: false, default: '62px' }
})
</script>