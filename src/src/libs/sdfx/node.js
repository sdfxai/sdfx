import { SDFXCanvas } from './canvas.js'
import { LiteGraph, LCanvas } from '@/components/LiteGraph/'
import { createImageHost, calculateImageGrid } from './imagePreview.js'

const ANIM_PREVIEW_WIDGET = 'sdfx_animation_preview'

function calculateGrid(w, h, n) {
  let columns, rows, cellsize

  if (w > h) {
    cellsize = h
    columns = Math.ceil(w / cellsize)
    rows = Math.ceil(n / columns)
  } else {
    cellsize = w
    rows = Math.ceil(h / cellsize)
    columns = Math.ceil(n / rows)
  }

  while (columns * rows < n) {
    cellsize++
    if (w >= h) {
      columns = Math.ceil(w / cellsize)
      rows = Math.ceil(n / columns)
    } else {
      rows = Math.ceil(h / cellsize)
      columns = Math.ceil(n / rows)
    }
  }

  const cell_size = Math.min(w / columns, h / rows)
  return { cell_size, columns, rows }
}

function is_all_same_aspect_ratio(imgs) {
  // assume: imgs.length >= 2
  let ratio = imgs[0].naturalWidth / imgs[0].naturalHeight

  for (let i = 1; i < imgs.length; i++) {
    let this_ratio = imgs[i].naturalWidth / imgs[i].naturalHeight
    if (ratio != this_ratio) return false
  }

  return true
}

