import { ref, toRefs, computed, watch } from 'vue'

const arraysEqual = (a1, a2) => {
  const a2Sorted = a2.slice().sort()

  return (
    a1.length === a2.length &&
    a1
      .slice()
      .sort()
      .every((value, index) => {
        return value === a2Sorted[index]
      })
  )
}

const isObject = (o) => {
  return Object.prototype.toString.call(o) === '[object Object]'
}

const lowerize = (str) => {
  return String(str).toLowerCase().trim()
}

export default function useOptions(props, context, dep) {
  const {
    options,
    trackBy,
    limit,
    hideSelected,
    allowCustomTags,
    tagValidator,
    showLoader,
    minChars,
    clearOnSelect,
    canDeselect,
    max
  } = toRefs(props)

  const { iv, ev, search, blurSearch, clearSearch, update, blurInput, pointer } = dep

  const ap = ref([]) // appendedOptions
  const ro = ref([]) // resolvedOptions
  const resolving = ref(false)

  // no export
  const extendedOptions = computed(() => {
    let eo = ro.value || []

    // Transforming an object to an array of objects
    if (isObject(eo)) {
      eo = Object.keys(eo).map((key) => {
        let val = eo[key]

        return {
          value: key,
          [trackBy.value]: val
        }
      })
    }

    // Transforming an plain arrays to an array of objects
    eo = eo.map((val, key) => {
      return typeof val === 'object' ? val : { value: val, [trackBy.value]: val }
    })

    if (ap.value.length) {
      eo = eo.concat(ap.value)
    }

    return eo
  })

  const filteredOptions = computed(() => {
    let fo = extendedOptions.value

    if (createdTag.value.length) {
      fo = createdTag.value.concat(fo)
    }

    if (search.value) {
      fo = fo.filter((option) => {
        return lowerize(option[trackBy.value]).indexOf(lowerize(search.value)) !== -1
      })
    }

    if (hideSelected.value) {
      fo = fo.filter((option) => !shouldHideOption(option))
    }

    if (limit.value > 0) {
      fo = fo.slice(0, limit.value)
    }

    if (!search.value) {
      fo = []
    }

    return fo
  })

  const hasSelected = computed(() => {
    return iv.value && iv.value.length > 0
  })

  const noOptions = computed(() => {
    return extendedOptions.value.length <= 0 && !resolving.value
  })

  const noResults = computed(() => {
    return extendedOptions.value.length > 0 && filteredOptions.value.length === 0
  })

  // no export
  const createdTag = computed(() => {
    if (allowCustomTags.value === false || !search.value) {
      return []
    }

    return getOptionByTrackBy(search.value) !== -1
      ? []
      : [
          {
            value: search.value,
            [trackBy.value]: search.value
          }
        ]
  })

  // no export
  const nullValue = computed(() => [])

  const busy = computed(() => {
    return resolving.value
  })

  const select = (option) => {
    if (typeof option !== 'object') {
      option = getOption(option)
    }

    update(iv.value.concat(option))
    context.emit('select', option, option)
  }

  const deselect = (option) => {
    if (typeof option !== 'object') {
      option = getOption(option)
    }

    update(iv.value.filter((val) => val.value !== option.value))
    context.emit('deselect', option, option)
  }

  const remove = (option) => {
    deselect(option)
  }

  const handleTagRemove = (option, e) => {
    if (e.button !== 0) {
      e.preventDefault()
      return
    }

    remove(option)
  }

  const clear = () => {
    context.emit('clear')
    update(nullValue.value)
  }

  const isSelected = (option) => {
    return iv.value && iv.value.map((o) => o.value).indexOf(option.value) !== -1
  }

  const isDisabled = (option) => {
    return option.disabled === true
  }

  const isMax = () => {
    if (max === undefined || max.value === -1 || (!hasSelected.value && max.value > 0)) {
      return false
    }

    return iv.value.length >= max.value
  }

  const handleOptionClick = (option) => {
    if (isDisabled(option)) {
      return
    }

    if (isSelected(option)) {
      deselect(option)
      return
    }

    if (isMax()) {
      return
    }

    if (getOption(option.value) === undefined && allowCustomTags.value) {
      const newtag = option.value

      if (newtag && tagValidator.value(newtag) === true) {
        context.emit('tag', newtag)
        // ap.value.push(option)
        clearSearch()
      } else {
        return
      }
    }

    if (clearOnSelect.value) {
      clearSearch()
    }

    select(option)
  }

  const getOption = (val) => {
    const i = extendedOptions.value.map((o) => String(o.value)).indexOf(String(val))
    return extendedOptions.value[i]
  }

  // no export
  const getOptionByTrackBy = (val) => {
    return extendedOptions.value.map((o) => lowerize(o[trackBy.value])).indexOf(lowerize(val))
  }

  // no export
  const shouldHideOption = (option) => {
    return hideSelected.value && isSelected(option)
  }

  // no export
  const initInternalValue = () => {
    if (ev) {
      iv.value = ev || []
    }
  }

  // no export
  const refreshLabels = () => {
    if (!hasSelected.value) {
      return
    }

    iv.value.forEach((val, i) => {
      let newLabel = getOption(iv.value[i].value).label
      iv.value[i].label = newLabel
      ev[i].label = newLabel
    })
  }

  if (ev && !Array.isArray(ev)) {
    throw new Error('v-model must be an array')
  }

  if (!options || typeof options.value !== 'function') {
    ro.value = options.value
  }

  initInternalValue()

  const debounce = (func, delay) => {
    let inDebounce
    return function () {
      const context = this
      const args = arguments
      clearTimeout(inDebounce)
      inDebounce = setTimeout(() => func.apply(context, args), delay)
    }
  }

  const fetchList = async (query) => {
    if (query !== search.value) {
      return
    }

    resolving.value = true
    const response = await options.value(search.value)
    resolving.value = false

    if (query === search.value) {
      ro.value = response
      pointer.value = filteredOptions.value.filter((o) => o.disabled !== true)[0] || null
    }
  }

  const debFetchList = debounce(fetchList, 80)

  watch(
    search,
    (query) => {
      if (query.length < minChars.value) {
        return
      }

      if (typeof options.value === 'function') {
        debFetchList(query)
      }
    },
    { flush: 'sync' }
  )

  watch(
    ev,
    (newValue) => {
      if (!newValue) {
        iv.value = []
        return
      }

      if (
        !arraysEqual(
          newValue.map((o) => o.value),
          iv.value.map((o) => o.value)
        )
      ) {
        iv.value = newValue || []
      }
    },
    { deep: true }
  )

  if (typeof props.options !== 'function') {
    watch(options, (n, o) => {
      ro.value = props.options

      if (!Object.keys(iv.value).length) {
        initInternalValue()
      }

      refreshLabels()
    })
  }

  return {
    filteredOptions,
    hasSelected,
    extendedOptions,
    noOptions,
    noResults,
    resolving,
    busy,
    select,
    deselect,
    remove,
    clear,
    isSelected,
    isDisabled,
    isMax,
    getOption,
    handleOptionClick,
    handleTagRemove
  }
}
