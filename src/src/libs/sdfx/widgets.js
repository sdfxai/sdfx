import { sdfx } from '@/libs/sdfx/sdfx.js'
import { api } from '@/apis'
import { LiteGraph } from '@/components/LiteGraph/'
import './domWidget.js'

const widgetTypes = {
  'steps': {type:'slider', defaultValue: 20, min:1, max:150, step:1, precision:0},
  'scale_by': {type:'slider', defaultValue: 1, min:0.01, max:6.00, step:0.125, precision:3},
  'cfg': {type:'slider', defaultValue: 7.50, min:0, max:30, step:0.25, precision:2},
  'denoise': {type:'slider', defaultValue: 1.00, min:0.00, max:1.00, step:0.01, precision:2},
  'fps': {type:'slider', defaultValue: 12, min:1, max:60, step:1, precision:0},
}

const integerWidgets = [
  'steps'
]

const floatWidgets = [
  'cfg', 'denoise', 'scale_by', 'fps'
]

function isSlider(display) {
  return display === 'slider' ? 'slider' : 'number'
}

function getNumberDefaults(inputData, defaultStep, precision, enable_rounding) {
  let defaultVal = inputData[1]['default']
  let { min, max, step, round } = inputData[1]

  if (defaultVal == undefined) defaultVal = 0
  if (min === undefined) min = 0
  if (max === undefined) max = 2048
  if (step === undefined) step = defaultStep

  // precision is the number of decimal places to show.
  // by default, display the the smallest number of decimal places such that changes of size step are visible.
  if (precision === undefined) {
    precision = Math.max(-Math.floor(Math.log10(step)), 0)
  }

  if (enable_rounding && (round === undefined || round === true)) {
    // by default, round the value to those decimal places shown.
    round = Math.round(1000000*Math.pow(0.1,precision))/1000000
  }
  return { val: defaultVal, config: { min, max, step: 10.0 * step, round, precision } }
}

export function addValueControlWidget(
  node,
  targetWidget,
  defaultValue = 'randomize',
  values,
  widgetName,
  inputData,
) {
  let name = inputData[1]?.control_after_generate
  if (typeof name !== 'string') {
    name = widgetName
  }
  const widgets = addValueControlWidgets(
    node,
    targetWidget,
    defaultValue,
    {
      addFilterList: false,
      controlAfterGenerateName: name,
    },
    inputData,
  )
  return widgets[0]
}

export function addValueControlWidgets(
  node,
  targetWidget,
  defaultValue = 'randomize',
  options,
  inputData,
) {
  if (!defaultValue) defaultValue = 'randomize'
  if (!options) options = {}

  const getName = (defaultName, optionName) => {
    let name = defaultName
    if (options[optionName]) {
      name = options[optionName]
    } else if (typeof inputData?.[1]?.[defaultName] === 'string') {
      name = inputData?.[1]?.[defaultName]
    } else if (inputData?.[1]?.control_prefix) {
      name = inputData?.[1]?.control_prefix + ' ' + name
    }
    return name
  }

  const widgets = []
  const valueControl = node.addWidget(
    'combo',
    getName('control_after_generate', 'controlAfterGenerateName'),
    defaultValue,
    function () {},
    {
      values: ['fixed', 'increment', 'decrement', 'randomize'],
      serialize: false // Don't include this in prompt.
    },
  )
  widgets.push(valueControl)

  const isCombo = targetWidget.type === 'combo'
  let comboFilter
  if (isCombo && options.addFilterList !== false) {
    comboFilter = node.addWidget(
      'string',
      getName('control_filter_list', 'controlFilterListName'),
      '',
      function(){},
      {
        serialize: false, // Don't include this in prompt.
      }
    )
    widgets.push(comboFilter)
  }

  valueControl.afterQueued = () => {
    var v = valueControl.value

    if (isCombo && v !== 'fixed') {
      let values = targetWidget.options.values
      const filter = comboFilter?.value
      if (filter) {
        let check
        if (filter.startsWith('/') && filter.endsWith('/')) {
          try {
            const regex = new RegExp(filter.substring(1, filter.length - 1))
            check = (item) => regex.test(item)
          } catch (error) {
            console.error(
              'Error constructing RegExp filter for node ' + node.id,
              filter,
              error,
            )
          }
        }
        if (!check) {
          const lower = filter.toLocaleLowerCase()
          check = (item) => item.toLocaleLowerCase().includes(lower)
        }
        values = values.filter((item) => check(item))
        if (!values.length && targetWidget.options.values.length) {
          console.warn(
            'Filter for node ' + node.id + ' has filtered out all items',
            filter,
          )
        }
      }
      let current_index = values.indexOf(targetWidget.value)
      let current_length = values.length

      switch (v) {
        case 'increment':
          current_index += 1
          break
        case 'decrement':
          current_index -= 1
          break
        case 'randomize':
          current_index = Math.floor(Math.random() * current_length)
        default:
          break
      }
      current_index = Math.max(0, current_index)
      current_index = Math.min(current_length - 1, current_index)
      if (current_index >= 0) {
        let value = values[current_index]
        targetWidget.value = value
        targetWidget.callback(value)
      }
    } else {
      //number
      let min = targetWidget.options.min
      let max = targetWidget.options.max
      // limit to something that javascript can handle
      max = Math.min(1125899906842624, max)
      min = Math.max(-1125899906842624, min)
      let range = (max - min) / (targetWidget.options.step / 10)

      //adjust values based on valueControl Behaviour
      switch (v) {
        case 'fixed':
          break
        case 'increment':
          targetWidget.value += targetWidget.options.step / 10
          break
        case 'decrement':
          targetWidget.value -= targetWidget.options.step / 10
          break
        case 'randomize':
          targetWidget.value =
            Math.floor(Math.random() * range) *
              (targetWidget.options.step / 10) +
            min
        default:
          break
      }
      /*check if values are over or under their respective
       * ranges and set them to min or max.*/
      if (targetWidget.value < min) targetWidget.value = min

      if (targetWidget.value > max) targetWidget.value = max
      targetWidget.callback(targetWidget.value)
    }
  }
  return widgets
}

