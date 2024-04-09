<template>
  <div class="inputdrag text-xs flex items-center justify-between space-x-2">
    <label v-if="label" class="noselect w-1/2 block text-xs font-semibold leading-5 text-zinc-700 uppercase truncate">{{ label }}</label>
    <div
      class="w-full overflow-hidden relative rounded-md shadow-sm border border-zinc-300 dark:border-zinc-700/80 focus:placeholder-zinc-400 focus:outline-none focus:ring-teal-600 focus:border-teal-400 transition duration-150 ease-in-out"
      :class="{
        'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-pink-600 cursor-not-allowed':disabled,
        'bg-white text-zinc-700 dark:text-zinc-200 dark:bg-zinc-950/60':!disabled
      }"    
      @mouseover="onMouseoverHandler" 
      @mouseout="onMouseoutHandler"
    >
      <input
        ref="inpt"
        type="text"
        :value="formatedValue"
        @input="updateValue"
        @mouseup="onMouseupHandler"
        @mousedown="onMousedownHandler"
        @keydown="filterInput"
        @focus="focusInput"
        @blur="blurInput"
        :step="interval"
        :disabled="disabled"
        class="spin w-full p-0 bg-transparent border-0 text-right font-mono px-3 py-2 placeholder-zinc-600 dark:placeholder-zinc-700 text-sm leading-5"
      />

      <div v-show="isDragging" class="absolute inset-0 noselect pointer-events-none z-20 rounded-md text-right font-mono appearance-none w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-900 text-sm leading-5 flex items-center justify-end">
        <div class="absolute left-2 top-0 text-zinc-500 h-full flex items-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
          </svg>
        </div>

        {{ formatedValue }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, watch, reactive, toRefs, onMounted, onBeforeUnmount } from 'vue'

export default {
  props: {
    modelValue:   { type: [Number, String], required: false, default:0 },
    label:        { type: String, required: false, default:null },
    disabled:     { type: Boolean, required: false, default:false },
    interval:     { type: Number, required: false, default:0.00001 },
    shiftInterval:{ type: Number, required: false, default:0.00100 },
    min:          { type: Number, required: false, default:0 },
    max:          { type: Number, required: false, default:Infinity },
    precision:    { type: Number, required: false, default:6 }
  },

  setup (props, { emit }) {
    let cx = 0
    let cy = 0

    const inpt = ref(null)

    const state = reactive({
      inp: null,
      isFocus: false,
      isDragging: false,
      hover: false,
      isMousedown: false,
      scale: props.interval,
      dx: 0,
      dy: 0,
      formatedValue: Number(props.modelValue).toFixed(props.precision)
    })

    onMounted(()=>{
      document.addEventListener('keydown', onDocumentKeydownHandler)
      document.addEventListener('keyup', onDocumentKeyupHandler)
      document.addEventListener('mouseup', onDocumentMouseupHandler)
      document.addEventListener('mousemove', onDocumentMousemoveHandler)
    })

    onBeforeUnmount(()=>{
      document.removeEventListener('keydown', onDocumentKeydownHandler)
      document.removeEventListener('keyup', onDocumentKeyupHandler)
      document.removeEventListener('mouseup', onDocumentMouseupHandler)
      document.removeEventListener('mousemove', onDocumentMousemoveHandler)
    })

    const filterInput = (evt: any) => {
      const e = evt || window.event
      const key = e.keyCode || e.which

      if (key===13 || key===27) {
        formatInput()
        return true
      }

      if ((e.metaKey || e.ctrlKey) && (key===65 || key===67 || key===86 || key===88 ) || key===35 || key===36) return true

      if (!e.shiftKey && !e.altKey && !e.ctrlKey &&
        // numbers and point  
        key >= 48 && key <= 57 || key === 110 ||
        // Numeric keypad
        key >= 96 && key <= 105 ||
        // Minus, Backspace, Tab and Enter
        key == 109 || key == 8 || key == 9 || key == 13 ||
        // Home and End
        key == 33 || key == 34 || key == 35 || key == 36 ||
        // left and right arrows
        key == 37 || key == 39 ||
        // Del and Ins
        key == 46 || key == 45) {
      } else {
        // input is INVALID
        e.returnValue = false
        if (e.preventDefault) e.preventDefault()
      }
    }

    const onDocumentKeydownHandler = (evt: any) => {
      const e = evt || window.event
      const key = e.keyCode || e.which

      if (e.shiftKey) {
        state.scale = props.shiftInterval
      }
    }

    const onDocumentKeyupHandler = (evt: any) => {
      state.scale = props.interval
    }

    const setRange = (value: number) => {
      return Math.min(Math.max(value, props.min), props.max)
    }

    const updateValue = (ev: any) => {
      const value = ev.target.value
      state.formatedValue = value.replace(/,/, '.')
      emit('update:modelValue', Number(state.formatedValue))
      emit('change', Number(state.formatedValue))
    }

    const blurInput = () => {
      state.isFocus = false
      formatInput()
    }

    const focusInput = () => {
      state.isFocus = true
    }

    const formatInput = () => {
      if (isNaN(+state.formatedValue)) state.formatedValue = '0'

      const value = setRange(Number(state.formatedValue))
      state.formatedValue = Number(value).toFixed(props.precision)
    }

    const onDocumentMouseupHandler = (e: any)=>{
      if (state.isDragging) onMouseupHandler(e)
    }

    const onDocumentMousemoveHandler = (e: any)=>{
      if (!state.isMousedown) return
      state.isDragging = true
      state.dx = e.clientX - cx
      state.dy = (e.clientY - cy) * 1

      const value = setRange(Number(state.formatedValue) + state.dy*state.scale)
      state.formatedValue = value.toFixed(props.precision)

      emit('update:modelValue', value)
      emit('change', value)

      cx = e.clientX
      cy = e.clientY
    }

    const onMouseoverHandler = (e: any) => {
      state.hover = true
    }

    const onMouseoutHandler = (e: any) => {
      state.hover = false
    }

    const onMousedownHandler = (e: any) => {
      emit('update:modelValue', state.formatedValue)
      emit('change', state.formatedValue)
      state.isMousedown = true
      cx = e.clientX
      cy = e.clientY
    }

    const onMouseupHandler = (e: any) => {
      state.isMousedown = false
      state.isDragging = false
      state.dx = 0
      state.dy = 0
    }

    watch(() => props.modelValue, (value)=>{
      state.formatedValue = Number(value).toFixed(props.precision)
    })

    return {
      ...toRefs(state),
      focusInput,
      blurInput,
      filterInput,
      formatInput,
      updateValue,
      onMouseoverHandler,
      onMouseoutHandler,
      onMousedownHandler,
      onMouseupHandler
    }
  }
}
</script>

<style scoped>
/* Chrome, Safari, Edge, Opera */
input.spin::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input.spin[type=number] {
  appearance: textfield;
  -moz-appearance: textfield;
}

.noselect {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
</style>