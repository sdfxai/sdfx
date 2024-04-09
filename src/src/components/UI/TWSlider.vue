<template>
  <div :id="id" class="TWSlider" :class="[color, disabled?'disabled':null]" @mouseover="hover=true" @mouseout="hover=false">
    <div ref="elem" class="twsld relative block rounded-full cursor-pointer" :style="{height: `${lineHeight}px`}" style="margin:0 0.10rem">
      <dt ref="slider" class="twsld-tooltip-container" :style="{'width': `${iconWidth}px`}">
        <span v-if="fixTooltip" class="twsld-tooltip-top twsld-tooltip-wrap duration-300">
          <span class="twsld-tooltip relative rounded-full border text-white text-center">
            <slot name="tooltip">
              {{ formatedVal }}
            </slot>
          </span>
        </span>
      </dt>
      <dt>
        <div ref="process" class="twsld-process absolute h-full left-0 top-0"></div>
        <span ref="knob" class="twsld-knob absolute rounded-full inline-block z-5 border-2 shadow-md bg-white"></span>
      </dt>
    </div>

    <div v-if="range" class="twsld-axis mt-2 relative" style="margin:-0.20rem 0.06rem; top:0.9rem; font-size:0.9em">
      <div v-for="(r, index) in range"
        :key="index"
        class="twsld-separate absolute left-0 top-0" :style="{transform:`translate(${valueToPosition(r)}px)`}"
        :class="[snap&&snap.includes(r)?'twsld-snap':'bg-zinc-400/40 dark:bg-zinc-600/40']"
      >
        <span class="twsld-separate-text text-xs duration-300" :class="[hover||dragging?'opacity-100':'opacity-0', 'text-zinc-400 dark:text-zinc-500']">
          {{ r }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount, onActivated, onUpdated, watch, nextTick} from 'vue'
import { throttle } from 'lodash'
import { ref } from 'vue'
import { PropType } from 'vue'

const isDiff = (a: any, b: any) => {
  if (Object.prototype.toString.call(a) !== Object.prototype.toString.call(b)) {
    return true
  } else if (Array.isArray(a) && a.length === b.length) {
    return a.some((v, i) => v !== b[i])
  }
  return a !== b
}

/**
 * compute best possible step if not specified in props (TODO)
 **/
const getAutoStep = (min: number, max: number) => {
  // Trouver la magnitude de l'intervalle
  const range = max - min
  const magnitude = Math.floor(Math.log10(range))

  // Calculer une approximation du step en fonction de la magnitude
  let suggestedStep = Math.pow(10, magnitude)

  // Vérifier si le step calculé est trop grand
  while (suggestedStep > range / 10) {
    suggestedStep /= 10
  }

  // Déterminer si le min et max sont des entiers ou des floats
  const isIntegerRange = Number.isInteger(min) && Number.isInteger(max)

  // Arrondir le step si nécessaire en fonction du type d'intervalle
  if (isIntegerRange) {
    suggestedStep = Math.ceil(suggestedStep)
  }

  return suggestedStep
}

const printError = (...msg: any[]) => {
  console.error(...msg)
}

