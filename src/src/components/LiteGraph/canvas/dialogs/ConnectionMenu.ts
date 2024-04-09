import { LCanvas } from "../../LGraph"
import { LiteGraph } from "../../LiteGraph"
import { showSearchBox } from "./Search"

export function showConnectionMenu(lcanvas: any, optPass: any = {}) {
  // addNodeMenu for connection
  var opts = Object.assign(
    {
      nodeFrom: null, // input
      slotFrom: null, // input
      nodeTo: null, // output
      slotTo: null, // output
      e: null,
    },
    optPass,
  )

  var isFrom = opts.nodeFrom && opts.slotFrom
  var isTo = !isFrom && opts.nodeTo && opts.slotTo

  if (!isFrom && !isTo) {
    console.warn('No data passed to showConnectionMenu')
    return false
  }

  let nodeX: any = isFrom ? opts.nodeFrom : opts.nodeTo
  let slotX: any = isFrom ? opts.slotFrom : opts.slotTo

  let iSlotConn: any = false
  switch (typeof slotX) {
    case 'string':
      iSlotConn = isFrom ? nodeX.findOutputSlot(slotX, false) : nodeX.findInputSlot(slotX, false)
      slotX = isFrom ? nodeX.outputs[slotX] : nodeX.inputs[slotX]
      break
    case 'object':
      // ok slotX
      iSlotConn = isFrom ? nodeX.findOutputSlot(slotX.name) : nodeX.findInputSlot(slotX.name)
      break
    case 'number':
      iSlotConn = slotX
      slotX = isFrom ? nodeX.outputs[slotX] : nodeX.inputs[slotX]
      break
    default:
      // bad ?
      //iSlotConn = 0;
      console.warn('Cant get slot information ' + slotX)
      return false
  }

  var options = ['Add Node', null]

  if (lcanvas.allow_searchbox) {
    options.push('Search')
    options.push(null)
  }

  // get defaults nodes for this slottype
  var fromSlotType = slotX.type == LiteGraph.EVENT ? '_event_' : slotX.type
  var slotTypesDefault = isFrom ? LiteGraph.slot_types_default_out : LiteGraph.slot_types_default_in
  if (slotTypesDefault && slotTypesDefault[fromSlotType]) {
    if (typeof slotTypesDefault[fromSlotType] === 'object') {
      for (var typeX in slotTypesDefault[fromSlotType]) {
        options.push(slotTypesDefault[fromSlotType][typeX])
      }
    } else {
      options.push(slotTypesDefault[fromSlotType])
    }
  }

  // build menu
  var menu = new LiteGraph.ContextMenu(options, {
    event: opts.e,
    title: (slotX && slotX.name != '' ? slotX.name + (fromSlotType ? ' | ' : '') : '') + (slotX && fromSlotType ? fromSlotType : ''),
    callback: inner_clicked,
  })

  // callback
  function inner_clicked(v: any, options: any, e: any) {
    //console.log("Process showConnectionMenu selection");
    switch (v) {
      case 'Add Node':
        LCanvas.onMenuAdd(null, null, e, menu, function (node: any) {
          if (isFrom) {
            opts.nodeFrom.connectByType(iSlotConn, node, fromSlotType)
          } else {
            opts.nodeTo.connectByTypeOutput(iSlotConn, node, fromSlotType)
          }
        })
        break
      case 'Search':
        if (isFrom) {
          showSearchBox(lcanvas, e, { node_from: opts.nodeFrom, slot_from: slotX, type_filter_in: fromSlotType })
        } else {
          showSearchBox(lcanvas, e, { node_to: opts.nodeTo, slot_from: slotX, type_filter_out: fromSlotType })
        }
        break
      default:
        // check for defaults nodes for this slottype
        var nodeCreated = lcanvas.createDefaultNodeForSlot(Object.assign(opts, { position: [opts.e.canvasX, opts.e.canvasY], nodeType: v }))
        if (nodeCreated) {
          // new node created
          //console.log("node "+v+" created")
        } else {
          // failed or v is not in defaults
        }
        break
    }
  }

  return false
}
