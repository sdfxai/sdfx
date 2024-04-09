<template>
  <modal :show="open" class="clean" :width="`${width*compSizescale}px`" :header="false" @close="closeModal">
    <template v-slot:header>
      <h3>{{ t('labels.upload_picture') }}</h3>
    </template>

    <template v-slot:body>
      <div class="modal-content nopad noselect text-zinc-700 dark:text-zinc-400">
        <div class="px-4 py-3 flex items-center justify-between">
          <div class="text-sm text-zinc-800 dark:text-white font-semibold">
            <span>{{ t('actions.dragdrop') }}</span>
          </div>
          <button @click="reset()" class="tw-button xs gray transparent">Reset</button>
        </div>
        <div class="cropper-container flex items-center bg-green-300">
          <div :style="{ width: (width*compSizescale)+'px', height: (height*compSizescale)+'px'}" class="flex items-center bg-zinc-950 justify-center overflow-hidden">
            <ImageCropper
              ref="imageCropper"
              :image="prevsrc"
              :width="width"
              :height="height"
              :radius="radius"
              :scale="scale"
              :rotation="rotation"
              @onloaded="onloaded"
              @onchange="onchange"
              :style="{ transform: `scale(${compSizescale})`}"
            />
          </div>
        </div>

        <div class="cropper-tools p-8">
          <!-- zoom -->
          <div class="sliderContainer mt-4 w-full flex items-center justify-between">
            <div class="label w-24 truncate flex-shrink-0" @click="scale=1">
              {{ t('actions.zoom') }}
            </div>
            <div class="slider flex-1">
              <TWSlider 
                v-model="scale" 
                :min="1.00"
                :max="3.00"
                :range="[1.00, 1.50, 2.00, 2.50, 3.00]"
                :snap="[1.00, 1.50, 2.00, 2.50, 3.00]"
                :interval="0.10"
                :precision="2"
                :showTooltip="false"
              />
            </div>
            <span class="font-semibold w-12 text-right text-zinc-700 dark:text-zinc-200">{{ scale.toFixed(2) }}</span>
          </div>

          <!-- rotate -->
          <div class="sliderContainer w-full flex items-center justify-between mt-2">
            <div class="label w-24 truncate flex-shrink-0" @click="rotation=0">
              {{ t('actions.rotate') }}
            </div>
            <div class="slider flex-1">
              <TWSlider 
                v-model="rotation"
                color="pink"
                :range="[-180, -90, 0, 90, 180]"
                :snap="[-180, -90, 0, 90, 180]"
                :zeroPoint="0"
                :min="-180" 
                :max="180" 
                :interval="1"
                :precision="2"
                :showTooltip="false"
              />
            </div>
            <span class="font-semibold w-12 text-right text-zinc-700 dark:text-zinc-200">{{ rotation.toFixed(0) }}</span>
          </div>
        </div>
      </div>
    </template>

    <template v-slot:footer>
      <div class="space-x-2">
        <button class="tw-button sm gray transparent" @click.stop.prevent="cancel()">{{ t('actions.cancel') }}</button>
        <button class="tw-button sm" :disabled="!changed" @click.stop.prevent="submit()">{{ t('actions.submit') }}</button>
      </div>
    </template>
  </modal>
</template>

<script lang="ts">
import { computed, reactive, toRefs, onMounted, onBeforeUnmount, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { dataURLToBlob } from '@/utils/image'
import ImageCropper from '@/components/ImageCropper.vue'
import modal from '@/components/UI/Modal.vue'
import TWSlider from '@/components/UI/TWSlider.vue'

export default defineComponent({
  components: {
    modal,
    TWSlider,
    ImageCropper
  },

  props: {
    src: { type: String, required: false },
    max: { type: String, required: false, default: '1280x720' },
    radius: { type: Number, required: false, default: 0 },
    width: { type: Number, required: false, default: 1280 },
    height: { type: Number, required: false, default: 720 },
    options: { type: Object, required: false }
  },

  setup(props, { emit }) {
    const { t } = useI18n()

    const state = reactive({
      open: false,
      file: null as any,

      imageCropper: null as any,
      changed: false,
      preview: null as any,
      scale_marks: ['1.00', '1.50', '2.00', '2.50', '3.00'],

      screen: {
        width: window.innerWidth,
        height: window.innerHeight
      },

      rotation: 0,
      scale: 1.0
    })

    const compSizescale = computed(()=>{
      const s = state.screen.height / (2*props.height)
      return Math.max(s, 0.10)
    })

    const closeModal = () => {
      state.open = false
    }

    const openModal = (file: File) => {
      emit('onready', state.imageCropper)
      state.open = true
      state.file = file

      setTimeout(() => {
        if (file && state.imageCropper) {
          state.imageCropper.openFile(file)
        }
      }, 0)
    }

    const updateSize = ()=>{
      state.screen = {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }

    onMounted(() => {
      window.addEventListener('resize', updateSize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', updateSize)
    })


    const cancel = () => {
      closeModal()
      state.preview = null
    }

    const submit = async () => {
      if (!state.imageCropper) {
        cancel()
        console.error('Unable to process as imageCropper is unreachable')
        return false
      }

      //const blob = await state.imageCropper.getImageBlob()
      const metadata = state.imageCropper.getImageMetadata()
      const kanvas = state.imageCropper.getImageScaled()
      state.preview = kanvas.toDataURL()

      emit('submit', state.preview, {
        file: state.file,
        blob: dataURLToBlob(state.preview),
        width: props.width,
        height: props.height,
        metadata: metadata
      })

      closeModal()
    }

    const reset = () => {
      state.scale = 1
      state.rotation = 0
    }

    const onloaded = () => {
      reset()
    }

    const onchange = () => {
      state.changed = true

      /*
      let kanvas = state.imageCropper.getImageScaled()
      state.preview = kanvas.toDataURL()
      emit("onchange", state.preview)
      */
    }

    return {
      ...toRefs(state),
      t,
      compSizescale,
      closeModal,
      openModal,
      reset,
      cancel,
      submit,
      onloaded,
      onchange,

      prevsrc: computed(() => {
        return state.preview ? state.preview : props.src
      })
    }
  }
})
</script>
