import { sdfx as app } from '@/libs/sdfx/sdfx.js'
import { ComfyWidgets } from '@/libs/sdfx/widgets.js'
import { LiteGraph } from '@/components/LiteGraph/'

// Node that add notes to your project

app.registerExtension({
  name: 'SDFX.NoteNode',

  registerCustomNodes() {
    class NoteNode {
      constructor() {
        if (!this.properties) {
          this.properties = {}
          this.properties.text = ''
        }

        ComfyWidgets.STRING(this, '', [
          '',
          { default: this.properties.text, multiline: true },
        ])

        this.serialize_widgets = true
        this.isVirtualNode = true
      }
    }

    // Load default visibility

    const nodeType = Object.assign(NoteNode, {
      title_mode: LiteGraph.NORMAL_TITLE,
      title: 'Note',
      collapsable: true,
    })

    LiteGraph.registerNodeType('Note', nodeType)

    NoteNode.category = 'utils'
  }
})
