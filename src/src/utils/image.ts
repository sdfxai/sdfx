import ExifReader from 'exifreader'
// @ts-ignore
import { LiteGraph } from '@/components/LiteGraph/'

interface ImageSize {
  width: number
  height: number
}

export const dataURLToBlob = (dataURL: string) => {
  const parts = dataURL.split(';base64,')
  const contentType = parts[0].split(':')[1]
  const byteString = atob(parts[1])
  const arrayBuffer = new ArrayBuffer(byteString.length)
  const uint8Array = new Uint8Array(arrayBuffer)
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i)
  }
  return new Blob([arrayBuffer], { type: contentType })
}

export const imageToDataURL = (image: any) => {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')
  ctx?.drawImage(image, 0, 0)
  const dataURL = canvas.toDataURL('image/png', 1)
  return dataURL
}

export const imageToBlob = (image: any) => {
  const dataURL = imageToDataURL(image)
  const blob = dataURLToBlob(dataURL)
  return blob
}

export const blobToFile = (blob: Blob, fileName: string) => { 
  return new File(
    [blob],
    fileName,
    {
      lastModified: new Date().getTime(),
      type: blob.type
    }
  )
}

/**
 * src: url, blob or dataURL
 */
export const getImageDetails = async (src: string, useDataURL: boolean = false) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const width = img.width
      const height =  img.height
      let dataURL = null

      if (useDataURL) {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0)
        dataURL = canvas.toDataURL()
      }

      resolve({dataURL, src, width, height})
    }
    img.onerror = (error) => {
      reject(error)
    }
    img.src = src
  })
}

export const getImageSize = (src: string): Promise<ImageSize> => {
  return new Promise(resolve => {
    const img = document.createElement('img')
    img.crossOrigin = 'anonymous'
    img.src = src

    img.onload = () => {
      const width = img.width
      const height = img.height
      img.onload = null
      img.onerror = null
      resolve({ width, height })
    }

    img.onerror = () => {
      img.onload = null
      img.onerror = null
    }
  })
}

export const getImageDataURL = async (file: File): Promise<string> => {
  if (isHEIC(file)) {
    return await HEICToPNG(file)
  }

  return new Promise(resolve => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      resolve(reader.result as string)
    })
    reader.readAsDataURL(file)
  })
}

export const isHEIC = (file: any) => {
  const type = file && file.type ? file.type.toLowerCase() : null
  const name = file && file.name ? file.name.toLowerCase() : null
  if (!type) return false
  const HEIC = type.indexOf('heic')>=0 || name.indexOf('heic')>=0
  const HEIF = type.indexOf('heif')>=0 || name.indexOf('heif')>=0
  return HEIC || HEIF
}

export const HEICToPNG = async (file: any) => {
  // get image as blob url
  const blobURL = URL.createObjectURL(file)
  
  // convert "fetch" the new blob url
  const blobRes = await fetch(blobURL)
  
  // convert response to blob
  const blob = await blobRes.blob()
  
  // convert to PNG - response is blob
  // TODO: heic2any does not exists
  // @ts-ignore
  const conversionResult = await heic2any({
    blob: blob,
    toType: 'image/jpeg'
  })
  // convert to blob url
  return URL.createObjectURL(conversionResult)
}

/*
 * Stable Diffusion Image Metadata Viewer
 */

function decodeUnicode(array: any[]) {
  const plain = array.map(t => t.toString(16).padStart(2, "0")).join("")
  if (!plain.match(/^554e49434f44450/)) return ''
  const hex = plain.replace(/^554e49434f44450[0-9]/, "").replace(/[0-9a-f]{4}/g, ",0x$&").replace(/^,/, "")
  const arhex = hex.split(",")
  let decode = ""
  arhex.forEach(v => {
    // @ts-ignore
    decode += String.fromCodePoint(v)
  })
  return decode
}

