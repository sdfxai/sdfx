<template>
  <section class="AppDetails p-6">
    <AppMeta :workflow="nodegraph.currentWorkflow" class="space-x-6"/>
  </section>
</template>

<script lang="ts" setup>
import { useGraphStore, storeToRefs } from '@/stores'
import AppMeta from '@/components/AppMeta.vue'
const { nodegraph } = storeToRefs(useGraphStore())
</script>
