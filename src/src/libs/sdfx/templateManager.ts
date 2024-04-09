// @ts-ignore
import { sdfx } from '@/libs/sdfx/sdfx'
import { saveJSONFile } from '@/utils'
import { usePrompt } from '@/components/UI/VuePrompt/VuePrompt'
import { CanvasContextMenu } from '@/components/LiteGraph/canvas/CanvasContextMenu'
/* @ts-ignore */
import { GroupNodeConfig, GroupNodeHandler } from '@/libs/sdfx/extensions/core/groupNode.js'

const SDFXTemplate = {
  async add(template: any) {
    sdfx.graphStore.addTemplate(template)
  },

  remove(idx: number) {
    sdfx.graphStore.removeTemplate(idx)
  },

  getList() {
    return sdfx.graphStore.getLocalTemplateList()
  },

  paste(template: any) {
    sdfx.canvas.pasteNodes(template)
  },

  async saveAsTemplate(){
    const { prompt } = usePrompt()

    const name = await prompt({
      title: 'Template name',
      placeholder: 'Name',
      buttons: {
        submit: 'Submit',
        cancel: 'Cancel'
      }
    })

    // @ts-ignore
    if (!name?.trim()) return

    const data = sdfx.canvas.copySelectedNodes()
    const nodeIds = Object.keys(sdfx.canvas.selected_nodes)

    for (let i = 0; i < nodeIds.length; i++) {
      const node = sdfx.graph.getNodeById(nodeIds[i])
      const nodeData = node?.constructor.nodeData

      let groupData = GroupNodeHandler.getGroupData(node)
      if (groupData) {
        groupData = groupData.nodeData
        if (!data.groupNodes) {
            data.groupNodes = {}
        }
        data.groupNodes[nodeData.name] = groupData
        data.nodes[i].type = nodeData.name
      }
    }

    await sdfx.graphStore.addTemplate({ name, data })
  },

  async export() {
    // @ts-ignore
    const name = await prompt({
      title: 'Filename',
      placeholder: 'template.json',
      value: 'template.json',
      buttons: {
        submit: 'Submit',
        cancel: 'Cancel'
      }
    })

    if (!name?.trim()) return

    const templates = await sdfx.graphStore.getTemplateList()
    saveJSONFile(name, templates)
  }
}

CanvasContextMenu.addCustomCanvasMenuOptions((lcanvas: any) => {
  const options: any[] = []
  options.push(null)
  options.push({
    content: `Save as template`,
    disabled: !Object.keys(sdfx.canvas.selected_nodes || {}).length,
    callback: () => {
      SDFXTemplate.saveAsTemplate()
    },
  })

  const templates = SDFXTemplate.getList()

  // Map each template to a menu item
  const subItems = templates.map((t: any) => ({
    content: t.name,
    callback: async () => {
      const data = await sdfx.loadTemplateId(t.uid)
      await GroupNodeConfig.registerFromWorkflow(data.groupNodes, {})
      SDFXTemplate.paste(data)
    },
  }))

  options.push({
    content: 'Templates',
    disabled: templates.length<=0,
    submenu: {
      options: subItems
    },
  })

  return options
})
