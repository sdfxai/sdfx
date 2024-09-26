import { LiteGraph } from './LiteGraph'
import { LiteTheme } from './LiteTheme'
import { DragAndScale } from './DragAndScale'
import { clamp } from './helpers/Utils'
import { distance } from './helpers/Intersect'
import { CanvasEvents } from './canvas/CanvasEvents'
import { CanvasContextMenu } from './canvas/CanvasContextMenu'
import { checkPanels, closePanels, createPanel } from './canvas/dialogs/Panel'
import { showDefaultNodePanel } from './canvas/dialogs/DefaultNodePanel'
import { showSearchBox } from './canvas/dialogs/Search'
import { prompt } from './canvas/dialogs/Prompt'

/**
 * This class is in charge of rendering one graph inside a canvas. And provides all the interaction required.
 * Valid callbacks are: onNodeSelected, onNodeDeselected, onShowNodePanel, onNodeDblClicked
 *
 * @class LCanvas
 * @constructor
 * @param {HTMLCanvas} canvas the canvas where you want to render (it accepts a selector in string format or the canvas element itself)
 * @param {LGraph} graph [optional]
 * @param {Object} options [optional] { skip_rendering, autoresize, viewport }
 */
function LCanvas(canvas, graph, options) {
  this.events = new CanvasEvents(this)
  this.menu = new CanvasContextMenu(this)
  this.options = options = options || {}

  //if(graph === undefined)
  //  throw ("No graph assigned");
  this.background_image = LCanvas.DEFAULT_BACKGROUND_IMAGE

  if (canvas && canvas.constructor === String) {
    canvas = document.querySelector(canvas)
  }

  this.ds = new DragAndScale()
  this.zoom_modify_alpha = true //otherwise it generates ugly patterns when scaling down too much

  this.title_text_font = '' + LiteGraph.NODE_TEXT_SIZE + 'px Arial'
  this.inner_text_font = 'normal ' + LiteGraph.NODE_SUBTEXT_SIZE + 'px Arial'
  this.node_title_color = LiteGraph.NODE_TITLE_COLOR
  this.default_link_color = LiteGraph.LINK_COLOR
  this.default_connection_color = {
    input_off: '#778',
    input_on: '#7F7', //"#BBD"
    output_off: '#778',
    output_on: '#7F7', //"#BBD"
  }
  this.default_connection_color_byType = {
    /*number: "#7F7",
    string: "#77F",
    boolean: "#F77",*/
  }
  this.default_connection_color_byTypeOff = {
    /*number: "#474",
    string: "#447",
    boolean: "#744",*/
  }

  this.highquality_render = true
  this.use_gradients = false //set to true to render titlebar with gradients
  this.editor_alpha = 0.9 //used for transition
  this.pause_rendering = false
  this.clear_background = true
  this.clear_background_color = '#18181bcc'

  this.read_only = false //if set to true users cannot modify the graph
  this.render_only_selected = true
  this.live_mode = false
  this.show_info = true
  this.allow_dragcanvas = true
  this.allow_dragnodes = true
  this.allow_interaction = true //allow to control widgets, buttons, collapse, etc
  this.multi_select = false //allow selecting multi nodes without pressing extra keys
  this.allow_searchbox = true
  this.allow_reconnect_links = true //allows to change a connection with having to redo it again
  this.align_to_grid = false //snap to grid

  this.drag_mode = false
  this.tool = 'move'
  this.dragging_rectangle = null

  this.filter = null //allows to filter to only accept some type of nodes in a graph

  this.set_canvas_dirty_on_mouse_event = true //forces to redraw the canvas if the mouse does anything
  this.always_render_background = false
  this.render_shadows = true
  this.render_canvas_border = true
  this.render_connections_shadows = false //too much cpu
  this.render_connections_border = true
  this.render_curved_connections = true
  this.render_connection_arrows = false
  this.render_collapsed_slots = true
  this.render_execution_order = false
  this.render_title_colored = true
  this.render_link_tooltip = true

  this.links_render_mode = LiteGraph.SPLINE_LINK

  this.mouse = [0, 0] //mouse in canvas coordinates, where 0,0 is the top-left corner of the blue rectangle
  this.graph_mouse = [0, 0] //mouse in graph coordinates, where 0,0 is the top-left corner of the blue rectangle
  this.canvas_mouse = this.graph_mouse //LEGACY: REMOVE THIS, USE GRAPH_MOUSE INSTEAD

  //to personalize the search box
  this.onSearchBox = null
  this.onSearchBoxSelection = null

  //callbacks
  this.onMouse = null
  this.onDrawBackground = null //to render background objects (behind nodes and connections) in the canvas affected by transform
  this.onDrawForeground = null //to render foreground objects (above nodes and connections) in the canvas affected by transform
  this.onDrawOverlay = null //to render foreground objects not affected by transform (for GUIs)
  this.onDrawLinkTooltip = null //called when rendering a tooltip
  this.onNodeMoved = null //called after moving a node
  this.onSelectionChange = null //called if the selection changes
  this.onConnectingChange = null //called before any link changes
  this.onBeforeChange = null //called before modifying the graph
  this.onAfterChange = null //called after modifying the graph

  this.connections_width = 8
  this.round_radius = 5

  this.current_node = null
  this.node_widget = null //used for widgets
  this.over_link_center = null
  this.last_mouse_position = [0, 0]
  this.visible_area = this.ds.visible_area
  this.visible_links = []

  this.viewport = options.viewport || null //to constraint render area to a portion of the canvas

  //link canvas and graph
  if (graph) {
    graph.attachCanvas(this)
  }

  this.setCanvas(canvas, options.skip_events)
  this.clear()

  if (!options.skip_render) {
    this.startRendering()
  }

  this.autoresize = options.autoresize
}

LCanvas.DEFAULT_BACKGROUND_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQBJREFUeNrs1rEKwjAUhlETUkj3vP9rdmr1Ysammk2w5wdxuLgcMHyptfawuZX4pJSWZTnfnu/lnIe/jNNxHHGNn//HNbbv+4dr6V+11uF527arU7+u63qfa/bnmh8sWLBgwYJlqRf8MEptXPBXJXa37BSl3ixYsGDBMliwFLyCV/DeLIMFCxYsWLBMwSt4Be/NggXLYMGCBUvBK3iNruC9WbBgwYJlsGApeAWv4L1ZBgsWLFiwYJmCV/AK3psFC5bBggULloJX8BpdwXuzYMGCBctgwVLwCl7Be7MMFixYsGDBsu8FH1FaSmExVfAxBa/gvVmwYMGCZbBg/W4vAQYA5tRF9QYlv/QAAAAASUVORK5CYII='

LCanvas.link_type_colors = {
  '-1': LiteGraph.EVENT_LINK_COLOR,
  number: '#AAA',
  node: '#DCA',
}
LCanvas.gradients = {} //cache of gradients

/**
 * set canvas tool (move|select)
 *
 * @method setTool
 */
LCanvas.prototype.setTool = function (tool) {
  if (this.tool === tool) return

  if (tool === 'select') {
    this.deselectAllNodes()
  }

  this.tool = tool
}

/**
 * clears all the data inside
 *
 * @method clear
 */
LCanvas.prototype.clear = function () {
  this.frame = 0
  this.last_draw_time = 0
  this.render_time = 0
  this.fps = 0

  this.dragging_rectangle = null

  this.selected_nodes = {}
  this.selected_group = null

  this.visible_nodes = []
  this.node_dragged = null
  this.node_over = null
  this.node_capturing_input = null
  this.connecting_node = null
  this.highlighted_links = {}

  this.dragging_canvas = false

  this.dirty_canvas = true
  this.dirty_bgcanvas = true
  this.dirty_area = null

  this.node_in_panel = null
  this.node_widget = null

  this.last_mouse = [0, 0]
  this.last_mouseclick = 0
  this.pointer_is_down = false
  this.pointer_is_double = false
  this.visible_area.set([0, 0, 0, 0])

  if (this.onClear) {
    this.onClear()
  }
}

/**
 * assigns a graph, you can reassign graphs to the same canvas
 *
 * @method setGraph
 * @param {LGraph} graph
 */
LCanvas.prototype.setGraph = function (graph, skip_clear) {
  if (this.graph == graph) {
    return
  }

  if (!skip_clear) {
    this.clear()
  }

  if (!graph && this.graph) {
    this.graph.detachCanvas(this)
    return
  }

  graph.attachCanvas(this)

  //remove the graph stack in case a subgraph was open
  if (this._graph_stack) this._graph_stack = null

  this.setDirty(true, true)
}

/**
 * returns the top level graph (in case there are subgraphs open on the canvas)
 *
 * @method getTopGraph
 * @return {LGraph} graph
 */
LCanvas.prototype.getTopGraph = function () {
  if (this._graph_stack.length) return this._graph_stack[0]
  return this.graph
}

/**
 * opens a graph contained inside a node in the current graph
 *
 * @method openSubgraph
 * @param {LGraph} graph
 */
LCanvas.prototype.openSubgraph = function (graph) {
  if (!graph) {
    throw 'graph cannot be null'
  }

  if (this.graph == graph) {
    throw 'graph cannot be the same'
  }

  this.clear()

  if (this.graph) {
    if (!this._graph_stack) {
      this._graph_stack = []
    }
    this._graph_stack.push(this.graph)
  }

  graph.attachCanvas(this)
  checkPanels(this.canvas, this.graph)
  this.setDirty(true, true)
}

/**
 * closes a subgraph contained inside a node
 *
 * @method closeSubgraph
 * @param {LGraph} assigns a graph
 */
LCanvas.prototype.closeSubgraph = function () {
  if (!this._graph_stack || this._graph_stack.length === 0) {
    return
  }
  var subgraph_node = this.graph._subgraph_node
  var graph = this._graph_stack.pop()
  this.selected_nodes = {}
  this.highlighted_links = {}
  graph.attachCanvas(this)
  this.setDirty(true, true)
  if (subgraph_node) {
    this.centerOnNode(subgraph_node)
    this.selectNodes([subgraph_node])
  }
  // when close sub graph back to offset [0, 0] scale 1
  this.ds.offset = [0, 0]
  this.ds.scale = 1
}

/**
 * returns the visually active graph (in case there are more in the stack)
 * @method getCurrentGraph
 * @return {LGraph} the active graph
 */
LCanvas.prototype.getCurrentGraph = function () {
  return this.graph
}

/**
 * assigns a canvas
 *
 * @method setCanvas
 * @param {Canvas} assigns a canvas (also accepts the ID of the element (not a selector)
 */
LCanvas.prototype.setCanvas = function (canvas, skip_events) {
  var that = this

  if (canvas) {
    if (canvas.constructor === String) {
      canvas = document.getElementById(canvas)
      if (!canvas) {
        throw 'Error creating LiteGraph canvas: Canvas not found'
      }
    }
  }

  if (canvas === this.canvas) {
    return
  }

  if (!canvas && this.canvas) {
    //maybe detach events from old_canvas
    if (!skip_events) {
      this.events.unbindEvents()
    }
  }

  this.canvas = canvas
  this.ds.element = canvas

  if (!canvas) {
    return
  }

  //this.canvas.tabindex = "1000";
  canvas.className += ' lgraphcanvas'
  canvas.data = this
  canvas.tabindex = '1' //to allow key events

  //bg canvas: used for non changing stuff
  this.bgcanvas = null
  if (!this.bgcanvas) {
    this.bgcanvas = document.createElement('canvas')
    this.bgcanvas.width = this.canvas.width
    this.bgcanvas.height = this.canvas.height
  }

  if (canvas.getContext == null) {
    if (canvas.localName != 'canvas') {
      throw 'Element supplied for LCanvas must be a <canvas> element, you passed a ' + canvas.localName
    }
    throw "This browser doesn't support Canvas"
  }

  var ctx = (this.ctx = canvas.getContext('2d'))
  if (ctx == null) {
    if (!canvas.webgl_enabled) {
      console.warn('This canvas seems to be WebGL, enabling WebGL renderer')
    }
    this.enableWebGL()
  }

  //input:  (move and up could be unbinded)
  // why here? this._mousemove_callback = this.processMouseMove.bind(this);
  // why here? this._mouseup_callback = this.processMouseUp.bind(this);

  if (!skip_events) {
    this.events.bindEvents()
  }
}

//used in some events to capture them
LCanvas.prototype._doNothing = function doNothing(e) {
  //console.log("pointerevents: _doNothing "+e.type);
  e.preventDefault()
  return false
}
LCanvas.prototype._doReturnTrue = function doNothing(e) {
  e.preventDefault()
  return true
}

LCanvas.getFileExtension = function (url) {
  var question = url.indexOf('?')
  if (question != -1) {
    url = url.substr(0, question)
  }
  var point = url.lastIndexOf('.')
  if (point == -1) {
    return ''
  }
  return url.substr(point + 1).toLowerCase()
}

/**
 * this function allows to render the canvas using WebGL instead of Canvas2D
 * this is useful if you plant to render 3D objects inside your nodes, it uses litegl.js for webgl and canvas2DtoWebGL to emulate the Canvas2D calls in webGL
 * @method enableWebGL
 **/
LCanvas.prototype.enableWebGL = function () {
  if (typeof GL === undefined) {
    throw 'litegl.js must be included to use a WebGL canvas'
  }
  if (typeof enableWebGLCanvas === undefined) {
    throw 'webglCanvas.js must be included to use this feature'
  }

  this.gl = this.ctx = enableWebGLCanvas(this.canvas)
  this.ctx.webgl = true
  this.bgcanvas = this.canvas
  this.bgctx = this.gl
  this.canvas.webgl_enabled = true

  /*
  GL.create({ canvas: this.bgcanvas });
  this.bgctx = enableWebGLCanvas( this.bgcanvas );
  window.gl = this.gl;
  */
}

/**
 * marks as dirty the canvas, this way it will be rendered again
 *
 * @class LCanvas
 * @method setDirty
 * @param {bool} fgcanvas if the foreground canvas is dirty (the one containing the nodes)
 * @param {bool} bgcanvas if the background canvas is dirty (the one containing the wires)
 */
LCanvas.prototype.setDirty = function (fgcanvas, bgcanvas) {
  if (fgcanvas) {
    this.dirty_canvas = true
  }
  if (bgcanvas) {
    this.dirty_bgcanvas = true
  }
}

/**
 * Used to attach the canvas in a popup
 *
 * @method getCanvasWindow
 * @return {window} returns the window where the canvas is attached (the DOM root node)
 */
LCanvas.prototype.getCanvasWindow = function () {
  if (!this.canvas) {
    return window
  }
  var doc = this.canvas.ownerDocument
  return doc.defaultView || doc.parentWindow
}

/**
 * starts rendering the content of the canvas when needed
 *
 * @method startRendering
 */
LCanvas.prototype.startRendering = function () {
  if (this.is_rendering) {
    return
  } //already rendering

  this.is_rendering = true
  renderFrame.call(this)

  function renderFrame() {
    if (!this.pause_rendering) {
      this.draw()
    }

    var window = this.getCanvasWindow()
    if (this.is_rendering) {
      window.requestAnimationFrame(renderFrame.bind(this))
    }
  }
}

/**
 * stops rendering the content of the canvas (to save resources)
 *
 * @method stopRendering
 */
LCanvas.prototype.stopRendering = function () {
  this.is_rendering = false
  /*
if(this.rendering_timer_id)
{
  clearInterval(this.rendering_timer_id);
  this.rendering_timer_id = null;
}
*/
}

/* LiteGraphCanvas input */

//used to block future mouse events (because of im gui)
LCanvas.prototype.blockClick = function () {
  this.block_click = true
  this.last_mouseclick = 0
}

/**
 * returns true if a position (in graph space) is on top of a node little corner box
 * @method isOverNodeBox
 **/
LCanvas.prototype.isOverNodeBox = function (node, canvasx, canvasy) {
  var title_height = LiteGraph.NODE_TITLE_HEIGHT
  if (LiteGraph.isInsideRectangle(canvasx, canvasy, node.pos[0] + 2, node.pos[1] + 2 - title_height, title_height - 4, title_height - 4)) {
    return true
  }
  return false
}

/**
 * returns the INDEX if a position (in graph space) is on top of a node input slot
 * @method isOverNodeInput
 **/