export function parseImageInfo(input: string) {
  const promptMatch = input.match(/([^]+)Negative prompt: /) || input.match(/([^]+)Steps: /) || input.match(/([^]+){"steps"/) || input.match(/([^]+)\[[^[]+\]/)
  const negativePromptMatch = input.match(/Negative prompt: ([^]+)Steps: /) || input.match(/"uc": "([^]+)"}/) || input.match(/\[([^[]+)\]/)
  const stepsMatch = input.match(/Steps: (.*?)(?:,|$)/)
  const samplerMatch = input.match(/Sampler: (.*?)(?:,|$)/)
  const cfgScaleMatch = input.match(/CFG scale: (.*?)(?:,|$)/)
  const seedMatch = input.match(/Seed: (.*?)(?:,|$)/)
  const faceRestorationMatch = input.match(/Face restoration: (.*?)(?:,|$)/)
  const sizeMatch = input.match(/Size: (\d*)x(\d*)(?:,|$)/)
  const modelHashMatch = input.match(/Model hash: (.*?)(?:,|$)/)
  const modelNameMatch = input.match(/Model: (.*?)(?:,|$)/)
  const versionMatch = input.match(/Version: v(.*?)(?:,|$)/)

  return {
    prompt: promptMatch ? promptMatch[1].trim() : null,
    negative_prompt: negativePromptMatch ? negativePromptMatch[1].trim() : null,
    steps: stepsMatch ? parseInt(stepsMatch[1]) : null,
    sampler: samplerMatch ? samplerMatch[1].trim() : null,
    cfg_scale: cfgScaleMatch ? parseInt(cfgScaleMatch[1]) : null,
    seed: seedMatch ? parseInt(seedMatch[1]) : null,
    face_restoration: faceRestorationMatch ? faceRestorationMatch[1].trim() : null,
    image_size: sizeMatch ? {width: parseInt(sizeMatch[1]), height: parseInt(sizeMatch[2])} : null,
    model_hash: modelHashMatch ? modelHashMatch[1].trim() : null,
    model_name: modelNameMatch ? modelNameMatch[1].trim() : null,
    version: versionMatch ? versionMatch[1].trim() : null
  }
}

function parseExifData(exifData: any): any {
  // Check for the correct TIFF header (0x4949 for little-endian or 0x4D4D for big-endian)
  const isLittleEndian = new Uint16Array(exifData.slice(0, 2))[0] === 0x4949
  console.log(exifData)

  // Function to read 16-bit and 32-bit integers from binary data
  function readInt(offset: number, isLittleEndian: boolean, length: number) {
    let arr = exifData.slice(offset, offset + length)
    if (length === 2) {
      return new DataView(arr.buffer, arr.byteOffset, arr.byteLength).getUint16(
        0,
        isLittleEndian,
      )
    } else if (length === 4) {
      return new DataView(arr.buffer, arr.byteOffset, arr.byteLength).getUint32(
        0,
        isLittleEndian,
      )
    }
  }

  // Read the offset to the first IFD (Image File Directory)
  const ifdOffset = readInt(4, isLittleEndian, 4)

  function parseIFD(offset: number) {
    const numEntries = readInt(offset, isLittleEndian, 2)
    const result = {}

    for (let i = 0; i < numEntries!; i++) {
      const entryOffset = offset + 2 + i * 12
      const tag = readInt(entryOffset, isLittleEndian, 2)
      const type = readInt(entryOffset + 2, isLittleEndian, 2)
      const numValues = readInt(entryOffset + 4, isLittleEndian, 4)
      const valueOffset = readInt(entryOffset + 8, isLittleEndian, 4)

      // Read the value(s) based on the data type
      let value
      if (type === 2) {
        // ASCII string
        value = String.fromCharCode(
          ...exifData.slice(valueOffset, valueOffset! + numValues! - 1),
        )
      }

      // @ts-ignore
      result[tag] = value
    }

    return result
  }

  // Parse the first IFD
  const ifdData = parseIFD(ifdOffset!)
  return ifdData
}


export const extractImageSDMetadata = async (file: any) => {
  let tags: any = null
  let txt: string = ''

  try {
    tags = await ExifReader.load(file, {expanded: true})
  } catch(e) {
    console.log(e)
    return null
  }

  console.log('Success parsing image tags', JSON.parse(JSON.stringify(tags)))

  // PNG with embeded workflow or prompt?
  if (file.type === 'image/png') {
    const pngInfo: any = await getPngMetadata(file)
    if (pngInfo && pngInfo.workflow) {
      const workflow = JSON.parse(pngInfo.workflow)
      console.log('found png workflow', workflow)
      return {
        workflow
      }
    }
    if (pngInfo && pngInfo.prompt) {
      const prompt = JSON.parse(pngInfo.prompt)
      console.log('found png prompt', prompt)
      return {
        prompt
      }
    }
  }

  if (file.type === 'image/webp') {
    const webpInfo: any = await getWebpMetadata(file)
    if (webpInfo && (webpInfo.workflow || webpInfo.Workflow)) {
      const workflow = JSON.parse(webpInfo.workflow || webpInfo.Workflow)
      console.log('found webp workflow', workflow)
      return {
        workflow
      }
    }
    if (webpInfo && webpInfo.prompt) {
      const prompt = JSON.parse(webpInfo.prompt)
      console.log('found webp prompt', prompt)
      return {
        prompt
      }
    }
  }

  // Exif?
  if (tags.exif && tags.exif.UserComment) {
    txt = decodeUnicode(tags.exif.UserComment.value)
    const metadata = parseImageInfo(txt)
    return {
      parameters: txt,
      ...metadata
    }
  }

  // iTXt
  if (!tags.pngText) return

  // A1111
  if (tags.pngText.parameters) {
    txt = tags.pngText.parameters?.description
    const metadata = parseImageInfo(txt)
    return {
      parameters: txt,
      ...metadata
    }
  }

  // NMKD
  if (tags.pngText.Dream) {
    txt = tags.pngText.Dream.description
    txt += tags.pngText['sd-metadata'] ? '\r\n' + tags.pngText['sd-metadata'].description : ''
    const metadata = parseImageInfo(txt)
    return {
      parameters: txt,
      ...metadata
    }
  }

  Object.keys(tags.pngText).forEach(tag => {
    txt += tags.pngText[tag].description
  })

  const metadata = parseImageInfo(txt)
  return {
    parameters: txt,
    ...metadata
  }
}

export const getPngMetadata = (file: any) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      // Get the PNG data as a Uint8Array
      // @ts-ignore
      const pngData = new Uint8Array(event.target.result)
      const dataView = new DataView(pngData.buffer)

      // Check that the PNG signature is present
      if (dataView.getUint32(0) !== 0x89504e47) {
        resolve(null)
        return
      }

      // Start searching for chunks after the PNG signature
      let offset = 8
      let txt_chunks = {} as any
      // Loop through the chunks in the PNG file
      while (offset < pngData.length) {
        // Get the length of the chunk
        const length = dataView.getUint32(offset)
        // Get the chunk type
        const type = String.fromCharCode(...pngData.slice(offset + 4, offset + 8))
        if (type === 'tEXt'  || type == 'comf') {
          // Get the keyword
          let keyword_end = offset + 8
          while (pngData[keyword_end] !== 0) {
            keyword_end++
          }
          const keyword = String.fromCharCode(...pngData.slice(offset + 8, keyword_end))
          // Get the text
          const contentArraySegment = pngData.slice(keyword_end + 1, offset + 8 + length)
          const contentJson = Array.from(contentArraySegment)
            .map((s) => String.fromCharCode(s))
            .join('')
          txt_chunks[keyword] = contentJson
        }

        offset += 12 + length
      }

      resolve(txt_chunks)
    }

    reader.readAsArrayBuffer(file)
  })
}

