<template>
  <component
    v-if="syncComponent"
    :is="syncComponent"
    :options="options"
    v-bind="props"
    :label="computedLabel"
    :uid="uid"
    :key="uid"
    @action="action($event)"
    @change="change($event)"
    @click="click($event)"
    @dblclick="dblclick($event)"
  />
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGraphStore, storeToRefs } from '@/stores'
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'

/* widgets components */
import SDFXButton from '@/components/controls/widgets/SDFXButton.vue'
import SDFXDragNumber from '@/components/controls/widgets/SDFXDragNumber.vue'
import SDFXImageLoader from '@/components/controls/widgets/SDFXImageLoader.vue'
import SDFXInput from '@/components/controls/widgets/SDFXInput.vue'
import SDFXModelPicker from '@/components/controls/widgets/SDFXModelPicker.vue'
import SDFXNumber from '@/components/controls/widgets/SDFXNumber.vue'
import SDFXSelector from '@/components/controls/widgets/SDFXSelector.vue'
import SDFXSlider from '@/components/controls/widgets/SDFXSlider.vue'
import SDFXTextArea from '@/components/controls/widgets/SDFXTextArea.vue'
import SDFXPrompt from '@/components/controls/widgets/SDFXPrompt.vue'
import SDFXToggle from '@/components/controls/widgets/SDFXToggle.vue'
import SDFXPreview from '@/components/controls/widgets/SDFXPreview.vue'
import SDFXPromptTimeline from '@/components/controls/widgets/SDFXPromptTimeline.vue'

/* boxes components */
import BoxPreview from '@/components/boxes/BoxPreview.vue'
import BoxDimensions from '@/components/controls/boxes/BoxDimensions.vue'
import BoxSeed from '@/components/controls/boxes/BoxSeed.vue'

/* actionners components */
import NodeToggle from '@/components/controls/actionners/NodeToggle.vue'

import { PropType } from 'vue'

const emit = defineEmits(['change', 'action', 'click', 'dblclick'])

type ComponentType = 'toggle'
  | 'slider' | 'text' | 'input' | 'number' | 'dragnumber'  
  | 'customtext' | 'textarea' | 'prompt' | 'selector' | 'combo' | 'button'
  | 'ModelPicker' | 'NodeToggle' 
  | 'preview' | 'ImageLoader' | 'PromptTimeline'
  | 'BoxSeed' | 'BoxDimensions' | 'BoxPreview'

const props = defineProps({
  id: { type: String, required: false, default: null },
  label: { type: String, required: false, default: null },
  type: { type: String, required: false, default: null },
  component: { type: String as PropType<ComponentType>, required: true },
  defaults: { type: Object, required: false, default: null },
  target: { type: Object, required: true },
  showLabel: { type: Boolean, required: false, default: true },
  loading: { type: Boolean, required: false, default: false },
  disabled: { type: Boolean, required: false, default: false }
})

const graphStore = useGraphStore()
const { nodegraph } = storeToRefs(graphStore)
const uid = computed(() => nodegraph.value.currentAppId)

const syncComponent = computed(()=>{
  const widgetToComponentMap = {
    'slider': SDFXSlider,
    'text': SDFXInput,
    'input': SDFXInput,
    'number': SDFXNumber,
    'dragnumber': SDFXDragNumber,
    'customtext': SDFXTextArea,
    'prompt': SDFXPrompt,
    'textarea': SDFXTextArea,
    'selector': SDFXSelector,
    'combo': SDFXSelector,
    'button': SDFXButton,
    'toggle': SDFXToggle,
    'preview': SDFXPreview,
    'ModelPicker': SDFXModelPicker,
    'ImageLoader': SDFXImageLoader,

    'PromptTimeline': SDFXPromptTimeline,
    'BoxPreview': BoxPreview,
    'BoxDimensions': BoxDimensions,
    'BoxSeed': BoxSeed,
    'NodeToggle': NodeToggle
  }

  const comp = widgetToComponentMap[props.component]

  if (!props.component || !comp) {
    console.error(`Undefined "${props.component}" SDFXWidget for widget "${props.target.widgetNames}"`)
    return null
  }

  return comp
})

const options = ref([] as any[])

const computedLabel = computed(() => {
  if (props.label) {
    return props.label.replaceAll('_', ' ')
  }

  if (options.value.length>0 && options.value[0].name) {
    return options.value[0].name
  }

  if (props.target.widgetNames) {
    console.warn(`Missing "label" property in mapping for node #${props.target.nodeId}. Fallback to "${props.target.widgetNames}"`)
    return props.target.widgetNames[0]
  } else {
    console.error(`Invalid "label" and missing "widgetNames" property in mapping for node #${props.target.nodeId}`)
  }

  return undefined
})

if (!props.target.nodeId) {
  console.error(`Missing "nodeId" property in mapping.target with label "${props.label}"`)
}

if (!props.target.nodeType) {
  console.error(`Missing "nodeType" property in mapping.target for node #${props.target.nodeId} with label "${props.label}""`)
}

const setDefaults = () => {
  if (props.target.widgetNames) {
    options.value = props.target.widgetNames.map((widgetName: string) => {
      // @ts-ignore
      const localDefaults = props.defaults && props.defaults[widgetName] ? props.defaults[widgetName] : null

      if (localDefaults) {
        return localDefaults
      }

      const defaults = sdfx.getWidgetDefaults(props.target.nodeId, props.target.nodeType, widgetName)

      if (!defaults) {
        console.warn(`No defaults found for node #${props.target.nodeId} widget "${widgetName}"`)
      }

      return defaults ? defaults : {}
    })
  }
}

const action = (e: any) => {
  const { nodeId, actionName, values } = e
  sdfx.executeNodeActionById(nodeId, actionName, values)
  emit('action', e)
}

const change = (e: any) => {
  const { nodeId, widgetNames, widgetIdxs, values } = e
  sdfx.updateNodeWidgetsById(nodeId, widgetIdxs, values)
  emit('change', e)
}

const click = (e: any) => {
  const { nodeId, widgetNames, widgetIdxs, values } = e
  sdfx.callNodeWidgetsById(nodeId, widgetIdxs, values)
  emit('click', e)
}

const dblclick = (e: any) => {
  const { nodeId, values } = e
  sdfx.animateToNodeId(nodeId)
  emit('dblclick', e)
}

onMounted(()=>{
  // setDefaults()
})

setDefaults()
</script>