export const SDFXNode = {
  /**
   * get selected or hovered image for node containing images
   */
  getSelectedNodeImage(node) {
    let img = null

    if (node && node.imgs) {
      if (node.imageIndex !== null) {
        img = node.imgs[node.imageIndex]
      } else if (node.hoverIndex !== null) {
        img = node.imgs[node.hoverIndex]
      }
    }

    return img
  },

  getImageTop(node) {
    let shiftY

    if (node.imageOffset != null) {
      shiftY = node.imageOffset
    } else {
      if (node.widgets?.length) {
        const w = node.widgets[node.widgets.length - 1]
        shiftY = w.last_y
        if (w.computeSize) {
          shiftY += w.computeSize()[1] + 4
        }
        else if(w.computedHeight) {
          shiftY += w.computedHeight
        }
        else {
          shiftY += LiteGraph.NODE_WIDGET_HEIGHT + 4
        }
      } else {
        shiftY = node.computeSize()[1]
      }
    }
    return shiftY
  },

  drawBackground(node, ctx, sdfx) {
    if (node.flags.collapsed) return
    if (!sdfx || !sdfx.canvas) return

    const sdfxcanvas = sdfx.canvas

    let imgURLs = []
    let imagesChanged = false

    const output = sdfx.nodegraph.nodeOutputs[node.id + '']
    if (output?.images) {
      node.animatedImages = output?.animated?.find(Boolean)
      if (node.images !== output.images) {
        node.images = output.images
        imagesChanged = true
        imgURLs = imgURLs.concat(
          output.images.map(
            (params) => sdfx.getImageUrl(params)
          )
        )
      }
    }

    const preview = sdfx.preview.nodePreviewImages[String(node.id)]
    if (node.preview !== preview) {
      node.preview = preview
      imagesChanged = true
      if (preview != null) {
        imgURLs.push(preview)
      }
    }

    if (imagesChanged) {
      node.imageIndex = null
      if (imgURLs.length > 0) {
        Promise.all(
          imgURLs.map((src) => {
            return new Promise((r) => {
              const img = new Image()
              img.onload = () => r(img)
              img.onerror = () => r(null)
              img.src = src
            })
          }),
        ).then((imgs) => {
          if (
            (!output || node.images === output.images) &&
            (!preview || node.preview === preview)
          ) {
            node.imgs = imgs.filter(Boolean)
            node.setSizeForImage?.()
            sdfx.graph.setDirtyCanvas(true)
          }
        })
      } else {
        node.imgs = null
      }
    }

    if (node.imgs?.length) {
      const widgetIdx = node.widgets?.findIndex((w) => w.name === ANIM_PREVIEW_WIDGET)

      if (node.animatedImages) {
        // Instead of using the canvas we'll use an IMG
        if (widgetIdx > -1) {
          // Replace content
          const widget = node.widgets[widgetIdx]
          widget.options.host.updateImages(node.imgs)
        } else {
          const host = createImageHost(node)
          node.setSizeForImage(true)
          const widget = node.addDOMWidget(ANIM_PREVIEW_WIDGET, 'img', host.el, {
            host,
            getHeight: host.getHeight,
            onDraw: host.onDraw,
            hideOnZoom: false,
          })
          widget.serializeValue = () => undefined
          widget.options.host.updateImages(node.imgs)
        }
        return
      }

      if (widgetIdx > -1) {
        node.widgets[widgetIdx].onRemove?.()
        node.widgets.splice(widgetIdx, 1)
      }

      const mouse = sdfxcanvas.graph_mouse
      if (!sdfxcanvas.pointer_is_down && node.pointerDown) {
        if (
          mouse[0] === node.pointerDown.pos[0] &&
          mouse[1] === node.pointerDown.pos[1]
        ) {
          node.imageIndex = node.pointerDown.index
        }
        node.pointerDown = null
      }

      let imageIndex = node.imageIndex
      const numImages = node.imgs.length
      if (numImages === 1 && !imageIndex) {
        node.imageIndex = imageIndex = 0
      }

      const top = SDFXNode.getImageTop(node)
      var shiftY = top

      let dw = node.size[0]
      let dh = node.size[1]
      dh -= shiftY

      if (imageIndex == null) {
        let cellWidth, cellHeight, shiftX, cell_padding, cols

        const compact_mode = is_all_same_aspect_ratio(node.imgs)
        if (!compact_mode) {
          // use rectangle cell style and border line
          cell_padding = 2
          const { cell_size, columns, rows } = calculateGrid(
            dw,
            dh,
            numImages,
          )
          cols = columns

          cellWidth = cell_size
          cellHeight = cell_size
          shiftX = (dw - cell_size * cols) / 2
          shiftY = (dh - cell_size * rows) / 2 + top
        } else {
          cell_padding = 0
          const res = calculateImageGrid(node.imgs, dw, dh)
          cellWidth = res.cellWidth
          cellHeight = res.cellHeight
          cols = res.cols
          shiftX = res.shiftX
        }

        let anyHovered = false
        node.imageRects = []
        for (let i = 0; i < numImages; i++) {
          const img = node.imgs[i]
          const row = Math.floor(i / cols)
          const col = i % cols
          const x = col * cellWidth + shiftX
          const y = row * cellHeight + shiftY
          if (!anyHovered) {
            anyHovered = LiteGraph.isInsideRectangle(
              mouse[0],
              mouse[1],
              x + node.pos[0],
              y + node.pos[1],
              cellWidth,
              cellHeight,
            )
            if (anyHovered) {
              node.overIndex = i
              let value = 110
              if (sdfxcanvas.pointer_is_down) {
                if (!node.pointerDown || node.pointerDown.index !== i) {
                  node.pointerDown = { index: i, pos: [...mouse] }
                }
                value = 125
              }
              ctx.filter = `contrast(${value}%) brightness(${value}%)`
              sdfxcanvas.canvas.style.cursor = 'pointer'
            }
          }
          node.imageRects.push([x, y, cellWidth, cellHeight])

          let wratio = cellWidth / img.width
          let hratio = cellHeight / img.height
          var ratio = Math.min(wratio, hratio)

          let imgHeight = ratio * img.height
          let imgY = row * cellHeight + shiftY + (cellHeight - imgHeight) / 2
          let imgWidth = ratio * img.width
          let imgX = col * cellWidth + shiftX + (cellWidth - imgWidth) / 2

          ctx.drawImage(
            img,
            imgX + cell_padding,
            imgY + cell_padding,
            imgWidth - cell_padding * 2,
            imgHeight - cell_padding * 2,
          )

          if (!compact_mode) {
            // rectangle cell and border line style
            ctx.strokeStyle = '#8F8F8F'
            ctx.lineWidth = 1
            ctx.strokeRect(
              x + cell_padding,
              y + cell_padding,
              cellWidth - cell_padding * 2,
              cellHeight - cell_padding * 2,
            )
          }

          ctx.filter = 'none'
        }

        if (!anyHovered) {
          node.pointerDown = null
          node.overIndex = null
        }
      } else {
        // Draw individual
        let w = node.imgs[imageIndex].naturalWidth
        let h = node.imgs[imageIndex].naturalHeight

        const scaleX = dw / w
        const scaleY = dh / h
        const scale = Math.min(scaleX, scaleY, 1)

        w *= scale
        h *= scale

        let x = (dw - w) / 2
        let y = (dh - h) / 2 + shiftY
        ctx.drawImage(node.imgs[imageIndex], x, y, w, h)

        if (numImages > 1) {
          if (
            SDFXCanvas.drawImageNodeButton.bind(sdfxcanvas)(
              node,
              10,
              dh + top - 40,
              30,
              `${node.imageIndex + 1} / ${numImages}`,
              ctx
            )
          ) {
            let i = node.imageIndex + 1 >= numImages ? 0 : node.imageIndex + 1
            if (!node.pointerDown || !node.pointerDown.index === i) {
              node.pointerDown = { index: i, pos: [...mouse] }
            }
          }

          if (SDFXCanvas.drawImageNodeButton.bind(sdfxcanvas)(node, dw - 40, top + 10, 30, `X`, ctx)) {
            if (!node.pointerDown || !node.pointerDown.index === null) {
              node.pointerDown = { index: null, pos: [...mouse] }
            }
          }
        }
      }
    }
  }
}