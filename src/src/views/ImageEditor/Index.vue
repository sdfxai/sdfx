<template>
  <div ref="editorRef" class="relative flex-1 w-full h-full flex flex-col justify-between">
    <EditorToolbar
      :tool="tool"
      @setTool="setTool($event)"
      @setBrushSize="setBrushSize($event)"
      @crop="cropSelection()"
      @undo="undo()"
      @redo="redo()"
      @reset="resetState()"
    />

    <div v-if="false">
      <div class="text-white">
        {{ documentWidth }} x {{ documentHeight }}
      </div>
      <div class="text-white">
        {{ wk.width }} x {{ wk.height }}
      </div>
    </div>

    <div class="relative flex-1 w-full h-[calc(100vh-160px)]">
      <div class="inside-shadow absolute inset-0"></div>

      <!-- bottom toolbar -->
      <div class="absolute overflow-hidden shadow border border-zinc-100 dark:border-zinc-800 right-0 bottom-0 font-semibold bg-white dark:bg-black/80  m-3 z-10 flex rounded-full divide-x divide-zinc-200 dark:divide-zinc-800">
        <button @click="zoomIn()" class="overflow-hidden px-5 py-3 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 122.879 119.801" enable-background="new 0 0 122.879 119.801" xml:space="preserve"><g><path d="M49.991,0h0.015v0.006c13.794,0.004,26.294,5.601,35.336,14.645c9.026,9.031,14.618,21.515,14.628,35.303h0.006v0.034v0.04 h-0.006c-0.005,5.557-0.918,10.905-2.594,15.892c-0.281,0.837-0.576,1.641-0.877,2.409v0.007c-1.446,3.661-3.315,7.12-5.548,10.307 l29.08,26.14l0.018,0.015l0.157,0.146l0.012,0.012c1.641,1.563,2.535,3.656,2.648,5.779c0.11,2.1-0.538,4.248-1.976,5.971 l-0.011,0.016l-0.176,0.204l-0.039,0.046l-0.145,0.155l-0.011,0.011c-1.563,1.642-3.656,2.539-5.782,2.651 c-2.104,0.111-4.254-0.54-5.975-1.978l-0.012-0.012l-0.203-0.175l-0.029-0.024L78.764,90.865c-0.88,0.62-1.779,1.207-2.687,1.763 c-1.234,0.756-2.51,1.467-3.816,2.117c-6.699,3.342-14.266,5.223-22.27,5.223v0.006h-0.016v-0.006 c-13.797-0.005-26.297-5.601-35.334-14.644l-0.004,0.005C5.608,76.3,0.016,63.81,0.007,50.021H0v-0.033v-0.016h0.007 c0.005-13.799,5.601-26.297,14.646-35.339C23.684,5.607,36.169,0.015,49.958,0.006V0H49.991L49.991,0z M67.787,43.397 c1.21-0.007,2.353,0.312,3.322,0.872l-0.002,0.002c0.365,0.21,0.708,0.454,1.01,0.715c0.306,0.264,0.594,0.569,0.851,0.895h0.004 c0.873,1.11,1.397,2.522,1.394,4.053c-0.003,1.216-0.335,2.358-0.906,3.335c-0.454,0.78-1.069,1.461-1.791,1.996 c-0.354,0.261-0.751,0.496-1.168,0.688v0.002c-0.823,0.378-1.749,0.595-2.722,0.6l-11.051,0.08l-0.08,11.062 c-0.004,1.034-0.254,2.02-0.688,2.886c-0.188,0.374-0.417,0.737-0.678,1.074l-0.006,0.007c-0.257,0.329-0.551,0.644-0.866,0.919 c-1.169,1.025-2.713,1.649-4.381,1.649v-0.007c-0.609,0-1.195-0.082-1.743-0.232c-1.116-0.306-2.115-0.903-2.899-1.689 c-0.788-0.791-1.377-1.787-1.672-2.893v-0.006c-0.144-0.543-0.22-1.128-0.215-1.728v-0.005l0.075-10.945l-10.962,0.076 c-1.209,0.011-2.354-0.31-3.327-0.873l0.002-0.002c-0.37-0.212-0.715-0.458-1.016-0.722c-0.306-0.264-0.589-0.567-0.844-0.891 h-0.004c-0.873-1.112-1.397-2.522-1.393-4.053c0.002-1.213,0.337-2.354,0.906-3.328l-0.004-0.002 c0.376-0.642,0.869-1.225,1.442-1.714h0.004c0.574-0.489,1.236-0.883,1.942-1.151c0.704-0.266,1.484-0.418,2.296-0.423 l11.051-0.082l0.08-11.062c0.004-1.207,0.345-2.345,0.921-3.309l0.004,0.002c0.224-0.374,0.467-0.715,0.727-1.003 c0.264-0.296,0.576-0.584,0.908-0.839l0.005-0.004v0.002c1.121-0.861,2.533-1.379,4.055-1.375c1.211,0.002,2.352,0.332,3.317,0.897 c0.479,0.279,0.928,0.631,1.32,1.025l0.004-0.004c0.383,0.383,0.73,0.834,1.019,1.333c0.56,0.968,0.879,2.104,0.868,3.304 l-0.075,10.942L67.787,43.397L67.787,43.397z M50.006,11.212v0.006h-0.015h-0.034v-0.006C39.274,11.219,29.59,15.56,22.581,22.566 l0.002,0.002c-7.019,7.018-11.365,16.711-11.368,27.404h0.006v0.016v0.033h-0.006c0.006,10.683,4.347,20.365,11.354,27.377 l0.002-0.002c7.018,7.018,16.711,11.365,27.404,11.367v-0.007h0.016h0.033v0.007c10.685-0.007,20.367-4.348,27.381-11.359 c7.012-7.009,11.359-16.702,11.361-27.401H88.76v-0.015v-0.034h0.007C88.76,39.273,84.419,29.591,77.407,22.58v-0.007 C70.398,15.562,60.705,11.214,50.006,11.212L50.006,11.212z"/></g></svg>
        </button>
        <button @click="zoomFull()" class="overflow-hidden px-5 py-3 text-zinc-500 text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 uppercase">
          {{ `${(currentZoom*100).toFixed(0)}%` }}
        </button>
        <button @click="zoomAutoFit()" class="overflow-hidden px-5 py-3 text-zinc-500 text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 uppercase">
          Fit
        </button>
        <button @click="zoomOut()" class="overflow-hidden px-5 py-3 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 122.879 119.801" enable-background="new 0 0 122.879 119.801" xml:space="preserve"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M49.991,0h0.015v0.006c13.794,0.004,26.294,5.601,35.336,14.645 c9.026,9.031,14.618,21.515,14.628,35.303h0.006v0.034v0.04h-0.006c-0.005,5.557-0.918,10.905-2.594,15.892 c-0.281,0.837-0.576,1.641-0.877,2.409v0.007c-1.446,3.661-3.315,7.12-5.548,10.307l29.08,26.14l0.018,0.015l0.157,0.146 l0.012,0.012c1.641,1.563,2.535,3.656,2.648,5.779c0.11,2.1-0.538,4.248-1.976,5.971l-0.011,0.016l-0.176,0.204l-0.039,0.046 l-0.145,0.155l-0.011,0.011c-1.563,1.642-3.656,2.539-5.782,2.651c-2.104,0.111-4.254-0.54-5.975-1.978l-0.012-0.012l-0.203-0.175 l-0.029-0.024L78.764,90.865c-0.88,0.62-1.779,1.207-2.687,1.763c-1.234,0.756-2.51,1.467-3.816,2.117 c-6.699,3.342-14.266,5.223-22.27,5.223v0.006h-0.016v-0.006c-13.797-0.005-26.297-5.601-35.334-14.644l-0.004,0.005 C5.608,76.3,0.016,63.81,0.007,50.021H0v-0.033v-0.016h0.007c0.005-13.799,5.601-26.297,14.646-35.339 C23.684,5.607,36.169,0.015,49.958,0.006V0H49.991L49.991,0z M67.787,43.397c1.21-0.007,2.353,0.312,3.322,0.872l-0.002,0.002 c0.365,0.21,0.708,0.454,1.01,0.715c0.306,0.264,0.594,0.569,0.851,0.895h0.004c0.873,1.11,1.397,2.522,1.394,4.053 c-0.003,1.216-0.335,2.358-0.906,3.335c-0.454,0.78-1.069,1.461-1.791,1.996c-0.354,0.261-0.751,0.496-1.168,0.688v0.002 c-0.823,0.378-1.749,0.595-2.722,0.6l-35.166,0.248c-1.209,0.011-2.354-0.31-3.327-0.873l0.002-0.002 c-0.37-0.212-0.715-0.458-1.016-0.722c-0.306-0.264-0.589-0.567-0.844-0.891h-0.004c-0.873-1.112-1.397-2.522-1.393-4.053 c0.002-1.213,0.337-2.354,0.906-3.328l-0.004-0.002c0.376-0.642,0.869-1.225,1.442-1.714h0.004 c0.574-0.489,1.236-0.883,1.942-1.151c0.704-0.266,1.484-0.418,2.296-0.423L67.787,43.397L67.787,43.397z M50.006,11.212v0.006 h-0.015h-0.034v-0.006C39.274,11.219,29.59,15.56,22.581,22.566l0.002,0.002c-7.019,7.018-11.365,16.711-11.368,27.404h0.006v0.016 v0.033h-0.006c0.006,10.683,4.347,20.365,11.354,27.377l0.002-0.002c7.018,7.018,16.711,11.365,27.404,11.367v-0.007h0.016h0.033 v0.007c10.685-0.007,20.367-4.348,27.381-11.359c7.012-7.009,11.359-16.702,11.361-27.401H88.76v-0.015v-0.034h0.007 C88.76,39.273,84.419,29.591,77.407,22.58v-0.007C70.398,15.562,60.705,11.214,50.006,11.212L50.006,11.212z"/></g></svg>
        </button>
      </div>

      <!-- canvas -->
      <div ref="dropZone" v-contextmenu:canvasContextMenu class="abolute inset-0 w-full h-full">
        <canvas ref="canvasRef" id="canvas" class="design-grid"/>
        <div ref="brushpreviewRef" class="brushpreview"></div>
        <div v-if="loading" class="absolute bg-zinc-900/30 inset-0 flex items-center justify-center">
          <SpinLoader class="w-8 h-8 text-orange-100"/>
        </div>
      </div>
    </div>

    <v-contextmenu ref="canvasContextMenu">
      <v-contextmenu-item @click="cropSelection()">Crop</v-contextmenu-item>
      <v-contextmenu-item @click="unSelect()">Unselect</v-contextmenu-item>
      <v-contextmenu-divider />
      <v-contextmenu-item v-if="selection" @click="bringToFront()">Bring to front</v-contextmenu-item>
      <v-contextmenu-item v-if="selection" @click="sendToBack()">Send to back</v-contextmenu-item>
      <v-contextmenu-divider />
      <v-contextmenu-item @click="exportImage()">Export Image</v-contextmenu-item>
      <v-contextmenu-submenu title="Save as">
        <v-contextmenu-item @click="">Image</v-contextmenu-item>
        <v-contextmenu-item @click="">Mask</v-contextmenu-item>
      </v-contextmenu-submenu>
      <v-contextmenu-divider />
      <v-contextmenu-item v-if="false" @click="">Reprompt</v-contextmenu-item>
      <v-contextmenu-item v-if="selection" @click="deleteSelection()">Delete</v-contextmenu-item>
    </v-contextmenu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { getImageDataURL, getImageDetails, imageToDataURL, getImageSize, extractImageSDMetadata } from '@/utils/image'
