<template>
  <section ref="scrollableRef">
    <slot/>
  </section>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import Scrollbar from 'smooth-scrollbar'

const scrollableRef = ref<HTMLElement | null>(null)

onMounted(()=>{
  if (scrollableRef.value) {
    Scrollbar.init(scrollableRef.value, {damping:0.04})
  }
})
</script>