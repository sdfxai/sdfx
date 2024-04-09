import { LCanvas, LiteGraph } from "../../LGraph";

// refactor: there are different dialogs, some uses createDialog some don"t
let prompt_box: any;

export function prompt(lcanvas: any, title: string, value: any, callback: any, event: any, multiline: boolean) {
  // var input_html = ''
  title = title || ''

  const dialog: any = document.createElement('div')
  dialog.is_modified = false
  dialog.className = 'graphdialog'

  if (multiline) {
    dialog.innerHTML = `<span class="name"></span> <textarea autofocus class="value"></textarea><button>OK</button>`
  } else {
    dialog.innerHTML = `<span class="name"></span> <input autofocus type="text" class="value"/><button>OK</button>`
  }

  dialog.close = function () {
    prompt_box = null
    if (dialog.parentNode) {
      dialog.parentNode.removeChild(dialog)
    }
  }

  const graphcanvas = LCanvas.active_canvas
  const canvas = graphcanvas.canvas
  canvas.parentNode.appendChild(dialog)

  if (lcanvas.ds.scale > 1.5) {
    dialog.style.transform = 'scale(' + (lcanvas.ds.scale*0.75) + ')'
  }

  let dialogCloseTimer: any = null
  let prevent_timeout: any = false

  LiteGraph.pointerListenerAdd(dialog, 'leave', function (e: any) {
    if (prevent_timeout) return
    if (LiteGraph.dialog_close_on_mouse_leave)
      if (!dialog.is_modified && LiteGraph.dialog_close_on_mouse_leave) dialogCloseTimer = setTimeout(dialog.close, LiteGraph.dialog_close_on_mouse_leave_delay) //dialog.close();
  })

  LiteGraph.pointerListenerAdd(dialog, 'enter', function (e: any) {
    if (LiteGraph.dialog_close_on_mouse_leave) if (dialogCloseTimer) clearTimeout(dialogCloseTimer)
  })

  const selInDia = dialog.querySelectorAll('select')
  if (selInDia) {
    // if filtering, check focus changed to comboboxes and prevent closing
    selInDia.forEach(function (selIn: any) {
      selIn.addEventListener('click', function (e: any) {
        prevent_timeout++
      })
      selIn.addEventListener('blur', function (e: any) {
        prevent_timeout = 0
      })
      selIn.addEventListener('change', function (e: any) {
        prevent_timeout = -1
      })
    })
  }

  if (prompt_box) {
    prompt_box.close()
  }
  prompt_box = dialog

  // let first: any = null
  // let timeout: any = null
  // let selected: any = null

  const name_element = dialog.querySelector('.name')
  name_element.innerText = title
  const value_element = dialog.querySelector('.value')
  value_element.value = value

  const input = value_element
  input.addEventListener('keydown', function (e: any) {
    dialog.is_modified = true
    if (e.keyCode == 27) {
      //ESC
      dialog.close()
    } else if (e.keyCode == 13 && e.target.localName != 'textarea') {
      if (callback) {
        // @ts-ignore
        callback(this.value)
      }
      dialog.close()
    } else {
      return
    }
    e.preventDefault()
    e.stopPropagation()
  })

  const button = dialog.querySelector('button')
  button.addEventListener('click', function (e: any) {
    if (callback) {
      callback(input.value)
    }
    lcanvas.setDirty(true)
    dialog.close()
  })

  const rect = canvas.getBoundingClientRect()
  let offsetx = -20
  let offsety = -20
  if (rect) {
    offsetx -= rect.left
    offsety -= rect.top
  }

  if (event) {
    dialog.style.left = event.clientX + offsetx + 'px'
    dialog.style.top = event.clientY + offsety + 'px'
  } else {
    dialog.style.left = canvas.width * 0.5 + offsetx + 'px'
    dialog.style.top = canvas.height * 0.5 + offsety + 'px'
  }

  setTimeout(function () {
    input.focus()
    input.select()
  }, 10)

  return dialog
}
