import { LiteGraph, LCanvas } from '@/components/LiteGraph/'

LiteGraph.release_link_on_empty_shows_menu = true
LiteGraph.alt_drag_do_clone_nodes = true

LCanvas.prototype.renderInfo = function (ctx, x, y) {
  x = x || 10
  y = y || 10

  ctx.save()
  ctx.translate(x, y)

  ctx.font = '10px Arial'
  ctx.fillStyle = '#888'
  ctx.textAlign = 'left'
  if (this.graph) {
    ctx.fillText(`NODES: ${this.visible_nodes.length}`, 5, 13 * 1)
    ctx.fillText(`FPS: ${this.fps.toFixed(0)}`, 5, 13 * 2)
  }
  ctx.restore()
}

/**
 * "this" is binded to sdfx.canvas instance
 */
export const SDFXCanvas = {
  processKey(e) {
    const selected_nodes = this.selected_nodes

    let block_default = false

    if (e.type == 'keydown' && !e.repeat) {
      // Ctrl + D dock/undock
      if (e.key === 'd' && e.ctrlKey) {
        if (selected_nodes) {
          for (let i in selected_nodes) {
            selected_nodes[i].docked = !!!selected_nodes[i].docked
            this.graph.nodeUpdate(selected_nodes[i])
          }
        }
        block_default = true
        this.graph.afterChange()
      }

      // Ctrl + M mute/unmute
      if (e.key === 'm' && e.ctrlKey) {
        if (selected_nodes) {
          for (let i in selected_nodes) {
            if (selected_nodes[i].mode === 2) { // never
              selected_nodes[i].mode = 0 // always
            } else {
              selected_nodes[i].mode = 2 // never
            }
            this.graph.nodeUpdate(selected_nodes[i])
          }
        }
        block_default = true
        this.graph.afterChange()
      }

      // Ctrl + B bypass
      if (e.key === 'b' && e.ctrlKey) {
        if (selected_nodes) {
          for (let i in selected_nodes) {
            if (selected_nodes[i].mode === 4) { // bypass
              selected_nodes[i].mode = 0 // always
            } else {
              selected_nodes[i].mode = 4 // bypass
            }
            this.graph.nodeUpdate(selected_nodes[i])
          }
        }
        block_default = true
        this.graph.afterChange()
      }

      // Alt + C collapse/uncollapse
      if (e.key === 't' && e.ctrlKey) {
        if (selected_nodes) {
          for (let i in selected_nodes) {
            selected_nodes[i].collapse()
            this.graph.nodeUpdate(selected_nodes[i])
          }
        }
        block_default = true
        this.graph.afterChange()
      }

      // Ctrl+C Copy
      if ((e.key === 'c') && (e.metaKey || e.ctrlKey)) {
        return true
      }

      // Ctrl+V Paste
      if ((e.key === 'v' || e.key == 'V') && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        return true
      }

    }

    if (block_default) {
      e.preventDefault()
      e.stopImmediatePropagation()
    }

    return block_default
  },

  /**
   * draw additional node details based on out graph state
   * (running, progress, error ...)
   */
  drawNodeShapeStatus(node, ctx, size, fgcolor, bgcolor, selected, mouse_over, nodegraphStatus, progress, dragOverNode) {
    if (!nodegraphStatus) return

    const nodeErrors = nodegraphStatus.lastNodeErrors?.[node.id]
    const radius = this.round_radius
    const th = LiteGraph.NODE_TITLE_HEIGHT
    let color = null
    let lineWidth = 5

    if (node.id === +nodegraphStatus.runningNodeId) {
      color = '#96ce4c'
    } else if (dragOverNode && node.id === dragOverNode.id) {
      color = '#4299e1'
    } else if (nodeErrors?.errors) {
      color = 'red'
      lineWidth = 2
    } else if (nodegraphStatus.lastExecutionError && +nodegraphStatus.lastExecutionError.node_id === node.id) {
      color = '#f0f'
      lineWidth = 2
    }

    if (color) {
      const shape = node._shape || node.constructor.shape || LiteGraph.ROUND_SHAPE
      ctx.lineWidth = lineWidth
      ctx.globalAlpha = 0.8
      ctx.beginPath()

      if (shape === LiteGraph.BOX_SHAPE) {
        ctx.rect(-6, -6 - th, 12 + size[0] + 1, 12 + size[1] + th)
      } else if (shape === LiteGraph.ROUND_SHAPE || (shape === LiteGraph.CARD_SHAPE && node.flags.collapsed)) {
        // console.log(-6, -6 - th, 12 + size[0] + 1, 12 + size[1] + th, radius * 2)
        ctx.roundRect(-6, -6 - th, 12 + size[0] + 1, 12 + size[1] + th, radius * 2)
      } else if (shape === LiteGraph.CARD_SHAPE) {
        ctx.roundRect(-6, -6 - th, 12 + size[0] + 1, 12 + size[1] + th, [
          radius * 2,
          radius * 2,
          2,
          2,
        ])
      } else if (shape === LiteGraph.CIRCLE_SHAPE) {
        ctx.arc(size[0] * 0.5, size[1] * 0.5, size[0] * 0.5 + 6, 0, Math.PI * 2)
      }
      
      ctx.strokeStyle = color
      ctx.stroke()
      ctx.strokeStyle = fgcolor
      ctx.globalAlpha = 1
    }

    /* display progress bar */
    if (progress && progress.runningNodeId && node.id === +nodegraphStatus.runningNodeId) {
      ctx.fillStyle = '#38bec9'
      ctx.fillRect(0, 0, size[0] * (progress.currentStep / progress.totalSteps), 6)
      ctx.fillStyle = bgcolor
    }

    // Highlight inputs that failed validation
    if (nodeErrors) {
      ctx.lineWidth = 2
      ctx.strokeStyle = 'red'
      for (const error of nodeErrors.errors) {
        if (error.extra_info && error.extra_info.input_name) {
          const inputIndex = node.findInputSlot(error.extra_info.input_name)
          if (inputIndex !== -1) {
            let pos = node.getConnectionPos(true, inputIndex)
            ctx.beginPath()
            ctx.arc(pos[0] - node.pos[0], pos[1] - node.pos[1], 12, 0, 2 * Math.PI, false)
            ctx.stroke()
          }
        }
      }
    }
  },

  /**
   * update node when its muted or bypassed
   */
  beforeDrawNode(node, ctx) {
    node.__state__ = {
      editor_alpha: this.editor_alpha,
      bgcolor: node.bgcolor
    }

    // docked node
    if (node.docked) {
      node.color = '#507b2e80'
      node.bgcolor = '#35581980'
    } else {
      node.color = null
    }

    // muted node
    if (node.mode === 2) {
      this.editor_alpha = 0.40
    }

    // bypassed node
    if (node.mode === 4) {
      node.bgcolor = '#d946ef'
      this.editor_alpha = 0.20
    }    
  },

  drawGroupHeaders(ctx) {
    if (!this.graph) {
      return
    }

    const groups = this.graph._groups

    ctx.save()
    ctx.globalAlpha = 0.7 * this.editor_alpha

    for (let i = 0; i < groups.length; ++i) {
      const group = groups[i]
      const pos = group._pos
      const size = group._size
      const font_size = group.font_size || LiteGraph.DEFAULT_GROUP_FONT_SIZE

      if (!LiteGraph.overlapBounding(this.visible_area, group._bounding)) {
        continue
      } //out of the visible area

      ctx.fillStyle = group.color || '#335'
      ctx.strokeStyle = group.color || '#335'
      ctx.globalAlpha = 0.10 * this.editor_alpha
      ctx.beginPath()
      ctx.rect(pos[0] + 0.5, pos[1] + 0.5, size[0], 3+font_size * 1.4)
      ctx.fill()
      ctx.globalAlpha = this.editor_alpha
    }

    ctx.restore()
  },

  /**
   */
  afterDrawNode(node, ctx) {
    if (node.__state__) {
      this.editor_alpha = node.__state__.editor_alpha
      node.bgcolor = node.__state__.bgcolor
      delete node.__state__
    }
  },

  /**
   * draw button on image nodes (x, and also 1/4 etc ... when multiple images)
   * canvas: instance of sdfx canvas
   */
  drawImageNodeButton (node, x, y, sz, text, ctx) {
    let fill = '#0a1016dd'
    let textFill = '#ffffff'
    let isClicking = false
    const mouse = this.graph_mouse

    const hovered = LiteGraph.isInsideRectangle(
      mouse[0],
      mouse[1],
      x + node.pos[0],
      y + node.pos[1],
      sz,
      sz,
    )

    if (hovered) {
      this.canvas.style.cursor = 'pointer'
      if (this.pointer_is_down) {
        fill = '#14919b'
        isClicking = true
      } else {
        fill = '#14919b'
        textFill = '#ffffff'
      }
    } else {
      node.pointerWasDown = null
    }

    ctx.fillStyle = fill
    ctx.beginPath()
    ctx.roundRect(x, y, sz, sz, [4])
    ctx.fill()
    ctx.fillStyle = textFill
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(text, x + 15, y + 20)

    return isClicking
  }
}