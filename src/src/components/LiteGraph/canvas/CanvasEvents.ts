// @ts-ignore
import { LCanvas } from '../LCanvas';
import { LiteGraph } from '../LiteGraph'
import { distance } from '../helpers/Intersect'
import { showConnectionMenu } from './dialogs/ConnectionMenu';
import { showSearchBox } from './dialogs/Search';

export class CanvasEvents {
  private _mouseup_callback: any
  private _mousemove_callback: any
  private _mousewheel_callback: any
  private _mousedown_callback: any
  private _key_callback: any
  private _ondrop_callback: any

  private _events_binded = false

  constructor(public lcanvas: LCanvas) {}

  /**
   * binds mouse, keyboard, touch and drag events to the canvas
   * @method bindEvents
   **/
  bindEvents() {
    if (this._events_binded) {
      console.warn('LCanvas: events already binded')
      return
    }

    const canvas = this.lcanvas.canvas

    const ref_window = this.lcanvas.getCanvasWindow()
    const document = ref_window.document //hack used when moving canvas between windows

    this._mousedown_callback = (e: any) => this.processMouseDown(e)
    this._mousewheel_callback = (e: any) => this.processMouseWheel(e)
    this._mousemove_callback = (e: any) => this.processMouseMove(e)
    this._mouseup_callback = (e: any) => this.processMouseUp(e)

    LiteGraph.pointerListenerAdd(canvas, 'down', this._mousedown_callback, true) //down do not need to store the binded
    canvas.addEventListener('mousewheel', this._mousewheel_callback, {passive: false})

    LiteGraph.pointerListenerAdd(canvas, 'up', this._mouseup_callback, true) // CHECK: ??? binded or not
    LiteGraph.pointerListenerAdd(canvas, 'move', this._mousemove_callback)

    canvas.addEventListener('contextmenu', this.lcanvas._doNothing)
    canvas.addEventListener('DOMMouseScroll', this._mousewheel_callback, false)

    // working touch events ;-)
    canvas.addEventListener("touchstart", this._mousedown_callback, {passive: false})
    canvas.addEventListener("touchmove", this._mousemove_callback, {passive: false})
    canvas.addEventListener("touchend", this._mouseup_callback, {passive: false})

    //Keyboard ******************
    this._key_callback = (e: any) => this.processKey(e)

    canvas.addEventListener('keydown', this._key_callback, true)
    document.addEventListener('keyup', this._key_callback, true) //in document, otherwise it doesn't fire keyup

    //Dropping Stuff over nodes ************************************
    this._ondrop_callback = (e: any) => this.processDrop(e)

    canvas.addEventListener('dragover', this.lcanvas._doNothing, false)
    canvas.addEventListener('dragend', this.lcanvas._doNothing, false)
    canvas.addEventListener('drop', this._ondrop_callback, false)
    canvas.addEventListener('dragenter', this.lcanvas._doReturnTrue, false)

    this._events_binded = true
  }

  /**
   * unbinds mouse events from the canvas
   * @method unbindEvents
   **/
  unbindEvents() {
    if (!this._events_binded) {
      console.warn('LCanvas: no events binded')
      return
    }

    //console.log("pointerevents: unbindEvents");

    const ref_window = this.lcanvas.getCanvasWindow()
    const document = ref_window.document

    LiteGraph.pointerListenerRemove(this.lcanvas.canvas, 'move', this._mousedown_callback)
    LiteGraph.pointerListenerRemove(this.lcanvas.canvas, 'up', this._mousedown_callback)
    LiteGraph.pointerListenerRemove(this.lcanvas.canvas, 'down', this._mousedown_callback)

    this.lcanvas.canvas.removeEventListener('mousewheel', this._mousewheel_callback)

    this.lcanvas.canvas.removeEventListener('DOMMouseScroll', this._mousewheel_callback)

    this.lcanvas.canvas.removeEventListener('keydown', this._key_callback)

    document.removeEventListener('keyup', this._key_callback)
    this.lcanvas.canvas.removeEventListener('contextmenu', this.lcanvas._doNothing)
    this.lcanvas.canvas.removeEventListener('drop', this._ondrop_callback)
    this.lcanvas.canvas.removeEventListener('dragenter', this.lcanvas._doReturnTrue)

    //touch events -- THIS WAY DOES NOT WORK, finish implementing pointerevents, than clean the touchevents
    /*this.lcanvas.canvas.removeEventListener("touchstart", this.lcanvas._touch_callback );
    this.lcanvas.canvas.removeEventListener("touchmove", this.lcanvas._touch_callback );
    this.lcanvas.canvas.removeEventListener("touchend", this.lcanvas._touch_callback );
    this.lcanvas.canvas.removeEventListener("touchcancel", this.lcanvas._touch_callback );*/

    this._mousedown_callback = null
    this._mousewheel_callback = null
    this._key_callback = null
    this._ondrop_callback = null

    this._events_binded = false
  }

  /**
   * Called when a mouse up event has to be processed
   * @method processMouseUp
   **/
  processMouseUp(e: any) {
    const is_primary = e.isPrimary === undefined || e.isPrimary
  
    if (this.lcanvas._initialPinchDistance) {
      this.lcanvas._initialPinchDistance = null
    }
  
    //early exit for extra pointer
    if (!is_primary) {
      return false
    }
  
    if (this.lcanvas.set_canvas_dirty_on_mouse_event) {
      this.lcanvas.dirty_canvas = true
    }
  
    if (!this.lcanvas.graph) return
  
    const window = this.lcanvas.getCanvasWindow()
    const document = window.document
    LCanvas.active_canvas = this.lcanvas
  
    //restore the mousemove event back to the canvas
    if (!this.lcanvas.options?.skip_events) {
      LiteGraph.pointerListenerRemove(document, 'move', this._mousemove_callback, true)
      LiteGraph.pointerListenerAdd(this.lcanvas.canvas, 'move', this._mousemove_callback, true)
      LiteGraph.pointerListenerRemove(document, 'up', this._mouseup_callback, true)
    }
  
    this.lcanvas.adjustMouseEvent(e)
    const now = LiteGraph.getTime()
    e.click_time = now - this.lcanvas.last_mouseclick
    this.lcanvas.last_mouse_dragging = false
    this.lcanvas.last_click_position = null
  
    if (this.lcanvas.block_click) {
      //console.log("pointerevents: processMouseUp block_clicks");
      this.lcanvas.block_click = false //used to avoid sending twice a click in a immediate button
    }
  
    let what = e.which
  
    const isMobile = e.touches && e.touches[0]
    if (isMobile) {
      switch (e.touches.length) {
        case 1:
          what = 1 
          break
        case 2:
          what = 2
          break
        case 3:
          what = 3
          break
        default:
          console.log("Not supported")
          break
      }
    }
  
    if (what === 1) {
      if (this.lcanvas.node_widget) {
        this.lcanvas.processNodeWidgets(this.lcanvas.node_widget[0], this.lcanvas.graph_mouse, e)
      }
  
      //left button
      this.lcanvas.node_widget = null
  
      if (this.lcanvas.selected_group) {
        this.selectedGroupReleaseEventHandler(e)
      }
      this.lcanvas.selected_group_resizing = false
  
      const node = this.lcanvas.graph.getNodeOnPos(
        e.canvasX,
        e.canvasY,
        this.lcanvas.visible_nodes
      )
  
      if (this.lcanvas.dragging_rectangle) {
        this.draggingSelectionReleaseEventHandler(e, node)
      } else if (this.lcanvas.connecting_node) {
        this.draggingLinkReleaseEventHandler(e, node)
      } else if (this.lcanvas.resizing_node) {
        this.resizingNodeReleaseEventHandler(e)
      } else if (this.lcanvas.node_dragged) {
        this.nodePointerReleaseEventHandler(e, this.lcanvas.node_dragged)
      } else {
        this.canvasPointerReleaseEventHandler(e, node)
      }
    }
  
    if (what===2 || what===3) {
      this.lcanvas.dirty_canvas = true
      this.lcanvas.dragging_canvas = false
    }
  
    if (is_primary) {
      this.lcanvas.pointer_is_down = false
      this.lcanvas.pointer_is_double = false
    }
  
    this.lcanvas.is_selecting = null
    this.lcanvas.graph.change()
  
    //e.stopPropagation()
    e.preventDefault()
    return false
  }

