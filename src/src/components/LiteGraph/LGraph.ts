import { extendClass, hex2num, num2hex, getTime, compareObjects, colorToString } from './helpers/Utils'
import { distance, isInsideRectangle, growBounding, isInsideBounding, overlapBounding } from './helpers/Intersect'

import { CurveEditor } from './CurveEditor'
import { LiteGraph } from './LiteGraph'
// @ts-ignore
import { LCanvas } from './LCanvas'
import { LLink } from './LLink'
import { LNode } from './LNode'
import { LGroup } from './LGroup'
import { DragAndScale } from './DragAndScale'
import { ContextMenu } from './ContextMenu'

import './polyfills/CanvasRenderingContext2D'

LiteGraph.LNode = LNode
LiteGraph.LLink = LLink
LiteGraph.LGroup = LGroup
LiteGraph.LCanvas = LCanvas
LiteGraph.CurveEditor = CurveEditor
LiteGraph.DragAndScale = DragAndScale
LiteGraph.ContextMenu = ContextMenu
LiteGraph.extendClass = extendClass

LiteGraph.getTime = getTime
LiteGraph.compareObjects = compareObjects
LiteGraph.distance = distance
LiteGraph.colorToString = colorToString
LiteGraph.isInsideRectangle = isInsideRectangle
LiteGraph.growBounding = growBounding
LiteGraph.isInsideBounding = isInsideBounding
LiteGraph.overlapBounding = overlapBounding
LiteGraph.hex2num = hex2num
LiteGraph.num2hex = num2hex

LiteGraph.closeAllContextMenus = function (ref_window: any) {
  ref_window = ref_window || window

  var elements = ref_window.document.querySelectorAll('.litecontextmenu')
  if (!elements.length) {
    return
  }

  var result = []
  for (var i = 0; i < elements.length; i++) {
    result.push(elements[i])
  }

  for (var i = 0; i < result.length; i++) {
    if (result[i].close) {
      result[i].close()
    } else if (result[i].parentNode) {
      result[i].parentNode.removeChild(result[i])
    }
  }
}

/**
 * Register a node class so it can be listed when the user wants to create a new one
 * @method registerNodeType
 * @param {String} type name of the node and path
 * @param {Class} base_class class containing the structure of a node
 */
LiteGraph.registerNodeType = function (type: string, base_class: any) {
  if (!base_class.prototype) {
    throw 'Cannot register a simple object, it must be a class with a prototype'
  }
  base_class.type = type

  if (LiteGraph.debug) {
    console.log('Node registered: ' + type)
  }

  const classname = base_class.name

  const pos = type.lastIndexOf('/')
  base_class.category = type.substring(0, pos)

  if (!base_class.title) {
    base_class.title = classname
  }

  //extend class
  for (var i in LNode.prototype) {
    if (!base_class.prototype[i]) {
      base_class.prototype[i] = LNode.prototype[i]
    }
  }

  const prev = this.registered_node_types[type]
  if (prev) {
    console.log('replacing node type: ' + type)
  }

  if (!Object.prototype.hasOwnProperty.call(base_class.prototype, 'shape')) {
    Object.defineProperty(base_class.prototype, 'shape', {
      enumerable: true,
      configurable: true,

      set: function (v) {
        switch (v) {
          case 'default':
            delete this._shape
            break
          case 'box':
            this._shape = LiteGraph.BOX_SHAPE
            break
          case 'round':
            this._shape = LiteGraph.ROUND_SHAPE
            break
          case 'circle':
            this._shape = LiteGraph.CIRCLE_SHAPE
            break
          case 'card':
            this._shape = LiteGraph.CARD_SHAPE
            break
          default:
            this._shape = v
        }
      },

      get: function () {
        return this._shape
      },
    })

    //used to know which nodes to create when dragging files to the canvas
    if (base_class.supported_extensions) {
      for (let i in base_class.supported_extensions) {
        const ext = base_class.supported_extensions[i]
        if (ext && ext.constructor === String) {
          this.node_types_by_file_extension[ext.toLowerCase()] = base_class
        }
      }
    }
  }

  this.registered_node_types[type] = base_class
  if (base_class.constructor.name) {
    this.Nodes[classname] = base_class
  }
  if (LiteGraph.onNodeTypeRegistered) {
    LiteGraph.onNodeTypeRegistered(type, base_class)
  }
  if (prev && LiteGraph.onNodeTypeReplaced) {
    LiteGraph.onNodeTypeReplaced(type, base_class, prev)
  }

  //warnings
  if (base_class.prototype.onPropertyChange) {
    console.warn('LiteGraph node class ' + type + ' has onPropertyChange method, it must be called onPropertyChanged with d at the end')
  }

  // TODO one would want to know input and ouput :: this would allow through registerNodeAndSlotType to get all the slots types
  if (this.auto_load_slot_types) {
    new base_class(base_class.title || 'tmpnode')
  }
}


/**
 * Adds this method to all nodetypes, existing and to be created
 * (You can add it to LNode.prototype but then existing node types wont have it)
 * @method addNodeMethod
 * @param {Function} func
 */
LiteGraph.addNodeMethod = function (name: string, func: any) {
  LNode.prototype[name] = func
  for (var i in this.registered_node_types) {
    var type = this.registered_node_types[i]
    if (type.prototype[name]) {
      type.prototype['_' + name] = type.prototype[name]
    } //keep old in case of replacing
    type.prototype[name] = func
  }
}

/* ----------------------------------------------------------- */
// @ts-ignore
LGroup.prototype.isPointInside = LNode.prototype.isPointInside
// @ts-ignore
LGroup.prototype.setDirtyCanvas = LNode.prototype.setDirtyCanvas

