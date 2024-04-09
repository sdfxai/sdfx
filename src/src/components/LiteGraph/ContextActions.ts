import { LiteGraph } from './LiteGraph'
// @ts-ignore
import { LCanvas } from './LCanvas'
import { LiteTheme } from './LiteTheme'

const applyToSelection = (node: any, fn: any) => {
  node.graph.beforeChange()

  const graphcanvas = LCanvas.active_canvas
  if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
    fn(node)
  } else {
    for (const i in graphcanvas.selected_nodes) {
      fn(graphcanvas.selected_nodes[i])
    }
  }

  node.graph.afterChange()
}

export const NodeSelection = {
  collapse(value: any, options: any, e: any, menu: any) {
    applyToSelection(this, (node: any)=>{
      node.collapse()
    })
  },

  pin(value: any, options: any, e: any, menu: any) {
    applyToSelection(this, (node: any)=>{
      node.pin()
    })
  },

  resize(value: any, options: any, e: any, menu: any) {
    applyToSelection(this, (node: any) => {
      node.size = node.computeSize()
      if (node.onResize) node.onResize(node.size)
    })
  
    // binded to node object
    // @ts-ignore
    this.setDirtyCanvas(true, true)
  },

  colorSubmenu(value: any, options: any, e: any, menu: any) {
    const node = this

    const values: any[] = []
    values.push({
      value: null,
      content: "<span style='display: block; padding: 3px 4px; border:1px solid #d0d0d0'>No color</span>",
    })
  
    for (const i in LiteTheme.node_colors) {
      // @ts-ignore
      const color = LiteTheme.node_colors[i]
      const value = {
        value: i,
        content: "<span style='display: block; color: #ffffff; padding: 3px 4px; border-left: 8px solid " + color.color + '; background-color:' + color.bgcolor + "'>" + i + '</span>',
      }
      values.push(value)
    }

    new LiteGraph.ContextMenu(values, {
      event: e,
      callback: inner_clicked,
      parentMenu: menu,
      node: node,
    })
  
    function inner_clicked(v: any) {
      if (!node) {
        return
      }
      // @ts-ignore
      const color = v.value ? LiteTheme.node_colors[v.value] : null
  
      applyToSelection(node, (node: any)=>{
        if (color) {
          if (node.constructor === LiteGraph.LGroup) {
            node.color = color.groupcolor
          } else {
            node.color = color.color
            node.bgcolor = color.bgcolor
          }
        } else {
          delete node.color
          delete node.bgcolor
        }
      })

      // binded to node object
      // @ts-ignore
      node.setDirtyCanvas(true, true)
    }
  
    return false
  },

  shapeSubmenu(value: any, options: any, e: any, menu: any) {
    const node = this
    if (!node) {
      return
    }

    new LiteGraph.ContextMenu(LiteGraph.VALID_SHAPES, {
      event: e,
      parentMenu: menu,
      node: node,
      callback: (v: any) => {
        applyToSelection(node, (node: any)=>{
          node.shape = v
        })

        // binded to node object
        // @ts-ignore
        node.setDirtyCanvas(true)
      }
    })
  
    return false
  },

  modeSubmenu(value: any, options: any, e: any, menu: any) {
    const node = this

    new LiteGraph.ContextMenu(LiteGraph.NODE_MODES, {
      event: e,
      parentMenu: menu,
      node: node,
      callback: (v: any) => {
        if (!node) {
          return
        }
        const kV = Object.values(LiteGraph.NODE_MODES).indexOf(v)

        applyToSelection(node, (node: any)=>{
          if (kV >= 0 && LiteGraph.NODE_MODES[kV]) {
            node.changeMode(kV)
          } else {
            console.warn('unexpected mode: ' + v)
            node.changeMode(LiteGraph.ALWAYS)
          }
        })
      }
    })
  
    return false
  }
}