  /**
   * mouseup after resizing a node
   */
  private resizingNodeReleaseEventHandler(e: any) {
    this.lcanvas.dirty_canvas = true
    this.lcanvas.dirty_bgcanvas = true
    this.lcanvas.graph.afterChange(this.lcanvas.resizing_node)
    this.lcanvas.resizing_node = null
  }

  /**
   * if group is selected
   */
  private selectedGroupReleaseEventHandler(e: any) {
    const gx = this.lcanvas.selected_group.pos[0]
    const gy = this.lcanvas.selected_group.pos[1]
    const diffx = gx - Math.round(gx)
    const diffy = gy - Math.round(gy)
  
    this.lcanvas.selected_group.move(diffx, diffy, e.ctrlKey)
    this.lcanvas.selected_group.pos[0] = Math.round(gx)
    this.lcanvas.selected_group.pos[1] = Math.round(gy)
  
    if (this.lcanvas.selected_group._nodes.length) {
      this.lcanvas.dirty_canvas = true
    }
  
    this.lcanvas.selected_group = null
  }

  /**
   * mouseup after dragging selection (to select nodes)
   */
  private draggingSelectionReleaseEventHandler(e: any, node: any) {
    if (!this.lcanvas.graph) {
      this.lcanvas.dragging_rectangle = null
      return
    }

    const nodes = this.lcanvas.graph._nodes
    const node_bounding = new Float32Array(4)

    //compute bounding and flip if left to right
    const w = Math.abs(this.lcanvas.dragging_rectangle[2])
    const h = Math.abs(this.lcanvas.dragging_rectangle[3])
    const startx = this.lcanvas.dragging_rectangle[2] < 0 ? this.lcanvas.dragging_rectangle[0] - w : this.lcanvas.dragging_rectangle[0]
    const starty = this.lcanvas.dragging_rectangle[3] < 0 ? this.lcanvas.dragging_rectangle[1] - h : this.lcanvas.dragging_rectangle[1]

    this.lcanvas.dragging_rectangle[0] = startx
    this.lcanvas.dragging_rectangle[1] = starty
    this.lcanvas.dragging_rectangle[2] = w
    this.lcanvas.dragging_rectangle[3] = h

    this.lcanvas.is_selecting = true

    // test dragging rect size, if minimun simulate a click
    if (!node || (w > 10 && h > 10)) {
      //test against all nodes (not visible because the rectangle maybe start outside
      const to_select = []
      for (let i=0; i<nodes.length; ++i) {
        const nodeX = nodes[i]
        nodeX.getBounding(node_bounding)
        if (!LiteGraph.overlapBounding(this.lcanvas.dragging_rectangle, node_bounding)) {
          continue
        } //out of the visible area
        to_select.push(nodeX)
      }
      if (to_select.length) {
        this.lcanvas.selectNodes(to_select, e.shiftKey) // add to selection with shift
      }
    } else {
      // will select of update selection
      this.lcanvas.selectNodes([node], e.shiftKey || e.ctrlKey) // add to selection with ctrlKey or shiftKey
    }

    this.lcanvas.dragging_rectangle = null
  }

  /**
   * mouseup: dragging link, shows menu if released in empty space
   * or connect to the node below mouse
   */
  private draggingLinkReleaseEventHandler(e: any, node: any) {
    //dragging a connection
    this.lcanvas.dirty_canvas = true
    this.lcanvas.dirty_bgcanvas = true

    const connInOrOut = this.lcanvas.connecting_output || this.lcanvas.connecting_input
    const connType = connInOrOut.type

    //node below mouse
    if (node) {
      this.connectNodeReleaseEventHandler(e, node, connType)
    } else {
      // show menu when releasing link in empty space
      if (LiteGraph.release_link_on_empty_shows_menu) {
        this.showLinkMenuReleaseEventHandler(e, node)
      }
    }

    this.lcanvas.connecting_output = null
    this.lcanvas.connecting_input = null
    this.lcanvas.connecting_pos = null
    this.lcanvas.connecting_node = null
    this.lcanvas.connecting_slot = -1
  }


  /**
   * mouseup on a node
   */
  private nodePointerReleaseEventHandler(e: any, node: any) {
    const isMobile = e.touches && e.touches[0]
    const x = isMobile ? e.touches[0].clientX : e.clientX
    const y = isMobile ? e.touches[0].clientY : e.clientY
    const dist = distance([x, y], [this.lcanvas.mousedown_mouse[0], this.lcanvas.mousedown_mouse[1]])

    /**
     * check if it was a simple click on a node or a drag
     */
    if (node && dist<=1) {
      if (e.click_time<800) {
        /* normal click */
        this.nodeClickEventHandler(e, node)
      } else {
        /* long touch (at least 800ms) */
        this.nodeLongTouchEventHandler(e, node)
      }
    }

    /**
     * our node may has been removed by nodeClickEventHandler
     * if user clicked on close button, in that case we return
     */
    if (!this.lcanvas.node_dragged) return

    if (dist>1) {
      this.lcanvas.dirty_canvas = true
      this.lcanvas.dirty_bgcanvas = true

      this.lcanvas.node_dragged.pos[0] = Math.round(this.lcanvas.node_dragged.pos[0])
      this.lcanvas.node_dragged.pos[1] = Math.round(this.lcanvas.node_dragged.pos[1])

      if (this.lcanvas.graph.config.align_to_grid || this.lcanvas.align_to_grid) {
        this.lcanvas.node_dragged.alignToGrid()
      }

      if (this.lcanvas.onNodeMoved) {
        this.lcanvas.onNodeMoved(this.lcanvas.node_dragged)
      }

      this.lcanvas.graph.afterChange(this.lcanvas.node_dragged)
    }

    this.lcanvas.node_dragged = null
  }

