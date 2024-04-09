<template>
  <div ref="dragwin" class="DragWin absolute left-0 top-0 z-[60] w-full flex flex-col">
    <div class="flex-1 h-full win-wrapper relative flex flex-col">
      <div class="win-head noselect" :class="[isDragging?'cursor-grabbing':'cursor-grab']" @mousedown="startDrag">
        <slot name="head"/>
      </div>
      <div class="win-body flex-1 flex flex-col">
        <slot/>
      </div>
      <div class="win-foot noselect">
        <slot name="foot"/>
      </div>
    </div>
    <div v-if="resizable" class="resize-handle resize-handle-bl" @mousedown="startResize($event, 'bl')"></div>
    <div v-if="resizable" class="resize-handle resize-handle-br" @mousedown="startResize($event, 'br')"></div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['close', 'enter'])

const props = defineProps({
  open: { type: Boolean, required: false, default: false },
  width: { type: Number, required: false, default: null },
  height: { type: Number, required: false, default: null },
  minWidth: { type: Number, required: false, default: null },
  minHeight: { type: Number, required: false, default: null },
  maxWidth: { type: Number, required: false, default: null },
  maxHeight: { type: Number, required: false, default: null },
  draggable: { type: Boolean, required: false, default: true },
  resizable: { type: Boolean, required: false, default: false },
  position: { type: Object, required: false, default: null },
  container: { type: Object, required: false, default: null }
})

const dragwin = ref<any>(null)
const isDragging = ref(false)
const isResizing = ref(false)
const resizeDirection = ref('')

const coords = ref({
  x: 0,
  y: 0,
  w: 0,
  h: 0
})

const setPosition = (x: number, y: number) => {
  const win = dragwin.value
  win.style.transform = `translate(${x}px, ${y}px)`
  coords.value.x = x
  coords.value.y = y
}

const setSize = (w: number, h: number) => {
  const win = dragwin.value

  if (props.minWidth !== null) w = Math.max(w, props.minWidth)
  if (props.maxWidth !== null) w = Math.min(w, props.maxWidth)
  if (props.minHeight !== null) h = Math.max(h, props.minHeight)
  if (props.maxHeight !== null) h= Math.min(h, props.maxHeight)

  win.style.width = `${w}px`
  win.style.height = `${h}px`
  coords.value.w = w
  coords.value.h = h
}

const init = ()=>{
  const win = dragwin.value
  const w = props.width ? props.width : win.clientWidth
  const h = props.height ? props.height : win.clientHeight
  setSize(w, h)
}

const center = ()=>{
  const win = dragwin.value
  const parentContainer = win.parentNode
  const pw = parentContainer.clientWidth
  const ph = parentContainer.clientHeight

  const w = win.clientWidth
  const h = win.clientHeight
  const x = (pw - w) * 0.5
  const y = (ph - h) * 0.5

  coords.value = { x, y, w, h }
  setPosition(x, y)
}

let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0

const startDrag = (e: MouseEvent) => {
  if (!props.draggable) return
  isDragging.value = true
  startX = e.clientX - coords.value.x
  startY = e.clientY - coords.value.y
}

const startResize = (e: MouseEvent, direction: string) => {
  if (!props.resizable) return
  isResizing.value = true
  resizeDirection.value = direction
  startWidth = dragwin.value.clientWidth
  startHeight = dragwin.value.clientHeight
  startX = e.clientX
  startY = e.clientY
}

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    const nx = e.clientX - startX
    const ny = e.clientY - startY
    setPosition(nx, ny)
  }

  if (isResizing.value) {
    let newWidth = startWidth
    let newHeight = startHeight

    if (resizeDirection.value === 'br') {
      newWidth = startWidth + (e.clientX - startX)
      newHeight = startHeight + (e.clientY - startY)
    } else if (resizeDirection.value === 'bl') {
      newWidth = startWidth - (e.clientX - startX)
      newHeight = startHeight + (e.clientY - startY)
    }

    setSize(newWidth, newHeight)
  }
}

const handleMouseUp = () => {
  isDragging.value = false
  isResizing.value = false
}

const handleKeydown = (e: any) => {
  if (!e.shiftKey && (e.keyCode===13 || e.key==='Enter')) emit('enter')
  if (e.keyCode===27 || e.key==='Escape') emit('close')
}

onMounted(()=>{
  init()

  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  if (!props.position) {
    center()
  } else {
    setPosition(props.position.x, props.position.y)
  }
})

onBeforeUnmount(()=>{
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style scoped>
.resize-handle {
  @apply absolute bg-zinc-500 w-5 h-5;
}

.resize-handle-bl {
  left: 0;
  bottom: 0;
  cursor: sw-resize;
}

.resize-handle-br {
  right: 0;
  bottom: 0;
  cursor: se-resize;
}
</style>