export const getWebpMetadata = (file: any) => {
  return new Promise<void>((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      // @ts-ignore
      const webp = new Uint8Array(event.target.result)
      const dataView = new DataView(webp.buffer)

      // Check that the WEBP signature is present
      if (
        dataView.getUint32(0) !== 0x52494646 ||
        dataView.getUint32(8) !== 0x57454250
      ) {
        console.error('Not a valid WEBP file')
        resolve()
        return
      }

      // Start searching for chunks after the WEBP signature
      let offset = 12
      let txt_chunks: any = {}
      // Loop through the chunks in the WEBP file
      while (offset < webp.length) {
        const chunk_length = dataView.getUint32(offset + 4, true)
        const chunk_type = String.fromCharCode(
          ...webp.slice(offset, offset + 4),
        )
        if (chunk_type === 'EXIF') {
          if (String.fromCharCode(...webp.slice(offset + 8, offset + 8 + 6)) == "Exif\0\0") {
            offset += 6
          }
          let data = parseExifData(
            webp.slice(offset + 8, offset + 8 + chunk_length)
          )
          for (var key in data) {
            var value = data[key]
            let index = value.indexOf(':')
            txt_chunks[value.slice(0, index)] = value.slice(index + 1)
          }
        }

        offset += 8 + chunk_length
      }

      resolve(txt_chunks)
    }

    reader.readAsArrayBuffer(file)
  })
}

