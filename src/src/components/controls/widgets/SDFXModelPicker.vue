<template>
  <ControllerWidget class="SDFXModelPicker" valueType="string" @change="$emit('change', $event)" v-bind="props" v-slot="{scope}">
    <h2 v-if="showLabel" class="tw-formlabel capitalize w-1/3 truncate">
      {{ label }}
    </h2>

    <CheckpointSelector
      v-model="scope.val"
      :loading="loadingModels"
      :options="scope.selectorOptionList"
      :disabled="disabled || loading"
      :label="label"
      @change="scope.change($event)"
      class="flex-1"
      :class="[showLabel?'w-2/3':'w-full']"
    />
  </ControllerWidget>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useModelStore } from '@/stores'
import ControllerWidget from '@/components/controls/ControllerWidget.vue'
import CheckpointSelector from '@/components/CheckpointSelector.vue'

const emit = defineEmits(['change'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  label: { type: String, required: false, default: null },
  options: { type: Array, required: true },
  target: { type: Object, required: true },
  showLabel: { type: Boolean, required: false, default: true },
  disabled: { type: Boolean, required: false, default: false },
  loading: { type: Boolean, required: false, default: false },
})

const loadingModels = ref(false)
const modelStore = useModelStore()

onMounted(async ()=>{
  const nbmodels = Object.keys(modelStore.modelMap).length

  if (nbmodels<=0) {
    loadingModels.value = true
    await modelStore.fetchModels()
    loadingModels.value = false
  }
})
</script>