function seedWidget(node, inputName, inputData, app, widgetName) {
  const seed = createIntWidget(node, inputName, inputData, app, true)
  const seedControl = addValueControlWidget(
    node,
    seed.widget,
    'randomize',
    undefined,
    widgetName,
    inputData,
  )

  seed.widget.linkedWidgets = [seedControl]
  return seed
}

function createIntWidget(node, inputName, inputData, app, isSeedInput) {
  const control = inputData[1]?.control_after_generate

  if (!isSeedInput && control) {
    return seedWidget(
      node,
      inputName,
      inputData,
      app,
      typeof control === 'string' ? control : undefined,
    )
  }

  let widgetType = isSlider(inputData[1]['display'], app)
  const { val, config } = getNumberDefaults(inputData, 1, 0, true)
  Object.assign(config, { precision: 0 })

  if (integerWidgets.includes(inputName)) {
    const w = widgetTypes[inputName]
    return {
      widget: node.addWidget(
        w.type,
        inputName,
        w.defaultValue,
        function (v) {
          const s = this.options.step / 10
          this.value = Math.round(v / s) * s
        },
        {min: w.min, max: w.max, step:w.step*10, precision:w.precision}
      ),
    }
  } 

  return {
    widget: node.addWidget(
      widgetType,
      inputName,
      val,
      function (v) {
        const s = this.options.step / 10
        this.value = Math.round(v / s) * s
      },
      config,
    ),
  }
}

function addMultilineWidget(node, name, opts) {
  const inputEl = document.createElement('textarea')

  inputEl.id = `n-${name}`
  inputEl.className = 'sdfx-textarea'
  inputEl.value = opts.defaultVal
  inputEl.placeholder = opts.placeholder || ''

  const widget = node.addDOMWidget(name, 'customtext', inputEl, {
    getValue() {
      return inputEl.value
    },
    setValue(v) {
      inputEl.value = v
    },
  })

  widget.inputEl = inputEl

  widget.inputEl.addEventListener('input', (e)=>{
    widget.callback?.(widget.value)
  })

  widget.inputEl.addEventListener('blur', (e)=>{
    if (e.target) {
      sdfx.triggerWidgetUpdateEvent(node, 'text', String(e.target.value))
    }
  })

  widget.inputEl.addEventListener('keypress', (e)=>{
    if (e.target) {
      sdfx.triggerWidgetUpdateEvent(node, 'text', String(e.target.value))
    }
  })

  widget.inputEl.addEventListener('copy', (e)=>{
    if (e.target) {
      sdfx.triggerWidgetUpdateEvent(node, 'text', String(e.target.value))
    }
  })

  widget.inputEl.addEventListener('paste', (e)=>{
    if (e.target) {
      sdfx.triggerWidgetUpdateEvent(node, 'text', String(e.target.value))
    }
  })

  widget.inputEl.addEventListener('input', (e)=>{
    if (e.target) {
      sdfx.triggerWidgetUpdateEvent(node, 'text', String(e.target.value))
    }
  })

  return { minWidth: 400, minHeight: 200, widget }
}