LCanvas.prototype.isOverNodeInput = function (node, canvasx, canvasy, slot_pos) {
  if (node.inputs) {
    for (var i = 0, l = node.inputs.length; i < l; ++i) {
      var input = node.inputs[i]
      var link_pos = node.getConnectionPos(true, i)
      var is_inside = false
      if (node.horizontal) {
        is_inside = LiteGraph.isInsideRectangle(canvasx, canvasy, link_pos[0] - 5, link_pos[1] - 10, 10, 20)
      } else {
        is_inside = LiteGraph.isInsideRectangle(canvasx, canvasy, link_pos[0] - 10, link_pos[1] - 5, 40, 10)
      }
      if (is_inside) {
        if (slot_pos) {
          slot_pos[0] = link_pos[0]
          slot_pos[1] = link_pos[1]
        }
        return i
      }
    }
  }
  return -1
}

/**
 * returns the INDEX if a position (in graph space) is on top of a node output slot
 * @method isOverNodeOuput
 **/
LCanvas.prototype.isOverNodeOutput = function (node, canvasx, canvasy, slot_pos) {
  if (node.outputs) {
    for (var i = 0, l = node.outputs.length; i < l; ++i) {
      var output = node.outputs[i]
      var link_pos = node.getConnectionPos(false, i)
      var is_inside = false
      if (node.horizontal) {
        is_inside = LiteGraph.isInsideRectangle(canvasx, canvasy, link_pos[0] - 5, link_pos[1] - 10, 10, 20)
      } else {
        is_inside = LiteGraph.isInsideRectangle(canvasx, canvasy, link_pos[0] - 10, link_pos[1] - 5, 40, 10)
      }
      if (is_inside) {
        if (slot_pos) {
          slot_pos[0] = link_pos[0]
          slot_pos[1] = link_pos[1]
        }
        return i
      }
    }
  }
  return -1
}

LCanvas.prototype.copySelectedNodes = function () {
  var copied = {
    nodes: [],
    links: [],
  }
  var index = 0
  var selected_nodes_array = []

  for (var i in this.selected_nodes) {
    var node = this.selected_nodes[i]
    if (node.clonable === false) continue
    node._relative_id = index
    selected_nodes_array.push(node)
    index += 1
  }

  for (var i = 0; i < selected_nodes_array.length; ++i) {
    var node = selected_nodes_array[i]
    var cloned = node.clone()

    if (!cloned) {
      console.warn('node type not found: ' + node.type)
      continue
    }

    if (cloned.widgets) {
      cloned.widgets.forEach((widget) => {
        if (widget.inputEl) {
          widget.inputEl.style.left = '-8000px'
          widget.inputEl.style.display = 'none'
        }
      })
    }

    copied.nodes.push(cloned.serialize())
    if (node.inputs && node.inputs.length) {
      for (var j = 0; j < node.inputs.length; ++j) {
        var input = node.inputs[j]
        if (!input || input.link == null) {
          continue
        }
        var link_info = this.graph.links[input.link]
        if (!link_info) {
          continue
        }
        var target_node = this.graph.getNodeById(link_info.origin_id)
        if (!target_node) {
          continue
        }
        copied.links.push([
          target_node._relative_id,
          link_info.origin_slot, //j,
          node._relative_id,
          link_info.target_slot,
          target_node.id,
        ])
      }
    }
  }

  return copied
}


LCanvas.prototype.copyToClipboard = function () {
  const copied = this.copySelectedNodes()
  localStorage.setItem('graphclipboard', JSON.stringify(copied))
}

LCanvas.prototype.pasteNodes = function (data) {
  this.graph.beforeChange()

  // calculate top-left node, could work without this processing but using diff with last node pos :: data.nodes[data.nodes.length-1].pos
  var posMin = false
  var posMinIndexes = false
  for (var i = 0; i < data.nodes.length; ++i) {
    if (posMin) {
      if (posMin[0] > data.nodes[i].pos[0]) {
        posMin[0] = data.nodes[i].pos[0]
        posMinIndexes[0] = i
      }
      if (posMin[1] > data.nodes[i].pos[1]) {
        posMin[1] = data.nodes[i].pos[1]
        posMinIndexes[1] = i
      }
    } else {
      posMin = [data.nodes[i].pos[0], data.nodes[i].pos[1]]
      posMinIndexes = [i, i]
    }
  }
  var nodes = []
  for (var i = 0; i < data.nodes.length; ++i) {
    var node_data = data.nodes[i]
    var node = LiteGraph.createNode(node_data.type)
    if (node) {
      node.configure(node_data)
      const gx = this.graph_mouse[0]
      const gy = this.graph_mouse[1]
      //paste in last known mouse position
      node.pos[0] += gx - posMin[0] //+= 5;
      node.pos[1] += gy - posMin[1] //+= 5;

      this.graph.add(node, { doProcessChange: false })

      nodes.push(node)
    }
  }

  //create links
  for (var i = 0; i < data.links.length; ++i) {
    var link_info = data.links[i]
    var origin_node
    var origin_node_relative_id = link_info[0]
    if (origin_node_relative_id != null) {
      origin_node = nodes[origin_node_relative_id]
    } else if (LiteGraph.ctrl_shift_v_paste_connect_unselected_outputs && isConnectUnselected) {
      var origin_node_id = link_info[4]
      if (origin_node_id) {
        origin_node = this.graph.getNodeById(origin_node_id)
      }
    }
    var target_node = nodes[link_info[2]]
    if (origin_node && target_node) origin_node.connect(link_info[1], target_node, link_info[3])
    else console.warn('Warning, nodes missing on pasting')
  }

  this.selectNodes(nodes)

  this.graph.afterChange()
}

LCanvas.prototype.pasteFromClipboard = function (isConnectUnselected = false) {
  // if ctrl + shift + v is off, return when isConnectUnselected is true (shift is pressed) to maintain old behavior
  if (!LiteGraph.ctrl_shift_v_paste_connect_unselected_outputs && isConnectUnselected) {
    return
  }

  const data = localStorage.getItem('graphclipboard')
  if (!data) {
    return
  }

  this.pasteNodes(JSON.parse(data))
}

//called if the graph doesn't have a default drop item behaviour
LCanvas.prototype.checkDropItem = function (e) {
  if (e.dataTransfer.files.length) {
    var file = e.dataTransfer.files[0]
    var ext = LCanvas.getFileExtension(file.name).toLowerCase()
    var nodetype = LiteGraph.node_types_by_file_extension[ext]
    if (nodetype) {
      this.graph.beforeChange()
      var node = LiteGraph.createNode(nodetype.type)
      node.pos = [e.canvasX, e.canvasY]
      this.graph.add(node)
      if (node.onDropFile) {
        node.onDropFile(file)
      }
      this.graph.afterChange()
    }
  }
}

LCanvas.prototype.processNodeDblClicked = function (node, clickedWidget=null) {
  let preventDefault = false

  if (this.onNodeDblClicked) {
    preventDefault = this.onNodeDblClicked(node, clickedWidget)
  }

  if (this.onShowNodePanel) {
    this.onShowNodePanel(node, clickedWidget)
  } else if (!preventDefault) {
    showDefaultNodePanel(this, node, clickedWidget)
  }

  this.setDirty(true)
}

LCanvas.prototype.processNodeSelected = function (node, e) {
  const numSelectedNodes = Object.keys(this.selected_nodes).length

  if (numSelectedNodes>1) {
    /* sdfx: don't need to hold shift key to move multiple selected nodes
     */
    this.selectNode(node, true)
  } else {
    this.selectNode(node, e && (e.shiftKey || e.ctrlKey || this.multi_select))
  }

  if (this.onNodeSelected) {
    this.onNodeSelected(node)
  }
}

/**
 * selects a given node (or adds it to the current selection)
 * @method selectNode
 **/
LCanvas.prototype.selectNode = function (node, add_to_current_selection) {
  if (!node) {
    this.deselectAllNodes()
  } else {
    this.selectNodes([node], add_to_current_selection)
  }
}

/**
 * selects several nodes (or adds them to the current selection)
 * @method selectNodes
 **/
LCanvas.prototype.selectNodes = function (nodes, add_to_current_selection) {
  if (!add_to_current_selection) {
    this.deselectAllNodes()
  }

  nodes = nodes || this.graph._nodes
  if (typeof nodes == 'string') nodes = [nodes]
  for (var i in nodes) {
    var node = nodes[i]
    if (node.is_selected) {
      this.deselectNode(node)
      continue
    }

    if (!node.is_selected && node.onSelected) {
      node.onSelected()
    }
    node.is_selected = true
    this.selected_nodes[node.id] = node

    if (node.inputs) {
      for (var j = 0; j < node.inputs.length; ++j) {
        this.highlighted_links[node.inputs[j].link] = true
      }
    }
    if (node.outputs) {
      for (var j = 0; j < node.outputs.length; ++j) {
        var out = node.outputs[j]
        if (out.links) {
          for (var k = 0; k < out.links.length; ++k) {
            this.highlighted_links[out.links[k]] = true
          }
        }
      }
    }
  }

  if (this.onSelectionChange) this.onSelectionChange(this.selected_nodes)

  this.setDirty(true)
}

/**
 * removes a node from the current selection
 * @method deselectNode
 **/
LCanvas.prototype.deselectNode = function (node) {
  if (!node.is_selected) {
    return
  }
  if (node.onDeselected) {
    node.onDeselected()
  }
  node.is_selected = false

  if (this.onNodeDeselected) {
    this.onNodeDeselected(node)
  }

  //remove highlighted
  if (node.inputs) {
    for (var i = 0; i < node.inputs.length; ++i) {
      delete this.highlighted_links[node.inputs[i].link]
    }
  }
  if (node.outputs) {
    for (var i = 0; i < node.outputs.length; ++i) {
      var out = node.outputs[i]
      if (out.links) {
        for (var j = 0; j < out.links.length; ++j) {
          delete this.highlighted_links[out.links[j]]
        }
      }
    }
  }
}

/**
 * removes all nodes from the current selection
 * @method deselectAllNodes
 **/
LCanvas.prototype.deselectAllNodes = function () {
  if (!this.graph) {
    return
  }
  var nodes = this.graph._nodes
  for (var i = 0, l = nodes.length; i < l; ++i) {
    var node = nodes[i]
    if (!node.is_selected) {
      continue
    }
    if (node.onDeselected) {
      node.onDeselected()
    }
    node.is_selected = false
    if (this.onNodeDeselected) {
      this.onNodeDeselected(node)
    }
  }
  this.selected_nodes = {}
  this.current_node = null
  this.highlighted_links = {}
  if (this.onSelectionChange) this.onSelectionChange(this.selected_nodes)
  this.setDirty(true)
}

/**
 * deletes all nodes in the current selection from the graph
 * @method deleteSelectedNodes
 **/
LCanvas.prototype.deleteSelectedNodes = function () {
  this.graph.beforeChange()

  for (var i in this.selected_nodes) {
    var node = this.selected_nodes[i]

    if (node.block_delete) continue

    //autoconnect when possible (very basic, only takes into account first input-output)
    if (
      node.inputs &&
      node.inputs.length &&
      node.outputs &&
      node.outputs.length &&
      LiteGraph.isValidConnection(node.inputs[0].type, node.outputs[0].type) &&
      node.inputs[0].link &&
      node.outputs[0].links &&
      node.outputs[0].links.length
    ) {
      var input_link = node.graph.links[node.inputs[0].link]
      var output_link = node.graph.links[node.outputs[0].links[0]]
      var input_node = node.getInputNode(0)
      var output_node = node.getOutputNodes(0)[0]
      if (input_node && output_node) input_node.connect(input_link.origin_slot, output_node, output_link.target_slot)
    }
    this.graph.remove(node)
    if (this.onNodeDeselected) {
      this.onNodeDeselected(node)
    }
  }
  this.selected_nodes = {}
  this.current_node = null
  this.highlighted_links = {}
  this.setDirty(true)
  this.graph.afterChange()
}

/**
 * centers the camera on a given node
 * @method centerOnNode
 **/
LCanvas.prototype.centerOnNode = function (node) {
  this.ds.offset[0] = -node.pos[0] - node.size[0] * 0.5 + (this.canvas.width * 0.5) / this.ds.scale
  this.ds.offset[1] = -node.pos[1] - node.size[1] * 0.5 + (this.canvas.height * 0.5) / this.ds.scale
  this.setDirty(true, true)

  if (this.onPositionChanged) {
    this.onPositionChanged({
      x: this.ds.offset[0],
      y: this.ds.offset[1]
    })
  }
}

/**
 * Centers the camera on a given node (animated version)
 * @method animateToNode
 **/
LCanvas.prototype.animateToNode = function (node, duration = 350, zoom = 0.75, easing = 'easeInOutQuad') {
  let animationId = null
  const startTimestamp = performance.now()
  const startX = this.ds.offset[0]
  const startY = this.ds.offset[1]
  const startScale = this.ds.scale
  const cw = this.canvas.width / window.devicePixelRatio
  const ch = this.canvas.height / window.devicePixelRatio

  let targetScale = startScale
  let targetX = startX
  let targetY = startY

  if (zoom>0) {
    // Calculate the new scale where the node size is 70% of the canvas size
    const targetScaleX = zoom * cw / Math.max(node.size[0], 300)
    const targetScaleY = zoom * ch / Math.max(node.size[1], 300)

    // Choose the smaller scale to ensure the node fits into the viewport
    // Ensure we don't go over the max scale
    targetScale = Math.min(targetScaleX, targetScaleY, this.ds.max_scale)
    targetX = -node.pos[0] - node.size[0] * 0.5 + (cw * 0.5) / targetScale
    targetY = -node.pos[1] - node.size[1] * 0.5 + (ch * 0.5) / targetScale
  } else {
    targetX = -node.pos[0] - node.size[0] * 0.5 + (cw * 0.5) / targetScale
    targetY = -node.pos[1] - node.size[1] * 0.5 + (ch * 0.5) / targetScale
  }

  const easeFunctions = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  }
  const easeFunction = easeFunctions[easing] || easeFunctions.linear

  const animate = (timestamp) => {
    const elapsed = timestamp - startTimestamp
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeFunction(progress)

    this.ds.offset[0] = startX + (targetX - startX) * easedProgress
    this.ds.offset[1] = startY + (targetY - startY) * easedProgress      

    if (zoom>0) {
      this.ds.scale = startScale + (targetScale - startScale) * easedProgress
    }

    this.setDirty(true, true)

    if (this.onPositionChanged) {
      this.onPositionChanged({
        x: this.ds.offset[0],
        y: this.ds.offset[1],
        scale: this.ds.scale
      })
    }

    if (progress < 1) {
      animationId = requestAnimationFrame(animate)
    } else {
      cancelAnimationFrame(animationId)
    }
  }

  animationId = requestAnimationFrame(animate)
}


/**
 * adds some useful properties to a mouse event, like the position in graph coordinates
 * @method adjustMouseEvent
 **/
LCanvas.prototype.adjustMouseEvent = function (e) {
  var clientX_rel = 0
  var clientY_rel = 0

  if (this.canvas) {
    var b = this.canvas.getBoundingClientRect()
    clientX_rel = e.clientX - b.left
    clientY_rel = e.clientY - b.top
  } else {
    clientX_rel = e.clientX
    clientY_rel = e.clientY
  }

  // e.deltaX = clientX_rel - this.last_mouse_position[0]
  // e.deltaY = clientY_rel- this.last_mouse_position[1]

  this.last_mouse_position[0] = clientX_rel
  this.last_mouse_position[1] = clientY_rel

  e.canvasX = clientX_rel / this.ds.scale - this.ds.offset[0]
  e.canvasY = clientY_rel / this.ds.scale - this.ds.offset[1]

  //console.log("pointerevents: adjustMouseEvent "+e.clientX+":"+e.clientY+" "+clientX_rel+":"+clientY_rel+" "+e.canvasX+":"+e.canvasY);
}

/**
 * changes the zoom level of the graph (default is 1), you can pass also a place used to pivot the zoom
 * @method setZoom
 **/
LCanvas.prototype.setZoom = function (value, zooming_center) {
  this.ds.changeScale(value, zooming_center)
  this.dirty_canvas = true
  this.dirty_bgcanvas = true
}

/**
 * changes the zoom level to fit the graph
 * @method setZoom
 **/
