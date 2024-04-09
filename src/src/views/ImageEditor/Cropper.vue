<template>
  <div class="flex flex-col h-full">
    <div class="flex justify-between space-x-3">
      <div class="flex-1 bg-zinc-700 flex items-center">
        {{ clipWidth.toFixed(1) + ' x ' + clipHeight.toFixed(1) }}
      </div>
      <button class="tw-button" @click="crop()">
        CROP
      </button>
    </div>

    <div ref="dropZone" class="flex-1 relative">
      <canvas id="canvas" class="design-grid"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// @ts-ignore
import { fabric } from 'fabric'
import { getImageDataURL, getImageSize, extractImageSDMetadata } from '@/utils/image'

// @ts-ignore
import makeDroppable from '@/utils/makeDroppable'

const emit = defineEmits(['cropped'])

fabric.Object.prototype.borderColor = '#e0fcff'
fabric.Object.prototype.cornerColor = '#38bec9ee'
fabric.Object.prototype.cornerStyle = 'rect'
fabric.Object.prototype.cornerSize = 8
fabric.Object.prototype.opacity = 1
fabric.Object.prototype.cornerStrokeColor = 'black'
fabric.Object.prototype.borderDashArray = [5, 5]
fabric.Object.prototype.hasBorders = true
fabric.Object.prototype.transparentCorners = false

let canvas: any = null
let cropClipPathObject: any = null
let cropOverlayObject: any = null

const dropZone = ref<any>(null)
const croppingImg = ref<any>(null)
const maxScaleX = ref(0)
const maxScaleY = ref(0)
const clipWidth = ref(0)
const clipHeight = ref(0)

const currentZoom = ref(1)
const minZoom = ref(0.1)
const maxZoom = ref(20)

const getWorkspaceWidth = () => {
  return dropZone.value.offsetWidth
}

const getWorkspaceHeight = () => {
  return dropZone.value.offsetHeight
}

const setZoomAuto = (scale: number) => {
  const vw = getWorkspaceWidth()
  const vh = getWorkspaceHeight()

  canvas.setDimensions({
    width: vw,
    height: vh
  })
  console.log(vw, vh)

  const center = canvas.getCenter()
  console.log(center)
  canvas.setViewportTransform(fabric.iMatrix.concat())
  canvas.zoomToPoint(new fabric.Point(center.left, center.top), scale)
  const z = canvas.getZoom()
  console.log('zoom', z)
  currentZoom.value = z

  // TODO: workspace is not defined
  //if (!workspace) return
  //setCenterFromObject(workspace)
}

const loadImage = (dataURL: any, e: any) => {
  fabric.Image.fromURL(dataURL, (img: any) => {
    croppingImg.value = img
    const arCanvas = canvas.width / canvas.height
    const arImage = img.width / img.height
    img.originX = 'center'
    img.originY = 'center'

    const clone = fabric.util.object.clone(img)
    canvas.add(img)

    clone.selectable = false
    clone.set({
      opacity: 0.8
    })
    canvas.add(clone)
    clone.center().setCoords()
    clone.sendToBack()
    
    cropOverlayObject.width = img.getScaledWidth()
    cropOverlayObject.height = img.getScaledHeight()

    img.set('clipPath', cropOverlayObject)

    img.selectable = false
    img.center().setCoords()

    maxScaleX.value = img.getScaledWidth() / cropClipPathObject.width
    maxScaleY.value = img.getScaledHeight() / cropClipPathObject.height
    
    canvas.setActiveObject(cropClipPathObject)

    if (arCanvas < arImage) {
      setZoomAuto(canvas.width / img.width)
      // img.scaleToWidth(canvas.width)
    } else {
      setZoomAuto(canvas.height / img.height)
      // img.scaleToHeight(canvas.height)
    }

    canvas.renderAll()
    // resolve()
  })
}

const openFile = async (file: File) => {
  const dataURL = await getImageDataURL(file)

  if (dataURL) {
    const metadata = await extractImageSDMetadata(file)
    const { width, height } = await getImageSize(dataURL)

    loadImage(dataURL, {
      width,
      height,
      metadata
    })
  }
}

const setCropper = (w: number, h: number) => {
  const c = cropClipPathObject
  c.set('width', w / c.scaleX)
  c.set('height', h / c.scaleY)
  c.setCoords()
  canvas.renderAll()
}

const initCropper = async () => {
  setupCroppingCanvas()
  setupClippingObjects()

  makeDroppable(dropZone.value, null, (files: File[]) => {
    if (files && files[0]) {
      openFile(files[0])
    }
  })
}

onMounted(() => {
  initCropper()
})

onBeforeUnmount(() => {
  canvas.dispose()
})

const setupCroppingCanvas = () => {
  const height = dropZone.value.clientHeight
  const width = dropZone.value.clientWidth

  canvas = new fabric.Canvas('canvas', {
    controlsAboveOverlay: true,
    selectionColor: '#54d1db40',
    selectionBorderColor: '#54d1db'
  })

  canvas.setDimensions({ width, height })
  canvas.renderAll()

  canvas.on('selection:cleared', () => {
    canvas.setActiveObject(cropClipPathObject)
  })

  canvas.on('object:modified', (e: any) => {
  })

  canvas.on('mouse:wheel', (opt: any) => {
    const delta = opt.e.deltaY
    let zoom = canvas.getZoom()
    zoom *= 0.999 ** delta

    if (zoom > maxZoom.value) zoom = maxZoom.value
    if (zoom < minZoom.value) zoom = minZoom.value

    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
    currentZoom.value = zoom

    opt.e.preventDefault()
    opt.e.stopPropagation()
  })
}

