<template>
  <section v-if="nodegraph.currentWorkflow" class="MappingInspector flex flex-1 overflow-hidden">
    <ComponentTree
      v-if="nodegraph.currentWorkflow.mapping"
      :components="nodegraph.currentWorkflow?.mapping?.mainpane"
      @select="selectComponent"
      class="noselect flex-1 p-3 scrollable overflow-y-auto"
    />
    <div v-if="!hasMapping" class="p-3">No mapping.</div>
    <aside v-if="selectedComponent" class="w-90 bg-zinc-900 px-6 py-2 h-full scrollable overflow-y-auto">
      <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
        <dt class="flex items-center justify-between py-2">
          <dd class="text-zinc-600 font-semibold">Component</dd>
          <dd class="text-zinc-200">{{ selectedComponent?.component  }}</dd>
        </dt>
        <dt class="flex items-center justify-between py-2">
          <dd class="text-zinc-600 font-semibold">Label</dd>
          <dd class="text-zinc-200">{{ selectedComponent?.label  }}</dd>
        </dt>
        <dt v-if="selectedComponent?.attributes" class="flex items-center justify-between py-2">
          <dd class="text-zinc-600 font-semibold">Attributes</dd>
          <dd class="text-zinc-200">{{ selectedComponent?.attributes  }}</dd>
        </dt>
        <dt v-if="selectedComponent?.type" class="flex items-center justify-between py-2">
          <dd class="text-zinc-600 font-semibold">Type</dd>
          <dd class="text-zinc-200">{{ selectedComponent?.type  }}</dd>
        </dt>
        <dt v-if="selectedComponent?.target" class="flex items-center justify-between py-2">
          <dd class="text-zinc-600 font-semibold">Target</dd>
          <dd class="text-zinc-200">Node #{{ selectedComponent?.target?.nodeId  }}</dd>
        </dt>
        <dt v-if="selectedComponent?.target" class="flex items-center justify-between py-2">
          <dd class="text-zinc-600 font-semibold">Widgets</dd>
          <dd class="text-zinc-200">{{ selectedComponent?.target?.widgetNames  }}</dd>
        </dt>
      </div>
    </aside>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useGraphStore, storeToRefs } from '@/stores'
import ComponentTree from '@/views/OpenGraph/components/ComponentTree.vue'
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx.js'

const graphStore = useGraphStore()
const selectedComponent = ref<any | null>(null)
const { nodegraph } = storeToRefs(graphStore)

const hasMapping = computed(() => {
  return nodegraph.value.currentWorkflow 
    && nodegraph.value.currentWorkflow.mapping
    && Object.keys(nodegraph.value.currentWorkflow.mapping).length>0
})

const selectComponent = (comp: any) => {
  selectedComponent.value = comp
  if (comp.target && comp.target.nodeId) {
    sdfx.animateToNodeId(comp.target.nodeId, 0.60)
  }
}
</script>