/**
 * LGraph is the class that contain a full graph. We instantiate one and add nodes to it, and then we can run the execution loop.
 * supported callbacks:
  + onNodeAdded: when a new node is added to the graph
  + onNodeRemoved: when a node inside this graph is removed
  + onNodeConnectionChange: some connection has changed in the graph (connected or disconnected)
 *
 * @class LGraph
 * @constructor
 * @param {Object} o data from previous serialization [optional]
 */

class LGraph {
  //default supported types
  static supported_types = ['number', 'string', 'boolean']
  static STATUS_STOPPED = 1
  static STATUS_RUNNING = 2

  list_of_graphcanvas: any
  status = LGraph.STATUS_STOPPED
  last_node_id = 0
  last_link_id = 0
  _version = -1
  _nodes: any[] = []
  _nodes_by_id: any = {}
  _nodes_in_order: any[] = []
  _nodes_executable: any = null
  _groups: any[] = []
  links: any = {}
  iteration = 0
  config: any = {}
  vars: any = {}
  extra: any = {}
  uid: any = null
  name: any = null
  meta: any = {}
  type: any = null
  mapping: any = {}
  defaults: any = {}
  globaltime = 0
  runningtime = 0
  fixedtime = 0
  fixedtime_lapse = 0.01
  elapsed_time = 0.01
  last_update_time = 0
  starttime = 0
  catch_errors = true
  nodes_executing: any[] = []
  nodes_actioning: any[] = []
  nodes_executedAction: any[] = []
  inputs: any = {}
  outputs: any = {}

  onPlayEvent: any
  onBeforeStep: any
  onAfterStep: any
  onStopEvent: any
  onExecuteStep: any
  onAfterExecute: any
  onNodeAdded: any
  onNodeRemoved: any
  onOutputAdded: any
  onInputsOutputsChange: any
  onTrigger: any
  onInputAdded: any
  onInputRenamed: any
  onInputTypeChanged: any
  onInputRemoved: any
  onOutputRenamed: any
  onOutputTypeChanged: any
  onOutputRemoved: any
  onConfigure: any
  onBeforeChange: any
  onAfterChange: any
  onConnectionChange: any
  onNodeUpdated: any
  on_change: any
  onSerialize: any
  
  execution_timer_id: any
  execution_time: any
  supported_types: any
  errors_in_execution: boolean | undefined
  _input_nodes: any

  constructor(o: any) {
    if (LiteGraph.debug) {
      console.log('Graph created')
    }
    this.list_of_graphcanvas = null
    this.clear()
  
    if (o) {
      this.configure(o)
    }
  }

  //used to know which types of connections support this graph (some graphs do not allow certain types)
  getSupportedTypes() {
    return this.supported_types || LGraph.supported_types
  }
  
  /**
   * Removes all nodes from this graph
   * @method clear
   */

  clear() {
    this.stop()
    this.status = LGraph.STATUS_STOPPED

    this.last_node_id = 0
    this.last_link_id = 0

    this._version = -1 //used to detect changes

    //safe clear
    if (this._nodes) {
      for (var i = 0; i < this._nodes.length; ++i) {
        var node = this._nodes[i]
        if (node.onRemoved) {
          node.onRemoved()
        }
      }
    }

    //nodes
    this._nodes = []
    this._nodes_by_id = {}
    this._nodes_in_order = [] //nodes sorted in execution order
    this._nodes_executable = null //nodes that contain onExecute sorted in execution order

    //other scene stuff
    this._groups = []

    //links
    this.links = {} //container with all the links

    //iterations
    this.iteration = 0

    //custom data
    this.config = {}
    this.vars = {}
    this.extra = {} //to store custom data
    this.uid = null
    this.name = null
    this.meta = {}
    this.type = null
    this.mapping = {}
    this.defaults = {}
    //timing
    this.globaltime = 0
    this.runningtime = 0
    this.fixedtime = 0
    this.fixedtime_lapse = 0.01
    this.elapsed_time = 0.01
    this.last_update_time = 0
    this.starttime = 0

    this.catch_errors = true

    this.nodes_executing = []
    this.nodes_actioning = []
    this.nodes_executedAction = []

    //subgraph_data
    this.inputs = {}
    this.outputs = {}

    //notify canvas to redraw
    this.change()

    this.sendActionToCanvas('clear')
  }

  /**
   * Attach Canvas to this graph
   * @method attachCanvas
   * @param {GraphCanvas} graph_canvas
   */
  attachCanvas(graphcanvas: any) {
    if (graphcanvas.constructor != LCanvas) {
      throw 'attachCanvas expects a LCanvas instance'
    }
    if (graphcanvas.graph && graphcanvas.graph != this) {
      graphcanvas.graph.detachCanvas(graphcanvas)
    }

    graphcanvas.graph = this

    if (!this.list_of_graphcanvas) {
      this.list_of_graphcanvas = []
    }
    this.list_of_graphcanvas.push(graphcanvas)
  }

  /**
   * Detach Canvas from this graph
   * @method detachCanvas
   * @param {GraphCanvas} graph_canvas
   */
  detachCanvas(graphcanvas: any) {
    if (!this.list_of_graphcanvas) {
      return
    }

    var pos = this.list_of_graphcanvas.indexOf(graphcanvas)
    if (pos == -1) {
      return
    }
    graphcanvas.graph = null
    this.list_of_graphcanvas.splice(pos, 1)
  }

  /**
   * Starts running this graph every interval milliseconds.
   * @method start
   * @param {number} interval amount of milliseconds between executions, if 0 then it renders to the monitor refresh rate
   */

