<template>
  <Box title="Preview" :isScrollable="false">
    <template #right>
      <ul class="flex items-center justify-end space-x-3">
        <li @click="tab='image'" :class="[tab==='image'?'bg-teal-700 text-white':'cursor-pointer bg-zinc-300 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-500']" class="rounded-full px-2 py-1 text-xs font-semibold">Image</li>
        <li @click="tab='mask'" :class="[tab==='mask'?'bg-teal-700 text-white':'cursor-pointer bg-zinc-300 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-500']" class="rounded-full px-2 py-1 text-xs font-semibold">Mask</li>
        <li @click="tab='blend'" :class="[tab==='blend'?'bg-teal-700 text-white':'cursor-pointer bg-zinc-300 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-500']" class="rounded-full px-2 py-1 text-xs font-semibold">Blend</li>
      </ul>
    </template>

    <div>
      <div v-if="tab==='image'" class="flex justify-center bg-black">
        <div class="png-grid bg-zinc-300">
          <imgz :src="image" class="w-full object-contain" />
        </div>
      </div>
      <div v-if="tab==='mask'" class="png-grid-dark flex justify-center">
        <imgz :src="mask" class="w-full object-contain" />
      </div>
      <div v-if="tab==='blend'" class="flex justify-center bg-black">
        <div class="png-grid bg-zinc-300">
          <imgz :src="blend" class="w-full object-contain" />
        </div>
      </div>
    </div>
  </Box>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Box from '@/components/UI/Box.vue'
import imgz from '@/components/imgz.vue'

const props = defineProps({
  image: { type: String, required: false, default: null },
  mask: { type: String, required: false, default: null },
  blend: { type: String, required: false, default: null }
})

const { t } = useI18n()
const tab = ref('image')
</script>

<style type="text/css" scoped>
.png-grid {
  --offsetX: 0px;
  --offsetY: 0px;
  --size: 8px;
  --color: rgb(244, 244, 245);
  background-image: linear-gradient(
      45deg,
      var(--color) 25%,
      transparent 0,
      transparent 75%,
      var(--color) 0
    ),
    linear-gradient(45deg, var(--color) 25%, transparent 0, transparent 75%, var(--color) 0);
  background-position: var(--offsetX) var(--offsetY),
    calc(var(--size) + var(--offsetX)) calc(var(--size) + var(--offsetY));
  background-size: calc(var(--size) * 2) calc(var(--size) * 2);
}

.png-grid-dark {
  --offsetX: 0px;
  --offsetY: 0px;
  --size: 8px;
  --color: rgb(34, 34, 37);
  background-image: linear-gradient(
      45deg,
      var(--color) 25%,
      transparent 0,
      transparent 75%,
      var(--color) 0
    ),
    linear-gradient(45deg, var(--color) 25%, transparent 0, transparent 75%, var(--color) 0);
  background-position: var(--offsetX) var(--offsetY),
    calc(var(--size) + var(--offsetX)) calc(var(--size) + var(--offsetY));
  background-size: calc(var(--size) * 2) calc(var(--size) * 2);
}

</style>