<template>
  <div ref="padRef" class="TWPad relative dark:shadow-xl rounded-lg overflow-hidden aspect-w-1 aspect-h-1">
    <div class="wrapper absolute inset-0">
      <dd class="text-xs font-mono p-3 text-teal-100 dark:text-teal-200 opacity-50 text-right">
        <dt>{{ (position.x).toFixed(precision) }}</dt>
        <dt>{{ (position.y).toFixed(precision) }}</dt>
      </dd>
    </div>
    <!-- Cursor -->
    <div ref="cursorRef" class="cursor absolute flex items-center justify-center bg-gradient-to-br z-10 from-teal-100 to-teal-300 dark:from-teal-300 dark:to-teal-900 rounded-full w-10 h-10 shadow-md cursor-pointer" style="left:50%; top:50%; transform: translate(-50%, -50%)">
      <div class="w-8 h-8 cursor-dot border border-teal-600 dark:border-teal-900 flex-shrink-0 bg-teal-300 dark:bg-teal-600 rounded-full mx-auto"></div>
    </div>
    <!-- Lines for X axis -->
    <div class="line absolute top-0 left-1/2 w-0.5 flex-shrink-0 bg-gradient-to-b from-teal-300/0 via-teal-100/50 to-teal-300/0 dark:from-teal-700/10 dark:via-teal-600/30 dark:to-teal-700/10 h-full"></div>
    <div class="line absolute top-0 left-1/4 opacity-25 w-0.5 flex-shrink-0 bg-gradient-to-b from-teal-300/10 via-teal-100/30 to-teal-300/10 dark:from-zinc-700/30 dark:via-zinc-600/75 dark:to-zinc-700/30 h-full"></div>
    <div class="line absolute top-0 left-3/4 opacity-25 w-0.5 flex-shrink-0 bg-gradient-to-b from-teal-300/10 via-teal-100/30 to-teal-300/10 dark:from-zinc-700/30 dark:via-zinc-600/75 dark:to-zinc-700/30 h-full"></div>

    <!-- Lines for Y axis -->
    <div class="line absolute left-0 top-1/2 h-0.5 flex-shrink-0 bg-gradient-to-r from-teal-300/10 via-teal-100/40 to-teal-300/10 dark:from-teal-700/10 dark:via-teal-600/40 dark:to-teal-700/10 w-full"></div>
    <div class="line absolute left-0 top-1/4 opacity-50 h-0.5 flex-shrink-0 bg-gradient-to-r from-teal-300/10 via-teal-100/30 to-teal-300/10 dark:from-zinc-700/30 dark:via-zinc-600/75 dark:to-zinc-700/30 w-full"></div>
    <div class="line absolute left-0 top-3/4 opacity-50 h-0.5 flex-shrink-0 bg-gradient-to-r from-teal-300/10 via-teal-100/30 to-teal-300/10 dark:from-zinc-700/30 dark:via-zinc-600/75 dark:to-zinc-700/30 w-full"></div>

    <!-- Crossed lines -->
    <div class="line  rotate-45 opacity-50 absolute left-0 top-1/2 h-0.5 flex-shrink-0 bg-gradient-to-r from-teal-300/10 via-teal-100/30 to-teal-300/10 dark:from-zinc-700/30 dark:via-zinc-600/75 dark:to-zinc-700/30 w-full"></div>
    <div class="line -rotate-45 opacity-50 absolute left-0 top-1/2 h-0.5 flex-shrink-0 bg-gradient-to-r from-teal-300/10 via-teal-100/30 to-teal-300/10 dark:from-zinc-700/30 dark:via-zinc-600/75 dark:to-zinc-700/30 w-full"></div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import { ref, onMounted, onBeforeUnmount, watchEffect } from 'vue'

const emit = defineEmits(['update:modelValue', 'change', 'release', 'updated', 'modified'])

const props = defineProps({
  id: { type: String, required: false, default: null },
  modelValue: { type: Array as PropType<number[]>, required: false, default: () => [0, 0] },
  zeroPoint: { type: Array as PropType<number[]>, required: false, default: () => [0, 0] },
  minx: { type: Number, required: false, default: -1.00 },
  maxx: { type: Number, required: false, default: 1.00 },
  miny: { type: Number, required: false, default: -1.00 },
  maxy: { type: Number, required: false, default: 1.00 },
  stepx: { type: Number, required: false, default: 0.20 },
  stepy: { type: Number, required: false, default: 0.20 },
  precision: { type: Number, required: false, default: 2 },
  resetOnRelease: { type: Boolean, required: false, default: false },
  flipYAxis: { type: Boolean, required: false, default: true },
  label: { type: String, required: false, default: null },
  disabled: { type: Boolean, required: false, default: false },
  readonly: { type: Boolean, required: false, default: false },
})

let old = props.modelValue
let isPointerDown: boolean = false
let isDragging: boolean = false
let isReleasing: boolean = false
let animationFrameId: number | null = null