import { initBrushes } from '@/utils/brushes'
import { useModelStore, useEditorStore, storeToRefs } from '@/stores'
import { fabric } from 'fabric'
import { throttle } from 'lodash'
// @ts-ignore
import makeDroppable from '@/utils/makeDroppable'
import SpinLoader from '@/components/UI/SpinLoader.vue'
import initAligningGuidelines from '@/libs/editor/core/initAligningGuidelines'
import InitCenterAlign from '@/libs/editor/core/initCenterAlign'
import initRuler from '@/libs/editor/ruler'
import type CanvasRuler from '@/libs/editor/ruler/ruler'
import EditorToolbar from '@/views/ImageEditor/EditorToolbar.vue'

const emit = defineEmits(['save', 'preview', 'reset'])

const props = defineProps({
  image: { type: String, required: false, default: null },
  mask: { type: String, required: false, default: null },
  defaultTool: { type: String, required: false, default: 'pencilbrush' },
  width: { type: Number, required: false, default: 768 },
  height: { type: Number, required: false, default: 768 },
})

const zoom_options = [
  { name:'10%',  value:0.10 },
  { name:'25%',  value:0.25 },
  { name:'50%',  value:0.50 },
  { name:'75%',  value:0.75 },
  { name:'100%', value:1.00 },
  { name:'125%', value:1.25 },
  { name:'150%', value:1.50 },
  { name:'200%', value:2.00 },
]

