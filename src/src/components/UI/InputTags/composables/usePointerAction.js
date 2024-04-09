import { toRefs, watch, nextTick, computed } from 'vue'

export default function usePointer(props, context, dep) {
  const filteredOptions = dep.filteredOptions
  const handleOptionClick = dep.handleOptionClick
  const search = dep.search
  const pointer = dep.pointer

  // no export
  const selectableOptions = computed(() => {
    return filteredOptions.value.filter((o) => o.disabled !== true)
  })

  const isPointed = (option) => {
    return !!pointer.value && pointer.value.value === option.value
  }

  const setPointer = (option) => {
    pointer.value = option
  }

  const setPointerFirst = () => {
    pointer.value = selectableOptions.value[0] || null
  }

  const clearPointer = () => {
    pointer.value = null
  }

  const selectPointer = () => {
    if (!pointer.value || pointer.value.disabled === true) {
      clearPointer()
      return
    }

    handleOptionClick(pointer.value)
    clearPointer()
  }

  const forwardPointer = () => {
    if (pointer.value === null) {
      setPointer(selectableOptions.value[0] || null)
    } else {
      let next = selectableOptions.value.map((o) => o.value).indexOf(pointer.value.value) + 1

      if (selectableOptions.value.length <= next) {
        next = 0
      }

      setPointer(selectableOptions.value[next] || null)
    }

    nextTick(() => {
      adjustWrapperScrollToPointer()
    })
  }

  const backwardPointer = () => {
    if (pointer.value === null) {
      setPointer(selectableOptions.value[selectableOptions.value.length - 1] || null)
    } else {
      let prevIndex = selectableOptions.value.map((o) => o.value).indexOf(pointer.value.value) - 1

      if (prevIndex < 0) {
        prevIndex = selectableOptions.value.length - 1
      }

      setPointer(selectableOptions.value[prevIndex] || null)
    }

    nextTick(() => {
      adjustWrapperScrollToPointer()
    })
  }

  // no export
  /* istanbul ignore next */
  const adjustWrapperScrollToPointer = () => {
    let pointedOption = document.getElementById(props.id).querySelector('.is-pointed')

    if (!pointedOption) {
      return
    }

    let wrapper = pointedOption.parentElement

    if (
      pointedOption.offsetTop + pointedOption.offsetHeight >
      wrapper.clientHeight + wrapper.scrollTop
    ) {
      wrapper.scrollTop =
        pointedOption.offsetTop + pointedOption.offsetHeight - wrapper.clientHeight
    }

    if (pointedOption.offsetTop < wrapper.scrollTop) {
      wrapper.scrollTop = pointedOption.offsetTop
    }
  }

  // ============== WATCHERS ==============

  watch(search, (val) => {
    setPointerFirst()
  })

  return {
    pointer,
    isPointed,
    setPointer,
    setPointerFirst,
    clearPointer,
    selectPointer,
    forwardPointer,
    backwardPointer
  }
}
