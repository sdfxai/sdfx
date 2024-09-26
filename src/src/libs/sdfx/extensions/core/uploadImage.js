import { sdfx as app } from '@/libs/sdfx/sdfx.js'

// Adds an upload button to the nodes

app.registerExtension({
  name: 'SDFX.UploadImage',

  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name === 'LoadImage' || nodeData.name === 'LoadImageMask' || nodeData.name === 'GlovyLoadimage') {
      nodeData.input.required.upload = ['IMAGEUPLOAD']
    }
  }
})
