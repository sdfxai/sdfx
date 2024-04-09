<template>
  <div ref="wrapperRef" class="relative flex-1 w-full h-full flex flex-col justify-between">
    <!-- toolbar -->
    <WorkspaceBar/>
    <NodeGraph/>
    <NodePanel/>

    <SlideDrawer :open="editorIsOpen" :showFooter="false" minwidth="384px" width="96vw" height="80vh"  orientation="top" @close="closeImageEditorDrawer()">
      <div class="flex h-full justify-between">
        <ImageEditor
          class="flex-1 w-[50vw] h-full"
          :image="state.image"
          :mask="state.mask"
          :gallery="[]"
          @cancel="closeImageEditorDrawer()"
        />
        <aside class="w-84 p-4 flex-shrink-0 text-zinc-600 dark:text-white bg-zinc-300 dark:bg-zinc-950 h-full">
          <BoxPreviewEditor
            :image="editorPreview.image"
            :mask="editorPreview.mask"
            :blend="editorPreview.blend"
          />

          <div class="flex justify-between space-x-3 mt-6">
            <button @click="closeImageEditorDrawer()" class="tw-button w-full transparent gray">Cancel</button>
            <button @click="onImageEditorSubmit" class="tw-button w-full pink">Submit</button>
          </div>
        </aside>
      </div>
    </SlideDrawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useGraphStore, useEditorStore, storeToRefs } from '@/stores'
// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import { dataURLToBlob } from '@/utils/image'

import ImageEditor from '@/views/ImageEditor/Index.vue'
import NodeGraph from '@/views/OpenGraph/components/NodeGraph.vue'
import NodePanel from '@/views/OpenGraph/components/NodePanel.vue'
import SlideDrawer from '@/components/UI/SlideDrawer.vue'
import BoxPreviewEditor from '@/components/boxes/BoxPreviewEditor.vue'
import WorkspaceBar from '@/layout/WorkspaceBar.vue'

const graphStore = useGraphStore()
const { clipspace, nodegraph } = storeToRefs(graphStore)
const { editorPreview } = storeToRefs(useEditorStore())

const editorIsOpen = ref(false)
const currentEditedNode = ref<any>(null)

const state = ref({
  image: null as any,
  mask: null as any,
  blend: null as any
})

const openImageEditorDrawer = () => {
  editorIsOpen.value = true
}

const closeImageEditorDrawer = () => {
  editorIsOpen.value = false
}

const onImageEditorSubmit = async () => {
  console.log('onImageEditorSubmit')

  const blob = dataURLToBlob(editorPreview.value.blend)
  const filename = 'clipspace-mask-' + performance.now() + '.png'

  await sdfx.uploadMask(currentEditedNode.value, filename, blob, editorPreview.value.blend)

  currentEditedNode.value = null
  closeImageEditorDrawer()
}

const getAlphaImageURL = (url: any) => {
  const alpha_url = new URL(url)
  alpha_url.searchParams.delete('channel')
  alpha_url.searchParams.delete('preview')
  alpha_url.searchParams.set('channel', 'a')
  return alpha_url?.href
}

const getRGBImageURL = (url: any) => {
  const rgb_url = new URL(url)
  rgb_url.searchParams.delete('channel')
  rgb_url.searchParams.set('channel', 'rgb')
  return rgb_url?.href
}

const openImageEditorHandler = ({ detail }: any) => {
  console.clear()
  const { node } = detail

  const idx = clipspace.value.selectedIndex
  const clipspaceImageURL = clipspace.value.imgs?.[idx]

  state.value.image = getRGBImageURL(clipspaceImageURL)
  state.value.mask = getAlphaImageURL(clipspaceImageURL)
  state.value.blend = clipspaceImageURL

  editorIsOpen.value = true
  currentEditedNode.value = node
}

onMounted(async ()=>{
  sdfx.addEventListener('openImageEditor', openImageEditorHandler)
})

onBeforeUnmount(() => {
  sdfx.removeEventListener('openImageEditor', openImageEditorHandler)
})
</script>