  /**
   * mouseup on nothing on the canvas 
   */
  private canvasPointerReleaseEventHandler(e: any, node: any) {
    const isMobile = e.touches && e.touches[0]
    const x = isMobile ? e.touches[0].clientX : e.clientX
    const y = isMobile ? e.touches[0].clientY : e.clientY

    if (!this.lcanvas.mousedown_mouse) return

    const dist = distance([x, y], [
      this.lcanvas.mousedown_mouse[0],
      this.lcanvas.mousedown_mouse[1]]
    )

    /**
     * check if it was a simple click on a the canvas
     */
    if (!node && dist<=1) {
      if (e.click_time<800) {
        /* normal click */
        this.canvasClickEventHandler(e)
      } else {
        /* long touch (at least 800ms) */
        this.canvasLongTouchEventHandler(e)
      }
    }

    this.lcanvas.dirty_canvas = true
    this.lcanvas.dragging_canvas = false

    if (this.lcanvas.node_over && this.lcanvas.node_over.onMouseUp) {
      this.lcanvas.node_over.onMouseUp(e, [e.canvasX - this.lcanvas.node_over.pos[0], e.canvasY - this.lcanvas.node_over.pos[1]], this.lcanvas)
    }
    if (this.lcanvas.node_capturing_input && this.lcanvas.node_capturing_input.onMouseUp) {
      this.lcanvas.node_capturing_input.onMouseUp(e, [e.canvasX - this.lcanvas.node_capturing_input.pos[0], e.canvasY - this.lcanvas.node_capturing_input.pos[1]])
    }
  }