let debounceTimer: any = null
let canvas: any = null
let maskRect: any = null
let workspace: any = null
let resizeObserver: any = null
let lockCanvas = false

const { editor, editorPreview } = storeToRefs(useEditorStore())

const wk = ref({
  width: 0,
  height: 0
})

const tool = ref(props.defaultTool)
const mouse = ref({
  mx: 0,
  my: 0
})

const documentWidth = ref(props.width)
const documentHeight = ref(props.height)

const currentZoom = ref(1.0)
const ctrlKeyDown = ref(false)
const loading = ref<boolean>(false)

const dropZone = ref<any>(null)
const editorRef = ref<any>(null)
const canvasRef = ref<any>(null)
const brushpreviewRef = ref<any>(null)
const selection = ref<any>(null)
const loadImageButton = ref<any>(null)

/* -------------- */

const resetImage = ()=>{
  zoomAutoFit()
}

const addFabricImage = async (src: any, e: any)=>{
  const w = workspace.width
  const h = workspace.height

  wk.value = {
    width: w,
    height: h
  }

  return new Promise((resolve) => {
    fabric.Image.fromURL(src, (img: any) => {
      const iw = Math.round(e.width)
      const ih = Math.round(e.height)
      const scale = (iw>=ih) ? w/iw : h/ih

      const workspaceCenter = workspace.getCenterPoint()

      img.set({
        left: Math.round(workspaceCenter.x - (iw*scale)/2),
        top: Math.round(workspaceCenter.y - (ih*scale)/2),
        angle: 0,
        padding: 0,
        width: iw,
        height: ih,
        opacity: 'opacity' in e ? e.opacity : 1.00,
        scaleX: scale,
        scaleY: scale,
        isMaskPath: e.isMaskPath,
        centeredScaling: true,
        centeredRotation: true,
        globalCompositeOperation: 'source-over',
      })

      canvas.add(img)
      canvas.renderAll()
      canvas.setActiveObject(img)

      if (e.unselect) {
        unSelect()
      }

      resolve(img)
    })
  })
}

