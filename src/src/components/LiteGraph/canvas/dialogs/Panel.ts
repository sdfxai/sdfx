import { LCanvas, LiteGraph } from "../../LGraph"

export function createPanel(title: string, options: any) {
  options = options || {}

  const ref_window = options.window || window
  const root: any = document.createElement('div')
  root.className = 'litegraph dialog'
  root.innerHTML =
    "<div class='dialog-header'><span class='dialog-title'></span></div><div class='dialog-content'></div><div style='display:none;' class='dialog-alt-content'></div><div class='dialog-footer'></div>"
  root.header = root.querySelector('.dialog-header')

  if (options.width) root.style.width = options.width + (options.width.constructor === Number ? 'px' : '')
  if (options.height) root.style.height = options.height + (options.height.constructor === Number ? 'px' : '')
  if (options.closable) {
    const close = document.createElement('span')
    close.innerHTML = '&#10005;'
    close.classList.add('close')
    close.addEventListener('click', function () {
      root.close()
    })
    root.header.appendChild(close)
  }
  root.title_element = root.querySelector('.dialog-title')
  root.title_element.innerText = title
  root.content = root.querySelector('.dialog-content')
  root.alt_content = root.querySelector('.dialog-alt-content')
  root.footer = root.querySelector('.dialog-footer')

  root.close = function () {
    if (root.onClose && typeof root.onClose == 'function') {
      root.onClose()
    }
    if (root.parentNode) root.parentNode.removeChild(root)
    /* XXX CHECK THIS */
    if (this.parentNode) {
      this.parentNode.removeChild(this)
    }
    /* XXX this was not working, was fixed with an IF, check this */
  }

  // function to swap panel content
  root.toggleAltContent = function (force?: boolean) {
    let vTo: string
    let vAlt: string
    if (typeof force != 'undefined') {
      vTo = force ? 'block' : 'none'
      vAlt = force ? 'none' : 'block'
    } else {
      vTo = root.alt_content.style.display != 'block' ? 'block' : 'none'
      vAlt = root.alt_content.style.display != 'block' ? 'none' : 'block'
    }
    root.alt_content.style.display = vTo
    root.content.style.display = vAlt
  }

  root.toggleFooterVisibility = function (force?: boolean) {
    let vTo: string;
    if (typeof force != 'undefined') {
      vTo = force ? 'block' : 'none'
    } else {
      vTo = root.footer.style.display != 'block' ? 'block' : 'none'
    }
    root.footer.style.display = vTo
  }

  root.clear = function () {
    this.content.innerHTML = ''
  }

  root.addHTML = function (code: string, classname: string, on_footer?: boolean) {
    const elem = document.createElement('div')
    if (classname) elem.className = classname
    elem.innerHTML = code
    if (on_footer) root.footer.appendChild(elem)
    else root.content.appendChild(elem)
    return elem
  }

  root.addButton = function (name: string, callback: any, options: any) {
    const elem: any = document.createElement('button')
    elem.innerText = name
    elem.options = options
    elem.classList.add('btn')
    elem.addEventListener('click', callback)
    root.footer.appendChild(elem)
    return elem
  }

  root.addSeparator = function () {
    const elem = document.createElement('div')
    elem.className = 'separator'
    root.content.appendChild(elem)
  }

  root.addWidget = function (type: string, name: string, value: any, options?: any, callback?: any) {
    options = options || {}
    let str_value = String(value)
    type = type.toLowerCase()
    if (type === 'number') str_value = value.toFixed(3)

    const elem: any = document.createElement('div')
    elem.className = 'property'
    elem.innerHTML = "<span class='property_name'></span><span class='property_value'></span>"
    elem.querySelector('.property_name').innerText = options.label || name
    const value_element = elem.querySelector('.property_value')
    value_element.innerText = str_value
    elem.dataset['property'] = name
    elem.dataset['type'] = options.type || type
    elem.options = options
    elem.value = value

    if (type == 'code')
      elem.addEventListener('click', function (e: any) {
        root.inner_showCodePad(elem.dataset['property'])
      })
    else if (type == 'boolean') {
      elem.classList.add('boolean')
      if (value) elem.classList.add('bool-on')
      elem.addEventListener('click', function () {
        //const v = node.properties[this.dataset["property"]];
        //node.setProperty(this.dataset["property"],!v); this.innerText = v ? "true" : "false";
        const propname = elem.dataset['property']
        elem.value = !elem.value
        elem.classList.toggle('bool-on')
        elem.querySelector('.property_value').innerText = elem.value ? 'true' : 'false'
        innerChange(propname, elem.value)
      })
    } else if (type == 'string' || type === 'number') {
      value_element.setAttribute('contenteditable', true)
      value_element.addEventListener('keydown', function (e: any) {
        if (e.code == 'Enter' && (type != 'string' || !e.shiftKey)) {
          // allow for multiline
          e.preventDefault()
          value_element.blur()
        }
      })
      value_element.addEventListener('blur', function () {
        let v = value_element.innerText
        const propname = value_element.parentNode.dataset['property']
        const proptype = value_element.parentNode.dataset['type']
        if (proptype === 'number') v = Number(v)
        innerChange(propname, v)
      })
    } else if (type == 'enum' || type == 'combo') {
      const str_value = LCanvas.getPropertyPrintableValue(value, options.values)
      value_element.innerText = str_value

      value_element.addEventListener('click', function (event: any) {
        const values = options.values || []
        const propname = value_element.parentNode.dataset['property']
        const elem_that = value_element
        const menu = new LiteGraph.ContextMenu(
          values,
          {
            event: event,
            className: 'dark',
            callback: inner_clicked,
          },
          ref_window,
        )
        function inner_clicked(v: any, option: any, event: any) {
          //node.setProperty(propname,v);
          //graphcanvas.dirty_canvas = true;
          elem_that.innerText = v
          innerChange(propname, v)
          return false
        }
      })
    }

    root.content.appendChild(elem)

    function innerChange(name: string, value: any) {
      //console.log("change",name,value);
      //that.dirty_canvas = true;
      if (options.callback) options.callback(name, value, options)
      if (callback) callback(name, value, options)
    }

    return elem
  }

  if (root.onOpen && typeof root.onOpen == 'function') root.onOpen()

  return root
}

export function checkPanels(canvas: any, graph: any) {
  if (!canvas) return
  const panels = canvas.parentNode.querySelectorAll('.litegraph.dialog')
  panels.forEach((panel: any) => {
    if (panel.node) {
      if (!panel.node.graph || panel.graph != graph) panel.close()
    }
  })
}

export function closePanels() {
  var panel: any = document.querySelector('#node-panel')
  if (panel) panel.close()
  var panel: any = document.querySelector('#option-panel')
  if (panel) panel.close()
}
