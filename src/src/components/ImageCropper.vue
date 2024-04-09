<template>
  <div class="image-cropper relative">
    <canvas
      :width="canvasWidth"
      :height="canvasHeight"
      class="cropper-canvas cursorPointer"
      :class="{dragover:dragover}"
      ref="canvas"
      @dragover.stop.prevent="onDragOver"
      @dragleave.stop.prevent="onDragLeave"
      @drop="onDrop"
      @mousedown="onDragStart"
      @touchstart="onDragStart"
      @click="onClicked">
    </canvas>
    <div v-if="decoding" class="absolute inset-0 bg-zinc-950 flex items-center justify-center">
      <SpinLoader class="w-7 h-7 text-zinc-500"/>
    </div>
    <input
      type="file"
      ref="input"
      @change="onFileSelected"
      style="display:none;"
    />
  </div>
</template>

<script lang="ts">
import { watch, computed, ref, reactive, toRefs, onMounted, defineComponent } from 'vue'
import { useMainStore } from '@/stores'
import { isHEIC, HEICToPNG, extractImageSDMetadata } from '@/utils/image'
import heic2any from 'heic2any'
import SpinLoader from '@/components/UI/SpinLoader.vue'

const svgToImage = (rawSVG: any) => {
  const svg = new Blob([rawSVG], { type: 'image/svg+xml;charset=utf-8' })
  const domURL = window.URL || window.webkitURL
  const img = new Image()
  img.src = domURL.createObjectURL(svg)
  return img
}

const isDataURL = (str: string) => {
  if (!str || str === null) return false
  return !!str.match(
    /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+=[a-z\-]+)?)?(;base64)?,[a-z0-9!$&',()*+;=\-._~:@\/?%\s]*\s*$/i
  ) // eslint-disable-line no-useless-escape
}

const drawRoundedRect = (ctx: any, x: number, y: number, width: number, height: number, radius: number) => {
  if (radius === 0) {
    ctx.rect(x, y, width, height)
  } else {
    const widthMinusRad = width - radius
    const heightMinusRad = height - radius
    ctx.fillStyle = '#e2e8f0'
    ctx.translate(x, y)
    ctx.arc(radius, radius, radius, Math.PI, Math.PI * 1.5)
    ctx.lineTo(widthMinusRad, 0)
    ctx.arc(widthMinusRad, radius, radius, Math.PI * 1.5, Math.PI * 2)
    ctx.lineTo(width, heightMinusRad)
    ctx.arc(widthMinusRad, heightMinusRad, radius, Math.PI * 2, Math.PI * 0.5)
    ctx.lineTo(radius, height)
    ctx.arc(radius, heightMinusRad, radius, Math.PI * 0.5, Math.PI)
    ctx.translate(-x, -y)
  }
}