const setupClippingObjects = () => {
  cropClipPathObject = new fabric.Rect({
    // @ts-ignore
    id: 'cropClipPath',
    width: 200,
    height: 200,
    centeredScaling: false,
    centeredRotation: true,
    originX: 'left',
    originY: 'top',
    lockRotation: true,
    hasRotatingPoint: false,
    absolutePositioned: true,
    inverted: true,
    opacity: 0.0001
  })
  
  clipWidth.value = cropClipPathObject.width
  clipHeight.value = cropClipPathObject.height
  
  cropClipPathObject.on('scaling', (e: any) => {
    limitClipScale(e)
  })

  cropClipPathObject.on('moving', (e: any) => {
    limitClipMove(e)
  })
  
  canvas.add(cropClipPathObject)
  cropClipPathObject.center().setCoords()
  
  cropOverlayObject = new fabric.Rect({
    // @ts-ignore
    id: 'cropOverlay',
    selectable: false,
    fill: '#00000099',
    originX: 'center',
    originY: 'center',
    clipPath: cropClipPathObject,
    inverted: true,
    absolutePositioned: true
  })

  cropClipPathObject.setControlsVisibility({
    mt: true,
    mb: true,
    ml: true,
    mr: true,
    tr: true,
    tl: true,
    br: true,
    bl: true,
    mtr: false,
  })

  canvas.add(cropOverlayObject)
  cropOverlayObject.center().setCoords()
}

const limitClipScale = (e: any) => {
  const object = canvas.getActiveObject()
  const iw = croppingImg.value.getScaledWidth()
  const ih = croppingImg.value.getScaledHeight()
  const it = croppingImg.value.top - ih/2
  const il = croppingImg.value.left - iw/2

  const cw = object.getScaledWidth()
  const ch = object.getScaledHeight()
  const ct = object.top // - ch/2
  const cl = object.left // - cw/2
  const sx = object.scaleX
  const sy = object.scaleY

  if (ct < it) {
    object.top = it // + ch/2
  }

  if (cl < il) {
    object.left = il // + cw/2
  }

  if (ct + ch > it + ih) {
    object.top = it + ih - ch // /2
  }

  if (cl + cw > il + iw) {
    object.left = il + iw - cw // /2
  }

  /*
  if (sx > maxScaleX.value) {
    object.set('scaleX', maxScaleX.value)
    object.left = il // + iw/2
  }

  if (sy > maxScaleY.value) {
    object.set('scaleY', maxScaleY.value)
    object.top = it // + ih/2
  }
  */

  console.log(object.getScaledWidth() + cl, iw)

  if (object.getScaledWidth() + cl > iw) {
    object.set({
      width: iw - cl
    })
  }

  object.setCoords()
  clipWidth.value = object.getScaledWidth()
  clipHeight.value = object.getScaledHeight()
}

const limitClipMove = (e: any) => {
  const object = canvas.getActiveObject()
  const iw = croppingImg.value.getScaledWidth()
  const ih = croppingImg.value.getScaledHeight()
  const it = croppingImg.value.top - ih/2
  const il = croppingImg.value.left - iw/2
  
  const clipWidth = object.getScaledWidth()
  const clipHeight = object.getScaledHeight()
  const ct = object.top // - clipHeight/2
  const cl = object.left // - clipWidth/2

  if (ct < it) {
    object.top = it // + clipHeight/2
  }

  if (cl < il) {
    object.left = il // + clipWidth/2
  }

  if (ct + clipHeight > it + ih) {
    object.top = it + ih - clipHeight // /2
  }

  if (cl + clipWidth > il + iw) {
    object.left = il + iw - clipWidth // /2
  }
}

const crop = () => {
  const c = canvas.getActiveObject()

  const base64 = canvas.toDataURL({
    top: c.top, // - c.getScaledHeight()/2,
    left: c.left, // - c.getScaledWidth()/2,
    width: c.getScaledWidth(),
    height: c.getScaledHeight(),
    quality: 1,
    multiply: 1/croppingImg.value.scaleX,
    enableRetinaScaling: true
  })

  emit('cropped', {
    base64
  })
}
</script>

<style type="text/css" scoped>
.inside-shadow {
  box-shadow: inset 0 0 9px 2px #0000001f;
}

.design-grid {
  --offsetX: 0px;
  --offsetY: 0px;
  --size: 12px;
  --color: rgb(244, 244, 245);
  background-image: linear-gradient(
      45deg,
      var(--color) 25%,
      transparent 0,
      transparent 75%,
      var(--color) 0
    ),
    linear-gradient(45deg, var(--color) 25%, transparent 0, transparent 75%, var(--color) 0);
  background-position: var(--offsetX) var(--offsetY),
    calc(var(--size) + var(--offsetX)) calc(var(--size) + var(--offsetY));
  background-size: calc(var(--size) * 2) calc(var(--size) * 2);
}

.dark .design-grid {
  --offsetX: 0px;
  --offsetY: 0px;
  --size: 12px;
  --color: rgb(34, 34, 37);
  background-image: linear-gradient(
      45deg,
      var(--color) 25%,
      transparent 0,
      transparent 75%,
      var(--color) 0
    ),
    linear-gradient(45deg, var(--color) 25%, transparent 0, transparent 75%, var(--color) 0);
  background-position: var(--offsetX) var(--offsetY),
    calc(var(--size) + var(--offsetX)) calc(var(--size) + var(--offsetY));
  background-size: calc(var(--size) * 2) calc(var(--size) * 2);
}
</style>