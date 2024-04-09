<template>
  <KeepAlive>
    <AppView v-if="route?.name === 'appview'"/>
  </KeepAlive>
  <KeepAlive>
    <GraphView v-if="route?.name === 'graphview'"/>
  </KeepAlive>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useMainStore, storeToRefs } from '@/stores'
import AppView from '@/views/OpenGraph/AppView.vue'
import GraphView from '@/views/OpenGraph/GraphView.vue'

const route = useRoute()
const { workspaces } = storeToRefs(useMainStore())
</script>