/**
 * paste mask data into alpha channel
 */
function processMask(ctx: any, w: number, h: number, borderWidth = 1) {
  const imgData = ctx.getImageData(0, 0, w, h)
  const data = imgData.data
  const color = [255, 255, 255] // white

  for (let i=0; i < data.length; i+=4) {
    let x = (i / 4) % w;
    let y = Math.floor((i / 4) / w);

    if (data[i+3] === 255) {
      data[i+3] = 0
    } else {
      data[i+3] = 255
    }

    data[i] = 255 - color[0]
    data[i+1] = 255 - color[1]
    data[i+2] = 255 - color[2]

    // Enlever le cadre blanc en rendant les bords transparents
    if (x < borderWidth || x >= w - borderWidth || y < borderWidth || y >= h - borderWidth) {
      data[i+3] = 0; // Rendre le pixel complètement transparent
    }
  }

  ctx.globalCompositeOperation = 'source-over'
  ctx.putImageData(imgData, 0, 0)
}


function prepareRGB(image: any, kanvas: any, ctx: any) {
  const w = kanvas.width
  const h = kanvas.height
  ctx.drawImage(image, 0, 0, w, h)
  processMask(ctx, w, h)
}

const getMaskDataURL = (maskURL: string) => {
  const maskCanvas = document.createElement('canvas')
  const maskCtx = maskCanvas.getContext('2d')

  return new Promise((resolve) => {
    const backupCanvas = document.createElement('canvas')
    const backupCtx = backupCanvas.getContext('2d')

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      backupCanvas.width = img.width
      backupCanvas.height = img.height
      prepareRGB(img, backupCanvas, backupCtx)
      const dataURL = backupCanvas.toDataURL()
      resolve(dataURL)
    }
    img.src = maskURL
  })
}

const openImageSrc = async (src: string) => {
  const { width, height }: any = await getImageSize(src)

  canvas.remove(workspace)
  initWorkspace(width, height)
  setTool(tool.value)

  return await addFabricImage(src, {
    width,
    height,
    unselect: true
  })
}

const openMaskSrc = async (src: string) => {
  const { width, height }: any = await getImageSize(src)

  const maskDataURL = await getMaskDataURL(src)

  const maskImage: any = await addFabricImage(maskDataURL, {
    width,
    height,
    isMaskPath: true,
    opacity: 1.00,
    unselect: true
  })

  maskImage.filters.push(new fabric.Image.filters.Invert())
  maskImage.applyFilters()
  canvas.renderAll()
}


const openFile = async (file: File) => {
  const URL = window.webkitURL || window.URL
  const src = URL.createObjectURL(file)

  if (src) {
    const { width, height } = await getImageSize(src)

    await addFabricImage(src, {
      width,
      height
    })

    setTool('select')
  }
}

/* -------------- */

let pressingKey = false
let oldTool: any = null
const onDocumentKeydownHandler = (evt: any)=>{
  const e = evt || window.event
  const key = e.keyCode || e.which

  /* escape */
  if (key===27) {
    unSelect()
  }

  if (e.ctrlKey) {
    ctrlKeyDown.value = true
  }

  if ((e.ctrlKey || e.altKey) && key===65) {
    selectAll()
    setTool('select')
    e.preventDefault()
  }

  /* backspace and delete keys */
  if (key===8 || key===46) {
    deleteSelection()
  }

  /* space */
  if (e.key===' ' || e.code==='Space' || key===32) {
    if (!pressingKey) {
      oldTool = tool.value
      setTool('move')
    }
  }

  pressingKey = true
}

const onDocumentKeyupHandler = (evt: any) => {
  const e = evt || window.event
  const key = e.keyCode || e.which

  pressingKey = false

  if (e.key===' ' || e.code==='Space' || key===32) {
    if (oldTool) {
      setTool(oldTool)
      oldTool = null
    }
  }

  if (!e.ctrlKey) {
    ctrlKeyDown.value = false
  }
}

const setCenterFromObject = (obj: fabric.Rect) => {
  if (!canvas || !obj) return

  const objCenter = obj.getCenterPoint()
  const t = canvas.viewportTransform

  if (t) {
    t[4] = canvas.width / 2 - objCenter.x * t[0]
    t[5] = canvas.height / 2 - objCenter.y * t[3]
    canvas.setViewportTransform(t)
    canvas.renderAll()
  }
}

/* ------------------ */

