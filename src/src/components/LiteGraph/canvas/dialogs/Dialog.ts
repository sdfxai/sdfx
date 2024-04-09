import { LiteGraph } from '../../LiteGraph'

// TODO refactor, theer are different dialog, some uses createDialog, some dont
export function createDialog(lcanvas: any, html: string, options?: any) {
  const canvas = lcanvas.canvas

  var def_options = { checkForInput: false, closeOnLeave: true, closeOnLeave_checkModified: true }
  options = Object.assign(def_options, options || {})

  const dialog: any = document.createElement('div')
  dialog.className = 'graphdialog'
  dialog.innerHTML = html
  dialog.is_modified = false

  var rect = canvas.getBoundingClientRect()
  var offsetx = -20
  var offsety = -20
  if (rect) {
    offsetx -= rect.left
    offsety -= rect.top
  }

  if (options.position) {
    offsetx += options.position[0]
    offsety += options.position[1]
  } else if (options.event) {
    offsetx += options.event.clientX
    offsety += options.event.clientY
  } //centered
  else {
    offsetx += canvas.width * 0.5
    offsety += canvas.height * 0.5
  }

  dialog.style.left = offsetx + 'px'
  dialog.style.top = offsety + 'px'

  canvas.parentNode.appendChild(dialog)

  // acheck for input and use default behaviour: save on enter, close on esc
  if (options.checkForInput) {
    var aI = []
    var focused = false
    if ((aI = dialog.querySelectorAll('input'))) {
      aI.forEach(function (iX: any) {
        iX.addEventListener('keydown', function (e: any) {
          dialog.modified()
          if (e.keyCode == 27) {
            dialog.close()
          } else if (e.keyCode != 13) {
            return
          }
          // set value ?
          e.preventDefault()
          e.stopPropagation()
        })
        if (!focused) iX.focus()
      })
    }
  }

  dialog.modified = function () {
    dialog.is_modified = true
  }
  dialog.close = function () {
    if (dialog.parentNode) {
      dialog.parentNode.removeChild(dialog)
    }
  }

  let dialogCloseTimer: any = null
  let prevent_timeout: any = false
  dialog.addEventListener('mouseleave', function (e: any) {
    if (prevent_timeout) return
    if (options.closeOnLeave || LiteGraph.dialog_close_on_mouse_leave)
      if (!dialog.is_modified && LiteGraph.dialog_close_on_mouse_leave) dialogCloseTimer = setTimeout(dialog.close, LiteGraph.dialog_close_on_mouse_leave_delay) //dialog.close();
  })
  dialog.addEventListener('mouseenter', function (e: any) {
    if (options.closeOnLeave || LiteGraph.dialog_close_on_mouse_leave) if (dialogCloseTimer) clearTimeout(dialogCloseTimer)
  })
  var selInDia = dialog.querySelectorAll('select')
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

  return dialog
}