  start(interval: number) {
    if (this.status == LGraph.STATUS_RUNNING) {
      return
    }
    this.status = LGraph.STATUS_RUNNING

    if (this.onPlayEvent) {
      this.onPlayEvent()
    }

    this.sendEventToAllNodes('onStart')

    //launch
    this.starttime = LiteGraph.getTime()
    this.last_update_time = this.starttime
    interval = interval || 0
    var that = this

    //execute once per frame
    if (interval == 0 && typeof window != 'undefined' && window.requestAnimationFrame) {
      function on_frame() {
        if (that.execution_timer_id != -1) {
          return
        }
        window.requestAnimationFrame(on_frame)
        if (that.onBeforeStep) that.onBeforeStep()
        that.runStep(1, !that.catch_errors)
        if (that.onAfterStep) that.onAfterStep()
      }
      this.execution_timer_id = -1
      on_frame()
    } else {
      //execute every 'interval' ms
      this.execution_timer_id = setInterval(function () {
        //execute
        if (that.onBeforeStep) that.onBeforeStep()
        that.runStep(1, !that.catch_errors)
        if (that.onAfterStep) that.onAfterStep()
      }, interval)
    }
  }

  /**
   * Stops the execution loop of the graph
   * @method stop execution
   */

  stop() {
    if (this.status == LGraph.STATUS_STOPPED) {
      return
    }

    this.status = LGraph.STATUS_STOPPED

    if (this.onStopEvent) {
      this.onStopEvent()
    }

    if (this.execution_timer_id != null) {
      if (this.execution_timer_id != -1) {
        clearInterval(this.execution_timer_id)
      }
      this.execution_timer_id = null
    }

    this.sendEventToAllNodes('onStop')
  }

  /**
   * Run N steps (cycles) of the graph
   * @method runStep
   * @param {number} num number of steps to run, default is 1
   * @param {Boolean} do_not_catch_errors [optional] if you want to try/catch errors
   * @param {number} limit max number of nodes to execute (used to execute from start to a node)
   */

  runStep(num: number, do_not_catch_errors: boolean, limit?: number) {
    num = num || 1

    var start = LiteGraph.getTime()
    this.globaltime = 0.001 * (start - this.starttime)

    var nodes = this._nodes_executable ? this._nodes_executable : this._nodes
    if (!nodes) {
      return
    }

    limit = limit || nodes.length

    if (do_not_catch_errors) {
      //iterations
      for (var i = 0; i < num; i++) {
        for (var j = 0; j < limit!; ++j) {
          var node = nodes[j]
          if (node.mode == LiteGraph.ALWAYS && node.onExecute) {
            //wrap node.onExecute();
            node.doExecute()
          }
        }

        this.fixedtime += this.fixedtime_lapse
        if (this.onExecuteStep) {
          this.onExecuteStep()
        }
      }

      if (this.onAfterExecute) {
        this.onAfterExecute()
      }
    } else {
      try {
        //iterations
        for (var i = 0; i < num; i++) {
          for (var j = 0; j < limit!; ++j) {
            var node = nodes[j]
            if (node.mode == LiteGraph.ALWAYS && node.onExecute) {
              node.onExecute()
            }
          }

          this.fixedtime += this.fixedtime_lapse
          if (this.onExecuteStep) {
            this.onExecuteStep()
          }
        }

        if (this.onAfterExecute) {
          this.onAfterExecute()
        }
        this.errors_in_execution = false
      } catch (err) {
        this.errors_in_execution = true
        if (LiteGraph.throw_errors) {
          throw err
        }
        if (LiteGraph.debug) {
          console.log('Error during execution: ' + err)
        }
        this.stop()
      }
    }

    var now = LiteGraph.getTime()
    var elapsed = now - start
    if (elapsed == 0) {
      elapsed = 1
    }
    this.execution_time = 0.001 * elapsed
    this.globaltime += 0.001 * elapsed
    this.iteration += 1
    this.elapsed_time = (now - this.last_update_time) * 0.001
    this.last_update_time = now
    this.nodes_executing = []
    this.nodes_actioning = []
    this.nodes_executedAction = []
  }

  /**
   * Updates the graph execution order according to relevance of the nodes (nodes with only outputs have more relevance than
   * nodes with only inputs.
   * @method updateExecutionOrder
   */
  updateExecutionOrder() {
    this._nodes_in_order = this.computeExecutionOrder(false)
    this._nodes_executable = []
    for (var i = 0; i < this._nodes_in_order.length; ++i) {
      if (this._nodes_in_order[i].onExecute) {
        this._nodes_executable.push(this._nodes_in_order[i])
      }
    }
  }