const updateBrushPreview = () => {
  const size = editor.value.parameters.brushSize
  const brush = brushpreviewRef.value

  const cx = mouse.value.mx
  const cy = mouse.value.my
  const zoom = canvas.getZoom()
  const scaled = (size * zoom) * 0.5

  brush.style.width = scaled * 2 + 'px'
  brush.style.height = scaled * 2 + 'px'
  brush.style.left = cx - scaled + 'px'
  brush.style.top = cy - scaled + 'px'
}

const setBrushSize = (size: number) => {
  if (canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.width = editor.value.parameters.brushSize
  }
  editor.value.parameters.brushSize = size
  updateBrushPreview()
}

const setTool = (t: any) => {
  tool.value = t
  canvas.isDrawingMode = false
  canvas.defaultCursor = 'default'
  workspace.hoverCursor = 'default'

  /* disable controls and freeze all objects in move mode */
  if (t === 'move') {
    unSelect()
    freezeObjects()
  } else {
    unfreezeObjects()
  }

  switch (t) {
    case 'select':
      break

    case 'move':
      canvas.defaultCursor = 'grab'
      workspace.hoverCursor = 'grab'
      break

    case 'longfur':
      unSelect()
      // @ts-ignore
      canvas.freeDrawingBrush = new fabric.FurBrush(canvas, {
        width: 2, 
        color: '#ffffff',
        opacity: 1
      })

      canvas.freeDrawingBrush.color = editor.value.parameters.drawingColor
      canvas.isDrawingMode = true
      break

    case 'spray':
      unSelect()
      // @ts-ignore
      canvas.freeDrawingBrush = new fabric.SpraypaintBrush(canvas, {
        width: editor.value.parameters.brushSize, 
        color: '#ffffff'
      })

      canvas.freeDrawingBrush.color = editor.value.parameters.drawingColor
      canvas.isDrawingMode = true
      break

    case 'pencilbrush':
      unSelect()
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.color = editor.value.parameters.drawingColor
      canvas.freeDrawingBrush.width = editor.value.parameters.brushSize
      canvas.freeDrawingBrush.opacity = 0.5
      canvas.isDrawingMode = true
      break
  }
}

/* ------------------ */

const zoomToCenter = (rz: any) => {
  if (!canvas) return
  /*
  const { width, height } = dropZone.value.getBoundingClientRect()
  const x = width / 2
  const y = height / 2
  const zoom = canvas.getZoom()
  canvas.zoomToPoint({ x, y }, rz)
  */
}

const setZoomAuto = (scale: number) => {
  const vw = getWorkspaceWidth()
  const vh = getWorkspaceHeight()

  canvas.setDimensions({
    width: vw,
    height: vh
  })

  const center = canvas.getCenter()
  canvas.setViewportTransform(fabric.iMatrix.concat())
  canvas.zoomToPoint(new fabric.Point(center.left, center.top), scale)
  const z = canvas.getZoom()
  currentZoom.value = z

  if (!workspace) return
  setCenterFromObject(workspace)
}

const getCanvasScale = () => {
  const vw = getWorkspaceWidth()
  const vh = getWorkspaceHeight()

  const w = documentWidth.value
  const h = documentHeight.value
  const sw = vw/w
  const sh = vh/h

  // console.log(vw, vh, w, h)
  //console.log(sw, sh)

  return Math.min(sw, sh)
}

const zoomIn = () => {
  let z = canvas.getZoom()
  z += 0.05

  const center = canvas.getCenter()
  canvas.zoomToPoint(new fabric.Point(center.left, center.top), z)
  currentZoom.value = z
}

const zoomOut = () => {
  let z = canvas.getZoom()
  z -= 0.05
  const center = canvas.getCenter()
  canvas.zoomToPoint(
    new fabric.Point(center.left, center.top),
    z < 0 ? 0.05 : z
  )
  currentZoom.value = z
}

const zoomFull = () => {
  setZoomAuto(1.0)
  canvas.requestRenderAll()
  currentZoom.value = 1.0
}

const zoomAutoFit = () => {
  const scale = getCanvasScale()
  setZoomAuto(scale - 0.08)
}

const getWorkspaceWidth = ()=>{
  return dropZone.value?.offsetWidth
}

const getWorkspaceHeight = ()=>{
  return dropZone.value.offsetHeight
}

const setWorkspaceSize = (width: number, height: number) => {
  workspace.set({
    width: width,
    height: height
  })

  canvas.renderAll()
}


/* ------------------------------------------------------ */

let tempFrozenObjects: any = null

const freezeObjects = () => {
  if (tempFrozenObjects) return

  tempFrozenObjects = canvas.getObjects().map((obj: any) => {
    const selectable = obj.selectable
    const hasControls = obj.hasControls

    obj.set({
      selectable: false,
      hasControls: false
    })

    return {
      obj,
      selectable,
      hasControls
    }
  })
}

const unfreezeObjects = () => {
  if (!tempFrozenObjects) return

  tempFrozenObjects.forEach(({obj, selectable, hasControls}: any) => {
    obj.set({ selectable, hasControls })
  })

  tempFrozenObjects = null
}