  processMouseDown(e: any) {
    if (this.lcanvas.set_canvas_dirty_on_mouse_event) {
      this.lcanvas.dirty_canvas = true
    }
  
    if (this.lcanvas.currentPromptDialog) {
      this.lcanvas.currentPromptDialog.close()
    }
    if (this.lcanvas.currentSearchDialog) {
      this.lcanvas.currentSearchDialog.close()
    }
  
    if (!this.lcanvas.graph) {
      return
    }
  
    this.lcanvas.adjustMouseEvent(e)
  
    const ref_window = this.lcanvas.getCanvasWindow()
    const document = ref_window.document
    LCanvas.active_canvas = this.lcanvas
  
    const isMobile = e.touches && e.touches[0]
    const x = isMobile ? e.touches[0].clientX : e.clientX
    const y = isMobile ? e.touches[0].clientY : e.clientY
  
    if (isMobile && e.touches.length === 2) {
      const x1 = e.touches[0].clientX
      const y1 = e.touches[0].clientY
      const x2 = e.touches[1].clientX
      const y2 = e.touches[1].clientY
      this.lcanvas._initialPinchDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
  
    this.lcanvas.ds.viewport = this.lcanvas.viewport
  
    const is_inside =
      !this.lcanvas.viewport || (this.lcanvas.viewport && x >= this.lcanvas.viewport[0] && x < this.lcanvas.viewport[0] + this.lcanvas.viewport[2] && y >= this.lcanvas.viewport[1] && y < this.lcanvas.viewport[1] + this.lcanvas.viewport[3])
  
    //move mousemove event to the document in case it drags outside of the canvas
    if (!this.lcanvas.options?.skip_events) {
      LiteGraph.pointerListenerAdd(ref_window.document, 'up', this._mouseup_callback, true)
      LiteGraph.pointerListenerAdd(ref_window.document, 'move', this._mousemove_callback, true) //catch for the entire window
      LiteGraph.pointerListenerRemove(this.lcanvas.canvas, 'move', this._mousemove_callback)
    }
  
    if (!is_inside) {
      return
    }
  
    let node = this.lcanvas.graph.getNodeOnPos(e.canvasX, e.canvasY, this.lcanvas.visible_nodes, 5)
    const skip_dragging = false
    let skip_action = false
    const now = LiteGraph.getTime()
  
    const is_primary = e.isPrimary === undefined || !e.isPrimary
    const is_double_click = now - this.lcanvas.last_mouseclick < 300 && is_primary
  
    this.lcanvas.mousedown_mouse = [x, y]
  
    this.lcanvas.mouse[0] = x
    this.lcanvas.mouse[1] = y
    this.lcanvas.graph_mouse[0] = e.canvasX
    this.lcanvas.graph_mouse[1] = e.canvasY
    this.lcanvas.last_click_position = [this.lcanvas.mouse[0], this.lcanvas.mouse[1]]
  
    /* handle multytouch */
    if (this.lcanvas.pointer_is_down && is_primary) {
      this.lcanvas.pointer_is_double = true
      //console.log("pointerevents: pointer_is_double start");
    } else {
      this.lcanvas.pointer_is_double = false
    }
    this.lcanvas.pointer_is_down = true
  
    this.lcanvas.canvas.focus()
  
    LiteGraph.closeAllContextMenus(ref_window)
  
    if (this.lcanvas.onMouse) {
      if (this.lcanvas.onMouse(e)) return
    }
  
    let what = e.which
  
    if (isMobile) {
      switch (e.touches.length) {
        case 1:
          what = 1 
          break
        case 2:
          what = 2
          break
        case 3:
          what = 3
          break
        default:
          console.log("Not supported")
          break
      }
    }
  
    let block_drag_node = false
    const numSelectedNodes = Object.keys(this.lcanvas.selected_nodes).length
  
    //left button mouse / single finger
    if (what === 1 && !this.lcanvas.pointer_is_double) {
      if (e.ctrlKey || (this.lcanvas.tool==='select' && numSelectedNodes<=0)) {
        this.lcanvas.dragging_rectangle = new Float32Array(4)
        this.lcanvas.dragging_rectangle[0] = e.canvasX
        this.lcanvas.dragging_rectangle[1] = e.canvasY
        this.lcanvas.dragging_rectangle[2] = 1
        this.lcanvas.dragging_rectangle[3] = 1
        skip_action = true
      }
  
      // clone node ALT dragging
      if (LiteGraph.alt_drag_do_clone_nodes && e.altKey && node && this.lcanvas.allow_interaction && !skip_action && !this.lcanvas.read_only) {
        let cloned = node.clone()
        if (cloned) {
          cloned.pos[0] += 5
          cloned.pos[1] += 5
          this.lcanvas.graph.add(cloned, false, { doCalcSize: false })
          node = cloned
          skip_action = true

          if (!block_drag_node) {
            if (this.lcanvas.allow_dragnodes) {
              this.lcanvas.graph.beforeChange()
              this.lcanvas.node_dragged = node
            }
            if (!this.lcanvas.selected_nodes[node.id]) {
              this.lcanvas.processNodeSelected(node, e)
            }
          }
        }
      }
  
      /*
      unselect on pointer down
      if (!skip_action && !this.lcanvas.dragging_canvas && !node) {
        this.lcanvas.deselectAllNodes()
      }
      */
  
      let clicking_canvas_bg = false
  
      //when clicked on top of a node
      //and it is not interactive
      if (node && (this.lcanvas.allow_interaction || node.flags.allow_interaction) && !skip_action && !this.lcanvas.read_only) {
        if (!this.lcanvas.live_mode && !node.flags.pinned) {
          this.lcanvas.bringToFront(node)
        } //if it wasn't selected?
  
        //not dragging mouse to connect two slots
        if (this.lcanvas.allow_interaction && !this.lcanvas.connecting_node && !node.flags.collapsed && !this.lcanvas.live_mode) {
          //Search for corner for resize
          const inCorner = node.inResizeCorner(e.canvasX, e.canvasY)
          if (!skip_action && node.resizable !== false && inCorner.result) {
            this.lcanvas.graph.beforeChange()
            this.lcanvas.resizing_node = node
            this.lcanvas.resizing_corner = inCorner.corner
            this.lcanvas.resizing_node.setResizeHandle(e.canvasX, e.canvasY);
            this.lcanvas.canvas.style.cursor = `${inCorner.corner}-resize`
            skip_action = true
          } else {
            //search for outputs
            if (node.outputs) {
              for (let i = 0, l = node.outputs.length; i < l; ++i) {
                const output = node.outputs[i]
                const link_pos = node.getConnectionPos(false, i)
                if (LiteGraph.isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 15, link_pos[1] - 10, 30, 20)) {
                  this.lcanvas.connecting_node = node
                  this.lcanvas.connecting_output = output
                  this.lcanvas.connecting_output.slot_index = i
                  this.lcanvas.connecting_pos = node.getConnectionPos(false, i)
                  this.lcanvas.connecting_slot = i
  
                  if (LiteGraph.shift_click_do_break_link_from) {
                    if (e.shiftKey) {
                      node.disconnectOutput(i)
                    }
                  }
  
                  if (is_double_click) {
                    if (node.onOutputDblClick) {
                      node.onOutputDblClick(i, e)
                    }
                  } else {
                    if (node.onOutputClick) {
                      node.onOutputClick(i, e)
                    }
                  }
  
                  skip_action = true
                  break
                }
              }
            }
  
            //search for inputs
            if (node.inputs) {
              for (let i = 0, l = node.inputs.length; i < l; ++i) {
                const input = node.inputs[i]
                const link_pos = node.getConnectionPos(true, i)
                if (LiteGraph.isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 15, link_pos[1] - 10, 30, 20)) {
                  if (is_double_click) {
                    if (node.onInputDblClick) {
                      node.onInputDblClick(i, e)
                    }
                  } else {
                    if (node.onInputClick) {
                      node.onInputClick(i, e)
                    }
                  }
  
                  if (input.link !== null) {
                    const link_info = this.lcanvas.graph.links[input.link] //before disconnecting
                    if (LiteGraph.click_do_break_link_to) {
                      node.disconnectInput(i)
                      this.lcanvas.dirty_bgcanvas = true
                      skip_action = true
                    } else {
                      // do same action as has not node ?
                    }
  
                    if (this.lcanvas.allow_reconnect_links || e.shiftKey) {
                      if (!LiteGraph.click_do_break_link_to) {
                        node.disconnectInput(i)
                      }
  
                      if (link_info) {
                        this.lcanvas.connecting_node = this.lcanvas.graph._nodes_by_id[link_info?.origin_id]
                        this.lcanvas.connecting_slot = link_info.origin_slot
                      }
  
                      this.lcanvas.connecting_output = this.lcanvas.connecting_node.outputs[this.lcanvas.connecting_slot]
                      this.lcanvas.connecting_pos = this.lcanvas.connecting_node.getConnectionPos(false, this.lcanvas.connecting_slot)
                      this.lcanvas.dirty_bgcanvas = true
                      skip_action = true
                    }
                  } else {
                    // has not node
                  }
  
                  if (!skip_action) {
                    // connect from in to out, from to to from
                    this.lcanvas.connecting_node = node
                    this.lcanvas.connecting_input = input
                    this.lcanvas.connecting_input.slot_index = i
                    this.lcanvas.connecting_pos = node.getConnectionPos(true, i)
                    this.lcanvas.connecting_slot = i
  
                    this.lcanvas.dirty_bgcanvas = true
                    skip_action = true
                  }
                }
              }
            }
          } //not resizing
        }
  
        //it wasn't clicked on the links boxes
        if (!skip_action) {
          block_drag_node = false
  
          // disable dragging if node is pinned
          if(node && node.flags && node.flags.pinned) {
            block_drag_node = true
          }

          const pos = [e.canvasX - node.pos[0], e.canvasY - node.pos[1]]
  
          //widgets
          const widget = this.lcanvas.processNodeWidgets(node, this.lcanvas.graph_mouse, e)
          if (widget) {
            block_drag_node = true
            this.lcanvas.node_widget = [node, widget]
          }
  
          //double clicking
          if (this.lcanvas.allow_interaction && is_double_click && this.lcanvas.selected_nodes[node.id]) {
            //double click node
            if (node.onDblClick) {
              node.onDblClick(e, pos, this.lcanvas, widget)
            }
            this.lcanvas.processNodeDblClicked(node, widget)
            block_drag_node = true
          }
  
          //if do not capture mouse
          if (node.onMouseDown && node.onMouseDown(e, pos, this.lcanvas)) {
            block_drag_node = true
          } else {
            //open subgraph button
            if (node.subgraph && !node.skip_subgraph_button) {
              if (!node.flags.collapsed && pos[0] > node.size[0] - LiteGraph.NODE_TITLE_HEIGHT && pos[1] < 0) {
                setTimeout(() => {
                  this.lcanvas.openSubgraph(node.subgraph)
                }, 10)
              }
            }
  
            if (this.lcanvas.live_mode) {
              clicking_canvas_bg = true
              block_drag_node = true
            }
          }
  
          if (!block_drag_node) {
            if (this.lcanvas.allow_dragnodes) {
              this.lcanvas.graph.beforeChange()
              this.lcanvas.node_dragged = node
            }
            this.lcanvas.processNodeSelected(node, e)
          } else {
            // double-click
            /**
             * Don't call the function if the block is already selected.
             * Otherwise, it could cause the block to be unselected while its panel is open.
             */
            if (!node.is_selected) {
              this.lcanvas.processNodeSelected(node, e)
            }
          }
  
          this.lcanvas.dirty_canvas = true
        }
      } else {
        //clicked outside of nodes
        if (!skip_action) {
          //search for link connector
          if (!this.lcanvas.read_only) {
            for (let i = 0; i < this.lcanvas.visible_links.length; ++i) {
              const link = this.lcanvas.visible_links[i]
              const center = link._pos
              if (!center || e.canvasX < center[0] - 4 || e.canvasX > center[0] + 4 || e.canvasY < center[1] - 4 || e.canvasY > center[1] + 4) {
                continue
              }
              //link clicked
              this.lcanvas.showLinkMenu(link, e)
              this.lcanvas.over_link_center = null //clear tooltip
              break
            }
          }
  
          this.lcanvas.selected_group = this.lcanvas.graph.getGroupOnPos(e.canvasX, e.canvasY)
          this.lcanvas.selected_group_resizing = false
          if (this.lcanvas.selected_group && !this.lcanvas.read_only) {
            if (e.ctrlKey) {
              this.lcanvas.dragging_rectangle = null
            }
  
            const dist = distance([e.canvasX, e.canvasY], [this.lcanvas.selected_group.pos[0] + this.lcanvas.selected_group.size[0], this.lcanvas.selected_group.pos[1] + this.lcanvas.selected_group.size[1]])
            if (dist * this.lcanvas.ds.scale < 10) {
              this.lcanvas.selected_group_resizing = true
            } else {
              this.lcanvas.selected_group.recomputeInsideNodes()
            }
          }
  
          if (is_double_click && !this.lcanvas.read_only && this.lcanvas.allow_searchbox) {
            this.lcanvas.currentSearchDialog = showSearchBox(this.lcanvas, e)
            e.preventDefault()
            e.stopPropagation()
          }
  
          clicking_canvas_bg = true
        }
      }
  
      if (!skip_action && clicking_canvas_bg && this.lcanvas.allow_dragcanvas) {
        //console.log("pointerevents: dragging_canvas start");
        this.lcanvas.dragging_canvas = true
      }
    } else if (what === 2) {
      //middle button
  
      if (LiteGraph.middle_click_slot_add_default_node) {
        if (node && this.lcanvas.allow_interaction && !skip_action && !this.lcanvas.read_only) {
          //not dragging mouse to connect two slots
          if (!this.lcanvas.connecting_node && !node.flags.collapsed && !this.lcanvas.live_mode) {
            let mClikSlot = false
            let mClikSlot_index: boolean | number = false
            let mClikSlot_isOut = false
            //search for outputs
            if (node.outputs) {
              for (let i = 0, l = node.outputs.length; i < l; ++i) {
                const output = node.outputs[i]
                const link_pos = node.getConnectionPos(false, i)
                if (LiteGraph.isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 15, link_pos[1] - 10, 30, 20)) {
                  mClikSlot = output
                  mClikSlot_index = i
                  mClikSlot_isOut = true
                  break
                }
              }
            }
  
            //search for inputs
            if (node.inputs) {
              for (let i = 0, l = node.inputs.length; i < l; ++i) {
                const input = node.inputs[i]
                const link_pos = node.getConnectionPos(true, i)
                if (LiteGraph.isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 15, link_pos[1] - 10, 30, 20)) {
                  mClikSlot = input
                  mClikSlot_index = i
                  mClikSlot_isOut = false
                  break
                }
              }
            }
            //console.log("middleClickSlots? "+mClikSlot+" & "+(mClikSlot_index!==false));
            if (mClikSlot && mClikSlot_index !== false) {
              const alphaPosY = 0.5 - (mClikSlot_index + 1) / (mClikSlot_isOut ? node.outputs.length : node.inputs.length)
              const node_bounding = node.getBounding()
              // estimate a position: this is a bad semi-bad-working mess .. REFACTOR with a correct autoplacement that knows about the others slots and nodes
              const posRef = [
                !mClikSlot_isOut ? node_bounding[0] : node_bounding[0] + node_bounding[2], // + node_bounding[0]/this.lcanvas.canvas.width*150
                e.canvasY - 80, // + node_bounding[0]/this.lcanvas.canvas.width*66 // vertical "derive"
              ]
              const nodeCreated = this.lcanvas.createDefaultNodeForSlot({
                nodeFrom: !mClikSlot_isOut ? null : node,
                slotFrom: !mClikSlot_isOut ? null : mClikSlot_index,
                nodeTo: !mClikSlot_isOut ? node : null,
                slotTo: !mClikSlot_isOut ? mClikSlot_index : null,
                position: posRef, //,e: e
                nodeType: 'AUTO', //nodeNewType
                posAdd: [!mClikSlot_isOut ? -30 : 30, -alphaPosY * 130], //-alphaPosY*30]
                posSizeFix: [!mClikSlot_isOut ? -1 : 0, 0], //-alphaPosY*2*/
              })
            }
          }
        }
      } else if (!skip_action && this.lcanvas.allow_dragcanvas) {
        //console.log("pointerevents: dragging_canvas start from middle button");
        this.lcanvas.dragging_canvas = true;
      }
    } else if (what === 3 || this.lcanvas.pointer_is_double) {
      //right button
      if (this.lcanvas.allow_interaction && !skip_action && !this.lcanvas.read_only) {
        // is it hover a node ?
        if (node) {
          // selection multiple nodes
          if (Object.keys(this.lcanvas.selected_nodes).length && (this.lcanvas.selected_nodes[node.id] || e.shiftKey || e.ctrlKey || e.metaKey)) {
            // is multiselected or using shift to include the now node
            if (!this.lcanvas.selected_nodes[node.id]) {
              this.lcanvas.selectNodes([node], true) // add this if not present
            }
          } else {
            this.lcanvas.selectNodes([node])
          }
        }
  
        // show menu on this node
        this.lcanvas.menu.processContextMenu(node, e)
      }
    }
  
    //TODO
    //if(this.lcanvas.node_selected != prev_selected)
    //  this.lcanvas.onNodeSelectionChange(this.lcanvas.node_selected);
  
    this.lcanvas.last_mouse[0] = e.clientX
    this.lcanvas.last_mouse[1] = e.clientY
    this.lcanvas.last_mouseclick = LiteGraph.getTime()
    this.lcanvas.last_mouse_dragging = true
  
    this.lcanvas.graph.change()
  
    //this is to ensure to defocus(blur) if a text input element is on focus
    const ae = ref_window.document.activeElement
    if (
      !ae ||
      (ae.nodeName.toLowerCase() !== 'input' && ae.nodeName.toLowerCase() !== 'textarea')
    ) {
      e.preventDefault()
    }
    e.stopPropagation()
  
    if (this.lcanvas.onMouseDown) {
      this.lcanvas.onMouseDown(e)
    }
  
    return false
  }

  /**
   * Called when a mouse wheel event has to be processed
   * @method processMouseWheel
   **/
  processMouseWheel(e: any) {
    if (!this.lcanvas.graph || !this.lcanvas.allow_dragcanvas) {
      return
    }

    const delta = e.wheelDeltaY != null ? e.wheelDeltaY : e.detail * -60

    this.lcanvas.adjustMouseEvent(e)

    const x = e.clientX
    const y = e.clientY
    const is_inside = !this.lcanvas.viewport || (this.lcanvas.viewport && x >= this.lcanvas.viewport[0] && x < this.lcanvas.viewport[0] + this.lcanvas.viewport[2] && y >= this.lcanvas.viewport[1] && y < this.lcanvas.viewport[1] + this.lcanvas.viewport[3])
    if (!is_inside) return

    let scale = this.lcanvas.ds.scale

    if (delta > 0) {
      scale *= 1.1
    } else if (delta < 0) {
      scale *= 1 / 1.1
    }

    this.lcanvas.ds.changeScale(scale, [e.clientX, e.clientY])

    if (this.lcanvas.onZoomChanged) {
      this.lcanvas.onZoomChanged(scale)
    }

    if (this.lcanvas.onPositionChanged) {
      this.lcanvas.onPositionChanged({
        x: this.lcanvas.ds.offset[0],
        y: this.lcanvas.ds.offset[1]
      })
    }

    this.lcanvas.graph.change()

    e.preventDefault()
    return false // prevent default
  }

  /**
   * Called when a mouse move event has to be processed
   * @method processMouseMove
   **/
  processMouseMove(e: any) {
    if (this.lcanvas.autoresize) {
      this.lcanvas.resize()
    }

    if (this.lcanvas.set_canvas_dirty_on_mouse_event) {
      this.lcanvas.dirty_canvas = true
    }

    if (!this.lcanvas.graph) {
      return
    }

    LCanvas.active_canvas = this.lcanvas
    this.lcanvas.adjustMouseEvent(e)
    const mouse = [e.clientX, e.clientY]
    this.lcanvas.mouse[0] = mouse[0]
    this.lcanvas.mouse[1] = mouse[1]
    const delta = [mouse[0] - this.lcanvas.last_mouse[0], mouse[1] - this.lcanvas.last_mouse[1]]
    this.lcanvas.last_mouse = mouse
    this.lcanvas.graph_mouse[0] = e.canvasX
    this.lcanvas.graph_mouse[1] = e.canvasY

    //console.log("pointerevents: processMouseMove "+e.pointerId+" "+e.isPrimary);

    if (this.lcanvas.block_click) {
      //console.log("pointerevents: processMouseMove block_click");
      e.preventDefault()
      return false
    }

    e.dragging = this.lcanvas.last_mouse_dragging

    if (this.lcanvas.node_widget) {
      this.lcanvas.processNodeWidgets(this.lcanvas.node_widget[0], this.lcanvas.graph_mouse, e, this.lcanvas.node_widget[1])
      /*
      // comment by SDFX (should improve perfs)
      this.lcanvas.dirty_canvas = true
      */
    }

    //get node over
    const node = this.lcanvas.graph.getNodeOnPos(e.canvasX, e.canvasY, this.lcanvas.visible_nodes)

    // dragging selection
    if (this.lcanvas.dragging_rectangle) {
      this.lcanvas.dragging_rectangle[2] = e.canvasX - this.lcanvas.dragging_rectangle[0]
      this.lcanvas.dragging_rectangle[3] = e.canvasY - this.lcanvas.dragging_rectangle[1]
      this.lcanvas.dirty_canvas = true

      e.preventDefault()
      return false
    }

    // moving/resizing a group
    if (this.lcanvas.selected_group && !this.lcanvas.read_only) {
      if (this.lcanvas.selected_group_resizing) {
        this.lcanvas.selected_group.size = [
          e.canvasX - this.lcanvas.selected_group.pos[0], 
          e.canvasY - this.lcanvas.selected_group.pos[1]
        ]
      } else {
        const dx = delta[0] / this.lcanvas.ds.scale
        const dy = delta[1] / this.lcanvas.ds.scale
        this.lcanvas.selected_group.move(dx, dy, e.ctrlKey)
        if (this.lcanvas.selected_group._nodes.length) {
          this.lcanvas.dirty_canvas = true
        }
      }
      this.lcanvas.dirty_bgcanvas = true

      e.preventDefault()
      return false
    } 

    // dragging / moving canvas
    if (this.lcanvas.dragging_canvas) {
      ////console.log("pointerevents: processMouseMove is dragging_canvas");
      this.lcanvas.ds.offset[0] += delta[0] / this.lcanvas.ds.scale
      this.lcanvas.ds.offset[1] += delta[1] / this.lcanvas.ds.scale
      this.lcanvas.dirty_canvas = true
      this.lcanvas.dirty_bgcanvas = true
      if (this.lcanvas.onPositionChanged) {
        this.lcanvas.onPositionChanged({
          x: this.lcanvas.ds.offset[0],
          y: this.lcanvas.ds.offset[1]
        })
      }
      e.preventDefault()
      return false
    }

    if ((this.lcanvas.allow_interaction || (node && node.flags.allow_interaction)) && !this.lcanvas.read_only) {
      if (this.lcanvas.connecting_node) {
        this.lcanvas.dirty_canvas = true
      }

      //remove mouseover flag
      for (let i = 0, l = this.lcanvas.graph._nodes.length; i < l; ++i) {
        if (this.lcanvas.graph._nodes[i].mouseOver && node != this.lcanvas.graph._nodes[i]) {
          //mouse leave
          this.lcanvas.graph._nodes[i].mouseOver = false
          if (this.lcanvas.node_over && this.lcanvas.node_over.onMouseLeave) {
            this.lcanvas.node_over.onMouseLeave(e)
          }
          this.lcanvas.node_over = null
          this.lcanvas.dirty_canvas = true
        }
      }

      //mouse over a node
      if (node) {
        if (node.redraw_on_mouse) {
          this.lcanvas.dirty_canvas = true
        }

        //this.lcanvas.canvas.style.cursor = "move";
        if (!node.mouseOver) {
          //mouse enter
          node.mouseOver = true
          this.lcanvas.node_over = node
          this.lcanvas.dirty_canvas = true

          if (node.onMouseEnter) {
            node.onMouseEnter(e)
          }
        }

        //in case the node wants to do something
        if (node.onMouseMove) {
          node.onMouseMove(e, [e.canvasX - node.pos[0], e.canvasY - node.pos[1]], this.lcanvas)
        }

        //if dragging a link
        if (this.lcanvas.connecting_node) {
          if (this.lcanvas.connecting_output) {
            const pos = this.lcanvas._highlight_input || [0, 0] //to store the output of isOverNodeInput

            //on top of input
            if (this.lcanvas.isOverNodeBox(node, e.canvasX, e.canvasY)) {
              //mouse on top of the corner box, don't know what to do
            } else {
              //check if I have a slot below de mouse
              const slot = this.lcanvas.isOverNodeInput(node, e.canvasX, e.canvasY, pos)
              if (slot != -1 && node.inputs[slot]) {
                const slot_type = node.inputs[slot].type
                if (LiteGraph.isValidConnection(this.lcanvas.connecting_output.type, slot_type)) {
                  this.lcanvas._highlight_input = pos
                  this.lcanvas._highlight_input_slot = node.inputs[slot] // XXX CHECK THIS
                }
              } else {
                this.lcanvas._highlight_input = null
                this.lcanvas._highlight_input_slot = null // XXX CHECK THIS
              }
            }
          } else if (this.lcanvas.connecting_input) {
            const pos = this.lcanvas._highlight_output || [0, 0] //to store the output of isOverNodeOutput

            //on top of output
            if (this.lcanvas.isOverNodeBox(node, e.canvasX, e.canvasY)) {
              //mouse on top of the corner box, don't know what to do
            } else {
              //check if I have a slot below de mouse
              const slot = this.lcanvas.isOverNodeOutput(node, e.canvasX, e.canvasY, pos)
              if (slot != -1 && node.outputs[slot]) {
                const slot_type = node.outputs[slot].type
                if (LiteGraph.isValidConnection(this.lcanvas.connecting_input.type, slot_type)) {
                  this.lcanvas._highlight_output = pos
                }
              } else {
                this.lcanvas._highlight_output = null
              }
            }
          }
        }

        //resizing / Search for corner
        if (this.lcanvas.canvas) {
          const inCorner = node.inResizeCorner(e.canvasX, e.canvasY)
          if (inCorner.result) {
            this.lcanvas.canvas.style.cursor = `${inCorner.corner}-resize`
          } else {
            this.lcanvas.canvas.style.cursor = 'crosshair'
          }
        }
      } else {
        //not over a node

        //search for link connector
        let over_link = null
        for (let i = 0; i < this.lcanvas.visible_links.length; ++i) {
          const link = this.lcanvas.visible_links[i]
          const center = link._pos
          if (!center || e.canvasX < center[0] - 4 || e.canvasX > center[0] + 4 || e.canvasY < center[1] - 4 || e.canvasY > center[1] + 4) {
            continue
          }
          over_link = link
          break
        }
        if (over_link != this.lcanvas.over_link_center) {
          this.lcanvas.over_link_center = over_link
          this.lcanvas.dirty_canvas = true
        }

        if (this.lcanvas.canvas) {
          this.lcanvas.canvas.style.cursor = ''
        }
      } //end

      //send event to node if capturing input (used with widgets that allow drag outside of the area of the node)
      if (this.lcanvas.node_capturing_input && this.lcanvas.node_capturing_input != node && this.lcanvas.node_capturing_input.onMouseMove) {
        this.lcanvas.node_capturing_input.onMouseMove(e, [e.canvasX - this.lcanvas.node_capturing_input.pos[0], e.canvasY - this.lcanvas.node_capturing_input.pos[1]], this.lcanvas)
      }

      //node being dragged
      if (this.lcanvas.node_dragged && !this.lcanvas.live_mode) {
        // console.log("draggin!",this.lcanvas.selected_nodes);
        for (let i in this.lcanvas.selected_nodes) {
          const n = this.lcanvas.selected_nodes[i]
          n.pos[0] += delta[0] / this.lcanvas.ds.scale
          n.pos[1] += delta[1] / this.lcanvas.ds.scale

          if (!n.is_selected) {
            this.lcanvas.processNodeSelected(n, e)
          }

          /*
          * Don't call the function if the block is already selected.
          * Otherwise, it could cause the block to be unselected while dragging.
          */
        }

        this.lcanvas.dirty_canvas = true
        this.lcanvas.dirty_bgcanvas = true
      }

      if (this.lcanvas.resizing_node && !this.lcanvas.live_mode) {
        //convert mouse to node space
        const desired_size = [ 0, 0 ];
				const min_size = this.lcanvas.resizing_node.computeSize();
				let move_node = true;
				
				desired_size[0] = Math.max( 
					min_size[0], 
					this.lcanvas.resizing_node.resize_handle_x == 'left' ? 
						- e.canvasX + this.lcanvas.resizing_node.pos[0] + this.lcanvas.resizing_node.size[0]: 
						e.canvasX - this.lcanvas.resizing_node.pos[0] 
				);
				desired_size[1] = Math.max( 
					min_size[1], 
					this.lcanvas.resizing_node.resize_handle_y == 'top'  ? 
						- e.canvasY + this.lcanvas.resizing_node.pos[1] + this.lcanvas.resizing_node.size[1] - LiteGraph.NODE_TITLE_HEIGHT: 
						e.canvasY - this.lcanvas.resizing_node.pos[1] 
				);
				
				if (this.lcanvas.resizing_node.resize_handle_x == 'left' && desired_size[0] != this.lcanvas.resizing_node.size[0]) {
					this.lcanvas.resizing_node.pos[0] = e.canvasX;
					move_node = true;
				}
				if (this.lcanvas.resizing_node.resize_handle_y == 'top' && desired_size[1] != this.lcanvas.resizing_node.size[1]) {
					this.lcanvas.resizing_node.pos[1] = e.canvasY + LiteGraph.NODE_TITLE_HEIGHT;
					move_node = true;
				}
				
				this.lcanvas.resizing_node.setSize( desired_size );

        this.lcanvas.canvas.style.cursor = `${this.lcanvas.resizing_corner}-resize`;

        this.lcanvas.dirty_canvas = true;
        this.lcanvas.dirty_bgcanvas = true;
      }
    }

    e.preventDefault()
    return false
  }

  /**
   * process a key event
   * @method processKey
   **/
  processKey(e: any) {
    if (!this.lcanvas.graph) {
      return
    }

    let block_default = false
    // console.log(e); //debug

    if (e.target.localName == 'input') {
      return
    }

    if (e.type == 'keydown') {
      if (e.keyCode == 32) {
        //space
        this.lcanvas.dragging_canvas = true
        block_default = true
      }

      if (e.keyCode == 27) {
        //esc
        if (this.lcanvas.node_panel) this.lcanvas.node_panel.close()
        if (this.lcanvas.options_panel) this.lcanvas.options_panel.close()
        block_default = true
      }

      //select all Control A
      if (e.keyCode == 65 && e.ctrlKey) {
        this.lcanvas.selectNodes()
        block_default = true
      }

      //copy
      /*
      if (e.keyCode === 67 && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        if (this.lcanvas.selected_nodes) {
          this.lcanvas.copyToClipboard()
          block_default = true
        }
      }

      if (e.keyCode === 86 && (e.metaKey || e.ctrlKey)) {
        //paste
        this.lcanvas.pasteFromClipboard(e.shiftKey)
        block_default = true
      }
      */

      //delete or backspace
      if (e.keyCode == 46 || e.keyCode == 8) {
        if (e.target.localName != 'input' && e.target.localName != 'textarea') {
          this.lcanvas.deleteSelectedNodes()
          block_default = true
        }
      }

      //TODO
      if (this.lcanvas.selected_nodes) {
        for (var i in this.lcanvas.selected_nodes) {
          if (this.lcanvas.selected_nodes[i].onKeyDown) {
            this.lcanvas.selected_nodes[i].onKeyDown(e)
          }
        }
      }
    } else if (e.type == 'keyup') {
      if (e.keyCode == 32) {
        // space
        this.lcanvas.dragging_canvas = false
      }

      if (this.lcanvas.selected_nodes) {
        for (var i in this.lcanvas.selected_nodes) {
          if (this.lcanvas.selected_nodes[i].onKeyUp) {
            this.lcanvas.selected_nodes[i].onKeyUp(e)
          }
        }
      }
    }

    if (this.lcanvas.onProcessKey) {
      block_default = this.lcanvas.onProcessKey(e)
    }

    this.lcanvas.graph.change()

    if (block_default) {
      e.preventDefault()
      e.stopImmediatePropagation()
      return false
    }
  }

  /**
   * process a item drop event on top the canvas
   * @method processDrop
   **/
  processDrop(e: any) {
    e.preventDefault()
    this.lcanvas.adjustMouseEvent(e)
    var x = e.clientX
    var y = e.clientY
    var is_inside =
      !this.lcanvas.viewport || (this.lcanvas.viewport && x >= this.lcanvas.viewport[0] && x < this.lcanvas.viewport[0] + this.lcanvas.viewport[2] && y >= this.lcanvas.viewport[1] && y < this.lcanvas.viewport[1] + this.lcanvas.viewport[3])
    if (!is_inside) {
      return
      // --- BREAK ---
    }

    var pos = [e.canvasX, e.canvasY]
    var node = this.lcanvas.graph ? this.lcanvas.graph.getNodeOnPos(pos[0], pos[1]) : null

    if (!node) {
      var r = null
      if (this.lcanvas.onDropItem) {
        r = this.lcanvas.onDropItem(event)
      }
      if (!r) {
        this.lcanvas.checkDropItem(e)
      }
      return
    }

    if (node.onDropFile || node.onDropData) {
      var files = e.dataTransfer.files
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = e.dataTransfer.files[0]
          var filename = file.name
          var ext = LCanvas.getFileExtension(filename)
          //console.log(file);

          if (node.onDropFile) {
            node.onDropFile(file)
          }

          if (node.onDropData) {
            //prepare reader
            var reader = new FileReader()
            reader.onload = function (event) {
              //console.log(event.target);
              var data = event.target?.result
              node.onDropData(data, filename, file)
            }

            //read data
            var type = file.type.split('/')[0]
            if (type == 'text' || type == '') {
              reader.readAsText(file)
            } else if (type == 'image') {
              reader.readAsDataURL(file)
            } else {
              reader.readAsArrayBuffer(file)
            }
          }
        }
      }
    }

    if (node.onDropItem) {
      if (node.onDropItem(event)) {
        return true
      }
    }

    if (this.lcanvas.onDropItem) {
      return this.lcanvas.onDropItem(event)
    }

    return false
  }
  
  /**
   * if link is released on a node below mouse,
   * try to connect to that node input or output
   */
  connectNodeReleaseEventHandler(e: any, node: any, connType: any) {
    if (this.lcanvas.connecting_output) {
      const slot = this.lcanvas.isOverNodeInput(node, e.canvasX, e.canvasY)
      if (slot !== -1) {
        this.lcanvas.connecting_node.connect(this.lcanvas.connecting_slot, node, slot)
      } else {
        //not on top of an input, look for a good slot
        this.lcanvas.connecting_node.connectByType(this.lcanvas.connecting_slot, node, connType)
      }
    } else if (this.lcanvas.connecting_input) {
      const slot = this.lcanvas.isOverNodeOutput(node, e.canvasX, e.canvasY)

      if (slot !== -1) {
        node.connect(slot, this.lcanvas.connecting_node, this.lcanvas.connecting_slot) // this is inverted has output-input nature like
      } else {
        //not on top of an input
        // look for a good slot
        this.lcanvas.connecting_node.connectByTypeOutput(this.lcanvas.connecting_slot, node, connType)
      }
    }
  }
  
  /**
   * show menu when releasing link in empty space
   */
  showLinkMenuReleaseEventHandler(e: any, node: any) {
    if (e.shiftKey && this.lcanvas.allow_searchbox) {
      if (this.lcanvas.connecting_output) {
        showSearchBox(this.lcanvas, e, { node_from: this.lcanvas.connecting_node, slot_from: this.lcanvas.connecting_output, type_filter_in: this.lcanvas.connecting_output.type })
      } else if (this.lcanvas.connecting_input) {
        showSearchBox(this.lcanvas, e, { node_to: this.lcanvas.connecting_node, slot_from: this.lcanvas.connecting_input, type_filter_out: this.lcanvas.connecting_input.type })
      }
    } else {
      if (this.lcanvas.connecting_output) {
        showConnectionMenu(this.lcanvas, { nodeFrom: this.lcanvas.connecting_node, slotFrom: this.lcanvas.connecting_output, e: e })
      } else if (this.lcanvas.connecting_input) {
        showConnectionMenu(this.lcanvas, { nodeTo: this.lcanvas.connecting_node, slotTo: this.lcanvas.connecting_input, e: e })
      }
    }
  }

  /**
   * click on a node, we check if clicked on collapsed or close
   */
  nodeClickEventHandler(e: any, node: any) {
    const cx = e.canvasX
    const cy = e.canvasY
    const nx = node.pos[0]
    const ny = node.pos[1]
    const nw = node.size[0]
    const nh = node.size[1]
    const th = LiteGraph.NODE_TITLE_HEIGHT
    const sz = this.lcanvas.ds.scale

    /* collapse toogle? */
    if (LiteGraph.isInsideRectangle(cx, cy, nx, ny-th, th, th)) {
      node.collapse()
    }

    /* close button (remove node)? */
    if (!node.flags.collapsed && LiteGraph.isInsideRectangle(cx, cy, nx+nw-th, ny-th, th, th)) {
      node.graph.remove(node)
      this.lcanvas.dirty_canvas = true
      this.lcanvas.dirty_bgcanvas = true
      this.lcanvas.graph.change()
      this.lcanvas.node_dragged = null
      e.preventDefault()
      return false
    }
  }

  /**
   * click on a node, we check if clicked on collapsed or close
   */
  nodeLongTouchEventHandler(e: any, node: any) {
    //console.log('nodeLongTouchEventHandler', node)
  }

  /**
   * simple click on nothing on the canvas
   * deselect all node
   */
  canvasClickEventHandler(e: any) {
    //console.log('canvasClickEventHandler')
    this.lcanvas.deselectAllNodes()
  }

  /**
   * long touch on nothing on the canvas
   */
  canvasLongTouchEventHandler(e: any) {
    //console.log('canvasLongTouchEventHandler')
  }

  processMobileZoom(e: any) {
    if (e.touches.length < 2) return

    const x1 = e.touches[0].clientX
    const y1 = e.touches[0].clientY
    const x2 = e.touches[1].clientX
    const y2 = e.touches[1].clientY
    const currentDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

    if (!this.lcanvas._initialPinchDistance) {
      this.lcanvas._initialPinchDistance = currentDistance
      return
    }

    const ratio = (currentDistance / this.lcanvas._initialPinchDistance)

    const centerX = (x1 + x2) / 2
    const centerY = (y1 + y2) / 2
    const scale = this.lcanvas.ds.scale * ratio
    
    this.lcanvas.ds.changeScale(scale, [centerX, centerY])
    this.lcanvas._initialPinchDistance = currentDistance

    if (this.lcanvas.onZoomChanged) {
      this.lcanvas.onZoomChanged(scale)
    }

    if (this.lcanvas.onPositionChanged) {
      this.lcanvas.onPositionChanged({
        x: this.lcanvas.ds.offset[0],
        y: this.lcanvas.ds.offset[1]
      })
    }

    this.lcanvas.graph.change()

    e.preventDefault()
    return false // prevent default
  }
}