export const getLatentMetadata = async (file: any) => {
  return new Promise((r) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      // @ts-ignore
      const safetensorsData = new Uint8Array(event.target.result)
      const dataView = new DataView(safetensorsData.buffer)
      let header_size = dataView.getUint32(0, true)
      let offset = 8
      let header = JSON.parse(new TextDecoder().decode(safetensorsData.slice(offset, offset + header_size)))
      r(header.__metadata__)
    }

    var slice = file.slice(0, 1024 * 1024 * 4)
    reader.readAsArrayBuffer(slice)
  })
}

/* ------ */

const ceil64 = (v: number) => Math.ceil(v / 64) * 64

export const getNodeWidget = (node: any, name: string) => {
  return node.widgets.find((w: any) => w.name === name)
}

export const setNodeWidgetValue = (node: any, name: string, value: any, isOptionPrefix?: boolean) => {
  const w = getNodeWidget(node, name)
  if (isOptionPrefix) {
    const o = w.options.values.find((w: string) => w.startsWith(value))
    if (o) {
      w.value = o
    } else {
      console.warn(`Unknown value '${value}' for widget '${name}'`, node)
      w.value = value
    }
  } else {
    w.value = value
  }
}

export const extractLorasFromPrompt = (textPrompt: string) => {
  const loras: any[] = []
  const text = textPrompt.replace(/<lora:([^:]+:[^>]+)>/g, (m, c)=>{
    const s = c.split(':')
    const name = s[0]
    const weight = parseFloat(s[1]) || 1.0

    if (isNaN(weight)) {
      console.warn('Invalid LORA', m)
    }

    loras.push({ name, weight })
    return ''
  })

  return { loras, text }
}