const transformCanvasViewportForExport = (desiredWidth: number, desiredHeight: number) => {
  const coords = workspace.getBoundingRect()
  const originalTransform = canvas.viewportTransform.slice()

  // Calculez les facteurs d'échelle pour redimensionner le contenu du workspace
  const scaleX = desiredWidth / coords.width
  const scaleY = desiredHeight / coords.height

  // apply temp transformation matrix
  const z = canvas.getZoom()

  canvas.viewportTransform[0] *= scaleX
  canvas.viewportTransform[3] *= scaleY

  canvas.viewportTransform[4] -= coords.left
  canvas.viewportTransform[5] -= coords.top

  return originalTransform
}

const blendImage = async (operation: GlobalCompositeOperation = 'destination-out') => {
  const kanvas = document.createElement('canvas')
  const ctx = kanvas.getContext('2d')

  const { imageDataURL, maskDataURL } = exportWorkspaceImages()

  const image = new Image()
  await new Promise((resolve) => {
    image.onload = resolve
    image.src = imageDataURL
  })

  kanvas.width = image.width
  kanvas.height = image.height

  const mask = new Image()
  await new Promise((resolve) => {
    mask.onload = resolve
    mask.src = maskDataURL
  })

  //@ts-ignore
  ctx.drawImage(image, 0, 0)
  //@ts-ignore
  ctx.globalCompositeOperation = operation
  //@ts-ignore
  ctx.drawImage(mask, 0, 0)
  const blendDataURL = kanvas.toDataURL('image/jpg')

  return {
    imageDataURL,
    maskDataURL,
    blendDataURL
  }
}

const exportWorkspaceImages = () => {
  const exportWidth = workspace.width
  const exportHeight = workspace.height

  const originalTransform = transformCanvasViewportForExport(
    exportWidth,
    exportHeight
  )

  const objects = canvas.getObjects()

  const savedObjects = objects.map((obj: any) => {
    const previousVisibility = obj.visible
    return {obj, previousVisibility}
  })

  /**
   * whole image + mask
   */
  const workspaceDataURL = canvas.toDataURL({
    format: 'png',
    left: 0,
    top: 0,
    width: exportWidth,
    height: exportHeight
  })

  /**
   * everything except mask (hide all mask paths)
   */
  objects.forEach((obj: any) => obj.set({visible: !obj.isMaskPath}))
  const imageDataURL = canvas.toDataURL({
    format: 'png',
    left: 0,
    top: 0,
    width: exportWidth,
    height: exportHeight
  })

  /**
   * only mask paths
   */
  objects.forEach((obj: any) => obj.set({visible: obj.isMaskPath}))
  const maskDataURL = canvas.toDataURL({
    format: 'png',
    left: 0,
    top: 0,
    width: exportWidth,
    height: exportHeight
  })

  // restore visibility
  savedObjects.forEach(({obj, previousVisibility}: any) => {
    obj.set({visible: previousVisibility})
  })

  // restore original transform
  canvas.setViewportTransform(originalTransform)

  return { 
    workspaceDataURL,
    imageDataURL,
    maskDataURL
  }
}

const asyncUpdatePreview = async () => {
  console.log('update preview')
  const coords = {
    width: workspace.width,
    height: workspace.height
  }

  const { imageDataURL, maskDataURL } = await exportWorkspaceImages()
  const { blendDataURL } = await blendImage()

  editorPreview.value.image = imageDataURL
  editorPreview.value.mask = maskDataURL
  // @ts-ignore
  editorPreview.value.blend = blendDataURL
  editorPreview.value.width = coords.width
  editorPreview.value.height = coords.height

  const payload = {
    image: imageDataURL,
    mask: maskDataURL,
    blend: blendDataURL,
    coords
  }

  emit('preview', payload)

  return payload
}

const updatePreview = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(async () => {
    await asyncUpdatePreview()
  }, 400)
}

/* ------------------------------------------------------ */

const exportImage = async () => {
  const payload = await asyncUpdatePreview()
  console.log()
  // emit('save', payload)
}

/* ------------------------------------------------------ */

const saveState = () => {
  const state = JSON.parse(JSON.stringify(canvas))
  editor.value.state = state
  return state
}

const loadState = (state: any) => {
  lockCanvas = true
  editor.value.state = state
  canvas.loadFromJSON(state)
  canvas.renderAll()
  lockCanvas = false
}

const resetState = () => {
  lockCanvas = true

  const objects = canvas.getObjects()

  for (let i=objects.length-1; i>=0; i--) {
    if (objects[i] !== workspace) {
      canvas.remove(objects[i])
    }
  }

  // reset editor settings
  editor.value.state = null

  editorPreview.value.image = null
  editorPreview.value.mask = null
  editorPreview.value.blend = null
  editorPreview.value.width = props.width
  editorPreview.value.height = props.height

  editor.value.maskPaths = []
  editor.value.undoStack = []
  editor.value.redoStack = []

  emit('reset')

  lockCanvas = false
}

