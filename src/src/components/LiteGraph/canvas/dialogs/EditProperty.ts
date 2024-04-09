import { createDialog } from "./Dialog"

export function showEditPropertyValue(canvas: any, node: any, property: any, options?: any) {
  if (!node || node.properties[property] === undefined) {
    return
  }

  options = options || {}

  const info = node.getPropertyInfo(property)
  const type = info.type

  let input_html = ''

  if (type == 'string' || type === 'number' || type == 'array' || type == 'object') {
    input_html = "<input autofocus type='text' class='value'/>"
  } else if ((type == 'enum' || type == 'combo') && info.values) {
    input_html = "<select autofocus type='text' class='value'>"
    for (var i in info.values) {
      var v = i
      if (info.values.constructor === Array) v = info.values[i]

      input_html += "<option value='" + v + "' " + (v == node.properties[property] ? 'selected' : '') + '>' + info.values[i] + '</option>'
    }
    input_html += '</select>'
  } else if (type == 'boolean' || type == 'toggle') {
    input_html = "<input autofocus type='checkbox' class='value' " + (node.properties[property] ? 'checked' : '') + '/>'
  } else {
    console.warn('unknown type: ' + type)
    return
  }

  var dialog = createDialog(canvas, "<span class='name'>" + (info.label ? info.label : property) + '</span>' + input_html + '<button>OK</button>', options)

  let input: any = false
  if ((type == 'enum' || type == 'combo') && info.values) {
    input = dialog.querySelector('select')
    input.addEventListener('change', function (e: any) {
      dialog.modified()
      setValue(e.target.value)
      //var index = e.target.value;
      //setValue( e.options[e.selectedIndex].value );
    })
  } else if (type == 'boolean' || type == 'toggle') {
    input = dialog.querySelector('input')
    if (input) {
      input.addEventListener('click', function (e: any) {
        dialog.modified()
        setValue(!!input.checked)
      })
    }
  } else {
    input = dialog.querySelector('input')
    if (input) {
      input.addEventListener('blur', function (e: any) {
        input.focus()
      })

      let v = node.properties[property] !== undefined ? node.properties[property] : ''
      if (type !== 'string') {
        v = JSON.stringify(v)
      }

      input.value = v
      input.addEventListener('keydown', function (e: any) {
        if (e.keyCode == 27) {
          //ESC
          dialog.close()
        } else if (e.keyCode == 13) {
          // ENTER
          inner() // save
        } else if (e.keyCode != 13) {
          dialog.modified()
          return
        }
        e.preventDefault()
        e.stopPropagation()
      })
    }
  }
  if (input) input.focus()

  var button = dialog.querySelector('button')
  button.addEventListener('click', inner)

  function inner() {
    setValue(input.value)
  }

  function setValue(value: any) {
    if (info && info.values && info.values.constructor === Object && info.values[value] != undefined) value = info.values[value]

    if (typeof node.properties[property] === 'number') {
      value = Number(value)
    }
    if (type == 'array' || type == 'object') {
      value = JSON.parse(value)
    }
    node.properties[property] = value
    if (node.graph) {
      node.graph._version++
    }
    if (node.onPropertyChanged) {
      node.onPropertyChanged(property, value)
    }
    if (options.onclose) options.onclose()
    dialog.close()
    node.setDirtyCanvas(true, true)
  }

  return dialog
}