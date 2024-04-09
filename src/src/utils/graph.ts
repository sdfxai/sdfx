import { LiteGraph } from '@/components/LiteGraph/'

export const isRegisteredNode = (node: any) => {
  return node.type in LiteGraph.registered_node_types
}

export const isImageNode = (node: any) => {
  return node.imgs || (node && node.widgets && node.widgets.findIndex((o: any) => o.name === 'image') > -1)
}

export const isSDFXGraph = (graphData: any) => {
  return graphData.uid && graphData.type==='sdfx' && graphData.nodes && graphData.links && graphData.mapping
}

export const sanitizeNodeName = (name: string) => {
  let entityMap = {
    '&': '',
    '<': '',
    '>': '',
    '"': '',
    "'": '',
    '`': '',
    '=': ''
  }
  return String(name).replace(/[&<>"'`=]/g, function fromEntityMap (s) {
    // @ts-ignore
    return entityMap[s]
  })
}

export const generateDefaultMapping = (workflow: any) => {
  const childrin = []
  const nodes = workflow.nodes

  const checkpointNode = nodes.find((node: any) => node.type === 'CheckpointLoaderSimple')
  if (checkpointNode) {
    childrin.push({
      label: 'Checkpoint',
      showLabel: true,
      type: 'control',
      component: 'ModelPicker',
      templates: ['ckpt_name'],
      target: {
        nodeId: checkpointNode.id,
        nodeType: checkpointNode.type,
        widgetNames: ['ckpt_name'],
        widgetIdxs: [0]
      }
    })
  }

  const imageDimensionNode = nodes.find((node: any) => node.type === 'EmptyLatentImage')
  if (imageDimensionNode) {
    childrin.push({
      label: 'Image Dimensions',
      showLabel: true,
      type: 'control',
      component: 'BoxDimensions',
      target: {
        nodeId: imageDimensionNode.id,
        nodeType: imageDimensionNode.type,
        widgetNames: ['width', 'height'],
        widgetIdxs: [0, 1]
      }
    })
  }

  const kSamplerNode = nodes.find((node: any) => node.type === 'KSampler')
  if (kSamplerNode) {
    childrin.push({
      label: 'Steps',
      showLabel: true,
      type: 'control',
      component: 'slider',
      target: {
        nodeId: kSamplerNode.id,
        nodeType: kSamplerNode.type,
        widgetNames: ['steps'],
        widgetIdxs: [2]
      }
    },
    {
      label: 'Guidance',
      showLabel: true,
      type: 'control',
      component: 'slider',
      target: {
        nodeId: kSamplerNode.id,
        nodeType: kSamplerNode.type,
        widgetNames: ['cfg'],
        widgetIdxs: [3]
      }
    },
    {
      label: 'Seed',
      showLabel: true,
      type: 'control',
      component: 'BoxSeed',
      target: {
        nodeId: kSamplerNode.id,
        nodeType: kSamplerNode.type,
        widgetNames: ['seed', 'control_after_generate'],
        widgetIdxs: [0, 1]
      }
    })
  }

  const clipTextNode = nodes.find((node: any) => node.type === 'CLIPTextEncode')
  if (clipTextNode) {
    childrin.push({
      label: 'Prompt',
      showLabel: true,
      type: 'control',
      component: 'textarea',
      templates: ['text'],
      target: {
        nodeId: clipTextNode.id,
        nodeType: clipTextNode.type,
        widgetNames: ['text'],
        widgetIdxs: [0]
      }
    })
  }

  return childrin
}
