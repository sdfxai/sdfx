import { useGraphStore, storeToRefs } from '@/stores'

export const ClipSpace = {
  isEmpty() {
    const { clipspace } = storeToRefs(useGraphStore())
    const c = clipspace.value
    return !c || (c.widgets===null && c.imgs===null && c.images===null)
  },

  getContent() {
    const { clipspace } = storeToRefs(useGraphStore())
    return clipspace.value
  },

  /**
   *  pathObj = {
   *    filename: filename,
   *    subfolder: ' ... ',
   *    type: 'input'
   *  }
   */
  updateSelectedImage(pathObj, url) {
    const clipspace = ClipSpace.getContent()
    const idx = clipspace.selectedIndex

    clipspace.imgs[idx] = url

    if (clipspace.images) {
      clipspace.images[idx] = pathObj
    }

    console.log('CLIPSPACE: updateSelectedImage', pathObj, url)
  },

  /**
   *  const pathObj = {
   *    filename: filename,
   *    subfolder: 'clipspace',
   *    type: 'input'
   *  }
   */
  updateNodeMask(pathObj) {
    const clipspace = ClipSpace.getContent()

    if (clipspace.images) {
      clipspace.images[0] = pathObj
    }

    if (clipspace.widgets) {
      const i = clipspace.widgets.findIndex(o => o.name === 'image')
      if (i>-1) clipspace.widgets[i].value = pathObj
    }
  },

  /**
   * clear clipspace
   */
  clear() {
    const { clipspace } = storeToRefs(useGraphStore())

    clipspace.value = {
      widgets: null,
      imgs: null,
      original_imgs: null,
      images: null,
      selectedIndex: null,
      img_paste_mode: null
    }    
  },

  /**
   * copy node details to clipspace
   */
  copy(node) {
    const { clipspace } = storeToRefs(useGraphStore())

    let widgets = null

    if (node.widgets) {
      widgets = node.widgets.map(({ type, name, value }) => ({ type, name, value }))
    }

    let imgs
    let orig_imgs

    if (node.imgs) {
      imgs = []
      orig_imgs = []

      for (let i=0; i<node.imgs.length; i++) {
        imgs[i] = node.imgs[i].src
        orig_imgs[i] = node.imgs[i].src
      }
    }

    let selectedIndex = 0
    if (node.imageIndex) {
      selectedIndex = node.imageIndex
    }

    clipspace.value = {
      widgets: widgets,
      imgs: imgs,
      original_imgs: orig_imgs,
      images: node.images,
      selectedIndex: selectedIndex,
      img_paste_mode: 'selected'
    }

    this.return_node = null
  },

  pasteImages(node) {
    const copy = this.getContent()
    if (!copy.imgs || !node.imgs) return

    const { nodegraph } = storeToRefs(useGraphStore())
    const nodeOutputs = nodegraph.value.nodeOutputs

    if (node.images && copy.images) {
      if (copy['img_paste_mode'] === 'selected') {
        node.images = [copy.images[copy.selectedIndex]]
      } else {
        node.images = copy.images
      }

      const id = String(node.id)
      if (nodeOutputs[id]) {
        nodeOutputs[id].images = node.images
      }
    }

    if (copy.imgs) {
      // deep-copy to cut link with clipspace
      if (copy['img_paste_mode'] === 'selected') {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = copy.imgs[copy.selectedIndex]
        node.imgs = [img]
        node.imageIndex = 0
      } else {
        const imgs = []
        for (let i = 0; i < copy.imgs.length; i++) {
          imgs[i] = new Image()
          imgs[i].src = copy.imgs[i]
          node.imgs = imgs
        }
      }
    }
  },

  pasteWidgets(node) {
    if (!node.widgets) return false

    const copy = this.getContent()

    if (copy.images) {
      const clip_image = copy.images[copy.selectedIndex]
      const index = node.widgets.findIndex((obj) => obj.name === 'image')

      if (index >= 0) {
        const widget = node.widgets[index]
        if (widget.type !== 'image' && typeof widget.value === 'string' && clip_image.filename) {
          widget.value = (clip_image.subfolder ? clip_image.subfolder + '/' : '') + clip_image.filename + (clip_image.type ? ` [${clip_image.type}]` : '')
        } else {
          widget.value = clip_image
        }
      }
    }

    if (copy.widgets) {
      copy.widgets.forEach(({ type, name, value }) => {
        const widget = Object.values(node.widgets).find((obj) => obj.type === type && obj.name === name)
        if (widget && widget.type !== 'button') {
          if (widget.type !== 'image' && typeof widget.value === 'string' && value.filename) {
            widget.value = (value.subfolder ? value.subfolder + '/' : '') + value.filename + (value.type ? ` [${value.type}]` : '')
          } else {
            widget.value = value
            widget.callback(value)
          }
        }
      })
    }
  },

  /**
   * paste node details from clipspace
   */
  paste(node) {
    this.pasteImages(node)
    this.pasteWidgets(node)
  }
}