// @ts-ignore
import { LCanvas } from '../LCanvas'
import { LiteGraph } from '../LiteGraph'
import { LiteTheme } from '../LiteTheme'
import { NodeSelection } from '../ContextActions'
import { createDialog } from './dialogs/Dialog'
import { showEditPropertyValue } from './dialogs/EditProperty'

export class CanvasContextMenu {
  static customMenuOptions: any[] = []

  constructor(public lcanvas: LCanvas) {}
  
  static onMenuNodeRemove(value: any, options: any, e: any, menu: any, node: any) {
    if (!node) {
      throw 'onMenuNodeRemove: missing node'
    }
  
    const graph = node.graph
    graph.beforeChange()
  
    const graphcanvas = LCanvas.active_canvas
    if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
      graph.remove(node)
    } else {
      for (let i in graphcanvas.selected_nodes) {
        graph.remove(graphcanvas.selected_nodes[i])
      }
    }
  
    graph.afterChange()
    node.setDirtyCanvas(true, true)
  }
  
  static onMenuNodeToSubgraph(value: any, options: any, e: any, menu: any, node: any) {
    const graph = node.graph
    const graphcanvas = LCanvas.active_canvas

    if (!graphcanvas) {
      return
    }
  
    let nodes_list = Object.values(graphcanvas.selected_nodes || {})
    if (!nodes_list.length) nodes_list = [node]

    const subgraph_node = LiteGraph.createNode('graph/subgraph')
    console.log(subgraph_node)

    subgraph_node.pos = node.pos.concat()
    graph.add(subgraph_node)
  
    subgraph_node.buildFromNodes(nodes_list)
  
    graphcanvas.deselectAllNodes()
    node.setDirtyCanvas(true, true)
  }
  
  static onMenuNodeClone(value: any, options: any, e: any, menu: any, node: any) {
    node.graph.beforeChange()
  
    const newSelected: any = {}
  
    const fApplyMultiNode = function (node: any) {
      if (node.clonable === false) {
        return
      }
      const newnode = node.clone()
      if (!newnode) {
        return
      }
      newnode.pos = [node.pos[0] + 5, node.pos[1] + 5]
      node.graph.add(newnode)
      newSelected[newnode.id] = newnode
    }
  
    const graphcanvas = LCanvas.active_canvas
    if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
      fApplyMultiNode(node)
    } else {
      for (const i in graphcanvas.selected_nodes) {
        fApplyMultiNode(graphcanvas.selected_nodes[i])
      }
    }
  
    if (Object.keys(newSelected).length) {
      graphcanvas.selectNodes(newSelected)
    }
  
    node.graph.afterChange()
  
    node.setDirtyCanvas(true, true)
  }
  
  static addCustomCanvasMenuOptions(fct: any) {
    CanvasContextMenu.customMenuOptions.push(fct)
  }

  getCanvasMenuOptions() {
    let options: any = null
    if (this.lcanvas.getMenuOptions) {
      options = this.lcanvas.getMenuOptions()
    } else {
      options = [
        {
          content: 'Add Node',
          has_submenu: true,
          callback: LCanvas.onMenuAdd,
        },
        { content: 'Add Group', callback: LCanvas.onGroupAdd },
        //{ content: "Arrange", callback: that.graph.arrange },
        //{content:"Collapse All", callback: LCanvas.onMenuCollapseAll }
      ]
      /*if (LiteGraph.showCanvasOptions){
        options.push({ content: "Options", callback: that.showShowGraphOptionsPanel });
      }*/
  
      if (Object.keys(this.lcanvas.selected_nodes).length > 1) {
        options.push({
          content: 'Align',
          has_submenu: true,
          callback: LCanvas.onGroupAlign,
        })
      }
  
      if (this.lcanvas._graph_stack && this.lcanvas._graph_stack.length > 0) {
        options.push(null, {
          content: 'Close subgraph',
          callback: this.lcanvas.closeSubgraph.bind(this),
        })
      }
    }
  
    if (this.lcanvas.getExtraMenuOptions) {
      const extra = this.lcanvas.getExtraMenuOptions(this, options)
      if (extra) {
        options = options.concat(extra)
      }
    }
    
    // console.log('getOptions', CanvasContextMenu.customMenuOptions.length)
    CanvasContextMenu.customMenuOptions.forEach((fct) => {
      options = [
        ...options,
        ...fct(this.lcanvas)
      ]
    })

    return options
  }
  
  //called by processContextMenu to extract the menu list
  getNodeMenuOptions(node: any) {
    let options: any = null
  
    if (node.getMenuOptions) {
      options = node.getMenuOptions(this)
    } else {
      options = [
        /*
        {
          content: 'Inputs',
          has_submenu: true,
          disabled: true,
          callback: CanvasContextMenu.showMenuNodeOptionalInputs,
        },
        {
          content: 'Outputs',
          has_submenu: true,
          disabled: true,
          callback: CanvasContextMenu.showMenuNodeOptionalOutputs,
        },
        null,
        */
        {
          content: 'Properties',
          has_submenu: true,
          callback: CanvasContextMenu.onShowMenuNodeProperties,
        },
        null,
        {
          content: 'Rename Title',
          callback: CanvasContextMenu.onShowPropertyEditor,
        },
      ]

      const selectionSubmenu = {
        content: 'Selection',
        has_submenu: true,
        submenu: {
          options: [
            {
              content: node.flags.collapsed ? 'Uncollapse' : 'Collapse',
              callback: NodeSelection.collapse.bind(node)
            },
            {
              content: node.flags.pinned ? 'Unpin' : 'Pin',
              callback: NodeSelection.pin.bind(node)
            },
            {
              content: 'Mode',
              has_submenu: true,
              callback: NodeSelection.modeSubmenu.bind(node)
            }
          ] as any[]
        }
      }

      if (node.resizable !== false) {
        selectionSubmenu.submenu.options.push(
          null,
          {
            content: 'Resize',
            callback: NodeSelection.resize.bind(node)
          }
        )
      }

      selectionSubmenu.submenu.options.push(
        null,
        {
          content: 'Change color',
          has_submenu: true,
          callback: NodeSelection.colorSubmenu.bind(node),
        },

        {
          content: 'Change shape',
          has_submenu: true,
          callback: NodeSelection.shapeSubmenu.bind(node),
        }
      )

      options.push(
        selectionSubmenu
      )
    }
  
    if (node.onGetInputs) {
      const inputs = node.onGetInputs()
      if (inputs && inputs.length) {
        options[0].disabled = false
      }
    }
  
    if (node.onGetOutputs) {
      const outputs = node.onGetOutputs()
      if (outputs && outputs.length) {
        options[1].disabled = false
      }
    }
  
    if (node.getExtraMenuOptions) {
      const extra = node.getExtraMenuOptions(this, options)
      if (extra) {
        extra.push(null)
        options = extra.concat(options)
      }
    }
  
    if (node.clonable !== false) {
      options.push({
        content: 'Clone',
        callback: CanvasContextMenu.onMenuNodeClone,
      })
    }
  
    // todo
    if (0) {
      options.push({
        content: 'To Subgraph',
        callback: CanvasContextMenu.onMenuNodeToSubgraph,
      })
    }
  
    if (Object.keys(this.lcanvas.selected_nodes).length > 1) {
      options.push({
        content: 'Align Selected To',
        has_submenu: true,
        callback: LCanvas.onNodeAlign,
      })
    }
  
    options.push(null, {
      content: 'Remove',
      disabled: !(node.removable !== false && !node.block_delete),
      callback: CanvasContextMenu.onMenuNodeRemove,
    })
  
    if (node.graph && node.graph.onGetNodeMenuOptions) {
      node.graph.onGetNodeMenuOptions(options, node)
    }
  
    return options
  }
  
  getGroupMenuOptions(node: any) {
    const o = [
      { 
        content: 'Title',
        callback: LCanvas.onShowPropertyEditor
      },
      {
        content: 'Color',
        has_submenu: true,
        callback: LCanvas.onMenuNodeColors
      },
      {
        content: 'Font size',
        property: 'font_size',
        type: 'Number',
        callback: LCanvas.onShowPropertyEditor
      },
      null,
      {
        content: 'Remove',
        callback: LCanvas.onMenuNodeRemove
      }
    ]
  
    return o
  }
  
  processContextMenu(node: any, event: any) {
    const that = this
    const canvas = LCanvas.active_canvas

    const ref_window = canvas.getCanvasWindow()
  
    const inner_option_clicked = (v: any, options: any, e: any)  => {
      if (!v) {
        return
      }
  
      if (v.content == 'Remove Slot') {
        const info = v.slot
        node.graph.beforeChange()
        if (info.input) {
          node.removeInput(info.slot)
        } else if (info.output) {
          node.removeOutput(info.slot)
        }
        node.graph.afterChange()
        return
      } else if (v.content == 'Disconnect Links') {
        const info = v.slot
        node.graph.beforeChange()
        if (info.output) {
          node.disconnectOutput(info.slot)
        } else if (info.input) {
          node.disconnectInput(info.slot)
        }
        node.graph.afterChange()
        return
      } else if (v.content == 'Rename Slot') {
        const info = v.slot
        const slot_info = info.input ? node.getInputInfo(info.slot) : node.getOutputInfo(info.slot)
        const dialog = createDialog(that.lcanvas.canvas, "<span class='name'>Name</span><input autofocus type='text'/><button>OK</button>", options)
        const input = dialog.querySelector('input')
        if (input && slot_info) {
          input.value = slot_info.label || ''
        }
        const inner = () => {
          node.graph.beforeChange()
          if (input.value) {
            if (slot_info) {
              slot_info.label = input.value
            }
            this.lcanvas.setDirty(true)
          }
          dialog.close()
          node.graph.afterChange()
        }
        dialog.querySelector('button').addEventListener('click', inner)
        input.addEventListener('keydown', function (e: any) {
          dialog.is_modified = true
          if (e.keyCode == 27) {
            //ESC
            dialog.close()
          } else if (e.keyCode == 13) {
            inner() // save
          } else if (e.keyCode != 13 && e.target.localName != 'textarea') {
            return
          }
          e.preventDefault()
          e.stopPropagation()
        })
        input.focus()
      }
    }

    let menu_info = null
    const options: any = {
      event: event,
      callback: inner_option_clicked,
      extra: node,
    }
  
    if (node) options.title = node.type
  
    //check if mouse is in input
    let slot = null
    if (node) {
      slot = node.getSlotInPosition(event.canvasX, event.canvasY)
      LCanvas.active_node = node
    }
  
    if (slot) {
      //on slot
      menu_info = []
      if (node.getSlotMenuOptions) {
        menu_info = node.getSlotMenuOptions(slot)
      } else {
        if (slot && slot.output && slot.output.links && slot.output.links.length) {
          menu_info.push({ content: 'Disconnect Links', slot: slot })
        }
        const _slot = slot.input || slot.output
        if (_slot.removable) {
          menu_info.push(_slot.locked ? 'Cannot remove' : { content: 'Remove Slot', slot: slot })
        }
        if (!_slot.nameLocked) {
          menu_info.push({ content: 'Rename Slot', slot: slot })
        }
      }
      options.title = (slot.input ? slot.input.type : slot.output.type) || '*'
      if (slot.input && slot.input.type == LiteGraph.ACTION) {
        options.title = 'Action'
      }
      if (slot.output && slot.output.type == LiteGraph.EVENT) {
        options.title = 'Event'
      }
    } else {
      if (node) {
        //on node
        menu_info = this.getNodeMenuOptions(node)
      } else {
        menu_info = this.getCanvasMenuOptions()
        const group = this.lcanvas.graph.getGroupOnPos(event.canvasX, event.canvasY)
        if (group) {
          //on group
          menu_info.push(
            null,
            {
              content: 'Edit Group',
              has_submenu: true,
              submenu: {
                title: 'Group',
                extra: group,
                options: this.getGroupMenuOptions(group),
              },
            },
            {
              content: 'Remove Group',
              has_submenu: false,
              callback: ()=>{
                this.lcanvas.graph.remove(group)
              }
            }
          )
        }
      }
    }
  
    //show menu
    if (!menu_info) {
      return
    }
  
    const menu = new LiteGraph.ContextMenu(menu_info, options, ref_window)
  }

  static showMenuNodeOptionalInputs(v: any, opts: any, e: any, prev_menu: any, node: any) {
    if (!node) {
      return
    }
  
    const that = this
    const canvas = LCanvas.active_canvas
    const ref_window = canvas.getCanvasWindow()
  
    let options = node.optional_inputs
    if (node.onGetInputs) {
      options = node.onGetInputs()
    }
  
    let entries = []
    if (options) {
      for (let i = 0; i < options.length; i++) {
        const entry = options[i]
        if (!entry) {
          entries.push(null)
          continue
        }
        let label = entry[0]
        if (!entry[2]) entry[2] = {}
  
        if (entry[2].label) {
          label = entry[2].label
        }
  
        entry[2].removable = true
        const data: any = { content: label, value: entry }
        if (entry[1] == LiteGraph.ACTION) {
          data.className = 'event'
        }
        entries.push(data)
      }
    }
  
    if (node.onMenuNodeInputs) {
      const retEntries = node.onMenuNodeInputs(entries)
      if (retEntries) entries = retEntries
    }
  
    if (!entries.length) {
      console.log('no input entries')
      return
    }
  
    const menu = new LiteGraph.ContextMenu(
      entries,
      {
        event: e,
        callback: inner_clicked,
        parentMenu: prev_menu,
        node: node,
      },
      ref_window,
    )
  
    function inner_clicked(v: any, e: any, prev: any) {
      if (!node) {
        return
      }
  
      if (v.callback) {
        v.callback.call(that, node, v, e, prev)
      }
  
      if (v.value) {
        node.graph.beforeChange()
        node.addInput(v.value[0], v.value[1], v.value[2])
  
        if (node.onNodeInputAdd) {
          // callback to the node when adding a slot
          node.onNodeInputAdd(v.value)
        }
        node.setDirtyCanvas(true, true)
        node.graph.afterChange()
      }
    }
  
    return false
  }
  
  static showMenuNodeOptionalOutputs(v: any, opts: any, e: any, prev_menu: any, node: any) {
    if (!node) {
      return
    }
  
    const that = this
    const canvas = LCanvas.active_canvas
    const ref_window = canvas.getCanvasWindow()
  
    let options = node.optional_outputs
    if (node.onGetOutputs) {
      options = node.onGetOutputs()
    }
  
    let entries = []
    if (options) {
      for (let i = 0; i < options.length; i++) {
        const entry = options[i]
        if (!entry) {
          //separator?
          entries.push(null)
          continue
        }
  
        if (node.flags && node.flags.skip_repeated_outputs && node.findOutputSlot(entry[0]) != -1) {
          continue
        } //skip the ones already on
        let label = entry[0]
        if (!entry[2]) entry[2] = {}
        if (entry[2].label) {
          label = entry[2].label
        }
        entry[2].removable = true
        const data: any = { content: label, value: entry }
        if (entry[1] == LiteGraph.EVENT) {
          data.className = 'event'
        }
        entries.push(data)
      }
    }

    // TODO: THIS IS AN ERROR, onMenuNodeOutputs will never be defined
    // if (this.onMenuNodeOutputs) {
    //   entries = this.lcanvas.onMenuNodeOutputs(entries)
    // }

    if (LiteGraph.do_add_triggers_slots) {
      //canvas.allow_addOutSlot_onExecuted
      if (node.findOutputSlot('onExecuted') == -1) {
        entries.push({ content: 'On Executed', value: ['onExecuted', LiteGraph.EVENT, { nameLocked: true }], className: 'event' }) //, opts: {}
      }
    }
    // add callback for modifing the menu elements onMenuNodeOutputs
    if (node.onMenuNodeOutputs) {
      const retEntries = node.onMenuNodeOutputs(entries)
      if (retEntries) entries = retEntries
    }
  
    if (!entries.length) {
      return
    }
  
    const menu = new LiteGraph.ContextMenu(
      entries,
      {
        event: e,
        callback: inner_clicked,
        parentMenu: prev_menu,
        node: node,
      },
      ref_window,
    )
  
    function inner_clicked(v: any, e: any, prev: any) {
      if (!node) {
        return
      }
  
      if (v.callback) {
        v.callback.call(that, node, v, e, prev)
      }
  
      if (!v.value) {
        return
      }
  
      const value = v.value[1]
  
      if (value && (value.constructor === Object || value.constructor === Array)) {
        //submenu why?
        const entries = []
        for (const i in value) {
          entries.push({ content: i, value: value[i] })
        }
        new LiteGraph.ContextMenu(entries, {
          event: e,
          callback: inner_clicked,
          parentMenu: prev_menu,
          node: node,
        })
        return false
      } else {
        node.graph.beforeChange()
        node.addOutput(v.value[0], v.value[1], v.value[2])
  
        if (node.onNodeOutputAdd) {
          // a callback to the node when adding a slot
          node.onNodeOutputAdd(v.value)
        }
        node.setDirtyCanvas(true, true)
        node.graph.afterChange()
      }
    }
  
    return false
  }
  
  static onShowMenuNodeProperties(value: any, options: any, e: any, prev_menu: any, node: any) {
    if (!node || !node.properties) {
      return
    }
  
    const that = this
    const canvas = LCanvas.active_canvas
    const ref_window = canvas.getCanvasWindow()
  
    const entries = []
    for (const i in node.properties) {
      let value = node.properties[i] !== undefined ? node.properties[i] : ' '
      if (typeof value == 'object') value = JSON.stringify(value)
      const info = node.getPropertyInfo(i)
      if (info.type == 'enum' || info.type == 'combo') value = LCanvas.getPropertyPrintableValue(value, info.values)
  
      //value could contain invalid html characters, clean that
      value = LCanvas.decodeHTML(value)
      entries.push({
        content: "<span class='property_name'>" + (info.label ? info.label : i) + '</span>' + "<span class='property_value'>" + value + '</span>',
        value: i,
      })
    }
    if (!entries.length) {
      return
    }
  
    const menu = new LiteGraph.ContextMenu(
      entries,
      {
        event: e,
        callback: inner_clicked,
        parentMenu: prev_menu,
        allow_html: true,
        node: node,
      },
      ref_window,
    )
    
    function inner_clicked(v: any, options: any, e: any, prev: any) {
      if (!node) {
        return
      }
      // @ts-ignore
      const rect = this.getBoundingClientRect()

      showEditPropertyValue(canvas, node, v.value, {
        position: [rect.left, rect.top],
      })
    }
  
    return false
  }

  // TODO refactor :: this is used fot title but not for properties!
  static onShowPropertyEditor(item: any, options: any, e: any, menu: any, node: any) {
    const input_html = ''
    const property = item.property || 'title'
    const value = node[property]

    // TODO refactor :: use createDialog ?

    const dialog: any = document.createElement('div')
    dialog.is_modified = false
    dialog.className = 'graphdialog'
    dialog.innerHTML = "<span class='name'></span><input autofocus type='text' class='value'/><button>OK</button>"
    dialog.close = function () {
      if (dialog.parentNode) {
        dialog.parentNode.removeChild(dialog)
      }
    }
    const title = dialog.querySelector('.name')
    title.innerText = property
    const input = dialog.querySelector('.value')
    if (input) {
      input.value = value
      input.addEventListener('blur', function (e: any) {
        input.focus()
      })
      input.addEventListener('keydown', function (e: any) {
        dialog.is_modified = true
        if (e.keyCode == 27) {
          //ESC
          dialog.close()
        } else if (e.keyCode == 13) {
          inner() // save
        } else if (e.keyCode != 13 && e.target.localName != 'textarea') {
          return
        }
        e.preventDefault()
        e.stopPropagation()
      })
    }

    const graphcanvas = LCanvas.active_canvas
    const canvas = graphcanvas.canvas

    const rect = canvas.getBoundingClientRect()
    let offsetx = -20
    let offsety = -20
    if (rect) {
      offsetx -= rect.left
      offsety -= rect.top
    }

    if (event) {
      // @ts-ignore
      dialog.style.left = event.clientX + offsetx + 'px'
      // @ts-ignore
      dialog.style.top = event.clientY + offsety + 'px'
    } else {
      dialog.style.left = canvas.width * 0.5 + offsetx + 'px'
      dialog.style.top = canvas.height * 0.5 + offsety + 'px'
    }

    const button = dialog.querySelector('button')
    button.addEventListener('click', inner)
    canvas.parentNode.appendChild(dialog)

    if (input) input.focus()

    let dialogCloseTimer: any = null
    dialog.addEventListener('mouseleave', function (e: any) {
      if (LiteGraph.dialog_close_on_mouse_leave)
        if (!dialog.is_modified && LiteGraph.dialog_close_on_mouse_leave) dialogCloseTimer = setTimeout(dialog.close, LiteGraph.dialog_close_on_mouse_leave_delay) //dialog.close();
    })
    dialog.addEventListener('mouseenter', function (e: any) {
      if (LiteGraph.dialog_close_on_mouse_leave) if (dialogCloseTimer) clearTimeout(dialogCloseTimer)
    })

    function inner() {
      if (input) setValue(input.value)
    }

    function setValue(value: any) {
      node.graph.onBeforeChange()

      if (item.type == 'Number') {
        value = Number(value)
      } else if (item.type == 'Boolean') {
        value = Boolean(value)
      }
      node[property] = value
      if (dialog.parentNode) {
        dialog.parentNode.removeChild(dialog)
      }

      node.setDirtyCanvas(true, true)
      node.graph.onAfterChange()
    }
  }
}