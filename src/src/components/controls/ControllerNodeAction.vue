<template>
  <dd v-if="uid" @dblclick="dblclick" class="ControllerNodeAction flex items-center justify-between">
    <slot :scope="{
      id,
      uid,
      valueType,
      label,
      options,
      option:{} as any,
      target,
      showLabel,
      disabled,
      loading,
      val,
      action
    }"/>
  </dd>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { eventHub } from '@/utils/eventHub'

// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import { PropType } from 'vue'

const emit = defineEmits(['action', 'dblclick'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  uid: { type: String, required: false, default: '' }, /* appId */
  valueType: { type: String, required: false, default: null },
  label: { type: String, required: false, default: null },
  options: { type: Array as PropType<any[]>, required: false, default: () => []},
  target: { type: Object, required: true },
  showLabel: { type: Boolean, required: false, default: true },
  disabled: { type: Boolean, required: false, default: false },
  loading: { type: Boolean, required: false, default: false },
})

let preventNodeUpdate = false

const val = ref<any>(null)

const setDefaultValue = () => {
  const nodeId = props.target.nodeId /* target nodeId */
  const node = sdfx.getLiteGraphNodeById(nodeId)

  if (node) {
    if (props.target.actionName === 'bypass') val.value = node.mode === 4 ? false : true
    if (props.target.actionName === 'docked') val.value = node.docked ? true : false
  }
}

const dblclick = (e: any)=>{
  const nodeId = props.target.nodeId
  const values = [val.value]
  emit('dblclick', { nodeId, values })
}

const action = (value: any) => {
  if (typeof value === 'undefined' || value === null) return
  if (props.valueType && typeof value !== props.valueType) return

  const uid = props.uid
  const nodeId = props.target.nodeId
  const actionName = props.target.actionName
  const values = [value]
  val.value = value

  emit('action', { uid, nodeId, actionName, values })

  /*
   * used to sync multiple components if they
   * target the same node
   */
  preventNodeUpdate = true
  eventHub.emit(`node-action-${props.uid}-${nodeId}-${actionName}`, {
    uid: uid,
    nodeId: nodeId,
    actionName: actionName,
    value: value
  })
  preventNodeUpdate = false
}

/*
 * triggered only when node is updated
 * on LiteGraph (i.e: manually on the canvas)
 */
const onNodeAction = (e: any) => {
  if (preventNodeUpdate) return
  val.value = e.value
}

const init = ()=>{
  preventNodeUpdate = false
  const nodeId = props.target.nodeId
  const actionName = props.target.actionName /* i.e: mute, bypass ... */

  //console.log(`++++++++++++++ ControllerNodeAction adding node-action-${props.uid}-${nodeId}-${actionName}`)
  eventHub.on(`node-action-${props.uid}-${nodeId}-${actionName}`, onNodeAction)
  setDefaultValue()
}

const release = (uid: string, nodeId: string, actionName: string) => {
  //console.log(`--------------- ControllerNodeAction removing node-action-${props.uid}-${nodeId}-${actionName}`)
  eventHub.off(`node-action-${uid}-${nodeId}-${actionName}`, onNodeAction)
}

onBeforeUnmount(()=>{
  const uid = props.uid /* AppId */
  const nodeId = props.target.nodeId
  const actionName = props.target.actionName

  release(uid, nodeId, actionName)
})

watch(() => props.uid, (nv, ov)=>{
  init()
})

init()
</script>
