<template>
  <section class="AppMeta flex justify-between">
    <div class="w-48 h-48 flex-shrink-0 flex items-center justify-center rounded-[3rem] border-2 border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <img v-if="workflow?.meta?.icon" :src="workflow?.meta?.icon" class="w-48 h-48 rounded-xl object-contain"/>
      <svg class="mx-auto h-20 w-20 text-zinc-200 dark:text-zinc-800" fill="none" stroke="currentColor" stroke-width="1.0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"></path>
      </svg>
    </div>
    <div class="flex-1 divide-y divide-zinc-200 dark:divide-zinc-800">
      <article class="py-2 flex items-center justify-between w-full">
        <dt class="text-zinc-400 dark:text-zinc-500 font-semibold w-24">Name</dt>
        <dd class="text-zinc-700 dark:text-zinc-200 text-right">
          {{ workflow.name || 'Untitled' }}
        </dd>
      </article>
      <article class="py-2 flex items-center justify-between w-full">
        <dt class="text-zinc-400 dark:text-zinc-500 font-semibold w-24">Version</dt>
        <dd class="text-zinc-700 dark:text-zinc-200 text-right">
          {{ workflow.meta?.version || 'n/a' }}
        </dd>
      </article>
      <article class="py-2 flex items-center justify-between w-full">
        <dt class="text-zinc-400 dark:text-zinc-500 font-semibold w-24">Author</dt>
        <dd class="text-zinc-700 dark:text-zinc-200 text-right">
          {{ workflow.meta?.author || 'n/a' }}
        </dd>
      </article>
      <article class="py-2 flex items-center justify-between w-full">
        <dt class="text-zinc-400 dark:text-zinc-500 font-semibold w-24">License</dt>
        <dd class="text-zinc-700 dark:text-zinc-200 text-right">
          {{ workflow.meta?.license || 'n/a' }}
        </dd>
      </article>
      <article v-if="workflow?.meta?.url" class="py-2 flex items-center justify-between w-full">
        <dt class="text-zinc-400 dark:text-zinc-500 font-semibold w-24">URL</dt>
        <dd class="text-zinc-700 dark:text-zinc-200 text-right">
          <a :href="workflow.meta?.url" class="tw-underlink" target="_blank">{{ workflow.meta?.url }}</a>
        </dd>
      </article>
      <article v-if="workflow?.meta?.keywords" class="py-2 flex items-center justify-between w-full">
        <dt class="text-zinc-400 dark:text-zinc-500 font-semibold w-24">Keywords</dt>
        <dd class="text-zinc-700 dark:text-zinc-200 text-right">
          {{ workflow.meta?.keywords }}
        </dd>
      </article>
      <article class="py-2">
        <dt class="text-zinc-400 dark:text-zinc-500 font-semibold w-24">Description</dt>
        <dd class="text-zinc-700 dark:text-zinc-200 mt-2 line-clamp-5 flex-1">
          {{ workflow.meta?.description || 'SDFX workflow' }}
        </dd>
      </article>
    </div>
  </section>
</template>
<script lang="ts" setup>

const props = defineProps({
  workflow: { type: Object, required: false, default: null }
})
</script>
