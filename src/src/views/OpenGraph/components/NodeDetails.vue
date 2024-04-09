<template>
  <div>
    <!-- node details and widgets -->
    <div class="divide-y divide-zinc-900">
      <SDFXWidget
        label="Enabled"
        component="NodeToggle"
        :target="{
          nodeId: node.id,
          nodeType: node.type,
          actionName: 'bypass'
        }"
        :showLabel="true"
        :key="node.id"
        @action="toggleBypass"
        class="px-1 py-2.5"
      />

      <SDFXWidget
        v-if="compMap[node.type]"
        :label="node.title || node.type"
        :disabled="disabled"
        :component="compMap[node.type].component"
        :target="{
          nodeId: node.id,
          nodeType: node.type,
          widgetNames: compMap[node.type].widgetNames,
          widgetIdxs: compMap[node.type].widgetIds
        }"
        :showLabel="compMap[node.type].showLabel"
        :key="node.id"
        class="px-1 py-2.5"
      />
      <div v-else v-for="(widget, idx) in node.widgets" :key="widget.id">
        <div v-if="widget && widget.type && !discardedWidgets.includes(widget.type)">
          <SDFXWidget
            :label="widget.defaults?.name || widget.name"
            :disabled="disabled"
            :component="widget.defaults?.type || widget.type"
            :templates="[widget.name]"
            :target="{
              nodeId: node.id,
              nodeType: node.type,
              widgetNames: [widget.name],
              widgetIdxs: [idx]
            }"
            :showLabel="true"
            :key="node.id+''+idx"
            class="px-1 py-2.5"
          />
        </div>
      </div>
    </div>

    <!-- node output images -->
    <div v-if="nodegraph.nodeOutputs[String(node.id)]">
      <dd v-for="img in nodegraph.nodeOutputs[node.id].images">
        <imgz :src="sdfx.getImageUrl(img)" />
      </dd>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import { useGraphStore, storeToRefs } from '@/stores'
import SDFXWidget from '@/components/controls/SDFXWidget.vue'
import imgz from '@/components/imgz.vue'

const disabled = ref(false)

const props = defineProps({
  node: { type: Object, required: true }
})

const discardedWidgets = [
  'converted-widget'
]

const compMap: any = {
  'LoadImage': {
    component: 'ImageLoader',
    templates: ['image'],
    widgetNames: ['image'],
    widgetIds: [0],
    showLabel: true
  }
}

const { nodegraph } = storeToRefs(useGraphStore())

const toggleBypass = (e: any) => {
  const { nodeId, actionName, values } = e
  // disabled.value = !values[0]
}
</script>