const clearAll = () => {
  resetState()
}

const onCanvasUpdated = (e: any) => {
  if (lockCanvas) return
  //console.log('update', e)
  // saveState() extremelly slow due to local storage and JSON serialize

  if (false) {
    // store canvas state
    const state = JSON.parse(JSON.stringify(canvas))
    editor.value.undoStack.push(state)
    console.log('add to undo stack', state)
    // reset redo stack
    editor.value.redoStack = []
  }

  updatePreview()
}

/* ------------------------------------------------------- */
/* ------------------------------------------------------- */

const bringToFront = () => {
  const ao = canvas.getActiveObject()
  ao.bringToFront()
}

const sendToBack = () => {
  const ao = canvas.getActiveObject()
  ao.sendToBack()
  workspace.sendToBack()
}

const unSelect = () => {
  canvas.selection = false
  canvas.discardActiveObject()
  canvas.renderAll()
}

const selectAll = () => {
  const allObjects = canvas.getObjects()
    .filter((o: any) => o !== workspace && o !== maskRect)

  if (allObjects.length <= 0) return

  // console.log(allObjects)

  // Créer une nouvelle sélection active avec les objets restants
  let activeSelection = new fabric.ActiveSelection(allObjects, {
    canvas: canvas
  })

  // Définir la nouvelle sélection active comme l'objet actif
  canvas.setActiveObject(activeSelection)

  // Mettre à jour le rendu du canvas avec la nouvelle sélection active
  canvas.requestRenderAll()
}

const deleteSelection = () => {
  let activeObject = canvas.getActiveObject()

  if (activeObject) {
    if (activeObject.type === 'activeSelection') {
      // Active object is a group of objects
      let objectsInGroup = activeObject.getObjects()
      canvas.discardActiveObject()
      objectsInGroup.forEach((object: any) => {
        canvas.remove(object)
      })
    } else {
      // Active object is a single object
      canvas.remove(activeObject)
    }
    canvas.renderAll()
  }
}

const cropSelection = () => {

}

/* ------------------------------------------------------- */
/* ------------------------------------------------------- */

const initCanvasListeners = () => {
  canvas.on('object:added', (e: any) => {
    console.log('object:added')
    onCanvasUpdated(e)
  })

  canvas.on('object:modified', (e: any) => {
    console.log('object:modified')
    onCanvasUpdated(e)
  })

  canvas.on('object:removed', (e: any) => {
    console.log('object:removed')
    onCanvasUpdated(e)
  })

  canvas.on('path:created', (e: any)=>{
    console.log('path:created')
    e.path.set({isMaskPath: true})
    e.path.setCoords()
    onCanvasUpdated(e)
  })

  canvas.on('path:modified', (e: any) => {
    console.log('path:modified')
    onCanvasUpdated(e)
  })

  canvas.on('path:removed', (e: any) => {
    console.log('path:removed')
    onCanvasUpdated(e)
  })

  canvas.on('selection:created', (e: any) => {
    console.log('selection:created', e)
    selection.value = e.selected
  })

  canvas.on('selection:updated', (e: any) => {
    console.log('selection:updated', e)
    selection.value = e.selected
  })

  canvas.on('selection:cleared', () => {
    console.log('selection:cleared')
    selection.value = null
  })
}

const undo = () => {
  return false
  const u = editor.value.undoStack
  const r = editor.value.redoStack

  // keep at least one state in the undo stack
  if (u.length > 1) { 
    // add actual state to redo stack
    r.push(u.pop())

    // get previous state
    const prevState = u[u.length - 1]

    // restore canvas' previous state
    lockCanvas = true
    canvas.loadFromJSON(prevState)
    canvas.renderAll()
    lockCanvas = false
  }
}

const redo = () => {
  return false
  const u = editor.value.undoStack
  const r = editor.value.redoStack

  if (r.length>0) {
    // get the next state
    const nextState = r.pop()

    // load the next state in canvas
    lockCanvas = true
    canvas.loadFromJSON(nextState)
    canvas.renderAll()
    lockCanvas = false

    // add actual state to the undo stack
    u.push(
      JSON.parse(JSON.stringify(canvas))
    )
  }
}

const initWorkspace = (width: number, height: number) => {
  /*
  const min = 768
  const ar = width / height

  if (ar>=1) {
    width = Math.min(768, width)
    height = Math.round(width * ar)
  } else {
    height = Math.min(768, height)
    width = Math.round(height * ar)
  }
  */

  workspace = new fabric.Rect({
    // @ts-ignore
    id: 'workspace',
    // fill: 'rgba(255, 255, 255, 1.0)',
    width,
    height
  })

  workspace.hoverCursor = 'default'
  workspace.set('selectable', false)
  workspace.set('hasControls', false)

  canvas.add(workspace)
  canvas.clipPath = workspace
  canvas.renderAll()

  zoomAutoFit()
}

