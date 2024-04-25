<template>
  <article class="UploadZone w-full overflow-hidden" :class="[{'rounded-full':rounded}, border&&!src?'border-2 border-zinc-300 dark:border-zinc-800 border-dashed hover:border-zinc-400':null]">
    <div ref="dropZone" class="w-full h-full file-drop-zone relative p-4 group">
      <div class="uploader-wrapper absolute inset-0">
        <div ref="clickable" v-show="!src && !def" class="uploader-layer absolute flex flex-col items-center justify-center w-full h-full text-center">
          <slot name="noimage">
            <svg class="mx-auto h-12 w-12 text-zinc-400 group-hover:text-zinc-600" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div v-if="verbose && !src" class="p-3">
              <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                <button class="font-medium text-teal-600 hover:text-teal-500 focus:outline-none focus:underline transition duration-150 ease-in-out">
                  {{ t('labels.upload_picture') }} (max. {{ max }})
                </button>
                {{ t('labels.or_dragdrop') }}
              </p>
              <p class="mt-1 text-xs text-zinc-500">
                PNG, JPG, GIF, max. 10MB
              </p>
            </div>
          </slot>
        </div>
        <div v-if="src" :class="[!draggable?'pointer-events-none':'']" class="uploader-image absolute inset-0 group">
          <imgz v-if="zoomable" :src="src" class="w-full h-full" :class="[cover?'object-cover':'object-contain']"/>
          <img v-else :src="src" class="w-full h-full" :class="[cover?'object-cover':'object-contain']"/>
          <dt v-if="showNoise" class="hidden group-hover:flex flex-col items-center justify-center duration-1000 bg-black/95 absolute inset-0" :style="{opacity:noise}">
            <dt class="animated-grain"></dt>
          </dt>
        </div>
        <div v-if="!src && def" class="uploader-image absolute inset-0">
          <imgz v-if="zoomable" :src="def" class="w-full h-full object-contain"/>
          <imgz v-else :src="def" class="w-full h-full object-contain"/>
        </div>
      </div>
    </div>
    <teleport to="#modals">
      <ModalPictureUploader 
        ref="pictureUploader"
        :src="src"
        :max="max"
        :radius="radius"
        :width="target_dimensions.width"
        :height="target_dimensions.height"
        @submit="onProcessed"
      />
    </teleport>
  </article>
</template>

<script lang="ts">
import { reactive, toRefs, computed, onMounted, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { extractImageSDMetadata, dataURLToBlob, getImageDataURL, getImageSize } from '@/utils/image'
import imgz from '@/components/imgz.vue'
import ModalPictureUploader from '@/components/ModalPictureUploader.vue'
// @ts-ignore
import makeDroppable from '@/utils/makeDroppable'

export default defineComponent({
  components: {
    ModalPictureUploader,
    imgz,
  },

  props: {
    src: { type: String, required: false, default: null },
    def: { type: String, required: false, default: null },
    cover: { type: Boolean, required: false, default: false },
    border: { type: Boolean, required: false, default: true },
    draggable: { type: Boolean, required: false, default: true },
    zoomable: { type: Boolean, required: false, default: true },
    clickToUpload: { type: Boolean, required: false, default: true },
    verbose: { type: Boolean, required: false, default: true },
    flex: { type: Boolean, required: false, default: false },
    rounded: { type: Boolean, required: false, default: false },
    noise: { type: Number, required: false, default: 0.0 },
    showNoise: { type: Boolean, required: false, default: false },
    radius: { type: Number, required: false, default: 0 },
    fixedwidth: { type: Number, required: false, default: null },
    fixedheight: { type: Number, required: false, default: null },
    maxwidth: { type: Number, required: false, default: 2048 },
    maxheight: { type: Number, required: false, default: 2048 }
  },

  setup(props, { emit }) {
    const { t } = useI18n()

    const state = reactive({
      max: String(props.maxwidth + 'x' + props.maxheight),
      original_width: 0,
      original_height: 0,
      dropZone: null as any,
      clickable: null as any,
      pictureUploader: null as any
    })

    const target_dimensions = computed(()=>{
      const w = state.original_width
      const h = state.original_height
      const ar = (w===0 || h===0) ? 1 : w/h

      let r = {
        width: w,
        height: h
      }

      if (ar>=1) {
        r.width = Math.min(w, props.maxwidth)
        r.height = r.width/ar
      } else {
        r.height = Math.min(h, props.maxheight)
        r.width = r.height*ar
      }

      if (props.fixedwidth) r.width = props.fixedwidth
      if (props.fixedheight) r.height = props.fixedheight

      return r
    })

    const openFile = async (file: File) => {
      const dataURL = await getImageDataURL(file)

      if (dataURL) {
        const metadata = await extractImageSDMetadata(file)

        const { width, height } = await getImageSize(dataURL)
        state.original_width = width
        state.original_height = height

        const blob = dataURLToBlob(dataURL)

        onDropped(dataURL, {
          file: file,
          blob: blob,
          width: state.original_width,
          height: state.original_height,
          metadata: metadata
        })

        openPictureModal(file)
      }
    }

    const openPictureModal = (file: File) => {
      if (!state.pictureUploader) {
        console.error('pictureUploader not found')
        return
      }

      state.pictureUploader.openModal(file)
    }

    onMounted(() => {
      makeDroppable(state.dropZone, props.clickToUpload ? state.clickable : null, (files: File[]) => {
        if (files && files[0]) {
          openFile(files[0])
          // openPictureModal(files[0])
        }
      })
    })

    const onProcessed = (dataURL: any, e: any) => {
      emit('processed', dataURL, e)
    }

    const onDropped = (dataURL: any, e: any) => {
      emit('dropped', dataURL, e)
    }

    return {
      ...toRefs(state),
      target_dimensions,
      openPictureModal,
      onProcessed,
      imgz,
      t
    }
  }
})
</script>

<style type="text/css" scoped>
.file-drop-zone.dragover {
  outline: 4px dashed #ff9900;
  border: 2px dashed #ff9900;
  opacity: 0.75;
}

.file-drop-zone {
  width: 100%;
  padding: 0;
  margin: 0;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
</style>