<template>
  <article class="ToggleSettings">
    <div class="flex items-center justify-between">
      <h2 v-if="showLabel" class="text-base text-zinc-800 dark:text-zinc-100 capitalize flex-1 truncate">
        {{ label }}
      </h2>
      <SDFXWidget
        :id="id"
        :label="label"
        :uid="uid"
        type="control"
        component="NodeToggle"
        :showLabel="false"
        :target="target"
        @action="onAction"
      />
    </div>

    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <section v-if="open" class="settings">
        <HTMLComponent
          v-for="(item, idx) in childrin"
          :key="idx"
          v-bind="item"
        />
      </section>
    </transition>
  </article>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, PropType } from 'vue'
import { eventHub } from '@/utils/eventHub'
/* @ts-ignore */
import { sdfx } from '@/libs/sdfx/sdfx'
import SDFXWidget from '@/components/controls/SDFXWidget.vue'
import HTMLComponent from '@/components/controls/HTMLComponent.vue'

const props = defineProps({
  id: { type: String, required: false, default: null },
  uid: { type: String, required: false, default: null },
  label: { type: String, required: false, default: null },
  defaults: { type: Object, required: false, default: null },
  target: { type: Object, required: true },
  showLabel: { type: Boolean, required: false, default: true },
  childrin: { type: Array as PropType<any[]>, required: false, default: null }
})

const open = ref(false)

const onAction = ({ nodeId, actionName, values }: { nodeId: number, actionName: string, values: any[] }) => {
  if (actionName === 'bypass' && values) {
    open.value = values[0]
  }
}

const onNodeAction = (e: any) => { 
  const { uid, nodeId, value } = e
  if (e.uid === props.uid && nodeId === props.target.nodeId) {
    open.value = value
  }
}

const init = ()=>{
  const uid = props.uid /* AppId */
  const nodeId = props.target.nodeId
  const actionName = props.target.actionName /* i.e: mute, bypass ... */

  //console.log(`++++++++++++++ BoxToggleSetting adding node-action-${props.uid}-${nodeId}-${actionName}`)
  eventHub.on(`node-action-${uid}-${nodeId}-${actionName}`, onNodeAction)
}

const release = (uid: string, nodeId: string, actionName: string) => {
  //console.log(`--------------- BoxToggleSetting removing node-action-${props.uid}-${nodeId}-${actionName}`)
  eventHub.off(`node-action-${uid}-${nodeId}-${actionName}`, onNodeAction)
}

onBeforeUnmount(()=>{
  const uid = props.uid /* AppId */
  const nodeId = props.target.nodeId
  const actionName = props.target.actionName

  release(uid, nodeId, actionName)
})

onMounted(()=>{
  open.value = sdfx.getNodeActionValueById(props.target.nodeId, props.target.actionName)
})

watch(() => props.uid, (nv, ov)=>{
  init()
})

init()
</script>