const cursorRef = ref<any>()
const padRef = ref<HTMLElement | null>(null)
const position = ref<any>({
  x: props.modelValue[0],
  y: props.modelValue[1]
})

const easeOutCubic = (t: number) => (--t) * t * t + 1;

watchEffect(() => {
  const xPercent = ((position.value.x - props.minx) / (props.maxx - props.minx)) * 100
  const yPercent = ((position.value.y - props.miny) / (props.maxy - props.miny)) * 100

  if (cursorRef.value) {
    cursorRef.value.style.left = `${xPercent}%`
    cursorRef.value.style.top = `${props.flipYAxis ? 100-yPercent : yPercent}%`
  }
})

const setValue = (x: number, y: number) => {
  x = Math.max(Math.min(x, props.maxx), props.minx)
  y = Math.max(Math.min(y, props.maxy), props.miny)

  position.value = {
    x: x,
    y: y,
  }

  update([x, y])
}

const update = (values: [number, number]) => {
  emit('update:modelValue', values, old, isReleasing)
  emit('change', values, old, isReleasing)
  emit('modified')
  old = values
}

const animateCursorToPosition = (targetX: number, targetY: number, releasing = false, duration = 300) => {
  const startX = position.value.x
  const startY = position.value.y
  const startTime = performance.now()

  const animate = (currentTime: number) => {
    if (isDragging) {
      cancelAnimationFrame(animationFrameId!)
      return
    }

    isReleasing = releasing

    const elapsedTime = currentTime - startTime
    const progress = Math.min(elapsedTime / duration, 1)
    const easeProgress = easeOutCubic(progress)

    const x = startX + (targetX - startX) * easeProgress
    const y = startY + (targetY - startY) * easeProgress

    if (progress < 1) {
      setValue(x, y)
      animationFrameId = requestAnimationFrame(animate)
    } else {
      animationFrameId = null
      emit('updated', [x, y], old)
      setValue(x, y)
    }
  }

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  animationFrameId = requestAnimationFrame(animate)
}

const getCoords = (e: any) => {
  const rect = padRef.value!.getBoundingClientRect()
  // @ts-ignore
  const cx = event.clientX - rect.left
  // @ts-ignore
  const cy = event.clientY - rect.top

  let x = props.minx + (cx / rect.width) * (props.maxx - props.minx)
  let y = props.miny + (cy / rect.height) * (props.maxy - props.miny)

  if (props.flipYAxis) {
    // @ts-ignore
    y = props.maxy - (((event.clientY - rect!.top) / rect!.height) * (props.maxy - props.miny));
  }

  return { x, y }
}

const handleMouseDown = (event: MouseEvent) => {
  if (props.disabled || props.readonly || !padRef.value) return
  isReleasing = false
  isPointerDown = true

  cancelAnimationFrame(animationFrameId!)

  const { x, y } = getCoords(event)
  animateCursorToPosition(x, y, false)

  event.stopPropagation()
  event.preventDefault()
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isPointerDown || !padRef.value || !cursorRef.value) return
  isDragging = true
  const { x, y } = getCoords(event)
  setValue(x, y)

  event.stopPropagation()
  event.preventDefault()
}

const handleMouseUp = () => {
  if (!isPointerDown) return false

  if (props.resetOnRelease) {
    animateCursorToPosition(
      props.zeroPoint[0],
      props.zeroPoint[1],
      true
    )
  }

  isPointerDown = false
  isDragging = false

  event!.stopPropagation()
  event!.preventDefault()
}

onMounted(()=>{
  padRef.value!.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  position.value = {
    x: props.modelValue[0],
    y: props.modelValue[1]
  }
})

onBeforeUnmount(()=>{
  padRef.value!.removeEventListener('mousedown', handleMouseDown)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style>
/* Custom CSS for the pad's aesthetics */
.TWPad {
  @apply bg-teal-700/80 border border-teal-900/70 border-r-teal-600/60 border-b-teal-600/60;
}
.dark .TWPad {
  background: radial-gradient(#005860c0 20%, #001c1aaa 85%);
  @apply border border-zinc-950/70 border-r-zinc-700/70 border-b-zinc-700/70;
}

.TWPad .wrapper {
  box-shadow: inset 1px 1px 10px 2px rgba(0, 0, 0, 0.3);
}
.dark .TWPad .wrapper {
  box-shadow: inset 4px 4px 16px 2px rgba(0, 0, 0, 0.6);
}

.dark .TWPad .cursor {
  box-shadow: inset -2px -2px 8px 2px rgba(0, 0, 0, 0.2), inset 1px 1px 2px 1px rgba(0, 250, 250, 0.2);
}

.TWPad .cursor-dot {
  box-shadow: inset 2px 2px 8px 2px rgba(255, 255, 255, 0.8), inset -1px -1px 2px 1px rgba(0, 250, 250, 0.8);
}
.dark .TWPad .cursor-dot {
  box-shadow: inset 2px 2px 8px 2px rgba(0, 0, 0, 0.6), inset -1px -1px 2px 1px rgba(0, 250, 250, 0.6);
}
</style>