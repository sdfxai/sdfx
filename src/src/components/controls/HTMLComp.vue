<template>
  <component
    v-if="syncComponent"
    :is="syncComponent"
    v-bind="props.attributes"

    :label="label"
    :showLabel="showLabel"
    :class="class"
    :target="target"
    :childrin="childrin"

    :uid="uid"
    :key="uid"
    :component="component"
    @action="action($event)"
    @change="change($event)"
    @click="click($event)"
    @dblclick="dblclick($event)"
  >
    <template
      v-if="childrin"
      v-for="(item, idx) in childrin"
      :key="idx"
    >
      <HTMLComponent v-bind="item"/>
    </template>
  </component>
</template>
<script setup lang="ts">
import { computed, defineComponent } from 'vue'
import { useGraphStore, storeToRefs } from '@/stores'
// @ts-ignore
import { PropType } from 'vue'
import HTMLComponent from '@/components/controls/HTMLComponent.vue'

import ToggleSettings from '@/components/controls/custom/ToggleSettings.vue'
import SplitH from '@/components/controls/custom/SplitH.vue'
import SplitV from '@/components/controls/custom/SplitV.vue'
import SplitPane from '@/components/controls/custom/SplitPane.vue'

import TabBar from '@/components/controls/custom/TabBar.vue'
import TabBox from '@/components/controls/custom/TabBox.vue'
import Tab from '@/components/controls/custom/Tab.vue'

const emit = defineEmits(['change', 'action', 'click', 'dblclick'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  label: { type: String, required: false, default: null },
  class: { type: String, required: false, default: null },
  type: { type: String as any, required: false, default: null },
  component: { type: String as any, required: true },
  target: { type: Object, required: false, default: null },
  showLabel: { type: Boolean, required: false, default: true },
  attributes: { type: Object as any, required: false, default:()=>({}) },
  innerText: { type: String as any, required: false, default: null },
  childrin: { type: Array as PropType<any[]>, required: false, default:null },
  loading: { type: Boolean, required: false, default: false },
  disabled: { type: Boolean, required: false, default: false }
})

const { nodegraph } = storeToRefs(useGraphStore())
const uid = computed(() => nodegraph.value.currentAppId)

const createVueComponent = (htmlTagName: string) => {
  if (htmlTagName === 'img') {
    return defineComponent({
      template: `<img class="img"/>`
    })
  }

  return defineComponent({
    template: `<${htmlTagName}><slot/></${htmlTagName}>`
  })
}

const createVueTextNode = (innerText: string) => {
  return defineComponent({
    template: `${innerText}`
  })
}

const syncComponent = computed(()=>{
  const allowed = [
    'div', 'p', 'section', 'code', 'pre', 'ul', 'li', 'ol',
    'article', 'aside', 'details', 'figcaption', 'figure', 'footer', 'header', 'main', 'mark', 'nav', 'summary',
    'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot',
    'strong', 'em', 'b', 'i', 'u', 's', 'br', 'hr',
    'blockquote', 'cite', 'abbr', 'acronym', 'address',
    'sub', 'sup', 'caption', 'col', 'colgroup', 'dd', 'dl', 'dt', 'fieldset',
    'label', 'legend', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'svg', 'img', 'video', 'iframe',
    
    /**
     * Special components
    */
    'textNode', 'ToggleSettings',
    'SplitH', 'SplitV', 'SplitPane',
    'TabBar', 'TabBox', 'Tab'

    /**
     * Action components (todo)
     * 
    */
    /* 'button', 'input', 'textarea', 'select', 'option', 'optgroup', 'label', 'form', */
  ]

  if (!allowed.includes(props.component)) {
    console.error(`Missing or invalid "${props.component}" HTML component`)
    return null
  }

  if (props.component === 'ToggleSettings') {
    if (!props.childrin) {
      console.error(`Missing "childrin" property for "ToggleSettings" HTML component`)
      return null
    }
    return ToggleSettings
  }

  if (props.component === 'SplitH') {
    if (!props.childrin) {
      console.error(`Missing "childrin" property for "SplitH" HTML component`)
      return null
    }
    return SplitH
  }

  if (props.component === 'SplitV') {
    if (!props.childrin) {
      console.error(`Missing "childrin" property for "SplitV" HTML component`)
      return null
    }
    return SplitV
  }

  if (props.component === 'TabBar') {
    if (!props.childrin) {
      console.error(`Missing "childrin" property for "TabBar" HTML component`)
      return null
    }
    return TabBar
  }

  if (props.component === 'TabBox') {
    if (!props.childrin) {
      console.error(`Missing "childrin" property for "TabBox" HTML component`)
      return null
    }
    return TabBox
  }

  if (props.component === 'Tab') {
    if (!props.childrin) {
      console.error(`Missing "childrin" property for "Tab" HTML component`)
      return null
    }
    return Tab
  }

  if (props.component === 'SplitPane') {
    return SplitPane
  }

  if (props.component === 'textNode') {
    if (props.childrin) {
      console.error(`Invalid "childrin" property for "textNode" HTML component`)
      return null
    }
    return createVueTextNode(props.innerText)
  } else {
    return createVueComponent(props.component)
  } 
})

const action = (e: any) => {
  emit('action', e)
}

const change = (e: any) => {
  emit('change', e)
}

const click = (e: any) => {
  emit('click', e)
}

const dblclick = (e: any) => {
  emit('dblclick', e)
}
</script>