LCanvas.prototype.zoomFit = function(maxZoom=0.95) {
  const nodes = this.graph._nodes
  
  if (!nodes || nodes.length === 0) return

  let min_x = Infinity
  let min_y = Infinity
  let max_x = -Infinity
  let max_y = -Infinity

  // Calculate boundaries
  for (let i = 0; i < nodes.length; ++i) {
    let node = nodes[i]
    min_x = Math.min(node.pos[0] - 20, min_x)
    min_y = Math.min(node.pos[1] - 20, min_y)
    max_x = Math.max(node.pos[0] + node.size[0] + 20, max_x)
    max_y = Math.max(node.pos[1] + node.size[1] + 20, max_y)
  }

  // Calculate scale
  const vw = this.canvas.width / window.devicePixelRatio
  const vh = this.canvas.height / window.devicePixelRatio

  const gw = (max_x - min_x)
  const gh = (max_y - min_y)

  const sx = (vw / gw) * maxZoom
  const sy = (vh / gh) * maxZoom

  const scale = Math.min(sx, sy)
  const px = (0 - min_x) 
  const py = (0 - min_y)

  // Call changeScale method with the new scale and the center of the graph
  this.ds.setScale(scale)
  this.ds.setCoords(px + (vw-(gw*scale))/maxZoom, py + (vh-(gh*scale))/maxZoom)

  this.dirty_bgcanvas = true
  this.dirty_canvas = true
  this.draw(true, true)
}

/**
 * changes position of the graph
 * @method setZoom
 **/
LCanvas.prototype.setPosition = function ({x, y}) {
  this.ds.offset[0] = Number(x)
  this.ds.offset[1] = Number(y)
  this.dirty_canvas = true
  this.dirty_bgcanvas = true
}

/**
 * converts a coordinate from graph coordinates to canvas2D coordinates
 * @method convertOffsetToCanvas
 **/
LCanvas.prototype.convertOffsetToCanvas = function (pos, out) {
  return this.ds.convertOffsetToCanvas(pos, out)
}

/**
 * converts a coordinate from Canvas2D coordinates to graph space
 * @method convertCanvasToOffset
 **/
LCanvas.prototype.convertCanvasToOffset = function (pos, out) {
  return this.ds.convertCanvasToOffset(pos, out)
}

//converts event coordinates from canvas2D to graph coordinates
LCanvas.prototype.convertEventToCanvasOffset = function (e) {
  var rect = this.canvas.getBoundingClientRect()
  return this.convertCanvasToOffset([e.clientX - rect.left, e.clientY - rect.top])
}

/**
 * brings a node to front (above all other nodes)
 * @method bringToFront
 **/
LCanvas.prototype.bringToFront = function (node) {
  var i = this.graph._nodes.indexOf(node)
  if (i == -1) {
    return
  }

  this.graph._nodes.splice(i, 1)
  this.graph._nodes.push(node)
}

/**
 * sends a node to the back (below all other nodes)
 * @method sendToBack
 **/
LCanvas.prototype.sendToBack = function (node) {
  var i = this.graph._nodes.indexOf(node)
  if (i == -1) {
    return
  }

  this.graph._nodes.splice(i, 1)
  this.graph._nodes.unshift(node)
}

/* Interaction */

/* LCanvas render */
var temp = new Float32Array(4)

/**
 * checks which nodes are visible (inside the camera area)
 * @method computeVisibleNodes
 **/
LCanvas.prototype.computeVisibleNodes = function (nodes, out) {
  var visible_nodes = out || []
  visible_nodes.length = 0
  nodes = nodes || this.graph._nodes
  for (var i = 0, l = nodes.length; i < l; ++i) {
    var n = nodes[i]

    //skip rendering nodes in live mode
    if (this.live_mode && !n.onDrawBackground && !n.onDrawForeground) {
      continue
    }

    if (!LiteGraph.overlapBounding(this.visible_area, n.getBounding(temp))) {
      continue
    } //out of the visible area

    visible_nodes.push(n)
  }
  return visible_nodes
}

/**
 * renders the whole canvas content, by rendering in two separated canvas, one containing the background grid and the connections, and one containing the nodes)
 * @method draw
 **/
LCanvas.prototype.draw = function (force_canvas, force_bgcanvas) {
  if (!this.canvas || this.canvas.width === 0 || this.canvas.height === 0) {
    return
  }

  //fps counting
  var now = LiteGraph.getTime()
  this.render_time = (now - this.last_draw_time) * 0.001
  this.last_draw_time = now

  if (this.graph) {
    this.ds.computeVisibleArea(this.viewport)
  }

  if (this.dirty_bgcanvas || force_bgcanvas || this.always_render_background || (this.graph && this.graph._last_trigger_time && now - this.graph._last_trigger_time < 1000)) {
    this.drawBackCanvas()
  }

  if (this.dirty_canvas || force_canvas) {
    this.drawFrontCanvas()
  }

  this.fps = this.render_time ? 1.0 / this.render_time : 0
  this.frame += 1
}

/**
 * draws the front canvas (the one containing all the nodes)
 * @method drawFrontCanvas
 **/
LCanvas.prototype.drawFrontCanvas = function () {
  this.dirty_canvas = false

  if (!this.ctx) {
    this.ctx = this.bgcanvas.getContext('2d')
  }
  var ctx = this.ctx
  if (!ctx) {
    //maybe is using webgl...
    return
  }

  var canvas = this.canvas
  if (ctx.start2D && !this.viewport) {
    ctx.start2D()
    ctx.restore()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }

  //clip dirty area if there is one, otherwise work in full canvas
  var area = this.viewport || this.dirty_area
  if (area) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(area[0], area[1], area[2], area[3])
    ctx.clip()
  }

  //clear
  //canvas.width = canvas.width;
  if (this.clear_background) {
    if (area) ctx.clearRect(area[0], area[1], area[2], area[3])
    else ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  //draw bg canvas
  if (this.bgcanvas == this.canvas) {
    this.drawBackCanvas()
  } else {
    ctx.drawImage(this.bgcanvas, 0, 0)
  }

  //rendering
  if (this.onRender) {
    this.onRender(canvas, ctx)
  }

  //info widget
  if (this.show_info) {
    this.renderInfo(ctx, area ? area[0] : 0, area ? area[1] : 0)
  }

  if (this.graph) {
    //apply transformations
    ctx.save()
    this.ds.toCanvasContext(ctx)

    //draw nodes
    var drawn_nodes = 0
    var visible_nodes = this.computeVisibleNodes(null, this.visible_nodes)

    for (var i = 0; i < visible_nodes.length; ++i) {
      var node = visible_nodes[i]

      //transform coords system
      ctx.save()
      ctx.translate(node.pos[0], node.pos[1])

      //Draw
      this.drawNode(node, ctx)
      drawn_nodes += 1

      //Restore
      ctx.restore()
    }

    //on top (debug)
    if (this.render_execution_order) {
      this.drawExecutionOrder(ctx)
    }

    //connections ontop?
    if (this.graph.config.links_ontop) {
      if (!this.live_mode) {
        this.drawConnections(ctx)
      }
    }

    //current connection (the one being dragged by the mouse)
    if (this.connecting_pos != null) {
      ctx.lineWidth = this.connections_width
      var link_color = null

      var connInOrOut = this.connecting_output || this.connecting_input

      var connType = connInOrOut.type
      var connDir = connInOrOut.dir
      if (connDir == null) {
        if (this.connecting_output) connDir = this.connecting_node.horizontal ? LiteGraph.DOWN : LiteGraph.RIGHT
        else connDir = this.connecting_node.horizontal ? LiteGraph.UP : LiteGraph.LEFT
      }
      var connShape = connInOrOut.shape

      switch (connType) {
        case LiteGraph.EVENT:
          link_color = LiteGraph.EVENT_LINK_COLOR
          break
        default:
          link_color = LiteGraph.CONNECTING_LINK_COLOR
      }

      //the connection being dragged by the mouse
      this.renderLink(ctx, this.connecting_pos, [this.graph_mouse[0], this.graph_mouse[1]], null, false, null, link_color, connDir, LiteGraph.CENTER)

      ctx.beginPath()
      if (connType === LiteGraph.EVENT || connShape === LiteGraph.BOX_SHAPE) {
        ctx.rect(this.connecting_pos[0] - 6 + 0.5, this.connecting_pos[1] - 5 + 0.5, 14, 10)
        ctx.fill()
        ctx.beginPath()
        ctx.rect(this.graph_mouse[0] - 6 + 0.5, this.graph_mouse[1] - 5 + 0.5, 14, 10)
      } else if (connShape === LiteGraph.ARROW_SHAPE) {
        ctx.moveTo(this.connecting_pos[0] + 8, this.connecting_pos[1] + 0.5)
        ctx.lineTo(this.connecting_pos[0] - 4, this.connecting_pos[1] + 6 + 0.5)
        ctx.lineTo(this.connecting_pos[0] - 4, this.connecting_pos[1] - 6 + 0.5)
        ctx.closePath()
      } else {
        ctx.arc(this.connecting_pos[0], this.connecting_pos[1], 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(this.graph_mouse[0], this.graph_mouse[1], 4, 0, Math.PI * 2)
      }
      ctx.fill()

      ctx.fillStyle = '#ffcc00'
      if (this._highlight_input) {
        ctx.beginPath()
        var shape = this._highlight_input_slot.shape
        if (shape === LiteGraph.ARROW_SHAPE) {
          ctx.moveTo(this._highlight_input[0] + 8, this._highlight_input[1] + 0.5)
          ctx.lineTo(this._highlight_input[0] - 4, this._highlight_input[1] + 6 + 0.5)
          ctx.lineTo(this._highlight_input[0] - 4, this._highlight_input[1] - 6 + 0.5)
          ctx.closePath()
        } else {
          ctx.arc(this._highlight_input[0], this._highlight_input[1], 6, 0, Math.PI * 2)
        }
        ctx.fill()
      }
      if (this._highlight_output) {
        ctx.beginPath()
        if (shape === LiteGraph.ARROW_SHAPE) {
          ctx.moveTo(this._highlight_output[0] + 8, this._highlight_output[1] + 0.5)
          ctx.lineTo(this._highlight_output[0] - 4, this._highlight_output[1] + 6 + 0.5)
          ctx.lineTo(this._highlight_output[0] - 4, this._highlight_output[1] - 6 + 0.5)
          ctx.closePath()
        } else {
          ctx.arc(this._highlight_output[0], this._highlight_output[1], 6, 0, Math.PI * 2)
        }
        ctx.fill()
      }
    }

    //the selection rectangle
    if (this.dragging_rectangle) {
      ctx.strokeStyle = '#54d1db'
      ctx.fillStyle = '#38bec915'
      ctx.fillRect(this.dragging_rectangle[0], this.dragging_rectangle[1], this.dragging_rectangle[2], this.dragging_rectangle[3])
      ctx.strokeRect(this.dragging_rectangle[0], this.dragging_rectangle[1], this.dragging_rectangle[2], this.dragging_rectangle[3])
    }

    //on top of link center
    if (this.over_link_center && this.render_link_tooltip) this.drawLinkTooltip(ctx, this.over_link_center)
    else if (this.onDrawLinkTooltip)
      //to remove
      this.onDrawLinkTooltip(ctx, null)

    //custom info
    if (this.onDrawForeground) {
      this.onDrawForeground(ctx, this.visible_rect)
    }

    ctx.restore()
  }

  //draws panel in the corner
  if (this._graph_stack && this._graph_stack.length) {
    this.drawSubgraphPanel(ctx)
  }

  if (this.onDrawOverlay) {
    this.onDrawOverlay(ctx)
  }

  if (area) {
    ctx.restore()
  }

  if (ctx.finish2D) {
    //this is a function I use in webgl renderer
    ctx.finish2D()
  }
}

/**
 * draws the panel in the corner that shows subgraph properties
 * @method drawSubgraphPanel
 **/
LCanvas.prototype.drawSubgraphPanel = function (ctx) {
  var subgraph = this.graph
  var subnode = subgraph._subgraph_node
  if (!subnode) {
    console.warn('subgraph without subnode')
    return
  }
  this.drawSubgraphPanelLeft(subgraph, subnode, ctx)
  this.drawSubgraphPanelRight(subgraph, subnode, ctx)
}

LCanvas.prototype.drawSubgraphPanelLeft = function (subgraph, subnode, ctx) {
  var num = subnode.inputs ? subnode.inputs.length : 0
  var w = 200
  var h = Math.floor(LiteGraph.NODE_SLOT_HEIGHT * 1.6)

  ctx.fillStyle = '#111'
  ctx.globalAlpha = 0.8
  ctx.beginPath()
  ctx.roundRect(10, 10, w, (num + 1) * h + 50, [8])
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.fillStyle = '#888'
  ctx.font = '14px Arial'
  ctx.textAlign = 'left'
  ctx.fillText('Graph Inputs', 20, 34)
  // var pos = this.mouse;

  if (this.drawButton(w - 20, 20, 20, 20, 'X', '#151515')) {
    this.closeSubgraph()
    return
  }

  var y = 50
  ctx.font = '14px Arial'
  if (subnode.inputs)
    for (var i = 0; i < subnode.inputs.length; ++i) {
      var input = subnode.inputs[i]
      if (input.not_subgraph_input) continue

      //input button clicked
      if (this.drawButton(20, y + 2, w - 20, h - 2)) {
        var type = subnode.constructor.input_node_type || 'graph/input'
        this.graph.beforeChange()
        var newnode = LiteGraph.createNode(type)
        if (newnode) {
          subgraph.add(newnode)
          this.block_click = false
          this.last_click_position = null
          this.selectNodes([newnode])
          this.node_dragged = newnode
          this.dragging_canvas = false
          newnode.setProperty('name', input.name)
          newnode.setProperty('type', input.type)
          this.node_dragged.pos[0] = this.graph_mouse[0] - 5
          this.node_dragged.pos[1] = this.graph_mouse[1] - 5
          this.graph.afterChange()
        } else console.error('graph input node not found:', type)
      }
      ctx.fillStyle = '#9C9'
      ctx.beginPath()
      ctx.arc(w - 16, y + h * 0.5, 5, 0, 2 * Math.PI)
      ctx.fill()
      ctx.fillStyle = '#AAA'
      ctx.fillText(input.name, 30, y + h * 0.75)
      // var tw = ctx.measureText(input.name);
      ctx.fillStyle = '#777'
      ctx.fillText(input.type, 130, y + h * 0.75)
      y += h
    }
  //add + button
  if (this.drawButton(20, y + 2, w - 20, h - 2, '+', '#151515', '#222')) {
    showSubgraphPropertiesDialog(this.canvas, subnode)
  }
}
LCanvas.prototype.drawSubgraphPanelRight = function (subgraph, subnode, ctx) {
  var num = subnode.outputs ? subnode.outputs.length : 0
  var canvas_w = this.bgcanvas.width
  var w = 200
  var h = Math.floor(LiteGraph.NODE_SLOT_HEIGHT * 1.6)

  ctx.fillStyle = '#111'
  ctx.globalAlpha = 0.8
  ctx.beginPath()
  ctx.roundRect(canvas_w - w - 10, 10, w, (num + 1) * h + 50, [8])
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.fillStyle = '#888'
  ctx.font = '14px Arial'
  ctx.textAlign = 'left'
  var title_text = 'Graph Outputs'
  var tw = ctx.measureText(title_text).width
  ctx.fillText(title_text, canvas_w - tw - 20, 34)
  // var pos = this.mouse;
  if (this.drawButton(canvas_w - w, 20, 20, 20, 'X', '#151515')) {
    this.closeSubgraph()
    return
  }

  var y = 50
  ctx.font = '14px Arial'
  if (subnode.outputs)
    for (var i = 0; i < subnode.outputs.length; ++i) {
      var output = subnode.outputs[i]
      if (output.not_subgraph_input) continue

      //output button clicked
      if (this.drawButton(canvas_w - w, y + 2, w - 20, h - 2)) {
        var type = subnode.constructor.output_node_type || 'graph/output'
        this.graph.beforeChange()
        var newnode = LiteGraph.createNode(type)
        if (newnode) {
          subgraph.add(newnode)
          this.block_click = false
          this.last_click_position = null
          this.selectNodes([newnode])
          this.node_dragged = newnode
          this.dragging_canvas = false
          newnode.setProperty('name', output.name)
          newnode.setProperty('type', output.type)
          this.node_dragged.pos[0] = this.graph_mouse[0] - 5
          this.node_dragged.pos[1] = this.graph_mouse[1] - 5
          this.graph.afterChange()
        } else console.error('graph input node not found:', type)
      }
      ctx.fillStyle = '#9C9'
      ctx.beginPath()
      ctx.arc(canvas_w - w + 16, y + h * 0.5, 5, 0, 2 * Math.PI)
      ctx.fill()
      ctx.fillStyle = '#AAA'
      ctx.fillText(output.name, canvas_w - w + 30, y + h * 0.75)
      // var tw = ctx.measureText(input.name);
      ctx.fillStyle = '#777'
      ctx.fillText(output.type, canvas_w - w + 130, y + h * 0.75)
      y += h
    }
  //add + button
  if (this.drawButton(canvas_w - w, y + 2, w - 20, h - 2, '+', '#151515', '#222')) {
    showSubgraphPropertiesDialogRight(this.canvas, subnode)
  }
}
//Draws a button into the canvas overlay and computes if it was clicked using the immediate gui paradigm
LCanvas.prototype.drawButton = function (x, y, w, h, text, bgcolor, hovercolor, textcolor) {
  var ctx = this.ctx
  bgcolor = bgcolor || LiteGraph.NODE_DEFAULT_COLOR
  hovercolor = hovercolor || '#555'
  textcolor = textcolor || LiteGraph.NODE_TEXT_COLOR
  var pos = this.ds.convertOffsetToCanvas(this.graph_mouse)
  var hover = LiteGraph.isInsideRectangle(pos[0], pos[1], x, y, w, h)
  pos = this.last_click_position ? [this.last_click_position[0], this.last_click_position[1]] : null
  if (pos) {
    var rect = this.canvas.getBoundingClientRect()
    pos[0] -= rect.left
    pos[1] -= rect.top
  }
  var clicked = pos && LiteGraph.isInsideRectangle(pos[0], pos[1], x, y, w, h)

  ctx.fillStyle = hover ? hovercolor : bgcolor
  if (clicked) ctx.fillStyle = '#AAA'
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, [4])
  ctx.fill()

  if (text != null) {
    if (text.constructor == String) {
      ctx.fillStyle = textcolor
      ctx.textAlign = 'center'
      ctx.font = ((h * 0.65) | 0) + 'px Arial'
      ctx.fillText(text, x + w * 0.5, y + h * 0.75)
      ctx.textAlign = 'left'
    }
  }

  var was_clicked = clicked && !this.block_click
  if (clicked) this.blockClick()
  return was_clicked
}