export const buildGraphFromMetadata = (graph: any, positive: any, negative: any, embeddings: any, opts: any) => {
  const ckptNode = LiteGraph.createNode('CheckpointLoaderSimple')
  const clipSkipNode = LiteGraph.createNode('CLIPSetLastLayer')
  const positiveNode = LiteGraph.createNode('CLIPTextEncode')
  const negativeNode = LiteGraph.createNode('CLIPTextEncode')
  const samplerNode = LiteGraph.createNode('KSampler')
  const latentImageNode = LiteGraph.createNode('EmptyLatentImage')
  const vaeNode = LiteGraph.createNode('VAEDecode')
  const vaeLoaderNode = LiteGraph.createNode('VAELoader')
  const saveNode = LiteGraph.createNode('SaveImage')
  let hrSamplerNode: any = null

  function createLoraNodes(clipNode: any, textPrompt: any, prevClip: any, prevModel: any) {
    const { loras, text } = extractLorasFromPrompt(textPrompt)

    for (const l of loras) {
      const loraNode = LiteGraph.createNode('LoraLoader')
      graph.add(loraNode)
      setNodeWidgetValue(loraNode, 'lora_name', l.name, true)
      setNodeWidgetValue(loraNode, 'strength_model', l.weight)
      setNodeWidgetValue(loraNode, 'strength_clip', l.weight)
      prevModel.node.connect(prevModel.index, loraNode, 0)
      prevClip.node.connect(prevClip.index, loraNode, 1)
      prevModel = { node: loraNode, index: 0 }
      prevClip = { node: loraNode, index: 1 }
    }

    prevClip.node.connect(1, clipNode, 0)
    prevModel.node.connect(0, samplerNode, 0)
    if (hrSamplerNode) {
      prevModel.node.connect(0, hrSamplerNode, 0)
    }

    return { text, prevModel, prevClip }
  }

  function replaceEmbeddings(text: string) {
    if (!embeddings.length) return text
    return text.replaceAll(
      new RegExp('\\b(' + embeddings.map((e: string) => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\b|\\b') + ')\\b', 'ig'),
      'embedding:$1',
    )
  }

  function popOpt(name: string) {
    const v = opts[name]
    delete opts[name]
    return v
  }

  graph.clear()
  graph.add(ckptNode)
  graph.add(clipSkipNode)
  graph.add(positiveNode)
  graph.add(negativeNode)
  graph.add(samplerNode)
  graph.add(latentImageNode)
  graph.add(vaeNode)
  graph.add(vaeLoaderNode)
  graph.add(saveNode)

  ckptNode.connect(1, clipSkipNode, 0)
  clipSkipNode.connect(0, positiveNode, 0)
  clipSkipNode.connect(0, negativeNode, 0)
  ckptNode.connect(0, samplerNode, 0)
  positiveNode.connect(0, samplerNode, 1)
  negativeNode.connect(0, samplerNode, 2)
  latentImageNode.connect(0, samplerNode, 3)
  vaeNode.connect(0, saveNode, 0)
  samplerNode.connect(0, vaeNode, 0)
  vaeLoaderNode.connect(0, vaeNode, 1)

  const handlers = {
    'model'(v: any) {
      setNodeWidgetValue(ckptNode, 'ckpt_name', v, true)
    },

    'cfg scale'(v: any) {
      setNodeWidgetValue(samplerNode, 'cfg', +v)
    },

    'clip skip'(v: any) {
      setNodeWidgetValue(clipSkipNode, 'stop_at_clip_layer', -v)
    },

    'sampler'(v: string) {
      let name = v.toLowerCase().replace('++', 'pp').replaceAll(' ', '_')
      if (name.includes('karras')) {
        name = name.replace('karras', '').replace(/_+$/, '')
        setNodeWidgetValue(samplerNode, 'scheduler', 'karras')
      } else {
        setNodeWidgetValue(samplerNode, 'scheduler', 'normal')
      }
      const w = getNodeWidget(samplerNode, 'sampler_name')
      const o = w.options.values.find((w: string) => w === name || w === 'sample_' + name)
      if (o) {
        setNodeWidgetValue(samplerNode, 'sampler_name', o)
      }
    },

    'size'(v: string) {
      const wxh = v.split('x')
      const w = ceil64(+wxh[0])
      const h = ceil64(+wxh[1])
      const hrUp = popOpt('hires upscale')
      const hrSz = popOpt('hires resize')
      let hrMethod = popOpt('hires upscaler')

      setNodeWidgetValue(latentImageNode, 'width', w)
      setNodeWidgetValue(latentImageNode, 'height', h)

      if (hrUp || hrSz) {
        let uw, uh
        if (hrUp) {
          uw = w * hrUp
          uh = h * hrUp
        } else {
          const s = hrSz.split('x')
          uw = +s[0]
          uh = +s[1]
        }

        let upscaleNode
        let latentNode

        if (hrMethod.startsWith('Latent')) {
          latentNode = upscaleNode = LiteGraph.createNode('LatentUpscale')
          graph.add(upscaleNode)
          samplerNode.connect(0, upscaleNode, 0)

          switch (hrMethod) {
            case 'Latent (nearest-exact)':
              hrMethod = 'nearest-exact'
              break
          }
          setNodeWidgetValue(upscaleNode, 'upscale_method', hrMethod, true)
        } else {
          const decode = LiteGraph.createNode('VAEDecodeTiled')
          graph.add(decode)
          samplerNode.connect(0, decode, 0)
          vaeLoaderNode.connect(0, decode, 1)

          const upscaleLoaderNode = LiteGraph.createNode('UpscaleModelLoader')
          graph.add(upscaleLoaderNode)
          setNodeWidgetValue(upscaleLoaderNode, 'model_name', hrMethod, true)

          const modelUpscaleNode = LiteGraph.createNode('ImageUpscaleWithModel')
          graph.add(modelUpscaleNode)
          decode.connect(0, modelUpscaleNode, 1)
          upscaleLoaderNode.connect(0, modelUpscaleNode, 0)

          upscaleNode = LiteGraph.createNode('ImageScale')
          graph.add(upscaleNode)
          modelUpscaleNode.connect(0, upscaleNode, 0)

          const vaeEncodeNode = (latentNode = LiteGraph.createNode('VAEEncodeTiled'))
          graph.add(vaeEncodeNode)
          upscaleNode.connect(0, vaeEncodeNode, 0)
          vaeLoaderNode.connect(0, vaeEncodeNode, 1)
        }

        setNodeWidgetValue(upscaleNode, 'width', ceil64(uw))
        setNodeWidgetValue(upscaleNode, 'height', ceil64(uh))

        hrSamplerNode = LiteGraph.createNode('KSampler')
        graph.add(hrSamplerNode)
        ckptNode.connect(0, hrSamplerNode, 0)
        positiveNode.connect(0, hrSamplerNode, 1)
        negativeNode.connect(0, hrSamplerNode, 2)
        latentNode.connect(0, hrSamplerNode, 3)
        hrSamplerNode.connect(0, vaeNode, 0)
      }
    },

    'steps'(v: any) {
      setNodeWidgetValue(samplerNode, 'steps', +v)
    },

    'seed'(v: any) {
      setNodeWidgetValue(samplerNode, 'seed', +v)
    }
  }

  for (const opt in opts) {
    if (opt in handlers) {
      // @ts-ignore
      handlers[opt](popOpt(opt))
    }
  }

  if (hrSamplerNode) {
    setNodeWidgetValue(hrSamplerNode, 'steps', getNodeWidget(samplerNode, 'steps').value)
    setNodeWidgetValue(hrSamplerNode, 'cfg', getNodeWidget(samplerNode, 'cfg').value)
    setNodeWidgetValue(hrSamplerNode, 'scheduler', getNodeWidget(samplerNode, 'scheduler').value)
    setNodeWidgetValue(hrSamplerNode, 'sampler_name', getNodeWidget(samplerNode, 'sampler_name').value)
    setNodeWidgetValue(hrSamplerNode, 'denoise', +(popOpt('denoising strength') || '1'))
  }

  let n = createLoraNodes(positiveNode, positive, { node: clipSkipNode, index: 0 }, { node: ckptNode, index: 0 })
  positive = n.text
  n = createLoraNodes(negativeNode, negative, n.prevClip, n.prevModel)
  negative = n.text

  setNodeWidgetValue(positiveNode, 'text', replaceEmbeddings(positive))
  setNodeWidgetValue(negativeNode, 'text', replaceEmbeddings(negative))

  graph.arrange()

  for (const opt of ['model hash', 'ensd']) {
    delete opts[opt]
  }

  console.warn('Unhandled parameters:', opts)
}

export const importA1111 = (graph: any, parameters: any, embeddings: any) => {
  const p = parameters.lastIndexOf('\nSteps:')
  if (p<=-1) return

  const opts = parameters.substr(p).split('\n')[1].split(',').reduce((p: any, n: string) => {
    const s = n.split(':')
    p[s[0].trim().toLowerCase()] = s[1].trim()
    return p
  }, {})

  const k = parseImageInfo(parameters)
  let positive = k.prompt || ''
  let negative = k.negative_prompt || ''

  buildGraphFromMetadata(
    graph,
    positive,
    negative,
    embeddings,
    opts
  )
}