export const ComfyWidgets = {
  'INT:seed': seedWidget,
  'INT:noise_seed': seedWidget,

  FLOAT(node, inputName, inputData) {
    if (floatWidgets.includes(inputName)) {
      const w = widgetTypes[inputName]
      return {
        widget: node.addWidget(
          w.type,
          inputName,
          w.defaultValue,
          function (v) {
            const s = this.options.step / 10
            this.value = Math.round(v/s) * s
          },
          {min: w.min, max: w.max, step:w.step*10.00, precision:w.precision}
        ),
      }
    } 

    const widgetType = inputData[1]['display'] === 'slider' ? 'slider' : 'number'
    const precision = 2
    const enable_rounding = true
    if (precision == 0) precision = undefined
    const { val, config } = getNumberDefaults(inputData, 0.5, precision, enable_rounding)

    return {
      widget: node.addWidget(
        widgetType,
        inputName,
        val,
        function (v) {
          const s = config.round

          if (s) {
            this.value = Math.round((v + Number.EPSILON)/s)*s
            if (this.value > config.max) this.value = config.max
            if (this.value < config.min) this.value = config.min
          } else {
            this.value = v
          }
        },
        config
      )
    }
  },

  INT(node, inputName, inputData) {
    return createIntWidget(node, inputName, inputData, app)
  },

  BOOLEAN(node, inputName, inputData) {
    let defaultVal = false
    let options = {}

    if (inputData[1]) {
      if (inputData[1].default) {
        defaultVal = inputData[1].default
      }

      if (inputData[1].label_on) {
        options['on'] = inputData[1].label_on
      }

      if (inputData[1].label_off) {
        options['off'] = inputData[1].label_off
      }
    }

    return {
      widget: node.addWidget(
        'toggle',
        inputName,
        defaultVal,
        () => {},
        options,
      )
    }
  },

  STRING(node, inputName, inputData) {
    const defaultVal = inputData[1].default || ''
    const multiline = !!inputData[1].multiline

    if (sdfx.canvasEl && multiline) {
      return addMultilineWidget(node, inputName, { defaultVal, ...inputData[1] })
    } else {
      return {
        widget: node.addWidget('text', inputName, defaultVal, () => {}, {})
      }
    }
  },

  COMBO(node, inputName, inputData) {
    const type = inputData[0]
    let defaultValue = type[0]
    if (inputData[1] && inputData[1].default) {
      defaultValue = inputData[1].default
    }
    const res = {
      widget: node.addWidget('combo', inputName, defaultValue, () => {}, {
        values: type,
      })
    }

    if (inputData[1]?.control_after_generate) {
      res.widget.linkedWidgets = addValueControlWidgets(
        node,
        res.widget,
        undefined,
        undefined,
        inputData,
      )
    }
    return res
  },

  IMAGEUPLOAD(node, inputName, inputData) {
    const imageWidget = node.widgets.find((w) => w.name === (inputData[1]?.widget ?? "image"))
    let uploadWidget

    var default_value = imageWidget.value

    Object.defineProperty(imageWidget, 'value', {
      set: function (value) {
        this._real_value = value
      },

      get: function () {
        let value = ''

        if (this._real_value) {
          value = this._real_value
        } else {
          return default_value
        }

        if (value.filename) {
          let real_value = value

          value = ''
          if (real_value.subfolder) {
            value = real_value.subfolder + '/'
          }

          value += real_value.filename

          if (real_value.type && real_value.type !== 'input') {
            value += ` [${real_value.type}]`
          }
        }

        return value
      },
    })

    // Add our own callback to the combo widget to render an image when it changes
    const cb = node.callback
    imageWidget.callback = function () {
      sdfx.updateNodeImage(node, imageWidget.value, 'input')
      if (cb) {
        return cb.apply(this, arguments)
      }
    }

    // On load if we have a value then render the image
    // The value isnt set immediately so we need to wait a moment
    // No change callbacks seem to be fired on initial setting of the value
    requestAnimationFrame(() => {
      if (imageWidget.value) {
        sdfx.updateNodeImage(node, imageWidget.value, 'input')
      }
    })

    const fileInput = document.createElement('input')
    Object.assign(fileInput, {
      //id: 'sdfx-file-input',
      className: `${inputName} sdfx-file-input`,
      type: 'file',
      accept: 'image/jpeg,image/png,image/webp,video/webm,video/mp4',
      style: 'display: none',
      onchange: async () => {
        if (fileInput.files.length) {
          const filename = fileInput.files[0].name
          const needUpdateNode = true
          await sdfx.uploadImage(node, filename, fileInput.files[0], needUpdateNode)
        }
      }
    })
    //sdfx.canvasEl.parentNode.append(fileInput)
    document.body.append(fileInput)

    // Create the button widget for selecting the files
    uploadWidget = node.addWidget('button', inputName, 'image', () => {
      fileInput.click()
    })
    uploadWidget.label = 'choose file to upload'
    uploadWidget.serialize = false

    // Add handler to check if an image is being dragged over our node
    node.onDragOver = function (e) {
      if (e.dataTransfer && e.dataTransfer.items) {
        const image = [...e.dataTransfer.items].find((f) => f.kind === 'file' && f.type.startsWith('image/'))
        return !!image
      }

      return false
    }

    // On drop upload files
    node.onDragDrop = function (e) {
      let handled = false
      for (const file of e.dataTransfer.files) {
        if (file.type.startsWith('image/')) {
          const needUpdateNode = !handled
          sdfx.uploadImage(node, file.name, file, needUpdateNode)
          handled = true
        }
      }

      return handled
    }

    node.pasteFile = function(file) {
      if (file.type.startsWith('image/')) {
        const isPasted = (file.name === 'image.png') && (file.lastModified - Date.now() < 2000)
        const needUpdateNode = true
        sdfx.uploadImage(node, file.name, file, needUpdateNode, isPasted)
        return true
      }
      return false
    }

    return { widget: uploadWidget }
  }
}
