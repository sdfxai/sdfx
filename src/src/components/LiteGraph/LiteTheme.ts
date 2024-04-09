import { LCanvas, LiteGraph } from '@/components/LiteGraph'
import { node_colors, themes } from './themes/colors'

export const LiteTheme = {
  node_colors: node_colors,
  themes: themes
}

const sortObjectKeys = (unordered: any) => {
  return Object.keys(unordered)
    .sort()
    .reduce((obj, key) => {
      obj[key] = unordered[key]
      return obj
    }, {} as any)
}

const getSlotTypes = (nodeDefs?: any) => {
  const types = []

  for (const nodeId in nodeDefs) {
    const nodeData = nodeDefs[nodeId]

    var inputs = nodeData['input']['required']
    if (nodeData['input']['optional'] !== undefined) {
      inputs = Object.assign(
        {}, 
        nodeData['input']['required'], 
        nodeData['input']['optional']
      )
    }

    for (const inputName in inputs) {
      const inputData = inputs[inputName]
      const type = inputData[0]

      if (!Array.isArray(type)) {
        types.push(type)
      }
    }

    for (const o in nodeData['output']) {
      const output = nodeData['output'][o]
      types.push(output)
    }
  }

  return types
}

export const loadTheme = (graphcanvas: any, nodeDefs: any, p: 'light'|'dark' = 'dark') => {
  const theme = LiteTheme.themes[p]
  const types = getSlotTypes(nodeDefs)

  if (!theme) {
    return
  }

  let { BACKGROUND_IMAGE, CLEAR_BACKGROUND_COLOR } = theme.colors.litegraph_base
  graphcanvas.updateBackground(BACKGROUND_IMAGE, CLEAR_BACKGROUND_COLOR)

  for (const type of types) {
    // @ts-ignore
    if (!theme.colors.node_slot[type]) {
      // @ts-ignore
      theme.colors.node_slot[type] = ''
    }
  }

  theme.colors.node_slot = sortObjectKeys(theme.colors.node_slot)

  if (theme.colors) {
    // Sets the colors of node slots and links
    if (theme.colors.node_slot) {
      Object.assign(graphcanvas.default_connection_color_byType, theme.colors.node_slot)
      Object.assign(LCanvas.link_type_colors, theme.colors.node_slot)
    }
    // Sets the colors of the LiteGraph objects
    if (theme.colors.litegraph_base) {
      // Everything updates correctly in the loop, except the Node Title and Link Color for some reason
      graphcanvas.node_title_color = theme.colors.litegraph_base.NODE_TITLE_COLOR
      graphcanvas.default_link_color = theme.colors.litegraph_base.LINK_COLOR

      for (const key in theme.colors.litegraph_base) {
        if (theme.colors.litegraph_base.hasOwnProperty(key) && LiteGraph.hasOwnProperty(key)) {
          // @ts-ignore
          LiteGraph[key] = theme.colors.litegraph_base[key]
        }
      }
    }
    // Sets the color of UI elements
    if (theme.colors.sdfx_base) {
      const rootStyle = document.documentElement.style
      for (const key in theme.colors.sdfx_base) {
        // @ts-ignore
        rootStyle.setProperty('--' + key, theme.colors.sdfx_base[key])
      }
    }
    graphcanvas.draw(true, true)
  }
}  