  //This is more internal, it computes the executable nodes in order and returns it
  computeExecutionOrder(only_onExecute: any, set_level?: any) {
    var L: any[] = []
    var S: any[] = []
    var M: any = {}
    var visited_links: any = {} //to avoid repeating links
    var remaining_links: any = {} //to a

    //search for the nodes without inputs (starting nodes)
    for (var i = 0, l = this._nodes.length; i < l; ++i) {
      var node = this._nodes[i]
      if (only_onExecute && !node.onExecute) {
        continue
      }

      M[node.id] = node //add to pending nodes

      var num = 0 //num of input connections
      if (node.inputs) {
        for (var j = 0, l2 = node.inputs.length; j < l2; j++) {
          if (node.inputs[j] && node.inputs[j].link != null) {
            num += 1
          }
        }
      }

      if (num == 0) {
        //is a starting node
        S.push(node)
        if (set_level) {
          node._level = 1
        }
      } //num of input links
      else {
        if (set_level) {
          node._level = 0
        }
        remaining_links[node.id] = num
      }
    }

    while (true) {
      if (S.length == 0) {
        break
      }

      //get an starting node
      var node = S.shift()
      L.push(node) //add to ordered list
      delete M[node.id] //remove from the pending nodes

      if (!node.outputs) {
        continue
      }

      //for every output
      for (var i = 0; i < node.outputs.length; i++) {
        var output = node.outputs[i]
        //not connected
        if (output == null || output.links == null || output.links.length == 0) {
          continue
        }

        //for every connection
        for (var j = 0; j < output.links.length; j++) {
          var link_id = output.links[j]
          var link = this.links[link_id]
          if (!link) {
            continue
          }

          //already visited link (ignore it)
          if (visited_links[link.id]) {
            continue
          }

          var target_node = this.getNodeById(link.target_id)
          if (target_node == null) {
            visited_links[link.id] = true
            continue
          }

          if (set_level && (!target_node._level || target_node._level <= node._level)) {
            target_node._level = node._level + 1
          }

          visited_links[link.id] = true //mark as visited
          remaining_links[target_node.id] -= 1 //reduce the number of links remaining
          if (remaining_links[target_node.id] == 0) {
            S.push(target_node)
          } //if no more links, then add to starters array
        }
      }
    }

    //the remaining ones (loops)
    for (let i in M) {
      L.push(M[i])
    }

    if (L.length != this._nodes.length && LiteGraph.debug) {
      console.warn('something went wrong, nodes missing')
    }

    var l = L.length

    //save order number in the node
    for (let i = 0; i < l; ++i) {
      L[i].order = i
    }

    //sort now by priority
    L = L.sort(function (A, B) {
      var Ap = A.constructor.priority || A.priority || 0
      var Bp = B.constructor.priority || B.priority || 0
      if (Ap == Bp) {
        //if same priority, sort by order
        return A.order - B.order
      }
      return Ap - Bp //sort by priority
    })

    //save order number in the node, again...
    for (var i = 0; i < l; ++i) {
      L[i].order = i
    }

    return L
  }

  /**
   * Returns all the nodes that could affect this one (ancestors) by crawling all the inputs recursively.
   * It doesn't include the node itself
   * @method getAncestors
   * @return {Array} an array with all the LNodes that affect this node, in order of execution
   */
  getAncestors(node: any) {
    var ancestors: any[] = []
    var pending: any[] = [node]
    var visited: any = {}

    while (pending.length) {
      var current = pending.shift()
      if (!current.inputs) {
        continue
      }
      if (!visited[current.id] && current != node) {
        visited[current.id] = true
        ancestors.push(current)
      }

      for (var i = 0; i < current.inputs.length; ++i) {
        var input = current.getInputNode(i)
        if (input && ancestors.indexOf(input) == -1) {
          pending.push(input)
        }
      }
    }

    ancestors.sort(function (a, b) {
      return a.order - b.order
    })
    return ancestors
  }

