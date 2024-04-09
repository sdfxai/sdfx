<template>
  SETUP
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMainStore, storeToRefs } from '@/stores'

const mainStore = useMainStore()
const ready = ref(false)

onMounted(()=>{
})
</script>
