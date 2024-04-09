import { LCanvas } from "../../LGraph"
import { LiteGraph } from "../../LiteGraph"

export let search_limit = -1
export let search_box: any;

export function showSearchBox(lcanvas: any, event: any, options?: any) {
  // proposed defaults
  var def_options = {
    slot_from: null,
    node_from: null,
    node_to: null,
    do_type_filter: LiteGraph.search_filter_enabled, // TODO check for registered_slot_[in/out]_types not empty // this will be checked for functionality enabled : filter on slot type, in and out
    type_filter_in: false, // these are default: pass to set initially set values
    type_filter_out: false,
    show_general_if_none_on_typefilter: true,
    show_general_after_typefiltered: true,
    hide_on_mouse_leave: LiteGraph.search_hide_on_mouse_leave,
    show_all_if_empty: true,
    show_all_on_open: LiteGraph.search_show_all_on_open,
  }
  options = Object.assign(def_options, options || {})

  //console.log(options);

  var input_html = ''
  var graphcanvas = LCanvas.active_canvas
  var canvas = graphcanvas.canvas
  var root_document = canvas.ownerDocument || document

  var dialog: any = document.createElement('div')
  dialog.className = 'litegraph litesearchbox graphdialog'
  dialog.innerHTML = `<span class="name">Search</span> <input autofocus type="text" class="value"/>`
  if (options.do_type_filter) {
    dialog.innerHTML += `<select class="slot_in_type_filter"><option value=""></option></select>`
    dialog.innerHTML += `<select class="slot_out_type_filter"><option value=""></option></select>`
  }
  dialog.innerHTML += "<div class='helper'></div>"

  if (root_document.fullscreenElement) root_document.fullscreenElement.appendChild(dialog)
  else {
    root_document.body.appendChild(dialog)
    root_document.body.style.overflow = 'hidden'
  }
  // dialog element has been appended

  if (options.do_type_filter) {
    var selIn = dialog.querySelector('.slot_in_type_filter')
    var selOut = dialog.querySelector('.slot_out_type_filter')
  }

  dialog.close = function () {
    search_box = null
    this.blur()
    canvas.focus()
    root_document.body.style.overflow = ''

    setTimeout(function () {
      lcanvas.canvas.focus()
    }, 20) //important, if canvas loses focus keys wont be captured
    if (dialog.parentNode) {
      dialog.parentNode.removeChild(dialog)
    }
  }

  /*
  if (lcanvas.ds.scale>1.0) {
    dialog.style.transform = 'scale(' + lcanvas.ds.scale + ')'
  }
  */

  // hide on mouse leave
  if (options.hide_on_mouse_leave) {
    let prevent_timeout: any = false
    let timeout_close: any = null
    LiteGraph.pointerListenerAdd(dialog, 'enter', function (e: any) {
      if (timeout_close) {
        clearTimeout(timeout_close)
        timeout_close = null
      }
    })
    LiteGraph.pointerListenerAdd(dialog, 'leave', function (e: any) {
      if (prevent_timeout) {
        return
      }
      timeout_close = setTimeout(function () {
        dialog.close()
      }, 500)
    })
    // if filtering, check focus changed to comboboxes and prevent closing
    if (options.do_type_filter) {
      selIn.addEventListener('click', function (e: any) {
        prevent_timeout++
      })
      selIn.addEventListener('blur', function (e: any) {
        prevent_timeout = 0
      })
      selIn.addEventListener('change', function (e: any) {
        prevent_timeout = -1
      })
      selOut.addEventListener('click', function (e: any) {
        prevent_timeout++
      })
      selOut.addEventListener('blur', function (e: any) {
        prevent_timeout = 0
      })
      selOut.addEventListener('change', function (e: any) {
        prevent_timeout = -1
      })
    }
  }

  if (search_box) {
    search_box.close()
  }
  search_box = dialog

  var helper = dialog.querySelector('.helper')

  var first: any = null
  var timeout: any = null
  var selected: any = null

  var input = dialog.querySelector('input')
  if (input) {
    input.addEventListener('blur', function (e: any) {
      // @ts-ignore
      this.focus()
    })
    input.addEventListener('keydown', function (e: any) {
      if (e.keyCode == 38) {
        //UP
        changeSelection(false)
      } else if (e.keyCode == 40) {
        //DOWN
        changeSelection(true)
      } else if (e.keyCode == 27) {
        //ESC
        dialog.close()
      } else if (e.keyCode == 13) {
        if (selected) {
          select(selected.innerHTML)
        } else if (first) {
          select(first)
        } else {
          dialog.close()
        }
      } else {
        if (timeout) {
          clearInterval(timeout)
        }
        timeout = setTimeout(refreshHelper, 10)
        return
      }
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
      return true
    })
  }

  // if should filter on type, load and fill selected and choose elements if passed
  if (options.do_type_filter) {
    if (selIn) {
      var aSlots = LiteGraph.slot_types_in
      var nSlots = aSlots.length // this for object :: Object.keys(aSlots).length;

      if (options.type_filter_in == LiteGraph.EVENT || options.type_filter_in == LiteGraph.ACTION) options.type_filter_in = '_event_'
      /* this will filter on * .. but better do it manually in case
      else if(options.type_filter_in === "" || options.type_filter_in === 0)
        options.type_filter_in = "*";*/

      for (var iK = 0; iK < nSlots; iK++) {
        var opt = document.createElement('option')
        opt.value = aSlots[iK]
        opt.innerHTML = aSlots[iK]
        selIn.appendChild(opt)
        if (options.type_filter_in !== false && (options.type_filter_in + '').toLowerCase() == (aSlots[iK] + '').toLowerCase()) {
          //selIn.selectedIndex ..
          opt.selected = true
          //console.log("comparing IN "+options.type_filter_in+" :: "+aSlots[iK]);
        } else {
          //console.log("comparing OUT "+options.type_filter_in+" :: "+aSlots[iK]);
        }
      }
      selIn.addEventListener('change', function () {
        refreshHelper()
      })
    }
    if (selOut) {
      var aSlots = LiteGraph.slot_types_out.filter((item: any) => typeof item === 'string')
      var nSlots = aSlots.length // this for object :: Object.keys(aSlots).length;

      if (options.type_filter_out == LiteGraph.EVENT || options.type_filter_out == LiteGraph.ACTION) options.type_filter_out = '_event_'
      /* this will filter on * .. but better do it manually in case
      else if(options.type_filter_out === "" || options.type_filter_out === 0)
        options.type_filter_out = "*";*/

      for (var iK = 0; iK < nSlots; iK++) {
        var opt = document.createElement('option')
        opt.value = aSlots[iK]
        opt.innerHTML = aSlots[iK]
        selOut.appendChild(opt)
        if (options.type_filter_out !== false && (options.type_filter_out + '').toLowerCase() == (aSlots[iK] + '').toLowerCase()) {
          //selOut.selectedIndex ..
          opt.selected = true
        }
      }
      selOut.addEventListener('change', function () {
        refreshHelper()
      })
    }
  }

  //compute best position
  var rect = canvas.getBoundingClientRect()

  var left = (event ? event.clientX : rect.left + rect.width * 0.5) - 80
  var top = (event ? event.clientY : rect.top + rect.height * 0.5) - 20
  dialog.style.left = left + 'px'
  dialog.style.top = top + 'px'

  //To avoid out of screen problems
  if (event.layerY > rect.height - 200) helper.style.maxHeight = rect.height - event.layerY - 20 + 'px'

  /*
  var offsetx = -20;
  var offsety = -20;
  if (rect) {
    offsetx -= rect.left;
    offsety -= rect.top;
  }

  if (event) {
    dialog.style.left = event.clientX + offsetx + "px";
    dialog.style.top = event.clientY + offsety + "px";
  } else {
    dialog.style.left = canvas.width * 0.5 + offsetx + "px";
    dialog.style.top = canvas.height * 0.5 + offsety + "px";
  }
  canvas.parentNode.appendChild(dialog);
  */

  input.focus()
  if (options.show_all_on_open) refreshHelper()

  function select(name: string) {
    if (name) {
      if (lcanvas.onSearchBoxSelection) {
        lcanvas.onSearchBoxSelection(name, event, graphcanvas)
      } else {
        var extra = LiteGraph.searchbox_extras[name.toLowerCase()]
        if (extra) {
          name = extra.type
        }

        graphcanvas.graph.beforeChange()
        var node = LiteGraph.createNode(name)
        if (node) {
          node.pos = graphcanvas.convertEventToCanvasOffset(event)
          graphcanvas.graph.add(node, false)
        }

        if (extra && extra.data) {
          if (extra.data.properties) {
            for (var i in extra.data.properties) {
              node.addProperty(i, extra.data.properties[i])
            }
          }
          if (extra.data.inputs) {
            node.inputs = []
            for (var i in extra.data.inputs) {
              node.addOutput(extra.data.inputs[i][0], extra.data.inputs[i][1])
            }
          }
          if (extra.data.outputs) {
            node.outputs = []
            for (var i in extra.data.outputs) {
              node.addOutput(extra.data.outputs[i][0], extra.data.outputs[i][1])
            }
          }
          if (extra.data.title) {
            node.title = extra.data.title
          }
          if (extra.data.json) {
            node.configure(extra.data.json)
          }
        }

        // join node after inserting
        if (options.node_from) {
          let iS: any = false
          switch (typeof options.slot_from) {
            case 'string':
              iS = options.node_from.findOutputSlot(options.slot_from)
              break
            case 'object':
              if (options.slot_from.name) {
                iS = options.node_from.findOutputSlot(options.slot_from.name)
              } else {
                iS = -1
              }
              if (iS == -1 && typeof options.slot_from.slot_index !== 'undefined') iS = options.slot_from.slot_index
              break
            case 'number':
              iS = options.slot_from
              break
            default:
              iS = 0 // try with first if no name set
          }
          if (typeof options.node_from.outputs[iS] !== undefined) {
            if (iS !== false && iS > -1) {
              options.node_from.connectByType(iS, node, options.node_from.outputs[iS].type)
            }
          } else {
            // console.warn("cant find slot " + options.slot_from);
          }
        }
        if (options.node_to) {
          let iS: any = false
          switch (typeof options.slot_from) {
            case 'string':
              iS = options.node_to.findInputSlot(options.slot_from)
              break
            case 'object':
              if (options.slot_from.name) {
                iS = options.node_to.findInputSlot(options.slot_from.name)
              } else {
                iS = -1
              }
              if (iS == -1 && typeof options.slot_from.slot_index !== 'undefined') iS = options.slot_from.slot_index
              break
            case 'number':
              iS = options.slot_from
              break
            default:
              iS = 0 // try with first if no name set
          }
          if (typeof options.node_to.inputs[iS] !== undefined) {
            if (iS !== false && iS > -1) {
              // try connection
              options.node_to.connectByTypeOutput(iS, node, options.node_to.inputs[iS].type)
            }
          } else {
            // console.warn("cant find slot_nodeTO " + options.slot_from);
          }
        }

        graphcanvas.graph.afterChange()
      }
    }

    dialog.close()
  }

  function changeSelection(forward: boolean) {
    var prev = selected
    if (selected) {
      selected.classList.remove('selected')
    }
    if (!selected) {
      selected = forward ? helper.childNodes[0] : helper.childNodes[helper.childNodes.length]
    } else {
      selected = forward ? selected.nextSibling : selected.previousSibling
      if (!selected) {
        selected = prev
      }
    }
    if (!selected) {
      return
    }
    selected.classList.add('selected')
    selected.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }

  function refreshHelper() {
    timeout = null
    var str = input.value
    first = null
    helper.innerHTML = ''
    if (!str && !options.show_all_if_empty) {
      return
    }

    if (lcanvas.onSearchBox) {
      var list = lcanvas.onSearchBox(helper, str, graphcanvas)
      if (list) {
        for (var i = 0; i < list.length; ++i) {
          addResult(list[i])
        }
      }
    } else {
      let c = 0
      str = str.toLowerCase()
      let filter = graphcanvas.filter || graphcanvas.graph.filter
      let sIn: any, sOut: any
      // filter by type preprocess
      if (options.do_type_filter && search_box) {
        sIn = search_box.querySelector('.slot_in_type_filter')
        sOut = search_box.querySelector('.slot_out_type_filter')
      } else {
        sIn = false
        sOut = false
      }

      //extras
      for (const i in LiteGraph.searchbox_extras) {
        let extra = LiteGraph.searchbox_extras[i]
        if ((!options.show_all_if_empty || str) && extra.desc.toLowerCase().indexOf(str) === -1) {
          continue
        }
        var ctor = LiteGraph.registered_node_types[extra.type]
        if (ctor && ctor.filter != filter) continue
        if (!inner_test_filter(extra.type)) continue
        addResult(extra.desc, 'searchbox_extra')
        if (LCanvas.search_limit !== -1 && c++ > LCanvas.search_limit) {
          break
        }
      }

      let filtered = null
      
      // @ts-ignore
      if (Array.prototype.filter) {
        //filter supported
        const keys = Object.keys(LiteGraph.registered_node_types) //types
        filtered = keys.filter(inner_test_filter)
      } else {
        filtered = []
        for (const i in LiteGraph.registered_node_types) {
          if (inner_test_filter(i)) filtered.push(i)
        }
      }

      for (let i = 0; i < filtered.length; i++) {
        addResult(filtered[i])
        if (LCanvas.search_limit !== -1 && c++ > LCanvas.search_limit) {
          break
        }
      }

      // add general type if filtering
      if (options.show_general_after_typefiltered && (sIn.value || sOut.value)) {
        let filtered_extra = []
        for (const i in LiteGraph.registered_node_types) {
          if (inner_test_filter(i, { inTypeOverride: sIn && sIn.value ? '*' : false, outTypeOverride: sOut && sOut.value ? '*' : false })) filtered_extra.push(i)
        }
        for (let i = 0; i < filtered_extra.length; i++) {
          addResult(filtered_extra[i], 'generic_type')
          if (LCanvas.search_limit !== -1 && c++ > LCanvas.search_limit) {
            break
          }
        }
      }

      // check il filtering gave no results
      if ((sIn.value || sOut.value) && helper.childNodes.length === 0 && options.show_general_if_none_on_typefilter) {
        let filtered_extra = []
        for (const i in LiteGraph.registered_node_types) {
          if (inner_test_filter(i, { skipFilter: true })) filtered_extra.push(i)
        }
        for (let i = 0; i < filtered_extra.length; i++) {
          addResult(filtered_extra[i], 'not_in_filter')
          if (LCanvas.search_limit !== -1 && c++ > LCanvas.search_limit) {
            break
          }
        }
      }

      function inner_test_filter(type: string, optsIn: any = {}) {
        var optsDef = { skipFilter: false, inTypeOverride: false, outTypeOverride: false }
        var opts = Object.assign(optsDef, optsIn)
        var ctor = LiteGraph.registered_node_types[type]
        if (filter && ctor.filter != filter) return false
        if ((!options.show_all_if_empty || str) && type.toLowerCase().indexOf(str) === -1) return false

        // filter by slot IN, OUT types
        if (options.do_type_filter && !opts.skipFilter) {
          var sType = type

          var sV = sIn.value
          if (opts.inTypeOverride !== false) sV = opts.inTypeOverride
          //if (sV.toLowerCase() == "_event_") sV = LiteGraph.EVENT; // -1

          if (sIn && sV) {
            //console.log("will check filter against "+sV);
            if (LiteGraph.registered_slot_in_types[sV] && LiteGraph.registered_slot_in_types[sV].nodes) {
              // type is stored
              //console.debug("check "+sType+" in "+LiteGraph.registered_slot_in_types[sV].nodes);
              var doesInc = LiteGraph.registered_slot_in_types[sV].nodes.includes(sType)
              if (doesInc !== false) {
                //console.log(sType+" HAS "+sV);
              } else {
                /*console.debug(LiteGraph.registered_slot_in_types[sV]);
                console.log(+" DONT includes "+type);*/
                return false
              }
            }
          }

          var sV = sOut.value
          if (opts.outTypeOverride !== false) sV = opts.outTypeOverride
          //if (sV.toLowerCase() == "_event_") sV = LiteGraph.EVENT; // -1

          if (sOut && sV) {
            //console.log("search will check filter against "+sV);
            if (LiteGraph.registered_slot_out_types[sV] && LiteGraph.registered_slot_out_types[sV].nodes) {
              // type is stored
              //console.debug("check "+sType+" in "+LiteGraph.registered_slot_out_types[sV].nodes);
              var doesInc = LiteGraph.registered_slot_out_types[sV].nodes.includes(sType)
              if (doesInc !== false) {
                //console.log(sType+" HAS "+sV);
              } else {
                /*console.debug(LiteGraph.registered_slot_out_types[sV]);
                console.log(+" DONT includes "+type);*/
                return false
              }
            }
          }
        }
        return true
      }
    }

    function addResult(type: string, className?: string) {
      var help = document.createElement('div')
      if (!first) {
        first = type
      }
      help.innerText = type
      help.dataset['type'] = escape(type)
      help.className = 'litegraph lite-search-item'
      if (className) {
        help.className += ' ' + className
      }
      help.addEventListener('click', function (e) {
        select(unescape(this.dataset['type']!))
      })
      helper.appendChild(help)
    }
  }

  return dialog
}