LCanvas.prototype.isAreaClicked = function (x, y, w, h, hold_click) {
  var pos = this.mouse
  var hover = LiteGraph.isInsideRectangle(pos[0], pos[1], x, y, w, h)
  pos = this.last_click_position
  var clicked = pos && LiteGraph.isInsideRectangle(pos[0], pos[1], x, y, w, h)
  var was_clicked = clicked && !this.block_click
  if (clicked && hold_click) this.blockClick()
  return was_clicked
}

/**
 * draws some useful stats in the corner of the canvas
 * @method renderInfo
 **/
LCanvas.prototype.renderInfo = function (ctx, x, y) {
  x = x || 10
  y = y || 10 // this.canvas.height - 170

  ctx.save()
  ctx.translate(x, y)

  ctx.font = '10px Arial'
  ctx.fillStyle = '#888'
  ctx.textAlign = 'left'
  if (this.graph) {
    ctx.fillText('T: ' + this.graph.globaltime.toFixed(2) + 's', 5, 13 * 1)
    ctx.fillText('I: ' + this.graph.iteration, 5, 13 * 2)
    ctx.fillText('N: ' + this.graph._nodes.length + ' [' + this.visible_nodes.length + ']', 5, 13 * 3)
    ctx.fillText('V: ' + this.graph._version, 5, 13 * 4)
    ctx.fillText('FPS:' + this.fps.toFixed(2), 5, 13 * 5)
  } else {
    ctx.fillText('No graph selected', 5, 13 * 1)
  }
  ctx.restore()
}

/**
 * draws the back canvas (the one containing the background and the connections)
 * @method drawBackCanvas
 **/
LCanvas.prototype.drawBackCanvas = function () {
  var canvas = this.bgcanvas
  if (canvas.width != this.canvas.width || canvas.height != this.canvas.height) {
    canvas.width = this.canvas.width
    canvas.height = this.canvas.height
  }

  if (!this.bgctx) {
    this.bgctx = this.bgcanvas.getContext('2d')
  }
  var ctx = this.bgctx
  if (ctx.start) {
    ctx.start()
  }

  var viewport = this.viewport || [0, 0, ctx.canvas.width, ctx.canvas.height]

  //clear
  if (this.clear_background) {
    ctx.clearRect(viewport[0], viewport[1], viewport[2], viewport[3])
  }

  //show subgraph stack header
  if (this._graph_stack && this._graph_stack.length) {
    ctx.save()
    var parent_graph = this._graph_stack[this._graph_stack.length - 1]
    var subgraph_node = this.graph._subgraph_node
    ctx.strokeStyle = subgraph_node.bgcolor
    ctx.lineWidth = 10
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2)
    ctx.lineWidth = 1
    ctx.font = '40px Arial'
    ctx.textAlign = 'center'
    ctx.fillStyle = subgraph_node.bgcolor || '#AAA'
    var title = ''
    for (var i = 1; i < this._graph_stack.length; ++i) {
      title += this._graph_stack[i]._subgraph_node.getTitle() + ' >> '
    }
    ctx.fillText(title + subgraph_node.getTitle(), canvas.width * 0.5, 40)
    ctx.restore()
  }

  var bg_already_painted = false
  if (this.onRenderBackground) {
    bg_already_painted = this.onRenderBackground(canvas, ctx)
  }

  //reset in case of error
  if (!this.viewport) {
    ctx.restore()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }
  this.visible_links.length = 0

  if (this.graph) {
    //apply transformations
    ctx.save()
    this.ds.toCanvasContext(ctx)

    //render BG
    if (this.ds.scale < 1.5 && !bg_already_painted && this.clear_background_color) {
      ctx.fillStyle = this.clear_background_color
      ctx.fillRect(this.visible_area[0], this.visible_area[1], this.visible_area[2], this.visible_area[3])
    }

    if (this.background_image && this.ds.scale > 0.5 && !bg_already_painted) {
      if (this.zoom_modify_alpha) {
        ctx.globalAlpha = (1.0 - 0.5 / this.ds.scale) * this.editor_alpha
      } else {
        ctx.globalAlpha = this.editor_alpha
      }
      ctx.imageSmoothingEnabled = ctx.imageSmoothingEnabled = false // ctx.mozImageSmoothingEnabled =
      if (!this._bg_img || this._bg_img.name != this.background_image) {
        this._bg_img = new Image()
        this._bg_img.name = this.background_image
        this._bg_img.src = this.background_image
        var that = this
        this._bg_img.onload = function () {
          that.draw(true, true)
        }
      }

      var pattern = null
      if (this._pattern == null && this._bg_img.width > 0) {
        pattern = ctx.createPattern(this._bg_img, 'repeat')
        this._pattern_img = this._bg_img
        this._pattern = pattern
      } else {
        pattern = this._pattern
      }
      if (pattern) {
        ctx.fillStyle = pattern
        ctx.fillRect(this.visible_area[0], this.visible_area[1], this.visible_area[2], this.visible_area[3])
        ctx.fillStyle = 'transparent'
      }

      ctx.globalAlpha = 1.0
      ctx.imageSmoothingEnabled = ctx.imageSmoothingEnabled = true //= ctx.mozImageSmoothingEnabled
    }

    //groups
    if (this.graph._groups.length && !this.live_mode) {
      this.drawGroups(canvas, ctx)
    }

    if (this.onDrawBackground) {
      this.onDrawBackground(ctx, this.visible_area)
    }
    if (this.onBackgroundRender) {
      //LEGACY
      console.error('WARNING! onBackgroundRender deprecated, now is named onDrawBackground ')
      this.onBackgroundRender = null
    }

    //DEBUG: show clipping area
    //ctx.fillStyle = "red";
    //ctx.fillRect( this.visible_area[0] + 10, this.visible_area[1] + 10, this.visible_area[2] - 20, this.visible_area[3] - 20);

    //bg
    if (this.render_canvas_border) {
      ctx.strokeStyle = '#235'
      ctx.strokeRect(0, 0, canvas.width, canvas.height)
    }

    if (this.render_connections_shadows) {
      ctx.shadowColor = '#000'
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.shadowBlur = 6
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0)'
    }

    //draw connections
    if (!this.live_mode) {
      this.drawConnections(ctx)
    }

    ctx.shadowColor = 'rgba(0,0,0,0)'

    //restore state
    ctx.restore()
  }

  if (ctx.finish) {
    ctx.finish()
  }

  this.dirty_bgcanvas = false
  this.dirty_canvas = true //to force to repaint the front canvas with the bgcanvas
}

var temp_vec2 = new Float32Array(2)

/**
 * draws the given node inside the canvas
 * @method drawNode
 **/
LCanvas.prototype.drawNode = function (node, ctx) {
  if (this.onBeforeDrawNode) {
    this.onBeforeDrawNode(node, ctx)
  }

  var glow = false
  this.current_node = node

  var color = node.color || node.constructor.color || LiteGraph.NODE_DEFAULT_COLOR
  var bgcolor = node.bgcolor || node.constructor.bgcolor || LiteGraph.NODE_DEFAULT_BGCOLOR

  //shadow and glow
  if (node.mouseOver) {
    glow = true
  }

  var low_scale = this.ds.scale < 0.6 //zoomed out

  //only render if it forces it to do it
  if (this.live_mode) {
    if (!node.flags.collapsed) {
      ctx.shadowColor = 'transparent'
      if (node.onDrawForeground) {
        node.onDrawForeground(ctx, this, this.canvas)
      }
    }
    return
  }

  var editor_alpha = this.editor_alpha
  ctx.globalAlpha = editor_alpha

  if (this.render_shadows && !low_scale) {
    ctx.shadowColor = LiteGraph.DEFAULT_SHADOW_COLOR
    ctx.shadowOffsetX = 0 * this.ds.scale
    ctx.shadowOffsetY = 5 * this.ds.scale
    ctx.shadowBlur = 12 * this.ds.scale
  } else {
    ctx.shadowColor = 'transparent'
  }

  //custom draw collapsed method (draw after shadows because they are affected)
  if (node.flags.collapsed && node.onDrawCollapsed && node.onDrawCollapsed(ctx, this) == true) {
    return
  }

  //clip if required (mask)
  var shape = node._shape || LiteGraph.BOX_SHAPE
  var size = temp_vec2
  temp_vec2.set(node.size)
  var horizontal = node.horizontal // || node.flags.horizontal;

  if (node.flags.collapsed) {
    ctx.font = this.inner_text_font
    var title = node.getTitle ? node.getTitle() : node.title
    if (title != null) {
      node._collapsed_width = Math.min(node.size[0], ctx.measureText(title).width + LiteGraph.NODE_TITLE_HEIGHT * 2) //LiteGraph.NODE_COLLAPSED_WIDTH;
      size[0] = node._collapsed_width
      size[1] = 0
    }
  }

  if (node.clip_area) {
    //Start clipping
    ctx.save()
    ctx.beginPath()
    if (shape == LiteGraph.BOX_SHAPE) {
      ctx.rect(0, 0, size[0], size[1])
    } else if (shape == LiteGraph.ROUND_SHAPE) {
      ctx.roundRect(0, 0, size[0], size[1], [10])
    } else if (shape == LiteGraph.CIRCLE_SHAPE) {
      ctx.arc(size[0] * 0.5, size[1] * 0.5, size[0] * 0.5, 0, Math.PI * 2)
    }
    ctx.clip()
  }

  //draw shape
  if (node.has_errors) {
    bgcolor = 'rgba(128, 0, 0, 0.8)'
  }
  this.drawNodeShape(node, ctx, size, color, bgcolor, node.is_selected, node.mouseOver)
  ctx.shadowColor = 'transparent'

  //draw foreground
  if (node.onDrawForeground) {
    node.onDrawForeground(ctx, this, this.canvas)
  }

  //connection slots
  ctx.textAlign = horizontal ? 'center' : 'left'
  ctx.font = this.inner_text_font

  var render_text = !low_scale

  var out_slot = this.connecting_output
  var in_slot = this.connecting_input
  ctx.lineWidth = 1

  var max_y = 0
  var slot_pos = new Float32Array(2) //to reuse

  //render inputs and outputs
  if (!node.flags.collapsed) {
    //input connection slots
    if (node.inputs) {
      for (var i = 0; i < node.inputs.length; i++) {
        var slot = node.inputs[i]

        var slot_type = slot.type
        var slot_shape = slot.shape

        ctx.globalAlpha = editor_alpha
        //change opacity of incompatible slots when dragging a connection
        if (this.connecting_output && !LiteGraph.isValidConnection(slot.type, out_slot.type)) {
          ctx.globalAlpha = 0.4 * editor_alpha
        }

        ctx.fillStyle =
          slot.link != null
            ? slot.color_on || this.default_connection_color_byType[slot_type] || this.default_connection_color.input_on
            : slot.color_off || this.default_connection_color_byTypeOff[slot_type] || this.default_connection_color_byType[slot_type] || this.default_connection_color.input_off

        var pos = node.getConnectionPos(true, i, slot_pos)
        pos[0] -= node.pos[0]
        pos[1] -= node.pos[1]
        if (max_y < pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5) {
          max_y = pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5
        }

        ctx.beginPath()

        if (slot_type == 'array') {
          slot_shape = LiteGraph.GRID_SHAPE // place in addInput? addOutput instead?
        }

        var doStroke = true

        if (slot.type === LiteGraph.EVENT || slot.shape === LiteGraph.BOX_SHAPE) {
          if (horizontal) {
            ctx.rect(pos[0] - 5 + 0.5, pos[1] - 8 + 0.5, 10, 14)
          } else {
            ctx.rect(pos[0] - 6 + 0.5, pos[1] - 5 + 0.5, 14, 10)
          }
        } else if (slot_shape === LiteGraph.ARROW_SHAPE) {
          ctx.moveTo(pos[0] + 8, pos[1] + 0.5)
          ctx.lineTo(pos[0] - 4, pos[1] + 6 + 0.5)
          ctx.lineTo(pos[0] - 4, pos[1] - 6 + 0.5)
          ctx.closePath()
        } else if (slot_shape === LiteGraph.GRID_SHAPE) {
          ctx.rect(pos[0] - 4, pos[1] - 4, 2, 2)
          ctx.rect(pos[0] - 1, pos[1] - 4, 2, 2)
          ctx.rect(pos[0] + 2, pos[1] - 4, 2, 2)
          ctx.rect(pos[0] - 4, pos[1] - 1, 2, 2)
          ctx.rect(pos[0] - 1, pos[1] - 1, 2, 2)
          ctx.rect(pos[0] + 2, pos[1] - 1, 2, 2)
          ctx.rect(pos[0] - 4, pos[1] + 2, 2, 2)
          ctx.rect(pos[0] - 1, pos[1] + 2, 2, 2)
          ctx.rect(pos[0] + 2, pos[1] + 2, 2, 2)
          doStroke = false
        } else {
          if (low_scale) ctx.rect(pos[0] - 4, pos[1] - 4, 8, 8) //faster
          else ctx.arc(pos[0], pos[1], 4, 0, Math.PI * 2)
        }
        ctx.fill()

        //render name
        if (render_text) {
          var text = slot.label != null ? slot.label : slot.name
          if (text) {
            ctx.fillStyle = LiteGraph.NODE_TEXT_COLOR
            if (horizontal || slot.dir == LiteGraph.UP) {
              ctx.fillText(text, pos[0], pos[1] - 10)
            } else {
              ctx.fillText(text, pos[0] + 10, pos[1] + 5)
            }
          }
        }
      }
    }

    //output connection slots

    ctx.textAlign = horizontal ? 'center' : 'right'
    ctx.strokeStyle = 'black'
    if (node.outputs) {
      for (var i = 0; i < node.outputs.length; i++) {
        var slot = node.outputs[i]

        var slot_type = slot.type
        var slot_shape = slot.shape

        //change opacity of incompatible slots when dragging a connection
        if (this.connecting_input && !LiteGraph.isValidConnection(slot_type, in_slot.type)) {
          ctx.globalAlpha = 0.4 * editor_alpha
        }

        var pos = node.getConnectionPos(false, i, slot_pos)
        pos[0] -= node.pos[0]
        pos[1] -= node.pos[1]
        if (max_y < pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5) {
          max_y = pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5
        }

        ctx.fillStyle =
          slot.links && slot.links.length
            ? slot.color_on || this.default_connection_color_byType[slot_type] || this.default_connection_color.output_on
            : slot.color_off || this.default_connection_color_byTypeOff[slot_type] || this.default_connection_color_byType[slot_type] || this.default_connection_color.output_off
        ctx.beginPath()
        //ctx.rect( node.size[0] - 14,i*14,10,10);

        if (slot_type == 'array') {
          slot_shape = LiteGraph.GRID_SHAPE
        }

        var doStroke = true

        if (slot_type === LiteGraph.EVENT || slot_shape === LiteGraph.BOX_SHAPE) {
          if (horizontal) {
            ctx.rect(pos[0] - 5 + 0.5, pos[1] - 8 + 0.5, 10, 14)
          } else {
            ctx.rect(pos[0] - 6 + 0.5, pos[1] - 5 + 0.5, 14, 10)
          }
        } else if (slot_shape === LiteGraph.ARROW_SHAPE) {
          ctx.moveTo(pos[0] + 8, pos[1] + 0.5)
          ctx.lineTo(pos[0] - 4, pos[1] + 6 + 0.5)
          ctx.lineTo(pos[0] - 4, pos[1] - 6 + 0.5)
          ctx.closePath()
        } else if (slot_shape === LiteGraph.GRID_SHAPE) {
          ctx.rect(pos[0] - 4, pos[1] - 4, 2, 2)
          ctx.rect(pos[0] - 1, pos[1] - 4, 2, 2)
          ctx.rect(pos[0] + 2, pos[1] - 4, 2, 2)
          ctx.rect(pos[0] - 4, pos[1] - 1, 2, 2)
          ctx.rect(pos[0] - 1, pos[1] - 1, 2, 2)
          ctx.rect(pos[0] + 2, pos[1] - 1, 2, 2)
          ctx.rect(pos[0] - 4, pos[1] + 2, 2, 2)
          ctx.rect(pos[0] - 1, pos[1] + 2, 2, 2)
          ctx.rect(pos[0] + 2, pos[1] + 2, 2, 2)
          doStroke = false
        } else {
          if (low_scale) ctx.rect(pos[0] - 4, pos[1] - 4, 8, 8)
          else ctx.arc(pos[0], pos[1], 4, 0, Math.PI * 2)
        }

        //trigger
        //if(slot.node_id != null && slot.slot == -1)
        //  ctx.fillStyle = "#F85";

        //if(slot.links != null && slot.links.length)
        ctx.fill()
        if (!low_scale && doStroke) ctx.stroke()

        //render output name
        if (render_text) {
          var text = slot.label != null ? slot.label : slot.name
          if (text) {
            ctx.fillStyle = LiteGraph.NODE_TEXT_COLOR
            if (horizontal || slot.dir == LiteGraph.DOWN) {
              ctx.fillText(text, pos[0], pos[1] - 8)
            } else {
              ctx.fillText(text, pos[0] - 10, pos[1] + 5)
            }
          }
        }
      }
    }

    ctx.textAlign = 'left'
    ctx.globalAlpha = 1

    if (node.widgets) {
      var widgets_y = max_y
      if (horizontal || node.widgets_up) {
        widgets_y = 2
      }
      if (node.widgets_start_y != null) widgets_y = node.widgets_start_y
      this.drawNodeWidgets(node, widgets_y, ctx, this.node_widget && this.node_widget[0] == node ? this.node_widget[1] : null)
    }
  } else if (this.render_collapsed_slots) {
    //if collapsed
    var input_slot = null
    var output_slot = null

    //get first connected slot to render
    if (node.inputs) {
      for (var i = 0; i < node.inputs.length; i++) {
        var slot = node.inputs[i]
        if (slot.link == null) {
          continue
        }
        input_slot = slot
        break
      }
    }
    if (node.outputs) {
      for (var i = 0; i < node.outputs.length; i++) {
        var slot = node.outputs[i]
        if (!slot.links || !slot.links.length) {
          continue
        }
        output_slot = slot
      }
    }

    if (input_slot) {
      var x = 0
      var y = LiteGraph.NODE_TITLE_HEIGHT * -0.5 //center
      if (horizontal) {
        x = node._collapsed_width * 0.5
        y = -LiteGraph.NODE_TITLE_HEIGHT
      }
      ctx.fillStyle = '#686'
      ctx.beginPath()
      if (slot.type === LiteGraph.EVENT || slot.shape === LiteGraph.BOX_SHAPE) {
        ctx.rect(x - 7 + 0.5, y - 4, 14, 8)
      } else if (slot.shape === LiteGraph.ARROW_SHAPE) {
        ctx.moveTo(x + 8, y)
        ctx.lineTo(x + -4, y - 4)
        ctx.lineTo(x + -4, y + 4)
        ctx.closePath()
      } else {
        ctx.arc(x, y, 4, 0, Math.PI * 2)
      }
      ctx.fill()
    }

    if (output_slot) {
      var x = node._collapsed_width
      var y = LiteGraph.NODE_TITLE_HEIGHT * -0.5 //center
      if (horizontal) {
        x = node._collapsed_width * 0.5
        y = 0
      }
      ctx.fillStyle = '#686'
      ctx.strokeStyle = 'black'
      ctx.beginPath()
      if (slot.type === LiteGraph.EVENT || slot.shape === LiteGraph.BOX_SHAPE) {
        ctx.rect(x - 7 + 0.5, y - 4, 14, 8)
      } else if (slot.shape === LiteGraph.ARROW_SHAPE) {
        ctx.moveTo(x + 6, y)
        ctx.lineTo(x - 6, y - 4)
        ctx.lineTo(x - 6, y + 4)
        ctx.closePath()
      } else {
        ctx.arc(x, y, 4, 0, Math.PI * 2)
      }
      ctx.fill()
      //ctx.stroke();
    }
  }

  if (node.clip_area) {
    ctx.restore()
  }

  ctx.globalAlpha = 1.0

  if (this.onAfterDrawNode) {
    this.onAfterDrawNode(node, ctx)
  }
}