const initEventHandlers = () => {
  canvas.on('mouse:down', (opt: any) => {
    const e = opt.e
    if (tool.value === 'move') {
      canvas.isDragging = true
      canvas.selection = false
      canvas.lastPosX = e.clientX
      canvas.lastPosY = e.clientY
    }
  })

  canvas.on('mouse:move', (opt: any) => {
    mouse.value.mx = Math.round(opt.e.x - canvas._offset.left)
    mouse.value.my = Math.round(opt.e.y - canvas._offset.top)

    if (brushpreviewRef.value) {
      if (tool.value === 'pencilbrush') {
        brushpreviewRef.value.style.display = 'block'
        updateBrushPreview()
      } else {
        brushpreviewRef.value.style.display = 'none'
      }
    }

    if (tool.value === 'move' && canvas.isDragging) {
      const e = opt.e
      const vpt = canvas.viewportTransform
      vpt[4] += e.clientX - canvas.lastPosX
      vpt[5] += e.clientY - canvas.lastPosY
      canvas.requestRenderAll()
      canvas.lastPosX = e.clientX
      canvas.lastPosY = e.clientY
    }
  })

  canvas.on('mouse:up', (opt: any) => {
    // on mouse up we want to recalculate new interaction
    // for all objects, so we call setViewportTransform
    canvas.setViewportTransform(canvas.viewportTransform)
    canvas.isDragging = false
    canvas.selection = true
  })

  canvas.on('mouse:wheel', (opt: any) => {
    const delta = opt.e.deltaY
    let zoom = canvas.getZoom()

    if (ctrlKeyDown.value) {
      let brushSize = editor.value.parameters.brushSize
      const inc = 12 / zoom
      brushSize = delta < 0 ? Math.min(brushSize + inc, 300) : Math.max(brushSize - inc, 1)
      setBrushSize(brushSize)
      opt.e.preventDefault()
      opt.e.stopPropagation()
      return
    }

    zoom *= 0.999 ** delta

    if (zoom > 20) zoom = 20
    if (zoom < 0.05) zoom = 0.05

    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
    currentZoom.value = zoom

    updateBrushPreview()

    opt.e.preventDefault()
    opt.e.stopPropagation()
  })
}

const initResizeObserver = () => {
  resizeObserver = new ResizeObserver(
    throttle(() => {
      zoomAutoFit()
    }, 10)
  )
  resizeObserver.observe(editorRef.value)
}

const initEditor = async () => {
  makeDroppable(dropZone.value, loadImageButton.value, (files: any) => {
    if (files && files[0]) {
      openFile(files[0])
    }
  })

  initBrushes(fabric)

  canvas = new fabric.Canvas('canvas', {
    imageSmoothingEnabled: true,
    fireRightClick: true,
    stopContextMenu: false,
    controlsAboveOverlay: true,
    preserveObjectStacking: true
  })

  resetState()
  initEventHandlers()
  initWorkspace(props.width, props.height)

  initAligningGuidelines(canvas)
  const ruler = initRuler(canvas)
  ruler.enable()

  /*
  if (editor.value.undoStack<=0) {
    onCanvasUpdated()
  }
  */

  setTool(tool.value)
  unSelect()

  if (props.image) {
    loading.value = true
    const m = await openImageSrc(props.image)
    console.log('-------------------')
    if (props.mask) {
      await openMaskSrc(props.mask)
    }
    loading.value = false
  }


  initResizeObserver()
  initCanvasListeners()

  /*
  watch([props.width, props.height], ([w, h]) => {
    setWorkspaceSize(w, h)
  })
  */

  watch(() => props.image, async ()=>{
    await openImageSrc(props.image)
  })

  if (!editor.value.state) {
    // saveState()
  } else {
    // loadState(editor.value.state)
  }

  editorRef.value?.click()
}

onMounted(()=>{
  document.addEventListener('keydown', onDocumentKeydownHandler)
  document.addEventListener('keyup', onDocumentKeyupHandler)

  fabric.Object.prototype.borderColor = '#e0fcff'
  fabric.Object.prototype.cornerColor = '#38bec9ee'
  fabric.Object.prototype.cornerStyle = 'rect'
  fabric.Object.prototype.cornerSize = 8
  fabric.Object.prototype.opacity = 1
  fabric.Object.prototype.cornerStrokeColor = 'black'
  fabric.Object.prototype.borderDashArray = [5, 5]
  fabric.Object.prototype.hasBorders = true
  fabric.Object.prototype.transparentCorners = false

  nextTick(async ()=>{
    await initEditor()
  })
})

onBeforeUnmount(()=>{
  document.removeEventListener('keydown', onDocumentKeydownHandler)
  document.removeEventListener('keyup', onDocumentKeyupHandler)

  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style type="text/css" scoped>
.brushpreview {
  @apply bg-transparent rounded-full absolute;
  outline: 1px dashed black;
  box-shadow: 0 0 0 1px white;
  z-index: 10000;
  pointer-events: none;
}

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