  /**
   * Positions every node in a more readable manner
   * @method arrange
   */
  arrange(margin: number, layout: any) {
    margin = margin || 100

    const nodes = this.computeExecutionOrder(false, true)
    const columns: any[] = []
    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i]
      const col = node._level || 1
      if (!columns[col]) {
        columns[col] = []
      }
      columns[col].push(node)
    }

    let x = margin

    for (let i = 0; i < columns.length; ++i) {
      const column = columns[i]
      if (!column) {
        continue
      }
      let max_size = 100
      let y = margin + LiteGraph.NODE_TITLE_HEIGHT
      for (let j = 0; j < column.length; ++j) {
        const node = column[j]
        node.pos[0] = layout == LiteGraph.VERTICAL_LAYOUT ? y : x
        node.pos[1] = layout == LiteGraph.VERTICAL_LAYOUT ? x : y
        const max_size_index = layout == LiteGraph.VERTICAL_LAYOUT ? 1 : 0
        if (node.size[max_size_index] > max_size) {
          max_size = node.size[max_size_index]
        }
        const node_size_index = layout == LiteGraph.VERTICAL_LAYOUT ? 0 : 1
        y += node.size[node_size_index] + margin + LiteGraph.NODE_TITLE_HEIGHT
      }
      x += max_size + margin
    }

    this.setDirtyCanvas(true, true)
  }

  /**
   * Returns the amount of time the graph has been running in milliseconds
   * @method getTime
   * @return {number} number of milliseconds the graph has been running
   */
  getTime() {
    return this.globaltime
  }

  /**
   * Returns the amount of time accumulated using the fixedtime_lapse var. This is used in context where the time increments should be constant
   * @method getFixedTime
   * @return {number} number of milliseconds the graph has been running
   */

  getFixedTime() {
    return this.fixedtime
  }

  /**
   * Returns the amount of time it took to compute the latest iteration. Take into account that this number could be not correct
   * if the nodes are using graphical actions
   * @method getElapsedTime
   * @return {number} number of milliseconds it took the last cycle
   */
  getElapsedTime() {
    return this.elapsed_time
  }

  /**
   * Sends an event to all the nodes, useful to trigger stuff
   * @method sendEventToAllNodes
   * @param {String} eventname the name of the event (function to be called)
   * @param {Array} params parameters in array format
   */
  sendEventToAllNodes(eventname: string, params?: any, mode?: any) {
    mode = mode || LiteGraph.ALWAYS

    var nodes = this._nodes_in_order ? this._nodes_in_order : this._nodes
    if (!nodes) {
      return
    }

    for (var j = 0, l = nodes.length; j < l; ++j) {
      var node = nodes[j]

      if (node.constructor === LiteGraph.Subgraph && eventname != 'onExecute') {
        if (node.mode == mode) {
          node.sendEventToAllNodes(eventname, params, mode)
        }
        continue
      }

      if (!node[eventname] || node.mode != mode) {
        continue
      }
      if (params === undefined) {
        node[eventname]()
      } else if (params && params.constructor === Array) {
        node[eventname].apply(node, params)
      } else {
        node[eventname](params)
      }
    }
  }

  sendActionToCanvas(action: string, params?: any) {
    if (!this.list_of_graphcanvas) {
      return
    }
  
    for (var i = 0; i < this.list_of_graphcanvas.length; ++i) {
      var c = this.list_of_graphcanvas[i]
      if (c[action]) {
        c[action].apply(c, params)
      }
    }
  }
  
  /**
   * Adds a new node instance to this graph
   * @method add
   * @param {LNode} node the instance of the node
   */
  
  add(node: any, skip_compute_order?: boolean) {
    if (!node) {
      return
    }
    //groups
    if (node.constructor === LGroup) {
      this._groups.push(node)
      this.setDirtyCanvas(true)
      this.change()
      node.graph = this
      this._version++
      return
    }
  
    //nodes
    if (node.id != -1 && this._nodes_by_id[node.id] != null) {
      console.warn('LiteGraph: there is already a node with this ID, changing it')
      if (LiteGraph.use_uuids) {
        node.id = LiteGraph.uuidv4()
      } else {
        node.id = ++this.last_node_id
      }
    }

    if (this._nodes.length >= LiteGraph.MAX_NUMBER_OF_NODES) {
      throw 'LiteGraph: max number of nodes in a graph reached'
    }
  
    //give him an id
    if (LiteGraph.use_uuids) {
      if (node.id == null || node.id == -1) node.id = LiteGraph.uuidv4()
    } else {
      if (node.id == null || node.id == -1) {
        node.id = ++this.last_node_id
      } else if (this.last_node_id < node.id) {
        this.last_node_id = node.id
      }
    }
  
    node.graph = this
    this._version++
  
    this._nodes.push(node)
    this._nodes_by_id[node.id] = node
  
    if (node.onAdded) {
      node.onAdded(this)
    }
  
    if (this.config.align_to_grid) {
      node.alignToGrid()
    }
  
    if (!skip_compute_order) {
      this.updateExecutionOrder()
    }
  
    if (this.onNodeAdded) {
      this.onNodeAdded(node)
    }
  
    this.setDirtyCanvas(true)
    this.change()
  
    return node //to chain actions
  }
  
  /**
   * Removes a node from the graph
   * @method remove
   * @param {LNode} node the instance of the node
   */

  remove(node: any) {
    if (node.constructor === LiteGraph.LGroup) {
      var index = this._groups.indexOf(node)
      if (index != -1) {
        this._groups.splice(index, 1)
      }
      node.graph = null
      this._version++
      this.setDirtyCanvas(true, true)
      this.change()
      return
    }

    if (this._nodes_by_id[node.id] == null) {
      return
    } //not found

    if (node.ignore_remove) {
      return
    } //cannot be removed

    //disconnect inputs
    if (node.inputs) {
      for (var i = 0; i < node.inputs.length; i++) {
        var slot = node.inputs[i]
        if (slot.link != null) {
          node.disconnectInput(i)
        }
      }
    }

    //disconnect outputs
    if (node.outputs) {
      for (var i = 0; i < node.outputs.length; i++) {
        var slot = node.outputs[i]
        if (slot.links != null && slot.links.length) {
          node.disconnectOutput(i)
        }
      }
    }

    //node.id = -1; //why?

    //callback
    if (node.onRemoved) {
      node.onRemoved()
    }

    node.graph = null
    this._version++

    //remove from canvas render
    if (this.list_of_graphcanvas) {
      for (var i = 0; i < this.list_of_graphcanvas.length; ++i) {
        var canvas = this.list_of_graphcanvas[i]
        if (canvas.selected_nodes[node.id]) {
          delete canvas.selected_nodes[node.id]
        }
        if (canvas.node_dragged == node) {
          canvas.node_dragged = null
        }
      }
    }

    //remove from containers
    var pos = this._nodes.indexOf(node)
    if (pos != -1) {
      this._nodes.splice(pos, 1)
    }
    delete this._nodes_by_id[node.id]

    if (this.onNodeRemoved) {
      this.onNodeRemoved(node)
    }

    //close panels
    this.sendActionToCanvas('checkPanels')

    this.setDirtyCanvas(true, true)
    this.afterChange() //sure? - almost sure is wrong
    this.change()

    this.updateExecutionOrder()
  }

  /**
   * Returns a node by its id.
   * @method getNodeById
   * @param {Number} id
   */

  getNodeById(id: number) {
    if (id == null) {
      return null
    }
    return this._nodes_by_id[id]
  }


  /**
   * Returns a list of nodes that matches a class
   * @method findNodesByClass
   * @param {Class} classObject the class itself (not an string)
   * @return {Array} a list with all the nodes of this type
   */
  findNodesByClass(classObject: any, result?: any) {
    result = result || []
    result.length = 0
    for (var i = 0, l = this._nodes.length; i < l; ++i) {
      if (this._nodes[i].constructor === classObject) {
        result.push(this._nodes[i])
      }
    }
    return result
  }

  /**
   * Returns a list of nodes that matches a type
   * @method findNodesByType
   * @param {String} type the name of the node type
   * @return {Array} a list with all the nodes of this type
   */
  findNodesByType(type: string, result?: any) {
    var type = type.toLowerCase()
    result = result || []
    result.length = 0
    for (var i = 0, l = this._nodes.length; i < l; ++i) {
      if (this._nodes[i].type.toLowerCase() == type) {
        result.push(this._nodes[i])
      }
    }
    return result
  }

  /**
   * Returns the first node that matches a name in its title
   * @method findNodeByTitle
   * @param {String} name the name of the node to search
   * @return {Node} the node or null
   */
  findNodeByTitle(title: string) {
    for (var i = 0, l = this._nodes.length; i < l; ++i) {
      if (this._nodes[i].title == title) {
        return this._nodes[i]
      }
    }
    return null
  }

  /**
   * Returns a list of nodes that matches a name
   * @method findNodesByTitle
   * @param {String} name the name of the node to search
   * @return {Array} a list with all the nodes with this name
   */
  findNodesByTitle(title: string) {
    var result = []
    for (var i = 0, l = this._nodes.length; i < l; ++i) {
      if (this._nodes[i].title == title) {
        result.push(this._nodes[i])
      }
    }
    return result
  }

  /**
   * Returns the top-most node in this position of the canvas
   * @method getNodeOnPos
   * @param {number} x the x coordinate in canvas space
   * @param {number} y the y coordinate in canvas space
   * @param {Array} nodes_list a list with all the nodes to search from, by default is all the nodes in the graph
   * @return {LNode} the node at this position or null
   */
  getNodeOnPos(x: number, y: number, nodes_list: any[], margin: any) {
    nodes_list = nodes_list || this._nodes
    var nRet = null
    for (var i = nodes_list.length - 1; i >= 0; i--) {
      var n = nodes_list[i]
      if (n.isPointInside(x, y, margin)) {
        // check for lesser interest nodes (TODO check for overlapping, use the top)
        /*if (typeof n == "LGroup"){
      nRet = n;
      }else{*/
        return n
        /*}*/
      }
    }
    return nRet
  }

  /**
   * Returns the top-most group in that position
   * @method getGroupOnPos
   * @param {number} x the x coordinate in canvas space
   * @param {number} y the y coordinate in canvas space
   * @return {LGroup} the group or null
   */
  getGroupOnPos(x: number, y: number) {
    for (var i = this._groups.length - 1; i >= 0; i--) {
      var g = this._groups[i]
      if (g.isPointInside(x, y, 2, true)) {
        return g
      }
    }
    return null
  }

  /**
   * Checks that the node type matches the node type registered, used when replacing a nodetype by a newer version during execution
   * this replaces the ones using the old version with the new version
   * @method checkNodeTypes
   */
  checkNodeTypes() {
    var changes = false
    for (var i = 0; i < this._nodes.length; i++) {
      var node = this._nodes[i]
      var ctor = LiteGraph.registered_node_types[node.type]
      if (node.constructor == ctor) {
        continue
      }
      console.log('node being replaced by newer version: ' + node.type)
      var newnode = LiteGraph.createNode(node.type)
      changes = true
      this._nodes[i] = newnode
      newnode.configure(node.serialize())
      newnode.graph = this
      this._nodes_by_id[newnode.id] = newnode
      if (node.inputs) {
        newnode.inputs = node.inputs.concat()
      }
      if (node.outputs) {
        newnode.outputs = node.outputs.concat()
      }
    }
    this.updateExecutionOrder()
  }

  // ********** GLOBALS *****************

  onAction(action: string, param: any, options: any) {
    this._input_nodes = this.findNodesByClass(LiteGraph.GraphInput, this._input_nodes)
    for (var i = 0; i < this._input_nodes.length; ++i) {
      var node = this._input_nodes[i]
      if (node.properties.name != action) {
        continue
      }
      //wrap node.onAction(action, param);
      node.actionDo(action, param, options)
      break
    }
  }

  trigger(action: string, param: any) {
    if (this.onTrigger) {
      this.onTrigger(action, param)
    }
  }

  /**
   * Tell this graph it has a global graph input of this type
   * @method addGlobalInput
   * @param {String} name
   * @param {String} type
   * @param {*} value [optional]
   */
  addInput(name: string, type: string, value: any) {
    var input = this.inputs[name]
    if (input) {
      //already exist
      return
    }

    this.beforeChange()
    this.inputs[name] = { name: name, type: type, value: value }
    this._version++
    this.afterChange()

    if (this.onInputAdded) {
      this.onInputAdded(name, type)
    }

    if (this.onInputsOutputsChange) {
      this.onInputsOutputsChange()
    }
  }

  /**
   * Assign a data to the global graph input
   * @method setGlobalInputData
   * @param {String} name
   * @param {*} data
   */
  setInputData(name: string, data: any) {
    var input = this.inputs[name]
    if (!input) {
      return
    }
    input.value = data
  }

  /**
   * Returns the current value of a global graph input
   * @method getInputData
   * @param {String} name
   * @return {*} the data
   */
  getInputData(name: string) {
    var input = this.inputs[name]
    if (!input) {
      return null
    }
    return input.value
  }

  /**
   * Changes the name of a global graph input
   * @method renameInput
   * @param {String} old_name
   * @param {String} new_name
   */
  renameInput(old_name: string, name: string) {
    if (name == old_name) {
      return
    }

    if (!this.inputs[old_name]) {
      return false
    }

    if (this.inputs[name]) {
      console.error('there is already one input with that name')
      return false
    }

    this.inputs[name] = this.inputs[old_name]
    delete this.inputs[old_name]
    this._version++

    if (this.onInputRenamed) {
      this.onInputRenamed(old_name, name)
    }

    if (this.onInputsOutputsChange) {
      this.onInputsOutputsChange()
    }
  }

  /**
   * Changes the type of a global graph input
   * @method changeInputType
   * @param {String} name
   * @param {String} type
   */
  changeInputType(name: string, type: string) {
    if (!this.inputs[name]) {
      return false
    }

    if (this.inputs[name].type && String(this.inputs[name].type).toLowerCase() == String(type).toLowerCase()) {
      return
    }

    this.inputs[name].type = type
    this._version++
    if (this.onInputTypeChanged) {
      this.onInputTypeChanged(name, type)
    }
  }

  /**
   * Removes a global graph input
   * @method removeInput
   * @param {String} name
   * @param {String} type
   */
  removeInput(name: string) {
    if (!this.inputs[name]) {
      return false
    }

    delete this.inputs[name]
    this._version++

    if (this.onInputRemoved) {
      this.onInputRemoved(name)
    }

    if (this.onInputsOutputsChange) {
      this.onInputsOutputsChange()
    }
    return true
  }

  /**
   * Creates a global graph output
   * @method addOutput
   * @param {String} name
   * @param {String} type
   * @param {*} value
   */
  addOutput(name: string, type: string, value: any) {
    this.outputs[name] = { name: name, type: type, value: value }
    this._version++

    if (this.onOutputAdded) {
      this.onOutputAdded(name, type)
    }
    if (this.onInputsOutputsChange) {
      this.onInputsOutputsChange()
    }
  }

  /**
   * Assign a data to the global output
   * @method setOutputData
   * @param {String} name
   * @param {String} value
   */
  setOutputData(name: string, value: string) {
    var output = this.outputs[name]
    if (!output) {
      return
    }
    output.value = value
  }

  /**
   * Returns the current value of a global graph output
   * @method getOutputData
   * @param {String} name
   * @return {*} the data
   */
  getOutputData(name: string) {
    var output = this.outputs[name]
    if (!output) {
      return null
    }
    return output.value
  }

  /**
   * Renames a global graph output
   * @method renameOutput
   * @param {String} old_name
   * @param {String} new_name
   */
  renameOutput(old_name: string, name: string) {
    if (!this.outputs[old_name]) {
      return false
    }

    if (this.outputs[name]) {
      console.error('there is already one output with that name')
      return false
    }

    this.outputs[name] = this.outputs[old_name]
    delete this.outputs[old_name]
    this._version++

    if (this.onOutputRenamed) {
      this.onOutputRenamed(old_name, name)
    }

    if (this.onInputsOutputsChange) {
      this.onInputsOutputsChange()
    }
  }

  /**
   * Changes the type of a global graph output
   * @method changeOutputType
   * @param {String} name
   * @param {String} type
   */
  changeOutputType(name: string, type: string) {
    if (!this.outputs[name]) {
      return false
    }

    if (this.outputs[name].type && String(this.outputs[name].type).toLowerCase() == String(type).toLowerCase()) {
      return
    }

    this.outputs[name].type = type
    this._version++
    if (this.onOutputTypeChanged) {
      this.onOutputTypeChanged(name, type)
    }
  }

  /**
   * Removes a global graph output
   * @method removeOutput
   * @param {String} name
   */
  removeOutput(name: string) {
    if (!this.outputs[name]) {
      return false
    }
    delete this.outputs[name]
    this._version++

    if (this.onOutputRemoved) {
      this.onOutputRemoved(name)
    }

    if (this.onInputsOutputsChange) {
      this.onInputsOutputsChange()
    }
    return true
  }

  triggerInput(name: string, value: any) {
    var nodes = this.findNodesByTitle(name)
    for (var i = 0; i < nodes.length; ++i) {
      nodes[i].onTrigger(value)
    }
  }

  setCallback(name: string, func: any) {
    var nodes = this.findNodesByTitle(name)
    for (var i = 0; i < nodes.length; ++i) {
      nodes[i].setTrigger(func)
    }
  }

  //used for undo, called before any change is made to the graph
  beforeChange(info?: any) {
    if (this.onBeforeChange) {
      this.onBeforeChange(this, info)
    }
    this.sendActionToCanvas('onBeforeChange', this)
  }

  nodeUpdate(node: any, info?: any) {
    if (this.onNodeUpdated) {
      this.onNodeUpdated(node, info)
    }
    this.sendActionToCanvas('nodeUpdate', this)
  }

  //used to resend actions, called after any change is made to the graph
  afterChange(info?: any) {
    if (this.onAfterChange) {
      this.onAfterChange(this, info)
    }
    this.sendActionToCanvas('onAfterChange', this)
  }

  connectionChange(node: any, link_info: any) {
    this.updateExecutionOrder()
    if (this.onConnectionChange) {
      this.onConnectionChange(node)
    }
    this._version++
    this.sendActionToCanvas('onConnectionChange')
  }

  /**
   * returns if the graph is in live mode
   * @method isLive
   */

  isLive() {
    if (!this.list_of_graphcanvas) {
      return false
    }

    for (var i = 0; i < this.list_of_graphcanvas.length; ++i) {
      var c = this.list_of_graphcanvas[i]
      if (c.live_mode) {
        return true
      }
    }
    return false
  }

  /**
   * clears the triggered slot animation in all links (stop visual animation)
   * @method clearTriggeredSlots
   */
  clearTriggeredSlots() {
    for (var i in this.links) {
      var link_info = this.links[i]
      if (!link_info) {
        continue
      }
      if (link_info._last_time) {
        link_info._last_time = 0
      }
    }
  }

  /* Called when something visually changed (not the graph!) */
  change() {
    if (LiteGraph.debug) {
      console.log('Graph changed')
    }
    this.sendActionToCanvas('setDirty', [true, true])
    if (this.on_change) {
      this.on_change(this)
    }
  }

  setDirtyCanvas(fg: any, bg?: any) {
    this.sendActionToCanvas('setDirty', [fg, bg])
  }

  /**
   * Destroys a link
   * @method removeLink
   * @param {Number} link_id
   */
  removeLink(link_id: number) {
    var link = this.links[link_id]
    if (!link) {
      return
    }
    var node = this.getNodeById(link.target_id)
    if (node) {
      node.disconnectInput(link.target_slot)
    }
  }

  //save and recover app state ***************************************
  /**
   * Creates a Object containing all the info about this graph, it can be serialized
   * @method serialize
   * @return {Object} value of the node
   */
  serialize() {
    var nodes_info = []
    for (var i = 0, l = this._nodes.length; i < l; ++i) {
      nodes_info.push(this._nodes[i].serialize())
    }

    //pack link info into a non-verbose format
    var links = []
    for (let i in this.links) {
      //links is an OBJECT
      var link = this.links[i]
      if (!link.serialize) {
        //weird bug I havent solved yet
        console.warn('weird LLink bug, link info is not a LLink but a regular object')
        var link2 = new LLink()
        for (let j in link) {
          // @ts-ignore
          link2[j] = link[j]
        }
        this.links[i] = link2
        link = link2
      }

      links.push(link.serialize())
    }

    var groups_info = []
    for (var i = 0; i < this._groups.length; ++i) {
      groups_info.push(this._groups[i].serialize())
    }

    var data = {
      uid: this.uid,
      name: this.name,
      meta: this.meta,
      type: this.type,
      mapping: this.mapping,
      defaults: this.defaults,
      version: LiteGraph.VERSION,
      last_node_id: this.last_node_id,
      last_link_id: this.last_link_id,
      nodes: nodes_info,
      links: links,
      groups: groups_info,
      config: this.config,
      extra: this.extra,
    }

    if (this.onSerialize) this.onSerialize(data)

    return data
  }

  /**
   * Configure a graph from a JSON string
   * @method configure
   * @param {String} str configure a graph from a JSON string
   * @param {Boolean} returns if there was any error parsing
   */
  configure(data: any, keep_old?: boolean) {
    if (!data) {
      return
    }

    if (!keep_old) {
      this.clear()
    }

    var nodes = data.nodes

    //decode links info (they are very verbose)
    if (data.links && data.links.constructor === Array) {
      const links: any[] = []
      for (var i = 0; i < data.links.length; ++i) {
        var link_data = data.links[i]
        if (!link_data) {
          //weird bug
          console.warn('serialized graph link data contains errors, skipping.', link_data)
          continue
        }
        var link = new LLink()
        link.configure(link_data)

        // @ts-ignore
        links[link.id] = link
      }
      data.links = links
    }

    //copy all stored fields
    for (let i in data) {
      if (i === 'nodes' || i === 'groups') {
        //links must be accepted
        continue
      }
      // @ts-ignore
      this[i] = data[i]
    }

    var error = false

    //create nodes
    this._nodes = []
    if (nodes) {
      for (var i = 0, l = nodes.length; i < l; ++i) {
        var n_info = nodes[i] //stored info

        var node = LiteGraph.createNode(n_info.type, n_info.title)

        if (!node) {
          if (LiteGraph.debug) {
            console.log('Node not found or has errors: ' + n_info.type)
          }

          //in case of error we create a replacement node to avoid losing info
          // @ts-ignore
          node = new LNode()
          node.last_serialization = n_info
          node.has_errors = true
          error = true
          //continue;
        }

        node.id = n_info.id //id it or it will create a new id
        this.add(node, true) //add before configure, otherwise configure cannot create links
      }

      //configure nodes afterwards so they can reach each other
      for (var i = 0, l = nodes.length; i < l; ++i) {
        var n_info = nodes[i]
        var node = this.getNodeById(n_info.id)
        if (node) {
          node.configure(n_info)
        }
      }
    }

    //groups
    this._groups.length = 0
    if (data.groups) {
      for (var i = 0; i < data.groups.length; ++i) {
        var group = new LiteGraph.LGroup()
        group.configure(data.groups[i])
        this.add(group)
      }
    }

    this.updateExecutionOrder()

    this.uid = data.uid || null
    this.name = data.name || null
    this.meta = data.meta || {}
    this.type = data.type || null
    this.mapping = data.mapping || {}
    this.defaults = data.defaults || {}
    this.extra = data.extra || {}

    if (this.onConfigure) this.onConfigure(data)

    this._version++
    this.setDirtyCanvas(true, true)
    return error
  }

  load(url: string, callback: any) {
    var that = this

    //from file
    if (url.constructor === File || url.constructor === Blob) {
      var reader = new FileReader()
      reader.addEventListener('load', function (event) {
        // @ts-ignore
        var data = JSON.parse(event.target.result)
        that.configure(data)
        if (callback) callback()
      })

      reader.readAsText(url)
      return
    }

    //is a string, then an URL
    var req = new XMLHttpRequest()
    req.open('GET', url, true)
    req.send(null)
    req.onload = function (oEvent) {
      if (req.status !== 200) {
        console.error('Error loading graph:', req.status, req.response)
        return
      }
      var data = JSON.parse(req.response)
      that.configure(data)
      if (callback) callback()
    }
    req.onerror = function (err) {
      console.error('Error loading graph:', err)
    }
  }

  onNodeTrace(node: any, msg: any, color: any) {
    //TODO
  }

}

LiteGraph.LGraph = LGraph

export {
  LiteGraph,
  LGraph,
  LCanvas,
  LLink,
  LNode,
  LGroup,
  ContextMenu
}