//used by this.over_link_center
LCanvas.prototype.drawLinkTooltip = function (ctx, link) {
  var pos = link._pos
  ctx.fillStyle = 'black'
  ctx.beginPath()
  ctx.arc(pos[0], pos[1], 3, 0, Math.PI * 2)
  ctx.fill()

  if (link.data == null) return

  if (this.onDrawLinkTooltip) if (this.onDrawLinkTooltip(ctx, link, this) == true) return

  var data = link.data
  var text = null

  if (data.constructor === Number) text = data.toFixed(2)
  else if (data.constructor === String) text = '"' + data + '"'
  else if (data.constructor === Boolean) text = String(data)
  else if (data.toToolTip) text = data.toToolTip()
  else text = '[' + data.constructor.name + ']'

  if (text == null) return
  text = text.substr(0, 30) //avoid weird

  ctx.font = '14px Courier New'
  var info = ctx.measureText(text)
  var w = info.width + 20
  var h = 24
  ctx.shadowColor = 'black'
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  ctx.shadowBlur = 3
  ctx.fillStyle = '#454'
  ctx.beginPath()
  ctx.roundRect(pos[0] - w * 0.5, pos[1] - 15 - h, w, h, [3])
  ctx.moveTo(pos[0] - 10, pos[1] - 15)
  ctx.lineTo(pos[0] + 10, pos[1] - 15)
  ctx.lineTo(pos[0], pos[1] - 5)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#CEC'
  ctx.fillText(text, pos[0], pos[1] - 15 - h * 0.3)
}

/**
 * draws the shape of the given node in the canvas
 * @method drawNodeShape
 **/
var tmp_area = new Float32Array(4)