const props = defineProps({
  id: { type: String, default: null },
  name: { type: String, default: null },
  data: { type: Array as PropType<number[]>, default: null },
  range: { type: Array, default: null },
  speed: { type: Number, default: 250 },
  lineHeight: { type: Number, default: 8 },
  iconWidth: { type: Number, default: 20 },
  color: { type: String, default: 'teal' },
  modelValue: { type: [String, Number], default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  interval: { type: Number, required: false, default: 0 },
  shiftInterval: { type: Number, required: false, default: 0 },
  snap: { type: Array, required: false, default: null },
  snapThreshold: { type: Number, required: false, default: 0.01 },
  zeroPoint: { type: Number, required: false, default: 0 },
  showTooltip: { type: Boolean, default: true },
  lazy: { type: Boolean, default: false },
  tooltipFormatter: { type: Function, default: null },
  animate: { type: Boolean, required:false, default: true },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change', 'updateEnd', 'dragStart', 'dragEnd', 'callbackRange'])
let resizeObserver: any = null

const fixTooltip = ref(true)

const compShowTooltip = computed(()=>{
  let show =  props.showTooltip && (hover.value || dragging.value)
  if (!fixTooltip.value) {
    // TODO: is it fixTooltip ?
    // was fixedTooltip
    fixTooltip.value = true
  }
  return show
})

const shiftKey = ref(false)
const hover = ref(false)
const slider = ref<any>(null)
const process = ref<any>(null)
const knob = ref<any>(null)
const elem = ref<any>(null)

const dragging = ref(false)
const size = ref(0)
const offset = ref(0)

const currentValue = ref(0)
const currentSlider = ref(0)
const isComponentExists = ref(false)
const realTime = ref(true)

const val = computed({
  get(): number {
    return props.data ? props.data[currentValue.value] : currentValue.value
  },

  set(val: number) {
    if (props.data) {
      let index = props.data.indexOf(val)
      if (index > -1) {
        currentValue.value = index
      }
    } else {
      currentValue.value = val
    }
  }
})

const xminimum = computed(() => (props.data ? 0 : props.min))
const xmaximum = computed(() => (props.data ? props.data.length - 1 : props.max))

const currentIndex = computed(() => (currentValue.value - xminimum.value) / spacing.value)
const indexRange = computed(() => [0, currentIndex.value])
const spacing = computed(() => (props.data ? 1 : compStep.value))
const gap = computed(() => size.value / total.value)
const position = computed(() => ((currentValue.value - xminimum.value) / spacing.value) * gap.value)
const limit = computed(() => [0, size.value])
const valueLimit = computed(() => [xminimum.value, xmaximum.value])

const multiple = computed(() => {
  let decimals = `${compStep.value}`.split('.')[1]
  return decimals ? Math.pow(10, decimals.length) : 1
})

const total = computed(() => {
  if (props.data) {
    return props.data.length - 1
  } else if (
    Math.floor((xmaximum.value - xminimum.value) * multiple.value) %
      (compStep.value * multiple.value) !== 0
  ) {
    printError(
      `[error] in slider${props.name?' '+props.name:''}:`,
      `Range (max - min) must be divisible by props.interval`,
      `min:${xminimum.value}`,
      `max:${xmaximum.value}`,
      `step:${compStep.value}`
    )
  }
  return (xmaximum.value - xminimum.value) / compStep.value
})

const compStep = computed(() => {
  let step = 1
  if (!props.interval && !props.shiftInterval) {
    step = getAutoStep(xminimum.value, xmaximum.value)
  } else {
    step = shiftKey.value ? (props.shiftInterval || props.interval) : props.interval
  }
  
  return step
})

const start = () => {
  if (isComponentExists.value) {
    getStaticData()
    setValue(limitValue(+props.modelValue), 0)
  }
}

const initResizeObserver = () => {
  resizeObserver = new ResizeObserver(
    throttle(() => {
      refresh()
    }, 16)
  )
  resizeObserver.observe(elem.value)
}

onMounted(() => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  isComponentExists.value = true

  setTransitionTime(props.speed)
  setValue(limitValue(+props.modelValue), 0)

  bindEvents()

  nextTick(() => {
    start()
    fixTooltip.value = false
    elem.value && (initResizeObserver())
  })
})

onUpdated(() => {
  getStaticData()
})    

onBeforeUnmount(() => {
  isComponentExists.value = false
  unbindEvents()
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

onActivated(() => {
  refresh()
})

const bindEvents = () => {
  elem.value.addEventListener('touchstart', moveStartHandler, { passive: false })
  elem.value.addEventListener('mousedown', wrapClick, { passive: false })

  //slider.value.addEventListener('touchstart', moveStartHandler, {passive: false})
  //slider.value.addEventListener('mousedown', moveStartHandler, { passive: false })

  document.addEventListener('touchmove', movingHandler, { passive: false })
  document.addEventListener('touchend', touchEndHandler, { passive: false })

  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
  document.addEventListener('mousemove', movingHandler)
  document.addEventListener('mouseup', moveEndHandler)
  document.addEventListener('mouseleave', moveEndHandler)
  window.addEventListener('resize', refresh)
}

const unbindEvents = () => {
  window.removeEventListener('resize', refresh)
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('keyup', onKeyUp)
  document.removeEventListener('touchmove', movingHandler)
  document.removeEventListener('touchend', moveEndHandler)
  document.removeEventListener('mousemove', movingHandler)
  document.removeEventListener('mouseup', moveEndHandler)
  document.removeEventListener('mouseleave', moveEndHandler)
}

watch(
  () => props.modelValue,
  (val) => {
    if (typeof val === 'string') {
      val = +val
    }
    if (dragging.value || !props.animate) {
      setValue(val)
    } else {
      setValue(val, props.speed)
    }
  }
)

watch(
  () => props.max,
  (v) => {
    if (v < props.min) {
      return printError(
        `[error] in slider${props.name?' '+props.name:''}:`,
        'maximum value can not be less than the minimum value.'
      )
    }
    setValue(limitValue(val.value))
    refresh()
  }
)

watch(
  () => props.min,
  (v) => {
    if (v > props.max) {
      return printError(
        `[error] in slider${props.name?' '+props.name:''}:`,
        'minimum value can not be greater than the maximum value.'
      )
    }
    setValue(limitValue(val.value))
    refresh()
  }
)

const onKeyDown = (e: any) => {
  if (e.shiftKey) {
    shiftKey.value = true
  }
}

const onKeyUp = (e: any) => {
  shiftKey.value = false
}

const setValue = (v: number, speed?: number) => {
  if (isDiff(val.value, val)) {
    val.value = limitValue(v)
    syncValue()
  }
  nextTick(() => setPosition(speed))
}

const getPos = (e: any) => {
  realTime.value && getStaticData()
  return e.clientX - offset.value
}

const wrapClick = (e: any) => {
  if (props.disabled || (props.readonly && e.target === elem.value)) return false
  let pos = getPos(e)
  setTransitionTime(props.speed)

  setValueOnPos(pos, true)
  setTimeout(() => {
    moveStartHandler(e)
  }, 0)
}

const moveStartHandler = (e: any, index?: any) => {
  if (props.readonly) return false
  setTransitionTime(0)

  dragging.value = true
  emit('dragStart')
}

const movingHandler = (e: any) => {
  if (!dragging.value || props.readonly) return false
  e.preventDefault()
  if (e.targetTouches && e.targetTouches[0]) e = e.targetTouches[0]
  setValueOnPos(getPos(e), true)
}

const moveEndHandler = (e: any) => {
  if (!dragging.value || props.readonly) return false
  dragging.value = false
  emit('dragEnd')

  if (props.lazy) {
    if (isDiff(val.value, props.modelValue)) {
      syncValue()
    }
    emit('updateEnd', val.value)
  }

  setTransitionTime(props.speed)
  setValueOnPos(getPos(e), true)
  setPosition()
}

const touchEndHandler = (e: any) => {
  if (!dragging.value || props.readonly) return false
  dragging.value = false
  emit('dragEnd')

  if (props.lazy) {
    if (isDiff(val.value, props.modelValue)) {
      syncValue()
    }
    emit('updateEnd', val.value)
  }

  dragging.value = false
  setTransitionTime(0)
}

const convertPercentageToValue = (value: any, min: number, max: number) => {
  if (typeof value === 'string' && value.endsWith('%')) {
    const ratio = parseFloat(value) / 100.0
    return min + (max-min) * ratio
  }
  return value
}

const snapValue = (value: any) => {
  if (!props.snap || shiftKey.value) {
    return value
  }

  const snapPoints = props.snap.map(value => convertPercentageToValue(value, xminimum.value, xmaximum.value))
  snapPoints.sort((a, b) => a - b)

  const threshold = (xmaximum.value - xminimum.value) * props.snapThreshold
  let minDistance = Math.abs(value - snapPoints[0])
  let snappedValue = snapPoints[0]

  for (let i = 1; i < snapPoints.length; i++) {
    let distance = Math.abs(value - snapPoints[i])
    if (distance < threshold) {
      // minDistance = distance
      return snappedValue = snapPoints[i]
    }
  }

  return value
}

const setValueOnPos = (pos: number, isDrag: boolean) => {
  let range = limit.value
  let valueRange = valueLimit.value

  if (pos >= range[0] && pos <= range[1]) {
    if (!props.snap || props.snap.length<=0 || shiftKey.value) setTransform(pos)
    let v = (Math.round(pos / gap.value) * (spacing.value * multiple.value) + xminimum.value * multiple.value) / multiple.value
    setCurrentValue(snapValue(v))
  } else if (pos < range[0]) {
    setTransform(range[0])
    setCurrentValue(valueRange[0])
    if (currentSlider.value === 1) currentSlider.value = 0
  } else {
    setTransform(range[1])
    setCurrentValue(valueRange[1])
    if (currentSlider.value === 0) currentSlider.value = 1
  }
}

const setCurrentValue = (val: number) => {
  if (val < xminimum.value || val > xmaximum.value) return false
  if (!isDiff(currentValue.value, val)) return false

  currentValue.value = val
  syncValue()

  if (dragging.value) {
    setPosition()
  } else {
    setPosition(props.speed)
  }
}

const setPosition = (speed?: number) => {
  if (speed) {
    setTransitionTime(speed)
  } else {
    setTransitionTime(0)
  }
  setTransform(position.value)
}

const valueToPosition = (val: any) => {
  const v = parseFloat(val)
  return ((v - xminimum.value) / spacing.value) * gap.value
}

const setProcess = (pos: number) => {
  const v = val.value
  const minValue =  Math.min(props.zeroPoint, v)
  const maxValue = Math.max(props.zeroPoint, v)

  let px = xminimum.value >= props.zeroPoint ? 0 : valueToPosition(minValue)
  let pw = xminimum.value >= props.zeroPoint ? pos : (valueToPosition(maxValue) - px)

  process.value.style.left = `${px}px`
  process.value.style.width = `${pw}px`
}

const setTransform = (pos: number) => {
  if (!slider.value) return

  const tx = pos - (slider.value.scrollWidth - 2) / 2
  const translateValue = `translateX(${tx}px)`

  slider.value.style.transform = translateValue
  slider.value.style.WebkitTransform = translateValue
  slider.value.style.msTransform = translateValue

  knob.value.style['left'] = `${pos}px`
  setProcess(pos)
}

const setTransitionTime = (time: any) => {
  if (!slider.value) return
  slider.value.style.transitionDuration = `${time}ms`
  slider.value.style.WebkitTransitionDuration = `${time}ms`
  process.value.style.transitionDuration = `${time}ms`
  process.value.style.WebkitTransitionDuration = `${time}ms`
  knob.value.style.transitionDuration = `${time}ms`
  knob.value.style.WebkitTransitionDuration = `${time}ms`
}

const limitValue = (v: number) => {
  if (props.interval && props.interval>0) {
    const s = props.interval
    v = Math.round(v/s) * s
  }

  if (props.data) {
    return v
  }
  const inRange = (v: number) => {
    if (v < props.min) {
      printError(
        `[warn] in slider${props.name?' '+props.name:''}:`,
        `value is ${v} while the minimum value is ${props.min}.`
      )
      return props.min
    } else if (v > props.max) {
      printError(
        `[warn] in slider${props.name?' '+props.name:''}:`,
        `value ${v} while the maximum value is ${props.max}.`
      )
      return props.max
    }
    return v
  }
  return inRange(v)
}

const syncValue = () => {
  let v = val.value
  if (props.range) {
    emit('callbackRange', props.range[currentIndex.value])
  }

  if (isDiff(v, props.modelValue)) {
    emit('update:modelValue', v)
    emit('change', v)
  }
}

const getValue = () => {
  return val.value
}

const getIndex = () => {
  return currentIndex.value
}

const getStaticData = () => {
  if (elem.value) {
    size.value = elem.value.offsetWidth
    offset.value = elem.value.getBoundingClientRect().left
  }
}

const refresh = () => {
  if (elem.value) {
    getStaticData()
    setPosition()
  }
}

const formatedVal = computed(() => {
  return typeof props.tooltipFormatter === 'function'
    ? props.tooltipFormatter(val.value)
    : val.value
})
</script>

<style scoped>
.TWSlider {
  position: relative;
  box-sizing: border-box;
  user-select: none;
}
.twsld::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
.twsld-process {
  transition: all 0s;
  width: 0;
  will-change: width;
}

.twsld-knob {
  width: 1.30rem;
  height: 1.30rem;
  transform: translate(-0.75rem, -0.30rem);
}

.twsld-tooltip-container {
  position: absolute;
  transition: all 0s;
  will-change: transform;
  cursor: pointer;
  z-index: 10;
  left: 0px;
  top: -30px;
}

.twsld-tooltip-wrap {
  /* display: none; */
  position: absolute;
  z-index: 20;
  width: 100%;
  height: 100%;
  display: block !important;
}
.twsld-tooltip-top {
  top: -15px;
  left: 40%;
  transform: translate(-50%, -100%);
}

.twsld-tooltip {
  padding: 8px 12px;
  white-space: nowrap;
  min-width: 20px;
}
.twsld-tooltip::before {
  content: '';
  position: absolute;
  bottom: -11px;
  left: 50%;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-top-color: inherit;
  transform: translate(-50%, 0);
}

.twsld-separate {
  position: absolute;
  width: 2px;
  height: 4px;
  z-index: 5;
  top: -14px;
  cursor: pointer;
}
.twsld-separate:first-child,
.twsld-separate:last-child {
  background-color: transparent;
}

.twsld-separate-text {
  text-align: center;
  position: absolute;
  white-space: nowrap;
  transform: translate(-50%, 0);
  top: 8px;
}


.TWSlider .twsld {
  @apply bg-teal-300/25 dark:bg-teal-800/20;
}
.TWSlider .twsld-tooltip {
  @apply border-teal-600 bg-teal-600;
}
.TWSlider .twsld-process {
  @apply bg-teal-600;
}
.TWSlider .twsld-knob {
  @apply dark:bg-teal-100 border-teal-500;
}
.TWSlider .twsld-snap {
  @apply bg-teal-600/50 dark:bg-teal-400/40
}

.TWSlider.pink .twsld {
  @apply bg-pink-200/20 dark:bg-pink-800/20;
}
.TWSlider.pink .twsld-tooltip {
  @apply border-pink-600 bg-pink-500;
}
.TWSlider.pink .twsld-process {
  @apply bg-pink-500;
}
.TWSlider.pink .twsld-knob {
  @apply dark:bg-pink-100 border-pink-500;
}
.TWSlider.pink .twsld-snap {
  @apply bg-pink-500/30 dark:bg-pink-300/40
}

.TWSlider.green .twsld {
  @apply bg-green-300/30 dark:bg-green-800/25;
}
.TWSlider.green .twsld-tooltip {
  @apply border-green-700 bg-green-600;
}
.TWSlider.green .twsld-process {
  @apply bg-green-500;
}
.TWSlider.green .twsld-knob {
  @apply bg-green-300 border-green-500;
}
.TWSlider.green .twsld-snap {
  @apply bg-green-500/30 dark:bg-green-300/30
}

.TWSlider.disabled .twsld {
  @apply bg-zinc-300/30 dark:bg-zinc-800/25 cursor-not-allowed;
}
.TWSlider.disabled .twsld-tooltip {
  @apply border-zinc-700 bg-zinc-600;
}
.TWSlider.disabled .twsld-process {
  @apply bg-zinc-500;
}
.TWSlider.disabled .twsld-knob {
  @apply bg-zinc-300 border-zinc-500;
}
.TWSlider.disabled .twsld-snap {
  @apply bg-zinc-500/30 dark:bg-zinc-300/30
}

</style>