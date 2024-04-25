<template>
  <dd v-if="uid" @dblclick="dblclick" :class="[expand?'h-full':null]" class="ControllerWidget flex items-center justify-between space-x-4">
    <slot :scope="{
      id,
      uid,
      valueType,
      label,
      options,
      option:options[0],
      target,
      showLabel,
      disabled,
      loading,

      val,
      animate,
      selectorOptionList,

      change,
      upload,
      click
    }"/>
  </dd>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { eventHub } from '@/utils/eventHub'

// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import { PropType } from 'vue'

const emit = defineEmits(['change', 'click', 'dblclick'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  uid: { type: String, required: false, default: '' }, /* appId */
  valueType: { type: String, required: false, default: null },
  label: { type: String, required: false, default: null },
  options: { type: Array as PropType<any[]>, required: false, default:null },
  target: { type: Object, required: true },
  expand: { type: Boolean, required: false, default: false },
  showLabel: { type: Boolean, required: false, default: true },
  disabled: { type: Boolean, required: false, default: false },
  loading: { type: Boolean, required: false, default: false },
})

let preventWidgetUpdate = false

const val = ref<any>(null)
const animate = ref(true) /* certain components use animation */
const selectorOptionList = ref([])

const setDefaultValue = () => {
  const nodeId = props.target.nodeId /* target nodeId */
  const widgetIdx = props.target.widgetIdxs[0]
  const option = props.options[0]
  val.value = sdfx.getNodeWidgetValueById(nodeId, widgetIdx, option?.defaultValue)
}

const dblclick = (e: any)=>{
  const nodeId = props.target.nodeId
  const values = [val.value]
  emit('dblclick', { nodeId, values })
}

const click = (value: any) => {
  const nodeId = props.target.nodeId
  const widgetNames = props.target.widgetNames
  const widgetIdxs = props.target.widgetIdxs
  const values = [value]
  emit('click', { nodeId, widgetNames, widgetIdxs, values })
}

const upload = async (e: any) => {
  if (!sdfx.graph) return

  const nodeId = props.target.nodeId
  const node = sdfx.graph.getNodeById(nodeId)
  await sdfx.uploadImage(node, e.file.name, e.blob)
}

const change = (value: any) => {
  if (typeof value === 'undefined' || value===null) return
  if (props.valueType && typeof value !== props.valueType) return
  if (value && value.target && value.isTrusted) {
    // a bug(?) is sometimes sending a DomEvent to value (i.e: on blur)
    return
  }
  
  const nodeId = props.target.nodeId
  const widgetNames = props.target.widgetNames
  const widgetIdxs = props.target.widgetIdxs
  const values = [value]

  val.value = value

  emit('change', { nodeId, widgetNames, widgetIdxs, values })

  /*
   * used to sync multiple components if they
   * target the same node / widget
   */

  if (widgetNames && widgetNames[0]) {
    preventWidgetUpdate = true
    eventHub.emit(`widget-updated-${props.uid}-${nodeId}-${widgetNames[0]}`, {
      value: value
    })
    preventWidgetUpdate = false
  } else {
    console.error(`Missing or invalid widgetNames (${widgetNames}) for node #${nodeId}`)
  }
}

/*
 * widget processed and ready so we can
 * set default value for our component
 */
const onWidgetReady = (e: any) => {
  const nodeId = e.nodeId
  const widget = e.widgetName
  
  if (props.uid !== e.uid) {
    console.error('props.uid mismatch e.uid', props.uid, e.uid)
  }
  
  // console.log(`(ControllerWidget) app ${props.uid} set node #${nodeId} [${widget}] --> ${e.value}`)
  if (e.optionArray) {
    // console.log(`(ControllerWidget) found selector options`)
    selectorOptionList.value = e.optionArray.map((o: any) => ({ name:o, value:o }))
  }

  val.value = e.value
}

/*
 * triggered only when widget is updated
 * on LiteGraph (i.e: manually on the canvas)
 * also disable any animation when upadating
 */
const onWidgetUpdated = (e: any) => {
  if (preventWidgetUpdate) return

  if (e.optionArray) {
    // console.log(`(ControllerWidget) selector options updated`)
    selectorOptionList.value = e.optionArray.map((o: any) => ({ name:o, value:o }))
  }

  animate.value = false
  val.value = e.value
  nextTick(()=>{
    animate.value = true
  })
}

/**
 * Get option list from node to build our TWSelector.
 * Only selector widgets (combo widgets in LiteGraph jargon)
 * have optionArray.values (list of strings)
 * So we use this list to build the array needed by
 * our TWSelector (an array of { name, value })
 */
const feedSelectorOptionList = ()=>{
  const nodeId = props.target.nodeId
  const widgetIdx = props.target.widgetIdxs[0]

  selectorOptionList.value = []

  const optionArray = sdfx.getNodeWidgetSelectorOptionsById(nodeId, widgetIdx)

  if (optionArray && optionArray.values && optionArray.values.length > 0) {
    // console.log(`(ControllerWidget) app ${props.uid} got node #${nodeId} [${widget}] selector options`, optionArray.values)
    selectorOptionList.value = optionArray.values.map((o: any) => ({ name:o, value:o }))
  }
}

const init = ()=>{
  if (!props.target.widgetNames) {
    console.error(`Missing widget names for ${props.uid} ${props.target.nodeId} ${props.target.widgetIdxs}`)
    return
  }

  preventWidgetUpdate = false
  const nodeId = props.target.nodeId
  const widgetName = props.target.widgetNames[0] /* i.e: cfg */
  const widgetIdx = props.target.widgetIdxs[0]

  //console.log('')
  //console.log(`++++++++++++++ ControllerWidget adding widget-ready-${props.uid}-${nodeId}-${widgetName}`)
  eventHub.on(`widget-ready-${props.uid}-${nodeId}-${widgetName}`, onWidgetReady)
  eventHub.on(`widget-updated-${props.uid}-${nodeId}-${widgetName}`, onWidgetUpdated)
  setDefaultValue()
  feedSelectorOptionList()
}

const release = (uid: string, nodeId: string, widgetName: string)=>{
  // console.log(`--------------- ControllerWidget removing widget-ready-${props.uid}-${nodeId}-${widgetName}`)
  eventHub.off(`widget-ready-${uid}-${nodeId}-${widgetName}`, onWidgetReady)
  eventHub.off(`widget-updated-${uid}-${nodeId}-${widgetName}`, onWidgetUpdated)
}

onBeforeUnmount(()=>{
  if (!props.target.widgetNames) {
    console.error(`Missing widget names for ${props.uid} ${props.target.nodeId} ${props.target.widgetIdxs}`)
    return
  }

  const uid = props.uid /* AppId */
  const nodeId = props.target.nodeId
  const widgetName = props.target.widgetNames[0] /* i.e: cfg */

  release(uid, nodeId, widgetName)
})

watch(() => props.uid, (nv, ov)=>{
  init()
})

init()
</script>