LCanvas.prototype.drawNodeShape = function (node, ctx, size, fgcolor, bgcolor, selected, mouse_over) {
  //bg rect
  ctx.strokeStyle = fgcolor
  ctx.fillStyle = bgcolor

  var title_height = LiteGraph.NODE_TITLE_HEIGHT
  var low_scale = this.ds.scale < 0.5

  //render node area depending on shape
  var shape = node._shape || node.constructor.shape || LiteGraph.ROUND_SHAPE

  var title_mode = node.constructor.title_mode

  var render_title = true
  if (title_mode == LiteGraph.TRANSPARENT_TITLE || title_mode == LiteGraph.NO_TITLE) {
    render_title = false
  } else if (title_mode == LiteGraph.AUTOHIDE_TITLE && mouse_over) {
    render_title = true
  }

  var area = tmp_area
  area[0] = 0 //x
  area[1] = render_title ? -title_height : 0 //y
  area[2] = size[0] + 1 //w
  area[3] = render_title ? size[1] + title_height : size[1] //h

  var old_alpha = ctx.globalAlpha

  //full node shape
  //if(node.flags.collapsed)
  {
    ctx.beginPath()
    if (shape == LiteGraph.BOX_SHAPE || low_scale) {
      ctx.fillRect(area[0], area[1], area[2], area[3])
    } else if (shape == LiteGraph.ROUND_SHAPE || shape == LiteGraph.CARD_SHAPE) {
      ctx.roundRect(area[0], area[1], area[2], area[3], shape == LiteGraph.CARD_SHAPE ? [this.round_radius, this.round_radius, 0, 0] : [this.round_radius])
    } else if (shape == LiteGraph.CIRCLE_SHAPE) {
      ctx.arc(size[0] * 0.5, size[1] * 0.5, size[0] * 0.5, 0, Math.PI * 2)
    }
    ctx.fill()

    //separator
    if (!node.flags.collapsed && render_title) {
      ctx.shadowColor = 'transparent'
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.fillRect(0, -1, area[2], 2)
    }
  }
  ctx.shadowColor = 'transparent'

  if (node.onDrawBackground) {
    node.onDrawBackground(ctx, this, this.canvas, this.graph_mouse)
  }

  //title bg (remember, it is rendered ABOVE the node)
  if (render_title || title_mode == LiteGraph.TRANSPARENT_TITLE) {
    //title bar
    if (node.onDrawTitleBar) {
      node.onDrawTitleBar(ctx, title_height, size, this.ds.scale, fgcolor)
    } else if (title_mode != LiteGraph.TRANSPARENT_TITLE && (node.constructor.title_color || this.render_title_colored)) {
      var title_color = node.constructor.title_color || fgcolor

      if (node.flags.collapsed) {
        ctx.shadowColor = LiteGraph.DEFAULT_SHADOW_COLOR
      }

      //* gradient test
      if (this.use_gradients) {
        var grad = LCanvas.gradients[title_color]
        if (!grad) {
          grad = LCanvas.gradients[title_color] = ctx.createLinearGradient(0, 0, 400, 0)
          grad.addColorStop(0, title_color) // TODO refactor: validate color !! prevent DOMException
          grad.addColorStop(1, '#000')
        }
        ctx.fillStyle = grad
      } else {
        ctx.fillStyle = title_color
      }

      //ctx.globalAlpha = 0.5 * old_alpha;
      ctx.beginPath()
      if (shape == LiteGraph.BOX_SHAPE || low_scale) {
        ctx.rect(0, -title_height, size[0] + 1, title_height)
      } else if (shape == LiteGraph.ROUND_SHAPE || shape == LiteGraph.CARD_SHAPE) {
        ctx.roundRect(0, -title_height, size[0] + 1, title_height, node.flags.collapsed ? [this.round_radius] : [this.round_radius, this.round_radius, 0, 0])
      }
      ctx.fill()
      ctx.shadowColor = 'transparent'
    }

    var colState = false
    if (LiteGraph.node_box_coloured_by_mode) {
      if (LiteGraph.NODE_MODES_COLORS[node.mode]) {
        colState = LiteGraph.NODE_MODES_COLORS[node.mode]
      }
    }
    if (LiteGraph.node_box_coloured_when_on) {
      colState = node.action_triggered ? '#f4f4f5' : node.execute_triggered ? '#a1a1aa' : '#27272a'
    }

    //title box
    var box_size = 10
    if (node.onDrawTitleBox) {
      node.onDrawTitleBox(ctx, title_height, size, this.ds.scale)
    } else if (shape === LiteGraph.ROUND_SHAPE || shape === LiteGraph.CIRCLE_SHAPE || shape === LiteGraph.CARD_SHAPE) {
      if (low_scale) {
        ctx.fillStyle = 'black'
        ctx.beginPath()
        ctx.arc(title_height * 0.5, title_height * -0.5, box_size * 0.5 + 1, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle = node.boxcolor || colState || LiteGraph.NODE_DEFAULT_BOXCOLOR

      if (low_scale) {
        ctx.fillRect(title_height * 0.5 - box_size * 0.5, title_height * -0.5 - box_size * 0.5, box_size, box_size)
      } else {

        if (node.flags.collapsed) {
          ctx.fillStyle = '#3f3f46'
        }

        if (selected) {
          ctx.fillStyle = LiteGraph.NODE_BOX_OUTLINE_COLOR
        }

        ctx.fillRect(
          title_height * 0.5 - box_size * 0.5, 
          title_height * -0.5 - box_size * 0.5, 
          box_size, 
          2
        )

        ctx.fillRect(
          title_height * 0.5 - box_size * 0.5, 
          title_height * -0.5 - box_size * 0.5 + (2 + 2.5),
          box_size, 
          2
        )

        ctx.fillRect(
          title_height * 0.5 - box_size * 0.5, 
          title_height * -0.5 - box_size * 0.5 + (2 + 2.5)*2,
          box_size, 
          2
        )

        /*
        ctx.beginPath()
        ctx.arc(title_height * 0.5, title_height * -0.5, box_size * 0.5, 0, Math.PI * 2)
        ctx.fill()
        */
      }
    } else {
      if (low_scale) {
        ctx.fillStyle = 'black'
        ctx.fillRect((title_height - box_size) * 0.5 - 1, (title_height + box_size) * -0.5 - 1, box_size + 2, box_size + 2)
      }
      ctx.fillStyle = node.boxcolor || colState || LiteGraph.NODE_DEFAULT_BOXCOLOR
      ctx.fillRect((title_height - box_size) * 0.5, (title_height + box_size) * -0.5, box_size, box_size)
    }
    ctx.globalAlpha = old_alpha

    /* close button */
    if (!low_scale && !node.flags.collapsed) {
      const s = 10 /* closebutton size */
      const x = node.size[0] - s - 10
      const y = 0 - title_height * 0.5 -s * 0.5
      ctx.fillStyle = 'red'
      ctx.strokeStyle = 'red'

      ctx.beginPath()
      ctx.strokeStyle = '#27272a'
      ctx.roundRect(x-2, y-2, s+4, s+4, 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.lineWidth = 2
      ctx.strokeStyle = '#52525b'
      ctx.moveTo(x+2, y+2)
      ctx.lineTo(x+s-2, y+s-2)

      ctx.moveTo(x+2, y+s-2)
      ctx.lineTo(x+s-2, y+2)

      ctx.stroke()
    }

    //title text
    if (node.onDrawTitleText) {
      node.onDrawTitleText(ctx, title_height, size, this.ds.scale, this.title_text_font, selected)
    }
    if (!low_scale) {
      ctx.font = this.title_text_font
      var title = String(node.getTitle())
      if (title) {
        if (selected) {
          ctx.fillStyle = LiteGraph.NODE_SELECTED_TITLE_COLOR
        } else {
          ctx.fillStyle = node.constructor.title_text_color || this.node_title_color
        }
        if (node.flags.collapsed) {
          ctx.textAlign = 'left'
          var measure = ctx.measureText(title)
          ctx.fillText(
            title.substr(0, 20), //avoid urls too long
            title_height, // + measure.width * 0.5,
            LiteGraph.NODE_TITLE_TEXT_Y - title_height,
          )
          ctx.textAlign = 'left'
        } else {
          ctx.textAlign = 'left'
          ctx.fillText(`[#${node.id}]   ${title}`, title_height, LiteGraph.NODE_TITLE_TEXT_Y - title_height)
        }
      }
    }

    //subgraph box
    if (!node.flags.collapsed && node.subgraph && !node.skip_subgraph_button) {
      var w = LiteGraph.NODE_TITLE_HEIGHT
      var x = node.size[0] - w
      var over = LiteGraph.isInsideRectangle(this.graph_mouse[0] - node.pos[0], this.graph_mouse[1] - node.pos[1], x + 2, -w + 2, w - 4, w - 4)
      ctx.fillStyle = over ? '#888' : '#555'
      if (shape == LiteGraph.BOX_SHAPE || low_scale) ctx.fillRect(x + 2, -w + 2, w - 4, w - 4)
      else {
        ctx.beginPath()
        ctx.roundRect(x + 2, -w + 2, w - 4, w - 4, [4])
        ctx.fill()
      }
      ctx.fillStyle = '#333'
      ctx.beginPath()
      ctx.moveTo(x + w * 0.2, -w * 0.6)
      ctx.lineTo(x + w * 0.8, -w * 0.6)
      ctx.lineTo(x + w * 0.5, -w * 0.3)
      ctx.fill()
    }

    //custom title render
    if (node.onDrawTitle) {
      node.onDrawTitle(ctx)
    }
  }

  //render selection marker
  if (selected) {
    if (node.onBounding) {
      node.onBounding(area)
    }

    if (title_mode == LiteGraph.TRANSPARENT_TITLE) {
      area[1] -= title_height
      area[3] += title_height
    }
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.8
    ctx.beginPath()
    if (shape == LiteGraph.BOX_SHAPE) {
      ctx.rect(-6 + area[0], -6 + area[1], 12 + area[2], 12 + area[3])
    } else if (shape == LiteGraph.ROUND_SHAPE || (shape == LiteGraph.CARD_SHAPE && node.flags.collapsed)) {
      ctx.roundRect(-6 + area[0], -6 + area[1], 12 + area[2], 12 + area[3], [this.round_radius * 1.5])
    } else if (shape == LiteGraph.CARD_SHAPE) {
      ctx.roundRect(-6 + area[0], -6 + area[1], 12 + area[2], 12 + area[3], [this.round_radius * 1.5, 2, this.round_radius * 1.5, 2])
    } else if (shape == LiteGraph.CIRCLE_SHAPE) {
      ctx.arc(size[0] * 0.5, size[1] * 0.5, size[0] * 0.5 + 6, 0, Math.PI * 2)
    }
    ctx.strokeStyle = LiteGraph.NODE_BOX_OUTLINE_COLOR
    ctx.stroke()
    ctx.strokeStyle = fgcolor
    ctx.globalAlpha = 1
  }

  // these counter helps in conditioning drawing based on if the node has been executed or an action occurred
  if (node.execute_triggered > 0) node.execute_triggered--
  if (node.action_triggered > 0) node.action_triggered--

  if (this.onDrawNodeShape) {
    this.onDrawNodeShape(node, ctx, size, fgcolor, bgcolor, selected, mouse_over)
  }
}

var margin_area = new Float32Array(4)
var link_bounding = new Float32Array(4)
var tempA = new Float32Array(2)
var tempB = new Float32Array(2)

/**
 * draws every connection visible in the canvas
 * OPTIMIZE THIS: pre-catch connections position instead of recomputing them every time
 * @method drawConnections
 **/
LCanvas.prototype.drawConnections = function (ctx) {
  var now = LiteGraph.getTime()
  var visible_area = this.visible_area
  margin_area[0] = visible_area[0] - 20
  margin_area[1] = visible_area[1] - 20
  margin_area[2] = visible_area[2] + 40
  margin_area[3] = visible_area[3] + 40

  //draw connections
  ctx.lineWidth = this.connections_width

  ctx.fillStyle = '#a1a1aa'
  ctx.strokeStyle = '#a1a1aa'
  ctx.globalAlpha = 1 * this.editor_alpha
  //for every node
  var nodes = this.graph._nodes
  for (var n = 0, l = nodes.length; n < l; ++n) {
    var node = nodes[n]
    //for every input (we render just inputs because it is easier as every slot can only have one input)
    if (!node.inputs || !node.inputs.length) {
      continue
    }

    for (var i = 0; i < node.inputs.length; ++i) {
      var input = node.inputs[i]
      if (!input || input.link == null) {
        continue
      }
      var link_id = input.link
      var link = this.graph.links[link_id]
      if (!link) {
        continue
      }

      //find link info
      var start_node = this.graph.getNodeById(link.origin_id)
      if (start_node == null) {
        continue
      }
      var start_node_slot = link.origin_slot
      var start_node_slotpos = null
      if (start_node_slot == -1) {
        start_node_slotpos = [start_node.pos[0] + 10, start_node.pos[1] + 10]
      } else {
        start_node_slotpos = start_node.getConnectionPos(false, start_node_slot, tempA)
      }
      var end_node_slotpos = node.getConnectionPos(true, i, tempB)

      //compute link bounding
      link_bounding[0] = start_node_slotpos[0]
      link_bounding[1] = start_node_slotpos[1]
      link_bounding[2] = end_node_slotpos[0] - start_node_slotpos[0]
      link_bounding[3] = end_node_slotpos[1] - start_node_slotpos[1]
      if (link_bounding[2] < 0) {
        link_bounding[0] += link_bounding[2]
        link_bounding[2] = Math.abs(link_bounding[2])
      }
      if (link_bounding[3] < 0) {
        link_bounding[1] += link_bounding[3]
        link_bounding[3] = Math.abs(link_bounding[3])
      }

      //skip links outside of the visible area of the canvas
      if (!LiteGraph.overlapBounding(link_bounding, margin_area)) {
        continue
      }

      var start_slot = start_node.outputs[start_node_slot]
      var end_slot = node.inputs[i]
      if (!start_slot || !end_slot) {
        continue
      }
      var start_dir = start_slot.dir || (start_node.horizontal ? LiteGraph.DOWN : LiteGraph.RIGHT)
      var end_dir = end_slot.dir || (node.horizontal ? LiteGraph.UP : LiteGraph.LEFT)

      this.renderLink(ctx, start_node_slotpos, end_node_slotpos, link, false, 0, null, start_dir, end_dir)

      //event triggered rendered on top
      if (link && link._last_time && now - link._last_time < 1000) {
        var f = 2.0 - (now - link._last_time) * 0.002
        var tmp = ctx.globalAlpha
        ctx.globalAlpha = tmp * f
        this.renderLink(ctx, start_node_slotpos, end_node_slotpos, link, true, f, 'white', start_dir, end_dir)
        ctx.globalAlpha = tmp
      }
    }
  }
  ctx.globalAlpha = 1
}

/**
 * draws a link between two points
 * @method renderLink
 * @param {vec2} a start pos
 * @param {vec2} b end pos
 * @param {Object} link the link object with all the link info
 * @param {boolean} skip_border ignore the shadow of the link
 * @param {boolean} flow show flow animation (for events)
 * @param {string} color the color for the link
 * @param {number} start_dir the direction enum
 * @param {number} end_dir the direction enum
 * @param {number} num_sublines number of sublines (useful to represent vec3 or rgb)
 **/
LCanvas.prototype.renderLink = function (ctx, a, b, link, skip_border, flow, color, start_dir, end_dir, num_sublines) {
  if (link) {
    this.visible_links.push(link)
  }

  //choose color
  if (!color && link) {
    color = link.color || LCanvas.link_type_colors[link.type]
  }
  if (!color) {
    color = this.default_link_color
  }
  if (link != null && this.highlighted_links[link.id]) {
    color = '#ffffff'
  }

  start_dir = start_dir || LiteGraph.RIGHT
  end_dir = end_dir || LiteGraph.LEFT

  var dist = distance(a, b)

  if (this.render_connections_border && this.ds.scale > 0.6) {
    ctx.lineWidth = this.connections_width + 4
  }
  ctx.lineJoin = 'round'
  num_sublines = num_sublines || 1
  if (num_sublines > 1) {
    ctx.lineWidth = 0.5
  }

  //begin line shape
  ctx.beginPath()
  for (var i = 0; i < num_sublines; i += 1) {
    var offsety = (i - (num_sublines - 1) * 0.5) * 5

    if (this.links_render_mode == LiteGraph.SPLINE_LINK) {
      ctx.moveTo(a[0], a[1] + offsety)
      var start_offset_x = 0
      var start_offset_y = 0
      var end_offset_x = 0
      var end_offset_y = 0
      switch (start_dir) {
        case LiteGraph.LEFT:
          start_offset_x = dist * -0.25
          break
        case LiteGraph.RIGHT:
          start_offset_x = dist * 0.25
          break
        case LiteGraph.UP:
          start_offset_y = dist * -0.25
          break
        case LiteGraph.DOWN:
          start_offset_y = dist * 0.25
          break
      }
      switch (end_dir) {
        case LiteGraph.LEFT:
          end_offset_x = dist * -0.25
          break
        case LiteGraph.RIGHT:
          end_offset_x = dist * 0.25
          break
        case LiteGraph.UP:
          end_offset_y = dist * -0.25
          break
        case LiteGraph.DOWN:
          end_offset_y = dist * 0.25
          break
      }
      ctx.bezierCurveTo(a[0] + start_offset_x, a[1] + start_offset_y + offsety, b[0] + end_offset_x, b[1] + end_offset_y + offsety, b[0], b[1] + offsety)
    } else if (this.links_render_mode == LiteGraph.LINEAR_LINK) {
      ctx.moveTo(a[0], a[1] + offsety)
      var start_offset_x = 0
      var start_offset_y = 0
      var end_offset_x = 0
      var end_offset_y = 0
      switch (start_dir) {
        case LiteGraph.LEFT:
          start_offset_x = -1
          break
        case LiteGraph.RIGHT:
          start_offset_x = 1
          break
        case LiteGraph.UP:
          start_offset_y = -1
          break
        case LiteGraph.DOWN:
          start_offset_y = 1
          break
      }
      switch (end_dir) {
        case LiteGraph.LEFT:
          end_offset_x = -1
          break
        case LiteGraph.RIGHT:
          end_offset_x = 1
          break
        case LiteGraph.UP:
          end_offset_y = -1
          break
        case LiteGraph.DOWN:
          end_offset_y = 1
          break
      }
      var l = 15
      ctx.lineTo(a[0] + start_offset_x * l, a[1] + start_offset_y * l + offsety)
      ctx.lineTo(b[0] + end_offset_x * l, b[1] + end_offset_y * l + offsety)
      ctx.lineTo(b[0], b[1] + offsety)
    } else if (this.links_render_mode == LiteGraph.STRAIGHT_LINK) {
      ctx.moveTo(a[0], a[1])
      var start_x = a[0]
      var start_y = a[1]
      var end_x = b[0]
      var end_y = b[1]
      if (start_dir == LiteGraph.RIGHT) {
        start_x += 10
      } else {
        start_y += 10
      }
      if (end_dir == LiteGraph.LEFT) {
        end_x -= 10
      } else {
        end_y -= 10
      }
      ctx.lineTo(start_x, start_y)
      ctx.lineTo((start_x + end_x) * 0.5, start_y)
      ctx.lineTo((start_x + end_x) * 0.5, end_y)
      ctx.lineTo(end_x, end_y)
      ctx.lineTo(b[0], b[1])
    } else {
      return
    } //unknown
  }

  //rendering the outline of the connection can be a little bit slow
  if (this.render_connections_border && this.ds.scale > 0.6 && !skip_border) {
    ctx.lineWidth = 15
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)'
    ctx.stroke()
  }

  ctx.lineWidth = this.connections_width
  ctx.fillStyle = ctx.strokeStyle = color
  ctx.stroke()
  //end line shape

  var pos = this.computeConnectionPoint(a, b, 0.5, start_dir, end_dir)
  if (link && link._pos) {
    link._pos[0] = pos[0]
    link._pos[1] = pos[1]
  }

  //render arrow in the middle
  if (this.ds.scale >= 0.6 && this.highquality_render && end_dir != LiteGraph.CENTER) {
    //render arrow
    if (this.render_connection_arrows) {
      //compute two points in the connection
      var posA = this.computeConnectionPoint(a, b, 0.25, start_dir, end_dir)
      var posB = this.computeConnectionPoint(a, b, 0.26, start_dir, end_dir)
      var posC = this.computeConnectionPoint(a, b, 0.75, start_dir, end_dir)
      var posD = this.computeConnectionPoint(a, b, 0.76, start_dir, end_dir)

      //compute the angle between them so the arrow points in the right direction
      var angleA = 0
      var angleB = 0
      if (this.render_curved_connections) {
        angleA = -Math.atan2(posB[0] - posA[0], posB[1] - posA[1])
        angleB = -Math.atan2(posD[0] - posC[0], posD[1] - posC[1])
      } else {
        angleB = angleA = b[1] > a[1] ? 0 : Math.PI
      }

      //render arrow
      ctx.save()
      ctx.translate(posA[0], posA[1])
      ctx.rotate(angleA)
      ctx.beginPath()
      ctx.moveTo(-5, -3)
      ctx.lineTo(0, +7)
      ctx.lineTo(+5, -3)
      ctx.fill()
      ctx.restore()
      ctx.save()
      ctx.translate(posC[0], posC[1])
      ctx.rotate(angleB)
      ctx.beginPath()
      ctx.moveTo(-5, -3)
      ctx.lineTo(0, +7)
      ctx.lineTo(+5, -3)
      ctx.fill()
      ctx.restore()
    }

    //circle
    ctx.beginPath()
    ctx.arc(pos[0], pos[1], 5, 0, Math.PI * 2)
    ctx.fill()
  }

  //render flowing points
  if (flow) {
    ctx.fillStyle = color
    for (var i = 0; i < 5; ++i) {
      var f = (LiteGraph.getTime() * 0.001 + i * 0.2) % 1
      var pos = this.computeConnectionPoint(a, b, f, start_dir, end_dir)
      ctx.beginPath()
      ctx.arc(pos[0], pos[1], 5, 0, 2 * Math.PI)
      ctx.fill()
    }
  }
}

//returns the link center point based on curvature
LCanvas.prototype.computeConnectionPoint = function (a, b, t, start_dir, end_dir) {
  start_dir = start_dir || LiteGraph.RIGHT
  end_dir = end_dir || LiteGraph.LEFT

  var dist = distance(a, b)
  var p0 = a
  var p1 = [a[0], a[1]]
  var p2 = [b[0], b[1]]
  var p3 = b

  switch (start_dir) {
    case LiteGraph.LEFT:
      p1[0] += dist * -0.25
      break
    case LiteGraph.RIGHT:
      p1[0] += dist * 0.25
      break
    case LiteGraph.UP:
      p1[1] += dist * -0.25
      break
    case LiteGraph.DOWN:
      p1[1] += dist * 0.25
      break
  }
  switch (end_dir) {
    case LiteGraph.LEFT:
      p2[0] += dist * -0.25
      break
    case LiteGraph.RIGHT:
      p2[0] += dist * 0.25
      break
    case LiteGraph.UP:
      p2[1] += dist * -0.25
      break
    case LiteGraph.DOWN:
      p2[1] += dist * 0.25
      break
  }

  var c1 = (1 - t) * (1 - t) * (1 - t)
  var c2 = 3 * ((1 - t) * (1 - t)) * t
  var c3 = 3 * (1 - t) * (t * t)
  var c4 = t * t * t

  var x = c1 * p0[0] + c2 * p1[0] + c3 * p2[0] + c4 * p3[0]
  var y = c1 * p0[1] + c2 * p1[1] + c3 * p2[1] + c4 * p3[1]
  return [x, y]
}

LCanvas.prototype.drawExecutionOrder = function (ctx) {
  ctx.shadowColor = 'transparent'
  ctx.globalAlpha = 0.25

  ctx.textAlign = 'center'
  ctx.strokeStyle = 'white'
  ctx.globalAlpha = 0.75

  var visible_nodes = this.visible_nodes
  for (var i = 0; i < visible_nodes.length; ++i) {
    var node = visible_nodes[i]
    ctx.fillStyle = 'black'
    ctx.fillRect(node.pos[0] - LiteGraph.NODE_TITLE_HEIGHT, node.pos[1] - LiteGraph.NODE_TITLE_HEIGHT, LiteGraph.NODE_TITLE_HEIGHT, LiteGraph.NODE_TITLE_HEIGHT)
    if (node.order === 0) {
      ctx.strokeRect(node.pos[0] - LiteGraph.NODE_TITLE_HEIGHT + 0.5, node.pos[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5, LiteGraph.NODE_TITLE_HEIGHT, LiteGraph.NODE_TITLE_HEIGHT)
    }
    ctx.fillStyle = '#FFF'
    ctx.fillText(node.order, node.pos[0] + LiteGraph.NODE_TITLE_HEIGHT * -0.5, node.pos[1] - 6)
  }
  ctx.globalAlpha = 1
}

/**
 * draws the widgets stored inside a node
 * @method drawNodeWidgets
 **/
LCanvas.prototype.drawNodeWidgets = function (node, posY, ctx, active_widget) {
  if (!node.widgets || !node.widgets.length) {
    return 0
  }
  var width = node.size[0]
  var widgets = node.widgets
  posY += 2
  var H = LiteGraph.NODE_WIDGET_HEIGHT
  var show_text = this.ds.scale > 0.5
  ctx.save()
  ctx.globalAlpha = this.editor_alpha

  var outline_color = LiteGraph.WIDGET_OUTLINE_COLOR
  var background_color = LiteGraph.WIDGET_BGCOLOR
  var text_color = LiteGraph.WIDGET_TEXT_COLOR
  var secondary_text_color = LiteGraph.WIDGET_SECONDARY_TEXT_COLOR
  var margin = 15
  var roundRadius = 0.0

  for (var i = 0; i < widgets.length; ++i) {
    var w = widgets[i]
    var y = posY
    if (w.y) {
      y = w.y
    }
    w.last_y = y
    ctx.strokeStyle = outline_color
    ctx.fillStyle = '#222'
    ctx.textAlign = 'left'
    //ctx.lineWidth = 2;
    if (w.disabled) ctx.globalAlpha *= 0.5
    var widget_width = w.width || width

    switch (w.type) {
      case 'button':
        if (w.clicked) {
          ctx.fillStyle = '#AAA'
          w.clicked = false
          this.dirty_canvas = true
        }
        ctx.fillRect(margin, y, widget_width - margin * 2, H)
        if (show_text && !w.disabled) ctx.strokeRect(margin, y, widget_width - margin * 2, H)
        if (show_text) {
          ctx.textAlign = 'center'
          ctx.fillStyle = text_color
          ctx.fillText(w.label || w.name, widget_width * 0.5, y + H * 0.7)
        }
        break

      case 'toggle':
        ctx.textAlign = 'left'
        ctx.strokeStyle = outline_color
        ctx.fillStyle = background_color
        ctx.beginPath()
        if (show_text) {
          ctx.roundRect(margin, y, widget_width - margin * 2, H, [H * roundRadius])
        } else {
          ctx.rect(margin, y, widget_width - margin * 2, H)
        }
        ctx.fill()
        if (show_text && !w.disabled) {
          ctx.stroke()
        }
        ctx.fillStyle = w.value ? '#89A' : '#333'
        ctx.beginPath()
        ctx.arc(widget_width - margin*2 + 3, y + H*0.5, H*0.30, 0, Math.PI*2)
        ctx.fill()
        if (show_text) {
          ctx.fillStyle = secondary_text_color
          const label = w.label || w.name
          if (label !== null) {
            ctx.fillText(label, margin + 5, y + H * 0.7)
          }
          ctx.fillStyle = w.value ? text_color : secondary_text_color
          ctx.textAlign = 'right'
          ctx.fillText(
            w.value ? w.options.on || 'true' : w.options.off || 'false',
            widget_width - margin*2 - 10, y + H * 0.7
          )
        }
        break

      case 'slider':
        ctx.fillStyle = background_color
        ctx.fillRect(margin, y, widget_width - margin * 2, H)

        var range = w.options.max - w.options.min
        var nvalue = (w.value - w.options.min) / range
        if (nvalue < 0.0) nvalue = 0.0
        if (nvalue > 1.0) nvalue = 1.0
        ctx.fillStyle = w.options.hasOwnProperty('slider_color') ? w.options.slider_color : active_widget == w ? '#89A' : '#678'
        ctx.fillRect(margin, y, nvalue * (widget_width - margin * 2), H)
        if (show_text && !w.disabled) ctx.strokeRect(margin, y, widget_width - margin * 2, H)
        if (w.marker) {
          var marker_nvalue = (w.marker - w.options.min) / range
          if (marker_nvalue < 0.0) marker_nvalue = 0.0
          if (marker_nvalue > 1.0) marker_nvalue = 1.0
          ctx.fillStyle = w.options.hasOwnProperty('marker_color') ? w.options.marker_color : '#AA9'
          ctx.fillRect(margin + marker_nvalue * (widget_width - margin * 2), y, 2, H)
        }
        if (show_text) {
          ctx.textAlign = 'left'
          ctx.fillStyle = '#ffffff'
          ctx.fillText(
            w.label || w.name,
            20,
            y + H * 0.7
          )

          const s = w.options.step / 10
          const v = Math.round(w.value/s) * s
          const txtVal = v.toFixed(w.options.precision != null ? w.options.precision : 3)

          ctx.textAlign = 'right'
          ctx.fillStyle = '#ffffff'
          ctx.fillText(
            txtVal,
            widget_width - 20,
            y + H * 0.7
          )
        }
        break

      case 'number':
      case 'combo':
        ctx.textAlign = 'left'
        ctx.strokeStyle = outline_color
        ctx.fillStyle = background_color
        ctx.beginPath()
        if (show_text) {
          ctx.roundRect(margin, y, widget_width - margin * 2, H, [H * roundRadius])
        } else {
          ctx.rect(margin, y, widget_width - margin * 2, H)
        }
        ctx.fill()
        if (show_text) {
          if (!w.disabled) ctx.stroke()
          ctx.fillStyle = text_color
          if (!w.disabled) {
            ctx.beginPath()
            ctx.moveTo(margin + 16, y + 5)
            ctx.lineTo(margin + 6, y + H * 0.5)
            ctx.lineTo(margin + 16, y + H - 5)
            ctx.fill()
            ctx.beginPath()
            ctx.moveTo(widget_width - margin - 16, y + 5)
            ctx.lineTo(widget_width - margin - 6, y + H * 0.5)
            ctx.lineTo(widget_width - margin - 16, y + H - 5)
            ctx.fill()
          }
          ctx.fillStyle = secondary_text_color
          ctx.fillText(w.label || w.name, margin * 2 + 10, y + H * 0.7)
          ctx.fillStyle = text_color
          ctx.textAlign = 'right'
          if (w.type === 'number') {
            ctx.fillText(
              Number(w.value).toFixed(w.options.precision !== undefined ? w.options.precision : 3), 
              widget_width - margin * 2 - 10, y + H * 0.7
            )
          } else {
            var v = w.value
            if (w.options.values) {
              var values = w.options.values
              if (values.constructor === Function) values = values()
              if (values && values.constructor !== Array) v = values[w.value]
            }
            ctx.fillText(v, widget_width - margin * 2 - 10, y + H * 0.7)
          }
        }
        break

      case 'string':
      case 'text':
        ctx.textAlign = 'left'
        ctx.strokeStyle = outline_color
        ctx.fillStyle = background_color
        ctx.beginPath()
        if (show_text) {
          ctx.roundRect(margin, y, widget_width - margin * 2, H, [H * roundRadius])
        } else {
          ctx.rect(margin, y, widget_width - margin * 2, H)
        }
        
        ctx.fill()
        if (show_text) {
          if (!w.disabled) ctx.stroke()
          ctx.save()
          ctx.beginPath()
          ctx.rect(margin, y, widget_width - margin * 2, H)
          ctx.clip()

          //ctx.stroke();
          ctx.fillStyle = secondary_text_color
          const label = w.label || w.name
          if (label != null) {
            ctx.fillText(label, margin + 5, y + H * 0.7)
          }
          ctx.fillStyle = text_color
          ctx.textAlign = 'right'
          ctx.fillText(String(w.value).substr(0, 30), widget_width - margin - 5, y + H * 0.7) //30 chars max
          ctx.restore()
        }
        break
      default:
        if (w.draw) {
          w.draw(ctx, node, widget_width, y, H)
        }
        break
    }
    posY += (w.computeSize ? w.computeSize(widget_width)[1] : H) + 4
    ctx.globalAlpha = this.editor_alpha
  }
  ctx.restore()
  ctx.textAlign = 'left'
}

/**
 * process an event on widgets
 * @method processNodeWidgets
 **/
LCanvas.prototype.processNodeWidgets = function (node, pos, event, active_widget) {
  if (!node.widgets || !node.widgets.length || (!this.allow_interaction && !node.flags.allow_interaction)) {
    return null
  }

  var x = pos[0] - node.pos[0]
  var y = pos[1] - node.pos[1]
  var width = node.size[0]
  var that = this
  var ref_window = this.getCanvasWindow()

  for (var i = 0; i < node.widgets.length; ++i) {
    var w = node.widgets[i]
    if (!w || w.disabled) continue
    var widget_height = w.computeSize ? w.computeSize(width)[1] : LiteGraph.NODE_WIDGET_HEIGHT
    var widget_width = w.width || width
    //outside
    if (w != active_widget && (x < 6 || x > widget_width - 12 || y < w.last_y || y > w.last_y + widget_height || w.last_y === undefined)) continue

    var old_value = w.value

    //if ( w == active_widget || (x > 6 && x < widget_width - 12 && y > w.last_y && y < w.last_y + widget_height) ) {
    //inside widget
    switch (w.type) {
      case 'button':
        if (event.type === LiteGraph.pointerevents_method + 'down') {
          if (w.callback) {
            setTimeout(function () {
              w.callback(w, that, node, pos, event)
            }, 20)
          }
          w.clicked = true
          this.dirty_canvas = true
        }
        break

      case 'slider':
        var old_value = w.value
        var nvalue = clamp((x - 15) / (widget_width - 30), 0, 1)
        if (w.options.read_only) break
        w.value = w.options.min + (w.options.max - w.options.min) * nvalue
        if (old_value != w.value) {
          setTimeout(function () {
            inner_value_change(w, w.value)
          }, 1)
        }
        this.dirty_canvas = true
        break

      case 'number':
      case 'combo':
        var old_value = w.value
        if (event.type == LiteGraph.pointerevents_method + 'move' && w.type === 'number') {
          if (event.deltaX) w.value += event.deltaX * 0.1 * (w.options.step || 1)
          if (w.options.min != null && w.value < w.options.min) {
            w.value = w.options.min
          }
          if (w.options.max != null && w.value > w.options.max) {
            w.value = w.options.max
          }
        } else if (event.type == LiteGraph.pointerevents_method + 'down') {
          var values = w.options.values
          if (values && values.constructor === Function) {
            values = w.options.values(w, node)
          }
          var values_list = null

          if (w.type !== 'number') {
            values_list = values.constructor === Array ? values : Object.keys(values)
          }

          var delta = x < 40 ? -1 : x > widget_width - 40 ? 1 : 0
          if (w.type === 'number') {
            w.value += delta * 0.1 * (w.options.step || 1)
            if (w.options.min != null && w.value < w.options.min) {
              w.value = w.options.min
            }
            if (w.options.max != null && w.value > w.options.max) {
              w.value = w.options.max
            }
          } else if (delta) {
            //clicked in arrow, used for combos
            var index = -1
            this.last_mouseclick = 0 //avoids dobl click event

            if (values.constructor === Object) {
              index = values_list.indexOf(String(w.value)) + delta
            } else {
              index = values_list.indexOf(w.value) + delta
            }

            if (index >= values_list.length) {
              index = values_list.length - 1
            }

            if (index < 0) {
              index = 0
            }

            if (values.constructor === Array) {
              w.value = values[index]
            } else {
              w.value = index 
            }
          } else {
            //combo clicked
            var text_values = values != values_list ? Object.values(values) : values
            var menu = new LiteGraph.ContextMenu(
              text_values,
              {
                scale: Math.max(1, this.ds.scale),
                event: event,
                className: 'dark',
                callback: inner_clicked.bind(w),
              },
              ref_window,
            )

            function inner_clicked(v, option, event) {
              if (values != values_list) v = text_values.indexOf(v)
              this.value = v
              inner_value_change(this, v)
              that.dirty_canvas = true
              return false
            }
          }
        } else if (event.type == LiteGraph.pointerevents_method + 'up' && w.type === 'number') {
          var delta = x < 40 ? -1 : x > widget_width - 40 ? 1 : 0

          if (event.click_time < 200 && delta === 0) {
            this.currentPromptDialog = prompt(
              this,
              'Value',
              w.value,
              function (v) {
                // check if v is a valid equation or a number
                if (/^[0-9+\-*/()\s]+|\d+\.\d+$/.test(v)) {
                  try {
                    //solve the equation if possible
                    v = eval(v)
                  } catch (e) {}
                }
                this.value = Number(v)
                inner_value_change(this, this.value)
              }.bind(w),
              event,
            )
          }
        }

        if (old_value != w.value)
          setTimeout(
            function () {
              inner_value_change(this, this.value)
            }.bind(w),
            20,
          )
        this.dirty_canvas = true
        break

      case 'toggle':
        if (event.type == LiteGraph.pointerevents_method + 'down') {
          w.value = !w.value
          setTimeout(function () {
            inner_value_change(w, w.value)
          }, 20)
        }
        break

      case 'string':
      case 'text':
        if (event.type == LiteGraph.pointerevents_method + 'down') {
          prompt(
            this,
            'Value',
            w.value,
            function (v) {
              inner_value_change(this, v)
            }.bind(w),
            event,
            w.options ? w.options.multiline : false,
          )
        }
        break

      default:
        if (w.mouse) {
          this.dirty_canvas = w.mouse(event, [x, y], node)
        }
        break
    } //end switch

    //value changed
    if (old_value != w.value) {
      if (node.onWidgetChanged) node.onWidgetChanged(w.name, w.value, old_value, w)
      node.graph._version++
    }

    return w
  } //end for

  function inner_value_change(widget, value) {
    if (widget.type === 'number') {
      value = Number(value)
    }
    widget.value = value

    if (that.onNodeWidgetChanged) {
      that.onNodeWidgetChanged(node, widget.name, widget.value)
    }

    if (widget.options && widget.options.property && node.properties[widget.options.property] !== undefined) {
      node.setProperty(widget.options.property, value)
    }
    if (widget.callback) {
      widget.callback(widget.value, that, node, pos, event)
    }
  }

  return null
}

/**
 * draws every group area in the background
 * @method drawGroups
 **/
LCanvas.prototype.drawGroups = function (canvas, ctx) {
  if (!this.graph) {
    return
  }

  if (this.onBeforeDrawGroups) {
    this.onBeforeDrawGroups(ctx)
  }

  var groups = this.graph._groups

  ctx.save()
  ctx.globalAlpha = 0.5 * this.editor_alpha

  for (var i = 0; i < groups.length; ++i) {
    var group = groups[i]

    if (!LiteGraph.overlapBounding(this.visible_area, group._bounding)) {
      continue
    } //out of the visible area

    ctx.fillStyle = group.color || '#335'
    ctx.strokeStyle = group.color || '#335'
    var pos = group._pos
    var size = group._size
    ctx.globalAlpha = 0.25 * this.editor_alpha
    ctx.beginPath()
    ctx.rect(pos[0] + 0.5, pos[1] + 0.5, size[0], size[1])
    ctx.fill()
    ctx.globalAlpha = this.editor_alpha
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(pos[0] + size[0], pos[1] + size[1])
    ctx.lineTo(pos[0] + size[0] - 10, pos[1] + size[1])
    ctx.lineTo(pos[0] + size[0], pos[1] + size[1] - 10)
    ctx.fill()

    var font_size = group.font_size || LiteGraph.DEFAULT_GROUP_FONT_SIZE
    ctx.font = font_size + 'px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(group.title, pos[0] + 6, 3+pos[1] + font_size)
  }

  ctx.restore()

  if (this.onAfterDrawGroups) {
    this.onAfterDrawGroups(ctx)
  }
}

LCanvas.prototype.adjustNodesSize = function () {
  var nodes = this.graph._nodes
  for (var i = 0; i < nodes.length; ++i) {
    nodes[i].size = nodes[i].computeSize()
  }
  this.setDirty(true, true)
}

/**
 * resizes the canvas to a given size, if no size is passed, then it tries to fill the parentNode
 * @method resize
 **/
LCanvas.prototype.resize = function (width, height) {
  if (!width && !height) {
    var parent = this.canvas.parentNode
    width = parent.offsetWidth
    height = parent.offsetHeight
  }

  if (this.canvas.width == width && this.canvas.height == height) {
    return
  }

  this.canvas.width = width
  this.canvas.height = height
  this.bgcanvas.width = this.canvas.width
  this.bgcanvas.height = this.canvas.height
  this.setDirty(true, true)
}

/**
 * switches to live mode (node shapes are not rendered, only the content)
 * this feature was designed when graphs where meant to create user interfaces
 * @method switchLiveMode
 **/
LCanvas.prototype.switchLiveMode = function (transition) {
  if (!transition) {
    this.live_mode = !this.live_mode
    this.dirty_canvas = true
    this.dirty_bgcanvas = true
    return
  }

  var self = this
  var delta = this.live_mode ? 1.1 : 0.9
  if (this.live_mode) {
    this.live_mode = false
    this.editor_alpha = 0.1
  }

  var t = setInterval(function () {
    self.editor_alpha *= delta
    self.dirty_canvas = true
    self.dirty_bgcanvas = true

    if (delta < 1 && self.editor_alpha < 0.01) {
      clearInterval(t)
      if (delta < 1) {
        self.live_mode = true
      }
    }
    if (delta > 1 && self.editor_alpha > 0.99) {
      clearInterval(t)
      self.editor_alpha = 1
    }
  }, 1)
}

LCanvas.prototype.onNodeSelectionChange = function (node) {
  return //disabled
}

/* CONTEXT MENU ********************/

LCanvas.onGroupAdd = function (info, entry, mouse_event) {
  var canvas = LCanvas.active_canvas
  var ref_window = canvas.getCanvasWindow()

  var group = new LiteGraph.LGroup()
  group.pos = canvas.convertEventToCanvasOffset(mouse_event)
  canvas.graph.add(group)
}

/**
 * Determines the furthest nodes in each direction
 * @param nodes {LNode[]} the nodes to from which boundary nodes will be extracted
 * @return {{left: LNode, top: LNode, right: LNode, bottom: LNode}}
 */
LCanvas.getBoundaryNodes = function (nodes) {
  let top = null
  let right = null
  let bottom = null
  let left = null
  for (const nID in nodes) {
    const node = nodes[nID]
    const [x, y] = node.pos
    const [width, height] = node.size

    if (top === null || y < top.pos[1]) {
      top = node
    }
    if (right === null || x + width > right.pos[0] + right.size[0]) {
      right = node
    }
    if (bottom === null || y + height > bottom.pos[1] + bottom.size[1]) {
      bottom = node
    }
    if (left === null || x < left.pos[0]) {
      left = node
    }
  }

  return {
    top: top,
    right: right,
    bottom: bottom,
    left: left,
  }
}
/**
 * Determines the furthest nodes in each direction for the currently selected nodes
 * @return {{left: LNode, top: LNode, right: LNode, bottom: LNode}}
 */
LCanvas.prototype.boundaryNodesForSelection = function () {
  return LCanvas.getBoundaryNodes(Object.values(this.selected_nodes))
}

/**
 *
 * @param {LNode[]} nodes a list of nodes
 * @param {"top"|"bottom"|"left"|"right"} direction Direction to align the nodes
 * @param {LNode?} align_to Node to align to (if null, align to the furthest node in the given direction)
 */
LCanvas.alignNodes = function (nodes, direction, align_to) {
  if (!nodes) {
    return
  }

  const canvas = LCanvas.active_canvas
  let boundaryNodes = []
  if (align_to === undefined) {
    boundaryNodes = LCanvas.getBoundaryNodes(nodes)
  } else {
    boundaryNodes = {
      top: align_to,
      right: align_to,
      bottom: align_to,
      left: align_to,
    }
  }

  for (const [_, node] of Object.entries(canvas.selected_nodes)) {
    switch (direction) {
      case 'right':
        node.pos[0] = boundaryNodes['right'].pos[0] + boundaryNodes['right'].size[0] - node.size[0]
        break
      case 'left':
        node.pos[0] = boundaryNodes['left'].pos[0]
        break
      case 'top':
        node.pos[1] = boundaryNodes['top'].pos[1]
        break
      case 'bottom':
        node.pos[1] = boundaryNodes['bottom'].pos[1] + boundaryNodes['bottom'].size[1] - node.size[1]
        break
    }
  }

  canvas.dirty_canvas = true
  canvas.dirty_bgcanvas = true
}

LCanvas.onNodeAlign = function (value, options, event, prev_menu, node) {
  new LiteGraph.ContextMenu(['Top', 'Bottom', 'Left', 'Right'], {
    event: event,
    callback: inner_clicked,
    parentMenu: prev_menu,
  })

  function inner_clicked(value) {
    LCanvas.alignNodes(LCanvas.active_canvas.selected_nodes, value.toLowerCase(), node)
  }
}

LCanvas.onGroupAlign = function (value, options, event, prev_menu) {
  new LiteGraph.ContextMenu(['Top', 'Bottom', 'Left', 'Right'], {
    event: event,
    callback: inner_clicked,
    parentMenu: prev_menu,
  })

  function inner_clicked(value) {
    LCanvas.alignNodes(LCanvas.active_canvas.selected_nodes, value.toLowerCase())
  }
}

LCanvas.onMenuAdd = function (node, options, e, prev_menu, callback) {
  var canvas = LCanvas.active_canvas
  var ref_window = canvas.getCanvasWindow()
  var graph = canvas.graph
  if (!graph) return

  function inner_onMenuAdded(base_category, prev_menu) {
    var categories = LiteGraph.getNodeTypesCategories(canvas.filter || graph.filter).filter(function (category) {
      return category.startsWith(base_category)
    })
    var entries = []

    categories.map(function (category) {
      if (!category) return

      var base_category_regex = new RegExp('^(' + base_category + ')')
      var category_name = category.replace(base_category_regex, '').split('/')[0]
      var category_path = base_category === '' ? category_name + '/' : base_category + category_name + '/'

      var name = category_name
      if (name.indexOf('::') != -1)
        //in case it has a namespace like "shader::math/rand" it hides the namespace
        name = name.split('::')[1]

      var index = entries.findIndex(function (entry) {
        return entry.value === category_path
      })
      if (index === -1) {
        entries.push({
          value: category_path,
          content: name,
          has_submenu: true,
          callback: function (value, event, mouseEvent, contextMenu) {
            inner_onMenuAdded(value.value, contextMenu)
          },
        })
      }
    })

    var nodes = LiteGraph.getNodeTypesInCategory(base_category.slice(0, -1), canvas.filter || graph.filter)
    nodes.map(function (node) {
      if (node.skip_list) return

      var entry = {
        value: node.type,
        content: node.title,
        has_submenu: false,
        callback: function (value, event, mouseEvent, contextMenu) {
          var first_event = contextMenu.getFirstEvent()
          canvas.graph.beforeChange()
          var node = LiteGraph.createNode(value.value)
          if (node) {
            node.pos = canvas.convertEventToCanvasOffset(first_event)
            canvas.graph.add(node)
          }
          if (callback) callback(node)
          canvas.graph.afterChange()
        },
      }

      entries.push(entry)
    })

    new LiteGraph.ContextMenu(entries, { event: e, parentMenu: prev_menu }, ref_window)
  }

  inner_onMenuAdded('', prev_menu)
  return false
}

LCanvas.onMenuCollapseAll = function () {}

LCanvas.onMenuNodeEdit = function () {}

LCanvas.decodeHTML = function (str) {
  var e = document.createElement('div')
  e.innerText = str
  return e.innerHTML
}

LCanvas.prototype.showLinkMenu = function (link, e) {
  var that = this
  // console.log(link);
  var node_left = that.graph.getNodeById(link.origin_id)
  var node_right = that.graph.getNodeById(link.target_id)
  var fromType = false
  if (node_left && node_left.outputs && node_left.outputs[link.origin_slot]) fromType = node_left.outputs[link.origin_slot].type
  var destType = false
  if (node_right && node_right.outputs && node_right.outputs[link.target_slot]) destType = node_right.inputs[link.target_slot].type

  var options = ['Add Node', null, 'Delete', null]

  var menu = new LiteGraph.ContextMenu(options, {
    event: e,
    title: link.data != null ? link.data.constructor.name : null,
    callback: inner_clicked,
  })

  function inner_clicked(v, options, e) {
    switch (v) {
      case 'Add Node':
        LCanvas.onMenuAdd(null, null, e, menu, function (node) {
          // console.debug("node autoconnect");
          if (!node.inputs || !node.inputs.length || !node.outputs || !node.outputs.length) {
            return
          }
          // leave the connection type checking inside connectByType
          if (node_left.connectByType(link.origin_slot, node, fromType)) {
            node.connectByType(link.target_slot, node_right, destType)
            node.pos[0] -= node.size[0] * 0.5
          }
        })
        break

      case 'Delete':
        that.graph.removeLink(link.id)
        break
      default:
      /*var nodeCreated = createDefaultNodeForSlot({   nodeFrom: node_left
                ,slotFrom: link.origin_slot
                ,nodeTo: node
                ,slotTo: link.target_slot
                ,e: e
                ,nodeType: "AUTO"
                });
    if(nodeCreated) console.log("new node in beetween "+v+" created");*/
    }
  }

  return false
}

LCanvas.prototype.createDefaultNodeForSlot = function (optPass) {
  // addNodeMenu for connection
  var optPass = optPass || {}
  var opts = Object.assign(
    {
      nodeFrom: null, // input
      slotFrom: null, // input
      nodeTo: null, // output
      slotTo: null, // output
      position: [], // pass the event coords
      nodeType: null, // choose a nodetype to add, AUTO to set at first good
      posAdd: [0, 0], // adjust x,y
      posSizeFix: [0, 0], // alpha, adjust the position x,y based on the new node size w,h
    },
    optPass,
  )
  var that = this

  var isFrom = opts.nodeFrom && opts.slotFrom !== null
  var isTo = !isFrom && opts.nodeTo && opts.slotTo !== null

  if (!isFrom && !isTo) {
    console.warn('No data passed to createDefaultNodeForSlot ' + opts.nodeFrom + ' ' + opts.slotFrom + ' ' + opts.nodeTo + ' ' + opts.slotTo)
    return false
  }
  if (!opts.nodeType) {
    console.warn('No type to createDefaultNodeForSlot')
    return false
  }

  var nodeX = isFrom ? opts.nodeFrom : opts.nodeTo
  var slotX = isFrom ? opts.slotFrom : opts.slotTo

  var iSlotConn = false
  switch (typeof slotX) {
    case 'string':
      iSlotConn = isFrom ? nodeX.findOutputSlot(slotX, false) : nodeX.findInputSlot(slotX, false)
      slotX = isFrom ? nodeX.outputs[slotX] : nodeX.inputs[slotX]
      break
    case 'object':
      // ok slotX
      iSlotConn = isFrom ? nodeX.findOutputSlot(slotX.name) : nodeX.findInputSlot(slotX.name)
      break
    case 'number':
      iSlotConn = slotX
      slotX = isFrom ? nodeX.outputs[slotX] : nodeX.inputs[slotX]
      break
    case 'undefined':
    default:
      // bad ?
      //iSlotConn = 0;
      console.warn('Cant get slot information ' + slotX)
      return false
  }

  if (slotX === false || iSlotConn === false) {
    console.warn('createDefaultNodeForSlot bad slotX ' + slotX + ' ' + iSlotConn)
  }

  // check for defaults nodes for this slottype
  var fromSlotType = slotX.type == LiteGraph.EVENT ? '_event_' : slotX.type
  var slotTypesDefault = isFrom ? LiteGraph.slot_types_default_out : LiteGraph.slot_types_default_in
  if (slotTypesDefault && slotTypesDefault[fromSlotType]) {
    if (slotX.link !== null) {
      // is connected
    } else {
      // is not not connected
    }
    let nodeNewType = false
    if (typeof slotTypesDefault[fromSlotType] == 'object' || typeof slotTypesDefault[fromSlotType] == 'array') {
      for (var typeX in slotTypesDefault[fromSlotType]) {
        if (opts.nodeType == slotTypesDefault[fromSlotType][typeX] || opts.nodeType == 'AUTO') {
          nodeNewType = slotTypesDefault[fromSlotType][typeX]
          // console.log("opts.nodeType == slotTypesDefault[fromSlotType][typeX] :: "+opts.nodeType);
          break // --------
        }
      }
    } else {
      if (opts.nodeType == slotTypesDefault[fromSlotType] || opts.nodeType == 'AUTO') nodeNewType = slotTypesDefault[fromSlotType]
    }
    if (nodeNewType) {
      var nodeNewOpts = false
      if (typeof nodeNewType == 'object' && nodeNewType.node) {
        nodeNewOpts = nodeNewType
        nodeNewType = nodeNewType.node
      }

      //that.graph.beforeChange();

      var newNode = LiteGraph.createNode(nodeNewType)
      if (newNode) {
        // if is object pass options
        if (nodeNewOpts) {
          if (nodeNewOpts.properties) {
            for (var i in nodeNewOpts.properties) {
              newNode.addProperty(i, nodeNewOpts.properties[i])
            }
          }
          if (nodeNewOpts.inputs) {
            newNode.inputs = []
            for (var i in nodeNewOpts.inputs) {
              newNode.addOutput(nodeNewOpts.inputs[i][0], nodeNewOpts.inputs[i][1])
            }
          }
          if (nodeNewOpts.outputs) {
            newNode.outputs = []
            for (var i in nodeNewOpts.outputs) {
              newNode.addOutput(nodeNewOpts.outputs[i][0], nodeNewOpts.outputs[i][1])
            }
          }
          if (nodeNewOpts.title) {
            newNode.title = nodeNewOpts.title
          }
          if (nodeNewOpts.json) {
            newNode.configure(nodeNewOpts.json)
          }
        }

        // add the node
        that.graph.add(newNode)
        newNode.pos = [
          opts.position[0] + opts.posAdd[0] + (opts.posSizeFix[0] ? opts.posSizeFix[0] * newNode.size[0] : 0),
          opts.position[1] + opts.posAdd[1] + (opts.posSizeFix[1] ? opts.posSizeFix[1] * newNode.size[1] : 0),
        ] //that.last_click_position; //[e.canvasX+30, e.canvasX+5];*/

        //that.graph.afterChange();

        // connect the two!
        if (isFrom) {
          opts.nodeFrom.connectByType(iSlotConn, newNode, fromSlotType)
        } else {
          opts.nodeTo.connectByTypeOutput(iSlotConn, newNode, fromSlotType)
        }

        // if connecting in between
        if (isFrom && isTo) {
          // TODO
        }

        return true
      } else {
        console.log('failed creating ' + nodeNewType)
      }
    }
  }
  return false
}

LCanvas.getPropertyPrintableValue = function (value, values) {
  if (!values) return String(value)

  if (values.constructor === Array) {
    return String(value)
  }

  if (values.constructor === Object) {
    var desc_value = ''
    for (var k in values) {
      if (values[k] != value) continue
      desc_value = k
      break
    }
    return String(value) + ' (' + desc_value + ')'
  }
}

/**
 * Changes the background color of the canvas.
 *
 * @method updateBackground
 * @param {image} String
 * @param {clearBackgroundColor} String
 * @
 */
LCanvas.prototype.updateBackground = function (image, clearBackgroundColor) {
  this._bg_img = new Image()
  this._bg_img.name = image
  this._bg_img.src = image
  this._bg_img.onload = () => {
    this.draw(true, true)
  }
  this.background_image = image

  this.clear_background = true
  this.clear_background_color = clearBackgroundColor
  this._pattern = null
}

export { LCanvas }