export default defineComponent({
  props: {
    image: { type: String, default: '' },
    radius: { type: Number, default: 0 },
    width: { type: Number, default: 1024 },
    height: { type: Number, default: 768 },
    color: { type: String, default: '#000000' },
    scale: { type: Number, default: 1 },
    rotation: { type: Number, default: 0 }
  },

  components: {
    SpinLoader
  },

  setup(props, { emit }) {
    let context: CanvasRenderingContext2D
    let rotation = ref(props.rotation)

    const state = reactive({
      canvas: null as any,
      input: null as any,
      cursor: 'cursorPointer',
      rotationRadian: (props.rotation * Math.PI) / 180,

      dragover: false,
      dragging: false,
      dragged: false,
      imageLoaded: false,
      changed: false,
      decoding: false,

      mx: 0,
      my: 0,

      image: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        resource: <null | HTMLImageElement>null,
        metadata: null as any
      }
    })

    const canvasWidth = computed((): number => getDimensions().canvas.width)
    const canvasHeight = computed((): number => getDimensions().canvas.height)

    watch(
      () => state.mx,
      () => {
        if (state.imageLoaded) {
          redraw()
        }
      }
    )

    watch(
      () => state.my,
      () => {
        if (state.imageLoaded) {
          redraw()
        }
      }
    )

    watch(
      () => state.image.resource,
      (nv) => {
        if (state.imageLoaded) {
          redraw()
        }
      }
    )

    watch(
      () => props.scale,
      () => {
        if (state.imageLoaded) {
          replaceImageInBounds()
          redraw()
        }
      }
    )

    watch(
      () => props.rotation,
      (rotation) => {
        state.rotationRadian = (rotation * Math.PI) / 180
        if (state.imageLoaded) {
          replaceImageInBounds()
          redraw()
        }
      }
    )

    watch(
      () => props.radius,
      () => {
        redraw()
      }
    )

    onMounted(() => {
      context = state.canvas.getContext('2d')
      paint()

      /*
      if (!props.image) {
        loadPlaceholder()
      } else {
        loadImage(props.image)
      }
      */
    })

    const openFile = (file: File) => {
      const reader = new FileReader()
      state.changed = true
      state.dragover = false
      emit('onchange')

      reader.onload = async (e) => {
        if (e && e.target) {
          let url = e.target.result as string

          state.image.metadata = await extractImageSDMetadata(file)

          if (isHEIC(file)) {
            const mainStore = useMainStore()
            state.decoding = true
            mainStore.spinner(true)
            url = await HEICToPNG(file)
            mainStore.spinner(false)
          }

          const image = new Image()
          image.src = url

          image.onload = ()=>{
            console.log(image.width, image.height)
            loadImage(url)
          }
        }
      }

      reader.readAsDataURL(file)
    }

    const getImageMetadata = () => {
      return state.image.metadata
    }

    const loadPlaceholder = () => {
      const placeHolder = svgToImage(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 65"><defs><style>.cls-1{fill:#000;}</style></defs><title>Upload_Upload</title><path class="cls-1" d="M32.5,1A31.5,31.5,0,1,1,1,32.5,31.54,31.54,0,0,1,32.5,1m0-1A32.5,32.5,0,1,0,65,32.5,32.5,32.5,0,0,0,32.5,0h0Z"/><polygon class="cls-1" points="41.91 28.2 32.59 18.65 23.09 28.39 24.17 29.44 31.87 21.54 31.87 40.05 33.37 40.05 33.37 21.59 40.83 29.25 41.91 28.2"/><polygon class="cls-1" points="40.66 40.35 40.66 44.35 24.34 44.35 24.34 40.35 22.34 40.35 22.34 44.35 22.34 46.35 24.34 46.35 40.66 46.35 42.66 46.35 42.66 44.35 42.66 40.35 40.66 40.35"/></svg>'
      )

      placeHolder.onload = () => {
        const x: number = <any>canvasWidth / 2 - props.width / 2
        const y: number = <any>canvasHeight / 2 - props.height / 2

        context.drawImage(placeHolder, x, y, props.width, props.height)
      }
    }

    const loadImage = (imageURL: string) => {
      const imageObj = new Image()

      imageObj.onload = () => {
        const imageState = getInitialSize(imageObj.width, imageObj.height)
        state.image.x = 0
        state.image.y = 0
        state.image.resource = imageObj
        state.image.width = imageState.width
        state.image.height = imageState.height
        state.dragging = false
        state.imageLoaded = true
        state.cursor = 'cursorGrab'
        emit('onloaded', props.scale)
      }

      imageObj.onerror = (err) => {
        console.log('error loading image: ', err)
      }

      if (!isDataURL(imageURL)) {
        imageObj.crossOrigin = 'anonymous'
      }

      imageObj.src = imageURL
    }

    const getInitialSize = (width: number, height: number) => {
      let newHeight
      let newWidth

      const dimensions = getDimensions()
      const canvasRatio = dimensions.height / dimensions.width
      const imageRatio = height / width

      if (canvasRatio > imageRatio) {
        newHeight = getDimensions().height
        newWidth = width * (newHeight / height)
      } else {
        newWidth = getDimensions().width
        newHeight = height * (newWidth / width)
      }

      return {
        height: newHeight,
        width: newWidth
      }
    }

    const paint = () => {
      context.save()
      context.translate(0, 0)
      context.fillStyle = props.color

      let radius = props.radius
      const dimensions = getDimensions()
      const height = dimensions.canvas.height
      const width = dimensions.canvas.width

      /*
       * clamp border radius between zero (perfect rectangle) and
       * half the size without borders (perfect circle or "pill")
       */

      radius = Math.max(radius, 0)
      radius = Math.min(radius, width / 2, height / 2)
      context.beginPath()
      drawRoundedRect(context, 0, 0, width, height, radius)
      context.rect(width, 0, -width, height)
      context.fill('evenodd')
      context.restore()
    }

    const getDimensions = () => {
      return {
        width: props.width,
        height: props.height,
        canvas: {
          width: props.width,
          height: props.height
        }
      }
    }

    const onDrop = (e: any) => {
      e = e || window.event
      e.stopPropagation()
      e.preventDefault()

      if (e.dataTransfer && e.dataTransfer.files.length) {
        const file = e.dataTransfer.files[0]
        openFile(file)
      }
    }

    const onDragOver = (e: any) => {
      state.dragover = true
    }

    const onDragLeave = (e: any) => {
      state.dragover = false
    }

    const onDragStart = (e: any) => {
      e = e || window.event
      e.preventDefault()
      state.dragging = true
      state.mx = 0
      state.my = 0
      state.cursor = 'cursorGrabbing'
      state.dragover = false
      let hasMoved = false

      const handleMouseUp = (event: any) => {
        onDragEnd(event)
        if (!hasMoved && event.targetTouches) {
          e.target.click()
        }
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('touchend', handleMouseUp)
        document.removeEventListener('touchmove', handleMouseMove)
      }

      const handleMouseMove = (event: any) => {
        hasMoved = true
        onMouseMove(event)
      }

      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('touchend', handleMouseUp)
      document.addEventListener('touchmove', handleMouseMove)
    }

    const onDragEnd = (e: any) => {
      if (state.dragging) {
        state.dragging = false
        state.cursor = 'cursorPointer'
      }
      state.dragover = false
    }

    const onMouseMove = (e: any) => {
      e = e || window.event
      if (state.dragging === false) {
        return
      }

      state.dragged = true
      state.changed = true
      state.dragover = false
      emit('onchange')

      const imageState = state.image
      const lastX = imageState.x
      const lastY = imageState.y

      const mousePositionX = e.targetTouches ? e.targetTouches[0].pageX : e.clientX
      const mousePositionY = e.targetTouches ? e.targetTouches[0].pageY : e.clientY

      const newState = {
        mx: mousePositionX,
        my: mousePositionY,
        image: imageState
      }

      if (state.mx && state.my) {
        const xDiff = (state.mx - mousePositionX) / props.scale
        const yDiff = (state.my - mousePositionY) / props.scale

        imageState.y = getBoundedY(lastY - yDiff, props.scale)
        imageState.x = getBoundedX(lastX - xDiff, props.scale)
      }

      state.mx = newState.mx
      state.my = newState.my
      state.image = imageState
    }

    const getBoundedX = (x: number, scale: number) => {
      var image = state.image
      var dimensions = getDimensions()
      const width =
        Math.abs(image.width * Math.cos(state.rotationRadian)) +
        Math.abs(image.height * Math.sin(state.rotationRadian))
      let widthDiff = Math.floor((width - dimensions.width / scale) / 2)
      widthDiff = Math.max(0, widthDiff)
      return Math.max(-widthDiff, Math.min(x, widthDiff))
    }

    const getBoundedY = (y: number, scale: number) => {
      var image = state.image
      var dimensions = getDimensions()
      const height =
        Math.abs(image.width * Math.sin(state.rotationRadian)) +
        Math.abs(image.height * Math.cos(state.rotationRadian))
      let heightDiff = Math.floor((height - dimensions.height / scale) / 2)
      heightDiff = Math.max(0, heightDiff)
      return Math.max(-heightDiff, Math.min(y, heightDiff))
    }

    const replaceImageInBounds = () => {
      const imageState = state.image
      imageState.y = getBoundedY(imageState.y, props.scale)
      imageState.x = getBoundedX(imageState.x, props.scale)
      state.changed = true
      emit('onchange')
    }

    const transformDataWithRotation = (x: number, y: number) => {
      const radian = -state.rotationRadian
      const rx = x * Math.cos(radian) - y * Math.sin(radian)
      const ry = x * Math.sin(radian) + y * Math.cos(radian)
      return [rx, ry]
    }

    const calculatePosition = (image: any) => {
      image = image || state.image
      const dimensions = getDimensions()

      const width = image.width * props.scale
      const height = image.height * props.scale
      const widthDiff = (width - dimensions.width) / 2
      const heightDiff = (height - dimensions.height) / 2

      let x = image.x * props.scale
      let y = image.y * props.scale

      const r = transformDataWithRotation(x, y)
      x = r[0]
      y = r[1]

      x += 0 - widthDiff
      y += 0 - heightDiff

      return {
        x,
        y,
        height,
        width
      }
    }

    const paintImage = (ctx: any, image: any) => {
      if (image.resource) {
        var position = calculatePosition(image)

        ctx.save()
        ctx.globalCompositeOperation = 'destination-over'

        const dimensions = getDimensions()
        ctx.translate(dimensions.canvas.width / 2, dimensions.canvas.height / 2)
        ctx.rotate(state.rotationRadian)
        ctx.translate(-dimensions.canvas.width / 2, -dimensions.canvas.height / 2)

        ctx.drawImage(image.resource, position.x, position.y, position.width, position.height)
        ctx.restore()
      }
    }

    const redraw = () => {
      context.clearRect(0, 0, getDimensions().canvas.width, getDimensions().canvas.height)

      paint()
      paintImage(context, state.image)
    }

    const getImage = () => {
      const cropRect = getCroppingRect()
      const image = state.image

      // get actual pixel coordinates
      if (image && image.resource) {
        cropRect.x *= image.resource.width
        cropRect.y *= image.resource.height
        cropRect.width *= image.resource.width
        cropRect.height *= image.resource.height
      }

      // create a canvas with the correct dimensions
      const canvas: HTMLCanvasElement = document.createElement('canvas')
      canvas.width = cropRect.width
      canvas.height = cropRect.height

      // draw the full-size image at the correct position,
      // the image gets truncated to the size of the canvas.
      const ctx = canvas.getContext('2d')

      if (ctx) {
        // eslint-disable-next-line
        ctx.drawImage(<CanvasImageSource>image.resource, -cropRect.x, -cropRect.y)
      }

      return canvas
    }

    const getImageScaled = () => {
      const { width, height } = getDimensions()
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      paintImage(canvas.getContext('2d'), state.image)
      return canvas
    }

    const getImageBlob = () => {
      return new Promise((resolve, reject) => {
        const canvas = getImageScaled()
        canvas.toBlob((blob) => {
          resolve(blob)
        })
      })
    }

    const getCroppingRect = () => {
      const dim = getDimensions()

      const frameRect = {
        x: 0,
        y: 0,
        width: dim.width,
        height: dim.height
      }

      const imageRect = calculatePosition(state.image)

      return {
        x: (frameRect.x - imageRect.x) / imageRect.width,
        y: (frameRect.y - imageRect.y) / imageRect.height,
        width: frameRect.width / imageRect.width,
        height: frameRect.height / imageRect.height
      }
    }

    const onClicked = (e: any) => {
      if (state.dragged === true) {
        state.dragged = false
      } else {
        state.input.click()
      }
    }

    const onFileSelected = (e: any) => {
      var files = e.target.files || e.dataTransfer.files
      emit('select-file', files)

      if (!files.length) {
        return
      }

      openFile(files[0])
    }

    const resetImage = () => {
      context = state.canvas.getContext('2d')

      state.imageLoaded = false
      emit('imageLoaded', false)

      state.dragging = false
      state.mx = 0
      state.my = 0

      state.image.x = 0
      state.image.y = 0
      state.image.resource = null

      context.clearRect(0, 0, getDimensions().canvas.width, getDimensions().canvas.height)

      paint()

      const placeHolder = svgToImage(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 65"><defs><style>.cls-1{fill:#000}</style></defs><title>Upload_Upload</title><path class="cls-1" d="M32.5,1A31.5,31.5,0,1,1,1,32.5,31.54,31.54,0,0,1,32.5,1m0-1A32.5,32.5,0,1,0,65,32.5,32.5,32.5,0,0,0,32.5,0h0Z"/><polygon class="cls-1" points="41.91 28.2 32.59 18.65 23.09 28.39 24.17 29.44 31.87 21.54 31.87 40.05 33.37 40.05 33.37 21.59 40.83 29.25 41.91 28.2"/><polygon class="cls-1" points="40.66 40.35 40.66 44.35 24.34 44.35 24.34 40.35 22.34 40.35 22.34 44.35 22.34 46.35 24.34 46.35 40.66 46.35 42.66 46.35 42.66 44.35 42.66 40.35 40.66 40.35"/></svg>'
      )

      placeHolder.onload = () => {
        const x: number = <any>canvasWidth / 2 - props.width / 2
        const y: number = <any>canvasHeight / 2 - props.height / 2
        context.drawImage(placeHolder, x, y, props.width, props.height)
      }
    }

    return {
      ...toRefs(state),
      onDrop,
      onDragStart,
      onDragOver,
      onDragLeave,
      onFileSelected,
      onClicked,
      canvasWidth,
      canvasHeight,
      openFile,
      getImageBlob,
      getImageScaled,
      getImageMetadata
    }
  }
})
</script>

<style type="text/css" scoped>
.cropper-canvas.dragover {
  outline: 3px dashed #ff9900;
}

.cursorPointer {
  cursor: pointer;
}

.cursorGrab {
  cursor: grab;
}

.cursorGrabbing {
  cursor: grabbing;
}
</style>
