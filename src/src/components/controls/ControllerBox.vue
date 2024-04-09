<template>
  <dd v-if="uid" @dblclick="dblclick" class="ControllerBox">
    <slot :scope="{
      id,
      uid,
      label,
      options,
      target,
      showLabel,
      disabled,
      loading,
      
      values: state.vals,
      change,
      click
    }"/>
  </dd>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, PropType } from 'vue'
import { eventHub } from '@/utils/eventHub'
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'

const emit = defineEmits(['click', 'change', 'dblclick'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  uid: { type: String, required: true },
  label: { type: String, required: false, default: null },
  options: { type: Array as PropType<any[]>, required: true },
  target: { type: Object, required: true },
  showLabel: { type: Boolean, required: false, default: true },
  disabled: { type: Boolean, required: false, default: false },
  loading: { type: Boolean, required: false, default: false },
})

let preventWidgetUpdate = false

const state = ref({
  vals: [] as any[]
})

const setDefaultValues = () => {
  const nodeId = props.target.nodeId
  const options = props.options
  const widgetIdxs = props.target.widgetIdxs

  for (let i=0; i<widgetIdxs.length; i++) {
    state.value.vals[i] = sdfx.getNodeWidgetValueById(nodeId, widgetIdxs[i], options[i]?.defaultValue)
  }
}

const click = (e: any)=>{
  const nodeId = props.target.nodeId
  const widgetNames = props.target.widgetNames
  const widgetIdxs = props.target.widgetIdxs
  const values = state.value.vals
  emit('click', { nodeId, widgetNames, widgetIdxs, values })
}

const dblclick = (e: any)=>{
  const nodeId = props.target.nodeId
  const values = state.value.vals
  emit('dblclick', { nodeId, values })
}

const change = (e: any)=>{
  const values = e.values
  for (let i=0; i<values.length; i++) {
    state.value.vals[i] = values[i]
  }

  const nodeId = props.target.nodeId
  const widgetNames = props.target.widgetNames
  const widgetIdxs = props.target.widgetIdxs

  emit('change', { nodeId, widgetNames, widgetIdxs, values })
  
  /*
   * used to sync multiple components if they
   * target the same node / widget
   */
  preventWidgetUpdate = true
  widgetNames.forEach((widgetName: string, widgetIdx: number) => {
    eventHub.emit(`widget-updated-${props.uid}-${nodeId}-${widgetName}`, {
      uid: props.uid,
      nodeId: nodeId,
      widgetName: widgetName,
      value: values[widgetIdx]
    })
  })
  preventWidgetUpdate = false
}

const getWidgetIdx = (widgetName: string) => {
  const widgetNames = props.target.widgetNames
  return widgetNames ? widgetNames.findIndex((w: any) => w === widgetName) : -1
}

/*
 * widget processed and ready so we can
 * set default value for our component
 */
const onWidgetReady = (e: any) => {
  const nodeId = props.target.nodeId
  const widgetName = e.widgetName
  const widgetIdx = getWidgetIdx(widgetName)

  if (props.uid !== e.uid) return
  if (nodeId !== e.nodeId) return
  if (widgetIdx === -1) {
    console.error('Cannot find widget index for widget', widgetName)
    return
  }

  //console.log(`(BoxDimensions) app ${props.uid} set node #${nodeId} [${widgetName}] --> ${e.value}`)
  
  state.value.vals[widgetIdx] = e.value
}

const onWidgetUpdated = (e: any) => {
  if (preventWidgetUpdate) return

  const nodeId = props.target.nodeId
  console.log(e)

  const widgetName = e.widgetName
  const widgetIdx = getWidgetIdx(widgetName)

  if (props.uid !== e.uid) return
  if (nodeId !== e.nodeId) return
  if (widgetIdx === -1) {
    console.error('Cannot find widget index for widget', widgetName)
    return
  }

  state.value.vals[widgetIdx] = e.value
}

const init = ()=>{
  if (!props.target) {
    console.error(`Missing "target" property in mapping with label "${props.label}"`)
    return
  } 

  if (!props.target.nodeId) {
    console.error(`Missing "nodeId" property in mapping.target with label "${props.label}"`)
    return
  } 
  
  if (!props.target.widgetNames) {
    console.error(`Missing "widgetNames" property in mapping.target with label "${props.label}"`)
    return
  }

  preventWidgetUpdate = false
  const nodeId = props.target.nodeId
  const widgetNames = props.target.widgetNames

  //console.log(`++++++++++++++ BoxDimensions adding widget-ready-${props.uid}-${nodeId}-[${widgetNames}]`)
  widgetNames.forEach((widgetName: string) => {
    eventHub.on(`widget-ready-${props.uid}-${nodeId}-${widgetName}`, onWidgetReady)
    eventHub.on(`widget-updated-${props.uid}-${nodeId}-${widgetName}`, onWidgetUpdated)
  })

  setDefaultValues()
}

const release = (nodeId: string, widgetNames: string[])=>{
  if (!widgetNames) return
  //console.log(`--------------- BoxDimensions removing widget-ready-${props.uid}-${nodeId}-${widgetNames}`)
  widgetNames.forEach(widgetName => {
    eventHub.off(`widget-ready-${props.uid}-${nodeId}-${widgetName}`, onWidgetReady)
    eventHub.off(`widget-updated-${props.uid}-${nodeId}-${widgetName}`, onWidgetUpdated)
  })
}

onMounted(()=>{
  init()
})

onBeforeUnmount(()=>{
  if (props.target) {
    const nodeId = props.target.nodeId
    const widgetNames = props.target.widgetNames
    release(nodeId, widgetNames)
  }
})

watch(() => props.uid, (nv, ov)=>{
  init()
})
</script>
