import { ComfyWidgets } from './widgets.js'
import { ClipSpace } from './clipspace.js'
import { SDFXCanvas } from './canvas.js'
import { SDFXNode } from './node.js'
import { eventHub } from '@/utils/eventHub'
import { api } from '@/apis'
import { widgetDefaults } from '@/stores/maps/widgetDefaults'
import { saveImageFile, getTempFileName } from '@/utils'
import { extractImageSDMetadata, importA1111, getLatentMetadata, blobToFile } from '@/utils/image'
import { formatPromptError } from '@/utils/errors'
import { isRegisteredNode, isImageNode, isSDFXGraph, sanitizeNodeName } from '@/utils/graph'
import { allowedExtensions } from '@/stores/maps/allowedExtensions'
import { LiteGraph, LGraph, LCanvas } from '@/components/LiteGraph/'
import { loadTheme } from '@/components/LiteGraph/LiteTheme'
import { useMainStore, useModelStore, useGraphStore, storeToRefs } from '@/stores'
import { v4 as uuidv4 } from 'uuid'
// import { StateManager } from './stateManager.js'

const debug = false
const log = debug ? console.log : (...args)=>{}

const isEmptyObject = (obj) => (Object.keys(obj).length === 0 || !obj)

const ANIM_PREVIEW_WIDGET = 'sdfx_animation_preview'

export class SDFXApp extends EventTarget {
  constructor() {
    super()
    this.apiListenersInitied = false
    this.#reset()
  }

  #reset() {
    this.ready = false
    this.canvas = null
    this.graph = null
    this.groupNodes = null
    this.shiftDown = false
    this.listenersInitied = false
    this.nodesRegistered = false
    this.debounceTimers = {}
    this.missingNodeTypes = []

    /**
     * List of extensions that are registered with the app
     * @type {SDFXExtension[]}
     */
    this.extensions = []
    this.extensionsLoaded = false
  }

  detroy() {
    this.#reset()
  }

  #initStores() {
    // log('sdfx: init stores')
    this.mainStore = useMainStore()
    this.graphStore = useGraphStore()
    this.modelStore = useModelStore()
    const { status } = storeToRefs(this.mainStore)
    const { availableExtensions, nodegraph, preview } = storeToRefs(this.graphStore)
    this.status = status.value
    this.preview = preview.value
    this.nodegraph = nodegraph.value
    this.availableExtensions = availableExtensions.value
    this.extensions = []
  }

  /*
  undo() {
    StateManager.undo()
  }

  redo() {
    StateManager.redo()
  }
  */

  async #initGraph () {
    log('sdfx: LiteGraph initialization')
    this.#addConfigureHandler()
    this.graph = new LGraph()
    this.#addAfterConfigureHandler()

    /* init undo/redo manager with this sdfx instance */
    //StateManager.init(this)
    
    this.graph.onNodeAdded = (node) => {
      // log('sdfx: added node', node)
      // StateManager.update()
    }

    this.graph.onNodeUpdated = (node) => {
      log('sdfx: updated node', node, node.mode)
      this.triggerNodeActionEvent(node, 'bypass', node.mode === 4 ? false : true)
      this.triggerNodeActionEvent(node, 'docked', node.docked ? true : false)
      // StateManager.update()
    }

    this.graph.onNodeRemoved = (node) => {
      this.graphStore.unselectSDFXNode()
      log('sdfx: removed node', node)
    }

    this.graph.onInputsOutputsChange = () => {
      log('sdfx: onInputsOutputsChange')
    }

    this.graph.onBeforeChange = (e) => {
      log('sdfx: onBeforeChange', e)
      this.updateSDFXNodeList()
    }

    this.graph.onAfterChange = (e) => {
      this.saveGraphData()
      log('sdfx: afterChange', e)
    }
  }

  #initCanvas(canvasEl, options={}) {
    log('sdfx: canvas initialization')

    canvasEl.style.touchAction = 'none'
    this.canvasEl = canvasEl
    this.canvasEl.tabIndex = '1'
    this.ctx = this.canvasEl.getContext('2d')

    this.canvas = new LCanvas(this.canvasEl, this.graph)
    this.canvas.canvasEl = this.canvasEl
    this.canvas.options = options

    this.#addCanvasEventHandlers()

    this.dispatchEvent(
      new CustomEvent('canvasReady', {
        detail: {
          graph: this.graph,
          canvas: this.canvas
        }
      })
    )
  }

  #addCanvasEventHandlers() {
    if (!this.canvas) {
      console.error('sdfx: undefined SDFX canvas')
      return
    }

    this.canvas.onPositionChanged = ({x, y}) => {
      this.graphStore.setCanvasPosition({x, y})
    }

    this.canvas.onZoomChanged = (z) => {
      this.graphStore.setCanvasZoom(z)
    }

    this.canvas.onNodeWidgetChanged = (node, widget, value) => {
      this.triggerWidgetUpdateEvent(node, widget, value)
    }

    /**
     * double clicked on a node, returns if
     * it was on a widget
     */
    this.canvas.onNodeDblClicked = (node, clickedWidget) => {
      if (clickedWidget) return true
      let preventDefault = true

      /**
       * multiple actions:
       * fist time double click do this,
       * second time do this ...
       */
      node.__dblc__ = node.__dblc__ ?? 0
      node.__dblc__++
      const action = node.__dblc__ % 3

      switch (action) {
        case 1:
          this.animateToNode(node, 0)
          break
        case 2:
          this.animateToNode(node, 0.75)
          break
        case 0:
          node.__dblc__ = 0
          if (SDFXNode.getSelectedNodeImage(node)) {
            this.openImageEditor(node)
          }
          break
      }

      return preventDefault
    }

    this.canvas.onNodeSelected = (node) => {
      this.graphStore.selectSDFXNodeById(node.id)
    }

    this.canvas.onNodeDeselected = (node) => {
      this.graphStore.unselectSDFXNode()
    }

    this.canvas.onProcessKey = (e) => {
      SDFXCanvas.processKey.bind(this.canvas)(e)
    }

    this.canvas.onBeforeDrawNode = (node, ctx) => {
      SDFXCanvas.beforeDrawNode.bind(this.canvas)(node, ctx)
    }

    this.canvas.onAfterDrawNode = (node, ctx) => {
      SDFXCanvas.afterDrawNode.bind(this.canvas)(node, ctx)
    }

    this.canvas.onDrawNodeShape = (node, ctx, size, fgcolor, bgcolor, selected, mouse_over) => {
      SDFXCanvas.drawNodeShapeStatus.bind(this.canvas)(
        node,
        ctx,
        size,
        fgcolor,
        bgcolor,
        selected,
        mouse_over,
        this.nodegraph.status,
        this.progress,
        this.dragOverNode
      )
    }

    this.canvas.onBeforeDrawGroups = (ctx) => {
      // add a header bar on top of groups
      SDFXCanvas.drawGroupHeaders.bind(this.canvas)(ctx)
    }
  }

  /*
   * Emits a 'widget-update' event when a widget 
   * has been updated on a LiteGraph node
   */
  triggerWidgetUpdateEvent(node, widgetName, value, optionArray) {
    const uid = this.nodegraph.currentAppId

    if (!this.preventWidgetUpdate && uid) {
      log('sdfx: onNodeWidgetChanged', uid, node.id, widgetName, value)
      eventHub.emit(`widget-updated-${uid}-${node.id}-${widgetName}`, {
        uid: uid,
        nodeId: node.id,
        widgetName: widgetName,
        value: value,
        optionArray: optionArray
      })
    }

    this.graphStore.clearLastNodeError(node.id)
    this.saveGraphData()
  }

  /*
   * Emits a 'node-action' event when a node 
   * has been updated on a LiteGraph node
   */
  triggerNodeActionEvent(node, actionName, value) {
    const uid = this.nodegraph.currentAppId

    if (uid) {
      log('sdfx: triggerNodeActionEvent', uid, node.id, actionName, value)
      eventHub.emit(`node-action-${uid}-${node.id}-${actionName}`, {
        uid: uid,
        nodeId: node.id,
        actionName: actionName,
        value: value
      })
    }

    this.graphStore.clearLastNodeError(node.id)
    this.saveGraphData()
  }


  /*
   * call only if we don't need canvas UI
   * i.e: to generate prompt
   */
  async init() {
    log('sdfx: init()')
    this.#initStores()

    if (!this.extensionsLoaded) {
      await this.#loadExtensions()
    }

    await this.#setupNodesRegistration(true)

    this.#initGraph()
    this.#addApiUpdateHandlers()

    if (document) {
      this.__hackClearInputElement()
    }
  }

  /*
   * call only when we need canvas UI
   */
  async setup(canvasEl, options={}) {
    log('sdfx: setup()')

    if (!this.graph) {
      await this.init()
      /* still useful?
      this.graph.start()
      */
    }

    if (document) {
      this.__hackClearInputElement()
    }
    
    if (canvasEl) {
      this.#initCanvas(canvasEl, options)
      this.#initListeners()

      await this.#invokeExtensionsAsync('init')
      await this.#setupNodesRegistration()

      /**
       * Canvas Theme can be set only after node registration
       * as it uses canvas and nodeDefs
       **/
      this.setCanvasTheme('dark')
    }
  }

  async #getNodeDefs(force=false) {
    let nodeDefs = this.graphStore.getNodeDefs()
    if (!isEmptyObject(nodeDefs) && !force) return nodeDefs

    try {
      log('sdfx: fetching node definitions')
      nodeDefs = await api.getNodeDefs()
      this.graphStore.setNodeDefs(nodeDefs)
      return nodeDefs
    } catch (e) {
      console.error('sdfx: unable to fetch node definitions')
      return false
    }
  }

  async #setupNodesRegistration (force=false) {
    if (!this.extensionsLoaded) {
      console.error('sdfx: unable to setup node registration before loading extentions.')
      return
    }

    if (!this.nodesRegistered) {
      const nodeDefs = await this.#getNodeDefs(force)
      if (!isEmptyObject(nodeDefs)) {
        await this.#registerNodesFromDefs(nodeDefs)
        await this.#invokeExtensionsAsync('setup')
      }
    } else {
      this.ready = true
      this.dispatchEvent(
        new CustomEvent('ready', {
          detail: {
            graph: this.graph,
            canvas: this.canvas
          }
        })
      )      
    }

    this.nodesRegistered = true
  }

  async #initListeners () {
    log('sdfx: listeners initialization')

    this.keyDownHandler = this.keyDownHandler.bind(this)
    this.keyUpHandler = this.keyUpHandler.bind(this)
    this.dropHandler = this.dropHandler.bind(this)
    this.copyHandler = this.copyHandler.bind(this)
    this.pasteHandler = this.pasteHandler.bind(this)
    this.canvasDragLeaveHandler = this.canvasDragLeaveHandler.bind(this)
    this.canvasDragOverHandler = this.canvasDragOverHandler.bind(this)

    if (this.canvasEl) {
      this.canvasEl.addEventListener('dragleave', this.canvasDragLeaveHandler)
      this.canvasEl.addEventListener('dragover', this.canvasDragOverHandler, false)

      this.resizeObserver = new ResizeObserver(() => {
        this.resizeCanvas()
      })

      this.resizeObserver.observe(this.canvasEl.parentNode)
      this.resizeCanvas()
    } else {
      log('sdfx: missing canvas element for listeners init')
    }

    /**
     * only these listeners should be instancied once
     */
    if (!this.listenersInitied) {
      window.addEventListener('keydown', this.keyDownHandler)
      window.addEventListener('keyup', this.keyUpHandler)
      document.addEventListener('drop', this.dropHandler)
      document.addEventListener('copy', this.copyHandler)
      document.addEventListener('paste', this.pasteHandler)
    } else {
      log('sdfx: keydown, keyup, drop, copy and paste listeners already instancied')
    }

    this.listenersInitied = true
  }

  removeListeners () {
    log('sdfx: removed listeners')
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    window.removeEventListener('keydown', this.keyDownHandler)
    window.removeEventListener('keyup', this.keyUpHandler)
    document.removeEventListener('drop', this.dropHandler)
    document.removeEventListener('copy', this.copyHandler)
    document.removeEventListener('paste', this.pasteHandler)

    if (this.canvasEl) {
      this.canvasEl.removeEventListener('dragleave', this.canvasDragLeaveHandler)
      this.canvasEl.removeEventListener('dragover', this.canvasDragOverHandler, false)
    }

    this.listenersInitied = false
  }

  keyDownHandler(e) {
    this.shiftDown = e.shiftKey
  }

  keyUpHandler(e) {
    this.shiftDown = e.shiftKey
  }

  resizeCanvas () {
    const scale = Math.max(window.devicePixelRatio, 1)
    const { left, top, width, height } = this.canvasEl.parentNode.getBoundingClientRect()

    this.canvasEl.width = Math.round(width * scale)
    this.canvasEl.height = Math.round(height * scale)
    this.canvasEl.style.width = width + 'px'
    this.canvasEl.style.height = height + 'px'
    this.ctx.scale(scale, scale)
    // this.canvas.viewport = [1, 1, width, height]
    this.canvas.draw(true, true)
  }

  /* ------------------ */

  async validateGraph (graphData) {
    if (!graphData) return false

    let valid = true

    this.missingNodeTypes = []
    await this.#invokeExtensionsAsync('beforeConfigureGraph', graphData, this.missingNodeTypes)

    log('sdfx: checking graph validity ...')

    for (let node of graphData.nodes) {
      /*
       * Patch T2IAdapterLoader to ControlNetLoader 
       * since they are the same node now
       */
      if (node.type === 'T2IAdapterLoader') {
        node.type = 'ControlNetLoader'
      }

      if (node.type === 'ConditioningAverage ') {
        node.type = 'ConditioningAverage'
      }

      if (node.type === 'SDV_img2vid_Conditioning') {
        node.type = 'SVD_img2vid_Conditioning'
      }

      // Find missing node types
      if (!isRegisteredNode(node)) {
        valid = false
        this.missingNodeTypes.push(node.type)
        node.type = sanitizeNodeName(node.type)
      }
    }

    return valid
  }

  getWorkflowNodeById (nodeId) {
    return this.nodegraph.currentWorkflow ? this.nodegraph.currentWorkflow.nodes.find(n => n.id===nodeId) : null
  }

  getLiteGraphNodeById(nodeId) {
    return this.graph ? this.graph.getNodeById(nodeId) : null
  }

  getNodeWidgetsById(nodeId) {
    const node = this.graph ? this.graph.getNodeById(nodeId) : null
    return node ? node.widgets : null
  }

  getNodeWidgetValueById(nodeId, widgetIdx, defaultValue) {
    let value = defaultValue

    const widgets = this.getNodeWidgetsById(nodeId)
    if (widgets && widgets[widgetIdx]) {
      const widget = widgets[widgetIdx]
      value = widget.value
      // log(`sdfx: found litegraph value for node #${nodeId} [${widget.name}] ===`, value)
      return typeof value !== 'undefined' ? value : defaultValue
    }

    // log(`not found value for node ${nodeId} widget ${widgetIdx}, fallback to any default value`, defaultValue)

    return typeof defaultValue !== 'undefined' ? defaultValue : null
  }

  getNodeWidgetSelectorOptionsById(nodeId, widgetIdx) {
    const widgets = this.getNodeWidgetsById(nodeId)
    return widgets && widgets[widgetIdx] ? widgets[widgetIdx].options : null
  }

  /**
   * execute an action on LiteGraph node (bypass, mute ...)
   */
  executeNodeActionById(nodeId, actionName, values) {
    if (this.graph) {
      const node = this.graph.getNodeById(nodeId)
      const val = values[0]

      if (node) {
        if (actionName === 'bypass') node.mode = val ? 0 : 4
        if (actionName === 'docked') node.docked = val ? true : false
        this.graph.setDirtyCanvas(true)
      }
    }

    this.saveGraphData()
  }

  /**
   * get action value on LiteGraph node (bypass, mute ...)
   */
  getNodeActionValueById(nodeId, actionName) {
    if (this.graph) {
      const node = this.graph.getNodeById(nodeId)

      if (node) {
        if (actionName === 'bypass') return node.mode === 4 ? false : true
        if (actionName === 'docked') return node.docked ? true : false
      }
    }

    return false
  }

  /**
   * Update a widget on a LiteGraph node
   */
  updateNodeWidgetsById(nodeId, widgetIdxs, values) {
    if (this.graph) {
      const node = this.graph.getNodeById(nodeId)

      if (node) {
        this.updateNodeWidgets(node, nodeId, widgetIdxs, values)
      }
    }

    this.updateLocalWorkflowWidgets(nodeId, widgetIdxs, values)
  }

  /**
   * Call a widget callback on a LiteGraph node
   */
  callNodeWidgetsById(nodeId, widgetIdxs, values) {
    if (this.graph) {
      const node = this.graph.getNodeById(nodeId)

      if (node && node.widgets) {
        for (let i=0; i<widgetIdxs.length; i++) {
          const widgetIdx = widgetIdxs[i]
          const value = values[i]
          const widget = node.widgets[widgetIdx]

          if (widget && widget.callback) {
            widget.callback()
            log('call', widget, value)
          }
        }
      }
    }
  }

  updateNodeWidgets(node, nodeId, widgetIdxs, values) {
    if (!this.graph) return

    if (node && nodeId && node.widgets) {
      this.preventWidgetUpdate = true

      log(`sdfx: update node#${nodeId} widgets [${widgetIdxs}] with values [${values}]`)

      for (let i=0; i<widgetIdxs.length; i++) {
        const widgetIdx = widgetIdxs[i]
        const value = values[i]
        const widget = node.widgets[widgetIdx]

        if (widget) {
          widget.value = value
        }

        if (node.widgets_values && node.widgets_values[widgetIdx]) {
          node.widgets_values[widgetIdx] = value
        }

        if (widget.type==='combo' && widget.name==='image') {
          this.updateNodeImage(node, value, 'input')
        }
      }

      this.preventWidgetUpdate = false
    }

    this.graph.setDirtyCanvas(true)
  }

  updateLocalWorkflowWidgets(nodeId, widgetIdxs, values) {
    if (this.debounceTimers[nodeId]) {
      clearTimeout(this.debounceTimers[nodeId])
    }

    /**
     * debounce as useStorage writes are extremelly slow
     * (see graphStore.ts)
     */
    this.debounceTimers[nodeId] = setTimeout(() => {
      const workflowNode = this.getWorkflowNodeById(nodeId)

      if (!workflowNode) {
        console.error(`sdfx: unable to get node ${nodeId}`)
        return
      }

      if (workflowNode.widgets_values) {
        for (let i=0; i<widgetIdxs.length; i++) {
          const widgetIdx = widgetIdxs[i]
          const value = values[i]
          workflowNode.widgets_values[widgetIdx] = value
        }
      }

      log('sdfx: ... local workflow widgets updated ...')
    }, 250)
  }

  #processGraphNodes (uid, resetInvalidComboValue=false) {
    log('sdfx: -------> processing graph nodes')

    for (const node of this.graph._nodes) {
      const size = node.computeSize()
      size[0] = Math.max(node.size[0], size[0])
      size[1] = Math.max(node.size[1], size[1])
      node.size = size
      node.title = node.title || node.type

      if (node.widgets) {
        // If you break something in the backend and want to patch workflows in the frontend
        // This is the place to do this
        for (let widget of node.widgets) {
          if (node.type === 'KSampler' || node.type === 'KSamplerAdvanced') {
            if (widget.name === 'sampler_name') {
              if (widget.value && widget.value.startsWith('sample_')) {
                widget.value = widget.value.slice(7)
              }
            }
          }

          if (node.type === 'KSampler' || node.type === 'KSamplerAdvanced' || node.type === 'PrimitiveNode') {
            if (widget.name === 'control_after_generate') {
              if (widget.value === true) {
                widget.value = 'randomize'
              } else if (widget.value === false) {
                widget.value = 'fixed'
              }
            }
          }

          /* reset invalid values in combo selector */
          if (resetInvalidComboValue && widget.type === 'combo' && widget.name!=='image') {
            if (!widget.options.values.includes(widget.value) && widget.options.values.length > 0) {
              widget.value = widget.options.values[0]
            }
          }

          if (uid) {
            // node.mode === 4 && log(`sdfx: emit action bypass for node`, node.id)
            eventHub.emit(`node-action-${uid}-${node.id}-bypass`, {
              uid: uid,
              nodeId: node.id,
              actionName: 'bypass',
              value: node.mode === 4 ? false : true
            })

            // node.docked && log(`sdfx: emit action docked for node`, node.id)
            eventHub.emit(`node-action-${uid}-${node.id}-docked`, {
              uid: uid,
              nodeId: node.id,
              actionName: 'docked',
              value: node.docked ? true : false
            })

            //log(`sdfx: emit widget ${widget.name} ready for node`, node.id, widget.value)
            eventHub.emit(`widget-ready-${uid}-${node.id}-${widget.name}`, {
              uid: uid,
              nodeId: node.id,
              widgetName: widget.name,
              value: widget.value,
              optionArray: widget.options ? widget.options.values : []
            })
          }
        }
      }

      this.#invokeExtensions('loadedGraphNode', node)

      this.dispatchEvent(
        new CustomEvent('loadedGraphNode', { detail: node })
      )
    }

    if (this.missingNodeTypes.length>0) {
      this.showMissingNodesError(this.missingNodeTypes)
    }
  }

  /**
   * tool = move | select
   **/
  setTool(tool) {
    if (this.canvas) {
      this.canvas.setTool(tool)
    }
  }

  getTool() {
    return this.canvas ? this.canvas.tool : 'move'
  }

  /**
   * Get widget defaults for a given node type and widget name
   * first we check if there is a specific definition for that widget path in widgetTemplates
   * then if we find a 'defaults' dict in the app's workflow data
   * @param {string} nodeType
   * @param {string} widgetName
   * @returns 
   */
  getWidgetDefaults(nodeId, nodeType, widgetName) {
    if (!this.graphStore) this.#initStores()

    /*
     * check if we can return the cached widget defaults from node.widgets
     * TODO: maybe slow due to the loop, maybe refactor this with a hash table
     */
    if (this.graph) {
      const node = this.graph.getNodeById(nodeId)
      if (node && node.widgets) {
        const widget = node.widgets.find(w => w.name === widgetName)
        if (widget && widget.defaults) {
          return widget.defaults
        }
      }
    }

    const widgetPath = `${nodeType}/${widgetName}`

    const appDefaults = this.graphStore.getCurrentAppDefaults()

    const factoryGenericDefs = widgetDefaults[widgetName] || null // i.e: 'b1'
    const factoryExtractPathDefs = widgetDefaults[widgetPath] || null // i.e: 'FreeU_V2

    const graphGenericDefs = appDefaults ? appDefaults[widgetName] : null
    const graphExactPathDefs = appDefaults ? appDefaults[widgetPath] : null

    if (!factoryGenericDefs && !factoryExtractPathDefs && !graphGenericDefs && !graphExactPathDefs) {
      return null
    }

    const defaults = {
      ...factoryGenericDefs,
      ...factoryExtractPathDefs,
      ...graphGenericDefs,
      ...graphExactPathDefs
    }

    return defaults
  }

  /**
   * update widget defaults for a given node type and widget name
   * @param {string} nodeId
   * @param {string} widgetName
   * @param {object} defaults
   */
  updateWidgetDefaults(nodeId, widgetName, defaults) {
    if (!this.graph) this.#initStores()
    const node = this.graph.getNodeById(nodeId)

    if (node && node.widgets) {
      const widget = node.widgets.find(w => w.name === widgetName)

      if (widget) {
        widget.defaults = defaults
      }
    }
  }

  /**
   * assign defaults to a specific SDFXWidget
   * (the defaults present in any control component in workflow mapping)
   * (SDFXWidgets are components in the workflow mapping with type 'control')
   * @param {*} comp a SDFXWidget component
   */
  #processSDFXWidgetLocalDefaults(comp) {
    if (!comp.defaults) {
      console.error('sdfx: cannot process missing defaults in component', comp)
      return
    }

    Object.keys(comp.defaults).forEach((widgetName) => {
      let def = comp.defaults[widgetName]
      
      const defaults = {
        ...def,
        name: comp.label ? comp.label : def.name,
        type: comp.component
      }
      this.updateWidgetDefaults(comp.target.nodeId, widgetName, defaults)
    })
  }

  /**
   * parse all mapping leafs for custom defaults
   * @param {object} mapping
   */
  updateWidgetDefaultsFromMapping(mapping) {
    if (!mapping) return
    log('')
    log('----------------- updateWidgetDefaultsFromMapping -----------------')
    let tabs = 0
    // recursively parse the workflow mapping components to find any local defaults key
    const parseMappingArray = (mapArray) => {
      if (!mapArray || Array.isArray(mapArray)) return

      for (let comp of mapArray) {

        /* --- debug --- */
        if (comp.type === 'control') {
          if (comp.target.widgetNames) {
            const missingNodeId = this.graph._nodes.find(n => n.id===comp.target.nodeId) ? false : true
            log('  '.repeat(tabs)+`%c| [${comp.component}] ${comp.label} -> node #${comp.target.nodeId} -> (${comp.target.widgetNames})`, missingNodeId?'color:red':'color:green')
          }
        } else {
          log('  '.repeat(tabs)+`%c[${comp.component}] ${comp.label||''}`, 'font-weight:bold')
        }
        /* --- debug --- */

        if (comp.type === 'control') {
          if (comp.defaults) {
            this.#processSDFXWidgetLocalDefaults(comp)
          }
        }

        if (comp.childrin) {
          tabs++
          parseMappingArray(comp.childrin)
          tabs--
          log('  '.repeat(tabs)+`%c[/${comp.component}]`, 'font-weight:bold')
        }
      }
    }

    /* parse all mapping leafs for custom defaults */
    mapping.leftpane && (parseMappingArray(mapping.leftpane))
    mapping.mainpane && (parseMappingArray(mapping.mainpane))
    mapping.rightpane && (parseMappingArray(mapping.rightpane))
  }
  
  /**
   * update widgets with additional details and defaults,
   * also and update our reactive SDFX node data structure
   */
  updateSDFXNodeList() {
    const sdfxNodes = []
    this.graph._nodes.forEach(n => {
      const node = n.serialize({ full_widgets: true })
      /**
       *  Add any found definition and defaults for each node widget
       */
      if (node && node.widgets) {
        for (let widget of node.widgets) {
          /* do not overrive any existing defaults for that widget */
          if (!widget.defaults) {
            const defaults = this.getWidgetDefaults(node.id, node.type, widget.name)

            if (defaults) {
              widget.defaults = defaults
              // console.log('/////////// updateSDFXNodeList', node.id, widget.name, defaults)
            }
          }

          /**
           * transform selector list to { name, value } for TWSelector
           **/
          /*
          if (widget.type==='combo') {
            const list =  widget.options.values
            widget.optionList = list.map((o) => ({ name:o, value:o }))
          }
          */
        }
      }

      /* imgs are not serialized, so we add it manually */
      node.imgs = n.imgs ? n.imgs.map(img => ({ src: img.src })) : null
      sdfxNodes.push(node)
    })

    // currentNodes is the reactive data structure
    // where we store our sdfx nodes
    // (see graphStore.ts for more details)
    this.nodegraph.currentNodes = sdfxNodes
  }

/**
 * Loads an application by its ID.
 * @param {string} uid - The ID of the application to load.
 * @param {boolean} [reset=false] - Indicates whether to reset the application or not. Default is false.
 */
  async loadAppId(uid, reset=false) {
    if (!this.graph) {
      console.error('sdfx: cannot load app before graph initialization')
      return
    }

    if (this.nodegraph.currentAppId === uid && reset===false) {
      await this.loadGraphData(this.nodegraph.currentWorkflow, false)
      return
    }

    const workflow = await this.graphStore.getAppDetails(uid)
    if (workflow) {
      this.cleanAllImages()
      this.graph.clear()
      this.graphStore.unselectSDFXNode()
      this.graphStore.clearCurrentWorkflow()
      this.__hackClearInputElement()
      await this.loadGraphData(workflow, true)
    }
  }

  /**
   * Loads a mapping and sets it as the current mapping in the graph store.
   * Dispatches a 'loadedMapping' event with the loaded mapping as the event detail.
   * @param {object} mapping - The mapping to be loaded.
   */
  loadMapping(mapping) {
    if (!mapping) {
      log('No mapping found')
      return
    }
    this.graphStore.setCurrentMapping(mapping)
    this.updateWidgetDefaultsFromMapping(mapping)

    this.dispatchEvent(
      new CustomEvent('loadedMapping', { detail: mapping })
    )
  }

  /**
   * Loads a workflow into the SDFX application.
   * 
   * @param {Object} graphData - The data representing the workflow to be loaded.
   */
  async loadWorkflow(graphData) {
    if (!this.graph) return

    if (!graphData) {
      console.error('sdfx: missing graphData')
      return
    }

    log('sdfx: loading workflow')
    const graphIsValid = await this.validateGraph(graphData)

    try {
      if (!graphData.uid) {
        graphData.uid = uuidv4()
        log('sdfx: generate uid for workflow', graphData.uid)
      }

      this.graph.configure(graphData)
      log('sdfx: -------> graph successfully configured')
    } catch (error) {
      console.error('sdfx: Loading aborted due to error reloading workflow data', error.fileName)
      console.error(error.stack)
      return
    }
  }


  /**
   * Loads the graph data and performs necessary operations.
   * @param {Object} graphData - The graph data to be loaded.
   * @param {boolean} [reset=false] - Indicates whether to reset the graph state.
   */
  async loadGraphData(graphData, reset=false) {
    if (!this.graph) return

    if (!graphData) {
      console.error('sdfx: missing graphData')
      return
    }

    log('sdfx: -------> loading GraphData', graphData)

    await this.loadWorkflow(graphData)

    if (reset) {
      this.resetGraphState()
      // StateManager.reset()
    }

    this.graphStore.setCurrentAppId(graphData.uid)
    this.#processGraphNodes(graphData.uid)
    this.updateSDFXNodeList()
    this.saveGraphData()

    /*
     * check if we can find our UI mapping in the workflow
     */
    if (isSDFXGraph(graphData) && Object.keys(graphData.mapping).length>0) {
      log('sdfx: found SDFX UI map', graphData.mapping)
      this.loadMapping(graphData.mapping)
    } else {
      this.graphStore.setCurrentMapping(null)
    }

    this.dispatchEvent(
      new CustomEvent('loadedGraph', { detail: this.graph })
    )

    if (reset) {
      this.zoomFit()
    } else {
      this.restoreGraphState()
    }

    await this.#invokeExtensionsAsync('afterConfigureGraph', this.missingNodeTypes)
  }

  getGraphData() {
    return this.graph.serialize()
  }

  saveGraphData() {
    if (!this.graph) {
      this.dispatchEvent('error', {
        detail: 'sdfx: cannot save graph data before graph initialization'
      })

      return;
    }

    if (this.debounceTimers['savegraph']) {
      clearTimeout(this.debounceTimers['savegraph'])
    }

    this.debounceTimers['savegraph'] = setTimeout(() => {
      const workflow = this.graph.serialize()
      this.nodegraph.currentWorkflow = workflow
      this.updateSDFXNodeList()
      log('sdfx: current workflow saved to localstorage')
    }, 150)
  }

  /**
   * Clipspace and editor
   */
  copyToClipSpace(node) {
    ClipSpace.copy(node)
  }

  cutToClipSpace(node) {
    ClipSpace.copy(node)
    this.graph.remove(node)
  }

  pasteFromClipSpace(node) {
    ClipSpace.paste(node)
    this.graph.setDirtyCanvas(true)
  }

  openImageEditor(node) {
    this.copyToClipSpace(node)

    this.dispatchEvent(
      new CustomEvent('openImageEditor', {
        detail: { node }
      })
    )
  }

  /**
   * Invoke an extension callback
   * @param {keyof SDFXExtension} method The extension callback to execute
   * @param  {any[]} args Any arguments to pass to the callback
   * @returns
   */
  #invokeExtensions(method, ...args) {
    let results = []
    for (const ext of this.extensions) {
      if (method in ext) {
        try {
          results.push(ext[method](...args, this))
        } catch (error) {
          console.error(`Error calling extension '${ext.name}' method '${method}'`, { error }, { extension: ext }, { args })
        }
      }
    }
    return results
  }

  /**
   * Invoke an async extension callback
   * Each callback will be invoked concurrently
   * @param {string} method The extension callback to execute
   * @param  {...any} args Any arguments to pass to the callback
   * @returns
   */
  async #invokeExtensionsAsync(method, ...args) {
    if (!this.extensionsLoaded) {
      console.error('sdfx: empty extention list.')
      return
    }

    return await Promise.all(
      this.extensions.map(async (ext) => {
        if (method in ext) {
          try {
            return await ext[method](...args, this)
          } catch (error) {
            console.error(`Error calling extension '${ext.name}' method '${method}'`, { error }, { extension: ext }, { args })
          }
        }
      })
    )
  }

  /**
   * Adds special context menu handling for nodes
   * e.g. this adds Open Image functionality for nodes that show images
   * @param {*} node The node to add the menu handler
   */
  #updateNodeContextMenuPrototype(node) {
    const self = this

    node.prototype.getExtraMenuOptions = function (_, options) {
      if (this.imgs) {
        const img = SDFXNode.getSelectedNodeImage(this)

        if (img) {
          options.unshift(
            {
              content: 'Open Image',
              callback: () => {
                let url = new URL(img.src)
                //url.searchParams.delete('preview')
                window.open(url, '_blank')
              },
            },
            {
              content: 'Save Image',
              callback: () => {
                let url = new URL(img.src)
                url.searchParams.delete('preview')
                const filename = new URLSearchParams(url.search).get('filename') || getTempFileName('png')
                saveImageFile(filename, url)
              },
            },
            null
          )
        }
      }

      options.push(
        null,
        {
          content: this.mode === 4 ? 'Unbypass' : 'Bypass',
          callback: (obj) => { 
            if (this.mode === 4) {
              this.mode = 0
            } else {
              this.mode = 4
            }
            self.triggerNodeActionEvent(this, 'bypass', this.mode === 0)
            this.graph.change()
          }
        },
        {
          content: this.docked ? 'Undock' : 'Dock',
          callback: (obj) => { 
            this.docked = !this.docked
            self.triggerNodeActionEvent(this, 'docked', this.docked)
            this.graph.change()
          }
        }
      )

      /*
      options.push({
        content: 'Cut To Clipspace',
        callback: () => self.cutToClipSpace(this)
      })
      */

      options.push(
        null,
        {
          content: 'Copy To Clipspace',
          callback: () => self.copyToClipSpace(this)
        },
        {
          content: 'Paste From Clipspace',
          disabled: ClipSpace.isEmpty(),
          callback: () => self.pasteFromClipSpace(this)
        },
        {
          content: 'Clear Clipspace',
          disabled: ClipSpace.isEmpty(),
          callback: () => ClipSpace.clear()
        },
        null
      )

      if (isImageNode(this)) {
        options.push({
          content: 'Open with Editor',
          callback: () => self.openImageEditor(this)
        })
      }
    }
  }

  #updateNodeKeyDownPrototype(node) {
    const self = this
    const origNodeOnKeyDown = node.prototype.onKeyDown

    node.prototype.onKeyDown = function (e) {
      if (origNodeOnKeyDown && origNodeOnKeyDown.apply(this, e) === false) {
        return false
      }

      if (this.flags.collapsed || !this.imgs || this.imageIndex === null) {
        return
      }

      let handled = false

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (e.key === 'ArrowLeft') {
          this.imageIndex -= 1
        } else if (e.key === 'ArrowRight') {
          this.imageIndex += 1
        }
        this.imageIndex %= this.imgs.length

        if (this.imageIndex < 0) {
          this.imageIndex = this.imgs.length + this.imageIndex
        }
        handled = true
      } else if (e.key === 'Escape') {
        this.imageIndex = null
        handled = true
      }

      if (handled === true) {
        e.preventDefault()
        e.stopImmediatePropagation()
        return false
      }
    }
  }

  /**
   * Adds Custom drawing logic for nodes
   * e.g. Draws images and handles thumbnail navigation on nodes that output images
   * @param {*} node The node to add the draw handler
   */
  #updateNodeDrawBackgroundPrototype(node) {
    const self = this

    node.prototype.setSizeForImage = function (force) {
      if (!force && this.animatedImages) return

      if (this.inputHeight || this.freeWidgetSpace>210) {
        this.setSize(this.size)
        return
      }
      const minHeight = SDFXNode.getImageTop(this) + 220
      if (this.size[1] < minHeight) {
        this.setSize([this.size[0], minHeight])
      }
    }

    node.prototype.onDrawBackground = function (ctx) {
      SDFXNode.drawBackground(this, ctx, self)
    }
  }

  /**
   * load a template
   */
  async loadTemplateId(uid) {
    const json = await this.graphStore.getTemplate(uid)
    return json.data /* return nodes */
  }

  /**
   * handle dropped object from UI
   * @param {*} droppedObject ({type, uid})
   */
  async droppedObjectHandler(event, droppedObject) {
    const uid = droppedObject.uid
    if (!uid) return

    switch (droppedObject.type) {
      case 'app':
        await this.loadAppId(uid)
        break

      case 'nodetemplate':
        const template = await this.loadTemplateId(uid)
        this.canvas.pasteNodes(template)
        break
    }
  }

  /**
   * Handler allowing drag+drop of files onto the window to load workflows
   */
  async dropHandler(event) {
    event.preventDefault()
    event.stopPropagation()

    const n = this.dragOverNode
    this.dragOverNode = null
    // Node handles file drop, we dont use the built in onDropFile handler as its buggy
    // If you drag multiple files it will call it multiple times with the same file
    if (n && n.onDragDrop && (await n.onDragDrop(event))) {
      return
    }
    // Dragging from Chrome->Firefox there is a file but its a bmp, so ignore that
    if (event.dataTransfer.files.length && event.dataTransfer.files[0].type !== 'image/bmp') {
      await this.handleFile(event.dataTransfer.files[0])
    } else if (event.dataTransfer) {
      // Try loading the first URI in the transfer list
      const validTypes = ['text/uri-list', 'text/x-moz-url']
      const match = [...event.dataTransfer.types].find((t) => validTypes.find((v) => t === v))

      if (match) {
        const uri = event.dataTransfer.getData(match)?.split('\n')?.[0]
        if (uri) {
          await this.handleFile(await (await fetch(uri)).blob())
        }
      }

      /* dropped a template or something from a UI list? */
      const txt = event.dataTransfer.getData('text')
      try {
        const droppedObject = JSON.parse(txt)
        if (droppedObject && droppedObject.type) {
          await this.droppedObjectHandler(event, droppedObject)
        }
      } catch (error) {
        /* dummy */
      }

    }
  }

  /**
   * Always clear over node on drag leave
   */
  canvasDragLeaveHandler(e) {
    if (this.dragOverNode) {
      this.dragOverNode = null
      this.graph.setDirtyCanvas(false, true)
    }
  }

  /**
   * Handler for dropping onto a specific node
   */
  canvasDragOverHandler(e) {
    this.canvas.adjustMouseEvent(e)

    const node = this.graph.getNodeOnPos(
      e.canvasX,
      e.canvasY
    )

    if (node && node.onDragOver && node.onDragOver(e)) {
      this.dragOverNode = node

      // dragover event is fired very frequently, run this on an animation frame
      requestAnimationFrame(() => {
        this.graph.setDirtyCanvas(false, true)
      })
      return
    }
    this.dragOverNode = null
  }

  /**
   * Adds a handler on copy that serializes selected nodes to JSON
   */
  copyHandler(e) {
    this.copiedNodes = false

    if (e.target.type === 'text' || e.target.type === 'textarea') {
      // Default system copy
      return
    }

    // copy nodes and clear clipboard
    if (this.canvas && this.canvas.selected_nodes) {
      this.copiedNodes = true
      this.canvas.copyToClipboard()
      e.clipboardData.setData('text', ' ')
      e.preventDefault()
      e.stopImmediatePropagation()
      return false
    }
  }

  /**
   * Adds a handler on paste that extracts and loads images or workflows from pasted JSON data
   */
  pasteHandler(e) {
    // ctrl+shift+v is used to paste nodes with connections
    // this is handled by litegraph
    if(this.shiftDown) return

    if (e.target.type === 'text' || e.target.type === 'textarea') {
      return
    }

    let selectedImageNode = null

    // If an image node is selected, paste into it
    if (
      this.canvas.current_node &&
      this.canvas.current_node.is_selected &&
      isImageNode(this.canvas.current_node)
    ) {
      selectedImageNode = this.canvas.current_node
    }

    if (!selectedImageNode && Object.keys(this.canvas.selected_nodes).length>0) {
      this.canvas.pasteFromClipboard()
      return
    }

    if (this.copiedNodes) {
      this.copiedNodes = false
      this.canvas.pasteFromClipboard()
      return
    }

    let clipData = (e.clipboardData || window.clipboardData)

    const enablePasteImage = true
    if (enablePasteImage) {
      const items = clipData.items
      // Look for image paste data
      for (const item of items) {
        if (item.type.startsWith('image/')) {

          // No image node selected: add a new one
          if (!selectedImageNode) {
            const newNode = LiteGraph.createNode('LoadImage')
            newNode.pos = [...this.canvas.graph_mouse]
            selectedImageNode = this.graph.add(newNode)
            this.graph.change()
          }

          const blob = item.getAsFile()
          selectedImageNode.pasteFile(blob)
          return
        }
      }
    }

    // No image found. Look for node data
    let data = clipData.getData('text/plain')
    let workflow
    try {
      data = data.slice(data.indexOf('{'))
      workflow = JSON.parse(data)
    } catch (err) {
      try {
        data = data.slice(data.indexOf('workflow\n'))
        data = data.slice(data.indexOf('{'))
        workflow = JSON.parse(data)
      } catch (error) {}
    }

    if (workflow && workflow.version && workflow.nodes && workflow.extra) {
      this.loadGraphData(workflow, true)
    } else {
      this.canvas.pasteFromClipboard()
    }
  }

  /**
   * Handles updates from the API socket
   */
  #addApiUpdateHandlers() {
    const self = this

    if (!this.nodegraph) {
      console.error('sdfx: Cannot execute API listeners before nodegraph initialization')
      return
    }

    if (this.apiListenersInitied) {
      console.warn('sdfx: API listeners already initied')
      return
    }

    api.addEventListener('status', ({ detail }) => {
      log('status', detail)
      const autoQueue = this.nodegraph.settings.autoQueueCheckbox

      if (detail) {
        const remaining = detail.exec_info.queue_remaining
        const lastError = this.nodegraph.status.lastExecutionError
        this.nodegraph.status.queueSize = remaining
  
        if (this.nodegraph.status.lastQueueSize !== 0 && remaining === 0 && autoQueue && !lastError) {
          // self.queuePrompt(0, this.nodegraph.settings.batchCount)
        }
        this.nodegraph.status.lastQueueSize = remaining
        this.graphStore.getQueue()

        if (remaining<=0) {
          this.graphStore.setProcessingQueue(false)
          this.graphStore.emptyPendingQueue()
          this.graphStore.emptyRunningQueue()
          this.status.generation = 'idle'

          log('IDLE', this.status.generation)

          this.dispatchEvent(
            new CustomEvent('executionstatus', {
              detail: {
                status: 'complete',
                remaining: 0
              }
            })
          )  
        } else {
          this.status.generation = 'generating'

          this.dispatchEvent(
            new CustomEvent('executionstatus', {
              detail: {
                status: 'generating',
                remaining: remaining
              }
            })
          )
        }
      }
    })

    api.addEventListener('progress', ({ detail }) => {
      const { progress } = storeToRefs(this.mainStore)
      this.progress = progress.value
      this.graph.setDirtyCanvas(true, false)
    })

    api.addEventListener('executing', ({ detail }) => {
      this.progress = null
      this.graph.setDirtyCanvas(true, false)
    })

    api.addEventListener('executed', ({ detail }) => {
      const nodeId = detail.node
      const node = this.graph.getNodeById(nodeId)

      const output = this.nodegraph.nodeOutputs[nodeId]
      if (detail.merge && output) {
        for (const k in detail.output ?? {}) {
          const v = output[k]
          if (v instanceof Array) {
            output[k] = v.concat(detail.output[k])
          } else {
            output[k] = detail.output[k]
          }
        }
      } else {
        this.nodegraph.nodeOutputs[nodeId] = detail.output
      }

      if (detail.output.images) {
        const nodeImages = detail.output.images
        const imageUrlArray = nodeImages.map(pathObj => this.getImageUrl(pathObj))
        this.graphStore.setCurrentPreviewImage(imageUrlArray[0])
        this.graphStore.setCurrentImageBatch(imageUrlArray)
        
        if (node && node.type==='SaveImage') {
          this.modelStore.appendImageGallery(imageUrlArray)
        }
      }

      if (node && node.onExecuted) {
        node.onExecuted(detail.output)
      }
    })

    api.init()

    this.apiListenersInitied = true
  }

  #addConfigureHandler() {
    const self = this
    const configure = LGraph.prototype.configure
    // Flag that the graph is configuring to prevent nodes from running checks while its still loading
    LGraph.prototype.configure = function () {
      self.configuringGraph = true
      try {
        return configure.apply(this, arguments)
      } finally {
        self.configuringGraph = false
      }
    }
  }

  #addAfterConfigureHandler() {
    const self = this
    const onConfigure = this.graph.onConfigure

    this.graph.onConfigure = function () {
      // Fire callbacks before the onConfigure, this is used by widget inputs to setup the config
      for (const node of self.graph._nodes) {
        node.onGraphConfigured?.()
      }
      
      const r = onConfigure?.apply(this, arguments)
      
      // Fire after onConfigure, used by primitves to generate widget using input nodes config
      for (const node of self.graph._nodes) {
        node.onAfterGraphConfigured?.()
      }

      return r
    }
  }

  updateNodeImage(node, filepath, type='input') {
    const img = new Image()
    img.onload = () => {
      node.imgs = [img]
      this.graph.setDirtyCanvas(true)
    }
    img.crossOrigin = 'anonymous'
    img.src = this.getImageUrlFromFilepath(filepath, type)
    node.setSizeForImage?.()
  }

  /**
   * filepath can be for instance 'image.jpg' or 'clipspace/mask-img.png' ...
   * method called generally after upload to update widget visually
   * and propagate the event to listeners (mainly SDFXWidget controls)
   */
  updateImageWidgetFilepath(node, filepath, type) {
    const imageWidget = node.widgets.find((w) => w.name === 'image')
    if (!imageWidget) return

    log('sdfx: updateImageWidgetFilepath', node.id, filepath, type)

    // Add the filepath as an option and update the widget value
    if (!imageWidget.options.values.includes(filepath)) {
      imageWidget.options.values.push(filepath)
    }

    this.updateNodeImage(node, filepath, type)
    imageWidget.value = filepath

    this.triggerWidgetUpdateEvent(
      node, 
      'image',
      String(filepath),
      imageWidget.options.values
    )
  }

  async uploadImage(node, filename, blob, updateNode=true, pasted=false) {
    const file = blobToFile(blob, filename)

    log('sdfx: upload file', node.id, filename, file)

    try {
      const body = new FormData()
      body.append('image', file, filename)
      if (pasted) body.append('subfolder', 'pasted')
      const resp = await api.fetchApi('/upload/image', {
        method: 'POST',
        body
      })

      if (resp.status === 200) {
        const data = await resp.json()
        let name = data.name || filename
        if (data.subfolder) name = data.subfolder + '/' + name
        if (updateNode) {
          this.updateImageWidgetFilepath(node, name, 'input')
        }
      } else {
        alert(resp.status + ' - ' + resp.statusText)
      }
    } catch (error) {
      alert(error)
    }
  }

  async uploadMask(node, filename, blob, tempMaskImg) {
    const clipspace = ClipSpace.getContent()
    const idx = clipspace.selectedIndex

    const original_url = new URL(clipspace.imgs[idx])
    original_url.searchParams.delete('channel')
    original_url.searchParams.set('channel', 'rgb')

    const original_ref = {
      filename: original_url.searchParams.get('filename'),
      subfolder: original_url.searchParams.get('subfolder'),
      type: original_url.searchParams.get('type')
    }

    const pathObj = {
      filename: filename,
      subfolder: 'clipspace',
      type: 'input'
    }

    ClipSpace.updateNodeMask(pathObj)

    if (clipspace.imgs && clipspace['img_paste_mode'] === 'selected') {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = tempMaskImg
      node.imgs = [img]
      node.imageIndex = 0
      img.onload = () => {
        this.graph.setDirtyCanvas(true)
      }
    }

    log('original_ref', original_ref)

    const formData = new FormData()
    formData.append('image', blob, filename)
    formData.append('original_ref', JSON.stringify(original_ref))
    formData.append('type', 'input')
    formData.append('subfolder', 'clipspace')

    const response = await api.fetchApi('/upload/mask', {
      method: 'POST',
      body: formData
    })

    const url = this.getImageUrl(pathObj)
    ClipSpace.updateSelectedImage(pathObj, url)
    ClipSpace.paste(node)

    const filepath = (pathObj.subfolder ? pathObj.subfolder + '/' : '') + pathObj.filename + (pathObj.type ? ` [${pathObj.type}]` : '')
    this.updateImageWidgetFilepath(node, filepath, 'input')
  }

  /**
   * restore outputs (images) for all nodes
   */
  setGraphOutputs(graphOutputs) {
    let outputImages = null
    let previewImages = null

    Object.keys(graphOutputs).forEach(nodeId => {
      const nodeOutputs = graphOutputs[nodeId]
      const images = nodeOutputs.images
      this.graphStore.setNodeOutputs(nodeId, nodeOutputs)
      if (images) {
        if (images[0].type==='output') outputImages = images
        if (images[0].type==='temp') previewImages = images
      }
    })

    if (outputImages) {
      const currentBatchImages = outputImages.map(pathObj => this.getImageUrl(pathObj))
      this.graphStore.setCurrentImageBatch(currentBatchImages)
      this.graphStore.setCurrentPreviewImage(currentBatchImages[0])
    }

    if (!outputImages && previewImages) {
      const previewBatchImages = previewImages.map(pathObj => this.getImageUrl(pathObj))
      this.graphStore.setCurrentImageBatch(previewBatchImages)
      this.graphStore.setCurrentPreviewImage(previewBatchImages[0])
    }

    this.graph.setDirtyCanvas(true)
  }

  getPreviewFormatParam() {
    let f = this.nodegraph.settings.previewFormat
    return f ? `&preview=${f}` : ''
  }

  getImageUrl(pathObj, previewMode=null) {
    let previewQuery = ''

    if (previewMode) {
      previewQuery = `&preview=${previewMode}`
    }

    return api.apiURL(
      `/view?filename=${encodeURIComponent(pathObj.filename)}&type=${pathObj.type}&subfolder=${pathObj.subfolder}` + previewQuery + '&rand=' + Math.random()
    )
  }

  getImageUrlFromFilepath(filepath, type, previewMode=null) {
    if (!filepath) {
      console.error('sdfx: invalid or missing filepath')
      return
    }

    const folder_separator = filepath.lastIndexOf('/')

    const pathObj = {
      filename: filepath,
      type: type,
      subfolder: ''
    }

    if (folder_separator > -1) {
      pathObj.subfolder = filepath.substring(0, folder_separator)
      pathObj.filename = filepath.substring(folder_separator + 1)
    }

    return this.getImageUrl(pathObj, previewMode)
  }

  /* ----------------- */

  centerOnNode (node) {
    if (!this.canvas) return
    this.canvas.centerOnNode(node)
  }

  animateToNodeId (nodeId, zoom=0.70) {
    if (!this.canvas) return
    const node = this.getLiteGraphNodeById(nodeId)
    node && (
      this.animateToNode(node, zoom)
    )
  }

  animateToNode (node, zoom=0.70) {
    if (!this.canvas) return
    this.canvas.animateToNode(node, 350, zoom, 'easeInOutQuad')
  }

  selectNode (node) {
    if (!this.canvas) return
    this.canvas.selectNode(node)
    this.graph.setDirtyCanvas(true)
  }

  /**
   * Import all extensions from allowed extensions
   */
  async #loadExtensions() {
    if (this.extensionsLoaded) return
    log('sdfx: loading extensions')

    /*
    if (this.availableExtensions.length<=0) {
      log('----- no available extentions')
      this.availableExtensions = await this.graphStore.getExtensionList()
      log('----- available extentions fetched', this.availableExtensions)
    }
    */

    // @ts-ignore
    await import('@/libs/sdfx/extensions/core/groupOptions.js')    
    // @ts-ignore
    await import('@/libs/sdfx/extensions/core/groupNode.js')    
    // @ts-ignore
    await import('@/libs/sdfx/extensions/core/rerouteNode.js')
    // @ts-ignore
    await import('@/libs/sdfx/extensions/core/contextMenuFilter.js')
    // @ts-ignore
    await import('@/libs/sdfx/extensions/core/dynamicPrompts.js')
    // @ts-ignore
    await import('@/libs/sdfx/extensions/core/editAttention.js')
    // @ts-ignore
    await import('@/libs/sdfx/extensions/core/noteNode.js')
    // @ts-ignore
    await import('@/libs/sdfx/extensions/core/slotDefaults.js')
    // @ts-ignore
    await import('@/libs/sdfx/extensions/core/snapToGrid.js')
    // @ts-ignore
    await import('@/libs/sdfx/extensions/core/uploadImage.js')
    // @ts-ignore
    await import('@/libs/sdfx/extensions/core/widgetInputs.js')
    // @ts-ignore
    await import('@/libs/sdfx/extensions/core/saveImageExtraOutput.js')
    // @ts-ignore
    await import('@/libs/sdfx/templateManager.ts')

    // @ts-ignore
    await import('@/libs/sdfx/extensions/vhs/vhs.js')
    // @ts-ignore
    await import('@/libs/sdfx/extensions/manager/manager.js')
    // @ts-ignore
    await import('@/libs/sdfx/extensions/kj/setgetnodes.js')
    
    // @ts-ignore
    // await import('@/libs/sdfx/extensions/painter/painterNode.js')

    this.extensionsLoaded = true

    /*
    TODO: seems this is not clean / secure with vitejs
    for (const filename of this.availableExtensions) {
      try {
        if (allowedExtensions.includes(filename)) {
          await import('.' + filename)
          // log('+++ successfully loaded extension', filename)
        } else {
          //log('--- discarding extension', filename, '(not implemented)')
        }
        this.extensionsLoaded = true
      } catch (error) {
        console.error('--- extension error', filename, error)
        this.extensionsLoaded = false
      }
    }
    */
  }

  createSDFXNodeClass (nodeName, nodeData) {
    const self = this

    const SDFXNode = function() {
      var inputs = nodeData['input']['required']

      if (nodeData['input']['optional'] !== undefined) {
        inputs = Object.assign(
          {},
          nodeData['input']['required'],
          nodeData['input']['optional']
        )
      }

      const config = { minWidth: 1, minHeight: 1 }

      for (const inputName in inputs) {
        const inputData = inputs[inputName]
        const type = inputData[0]
      
        let widgetCreated = true
        const widgetType = self.getWidgetType(inputData, inputName)
        if (widgetType) {
          if (widgetType === 'COMBO') {
            Object.assign(
              config,
              self.defWidgets.COMBO(this, inputName, inputData, self) || {},
            )
          } else {
            Object.assign(
              config,
              self.defWidgets[widgetType](this, inputName, inputData, self) || {},
            )
          }
        } else {
          // Node connection inputs
          this.addInput(inputName, type)
          widgetCreated = false
        }
      
        if (widgetCreated && inputData[1]?.forceInput && config?.widget) {
          if (!config.widget.options) config.widget.options = {}
          config.widget.options.forceInput = inputData[1].forceInput
        }
        if (widgetCreated && inputData[1]?.defaultInput && config?.widget) {
          if (!config.widget.options) config.widget.options = {}
          config.widget.options.defaultInput = inputData[1].defaultInput
        }
      }

      for (const o in nodeData['output']) {
        let output = nodeData['output'][o]
        if (output instanceof Array) {
          output = 'COMBO'
        }

        const outputName = nodeData['output_name'][o] || output
        const outputShape = nodeData['output_is_list'][o] ? LiteGraph.GRID_SHAPE : LiteGraph.CIRCLE_SHAPE
        this.addOutput(outputName, output, { shape: outputShape })
      }
      
      const s = this.computeSize()
      s[0] = Math.max(config.minWidth, s[0] * 1.5)
      s[1] = Math.max(config.minHeight, s[1])
      this.size = s
      this.serialize_widgets = true
      
      self.#invokeExtensionsAsync('nodeCreated', this)
    }

    const nodeClass = Object.assign(
      SDFXNode,
      {
        title: nodeData.display_name || nodeData.name,
        comfyClass: nodeData.name,
        nodeData: nodeData
      },
    )

    nodeClass.prototype.comfyClass = nodeData.name
    return nodeClass
  }

  setCanvasTheme(theme='dark') {
    const nodeDefs = this.graphStore.getNodeDefs()

    if (!this.canvas) {
      console.error('sdfx: unable to set canvas theme, missing SDFX canvas')
      return
    }
    if (isEmptyObject(nodeDefs)) {
      console.error('sdfx: unable to set canvas theme, missing node definitions')
      return
    }
    loadTheme(this.canvas, nodeDefs, theme)
  }

  getWidgetType(inputData, inputName) {
    const type = inputData[0]

    if (Array.isArray(type)) {
      return "COMBO"
    } else if (`${type}:${inputName}` in this.defWidgets) {
      return `${type}:${inputName}`
    } else if (type in this.defWidgets) {
      return type
    } else {
      return null
    }
  }

  /**
   * Registers nodes from server nodeDefs, and custom nodes
   */
  async #registerNodesFromDefs(nodeDefs) {
    if (this.nodesRegistered) {
      console.warn('sdfx: nodes already registered')
      return
    }

    if (isEmptyObject(nodeDefs)) {
      console.error('sdfx: missing node definitions')
      return
    }

    log(`sdfx: registering ${Object.keys(nodeDefs).length} nodes ...`)

    await this.#invokeExtensionsAsync('addCustomNodeDefs', nodeDefs)

    /**
     * Generate list of known comfy widgets
     * (COMBO, FLOAT, IMAGEUPLOAD, INT, INT:noise_seed, INT:seed, STRING)
     */
    this.defWidgets = Object.assign(
      {}, 
      ComfyWidgets,
      ...(await this.#invokeExtensionsAsync('getCustomWidgets')).filter(Boolean)
    )

    // Register a node for each definition
    for (const nodeName in nodeDefs) {
      this.registerNodeDef(nodeName, nodeDefs[nodeName])
    }

    log('sdfx: ... server nodes registered successfully ...')
    await this.#invokeExtensionsAsync('registerCustomNodes')

    this.ready = true

    this.dispatchEvent(
      new CustomEvent('ready', {
        detail: {
          graph: this.graph,
          canvas: this.canvas
        }
      })
    )
  }

  async registerNodeDef(nodeName, nodeData, isGroupNodeType) {
    const nodeClass = this.createSDFXNodeClass(nodeName, nodeData)
    await this.#registerNode(nodeName, nodeClass, nodeData)
  }

  /**
   * update node prototype and register the node to LiteGraph
   */
  async #registerNode(nodeName, nodeClass, nodeData) {
    this.#updateNodeContextMenuPrototype(nodeClass)
    this.#updateNodeDrawBackgroundPrototype(nodeClass)
    this.#updateNodeKeyDownPrototype(nodeClass)

    await this.#invokeExtensionsAsync('beforeRegisterNodeDef', nodeClass, nodeData)
    LiteGraph.registerNodeType(nodeName, nodeClass)
    nodeClass.category = nodeData.category
  }

  /**
   * Converts the current graph workflow for sending to the API
   * @returns The workflow and node links
   */

  async graphToPrompt() {
    if (!this.nodegraph) {
      this.#initStores()
    }
    
    for (const outerNode of this.graph.computeExecutionOrder(false)) {
      const innerNodes = outerNode.getInnerNodes
        ? outerNode.getInnerNodes()
        : [outerNode]
      
      for (const node of innerNodes) {
        if (node.isVirtualNode) {
          // Don't serialize frontend only nodes but let them make changes
          if (node.applyToGraph) {
            node.applyToGraph()
          }
        }
      }
    }
  
    const workflow = this.graph.serialize()
    const output = {}

    // Process nodes in order of execution
    for (const outerNode of this.graph.computeExecutionOrder(false)) {
      const skipNode = outerNode.mode === 2 || outerNode.mode === 4

      const innerNodes = !skipNode && outerNode.getInnerNodes
          ? outerNode.getInnerNodes()
          : [outerNode]
      
      for (const node of innerNodes) {
        if (node.isVirtualNode) {
          continue
        }
  
        if (node.mode === 2 || node.mode === 4) {
          // Don't serialize muted nodes
          continue
        }
  
        const inputs = {}
        const widgets = node.widgets
        // Store all widget values
        if (widgets) {
          for (const i in widgets) {
            const widget = widgets[i]
            if (!widget.options || widget.options.serialize !== false) {
              inputs[widget.name] = widget.serializeValue 
                ? await widget.serializeValue(node, i) 
                : widget.value
            }
          }
        }
  
        // Store all node links
        for (let i in node.inputs) {
          let parent = node.getInputNode(i)
          if (parent) {
            let link = node.getInputLink(i)
            while (parent.mode === 4 || parent.isVirtualNode) {
              let found = false
              if (parent.isVirtualNode) {
                link = parent.getInputLink(link.origin_slot)
                if (link) {
                  parent = parent.getInputNode(link.target_slot)
                  if (parent) {
                    found = true
                  }
                }
              } else if (link && parent.mode === 4) {
                let all_inputs = [link.origin_slot]
                if (parent.inputs) {
                  all_inputs = all_inputs.concat(Object.keys(parent.inputs))
                  for (let parent_input in all_inputs) {
                    parent_input = all_inputs[parent_input]
                    if (
                      parent.inputs[parent_input]?.type === node.inputs[i].type
                    ) {
                      link = parent.getInputLink(parent_input)
                      if (link) {
                        parent = parent.getInputNode(parent_input)
                      }
                      found = true
                      break
                    }
                  }
                }
              }
  
              if (!found) {
                break
              }
            }
  
            if (link) {
              if (parent?.updateLink) {
                link = parent.updateLink(link)
              }
              if (link) {
                inputs[node.inputs[i].name] = [
                  String(link.origin_id),
                  parseInt(link.origin_slot)
                ]
              }
            }
          }
        }
  
        output[String(node.id)] = {
          inputs,
          class_type: node.comfyClass,
        }
      }
    }
  
    // Remove inputs connected to removed nodes
  
    for (const o in output) {
      for (const i in output[o].inputs) {
        if (
          Array.isArray(output[o].inputs[i]) &&
          output[o].inputs[i].length === 2 &&
          !output[output[o].inputs[i][0]]
        ) {
          delete output[o].inputs[i]
        }
      }
    }
  
    return { workflow, output }
  }

  async generate(number) {
    const p = await this.graphToPrompt()

    try {
      const res = await api.queuePrompt(number, p)
      const errors = res.node_errors

      this.graphStore.setLastNodeErrors(errors)

      if (errors.length > 0) {

        this.dispatchEvent(
          new CustomEvent('error', {
            detail: errors
          })
        )

        this.canvas && (
          this.canvas.draw(true, true)
        )
      }
    } catch (error) {
      const formattedError = formatPromptError(error)
      console.error(formattedError)

      this.status.generation = 'idle'

      this.dispatchEvent(
        new CustomEvent('error', {
          detail: error
        })
      )

      if (error.response) {
        this.graphStore.setLastNodeErrors(error.response.node_errors)

        this.canvas && (
          this.canvas.draw(true, true)
        )
      }
      return null
    }

    for (const n of p.workflow.nodes) {
      const node = this.graph.getNodeById(n.id)
      if (node.widgets) {
        for (const widget of node.widgets) {
          // Allow widgets to run callbacks after a prompt has been queued
          // e.g. random seed after every gen
          if (widget.afterQueued) {
            widget.afterQueued()
          }
        }
      }
    }

    this.canvas && (
      this.canvas.draw(true, true)
    )

    await this.graphStore.getQueue()

    return true
  }

  async queuePrompt(number, batchCount = 1) {
    if (!this.nodegraph) {
      console.error('sdfx: store not defined')
      this.#initStores()
    }
    this.nodegraph.status.queueItems.push({ number, batchCount })

    // Only have one action process the items so each one gets a unique seed correctly
    if (this.nodegraph.status.processingQueue) {
      return
    }

    this.status.generation = 'started'
    this.graphStore.setProcessingQueue(true)
    this.graphStore.setLastNodeErrors(null)

    try {
      while (this.nodegraph.status.queueItems.length) {
        ;({ number, batchCount } = this.nodegraph.status.queueItems.pop())

        for (let i=0; i<batchCount; i++) {
          const completed = await this.generate(number)
          if (!completed) break
        }
      }
    } finally {
      this.graphStore.setProcessingQueue(false)
    }
  }

  async interrupt() {
    if (!this.nodegraph) {
      this.#initStores()
    }

    this.status.generation = 'interrupting'
    await this.graphStore.interrupt()
  }

  /**
   * Loads workflow data from SD parameters (A1111, InvokeAI ...)
   * @param {string} parameters
   */
  async loadFromSDParameters(parameters) {
    const embeddings = await api.getEmbeddings()
    importA1111(this.graph, parameters, embeddings)
  }

  /**
   * Loads workflow data from latent file
   * @param {File} file
   */
  async loadLatentFile(file) {
    const info = await getLatentMetadata(file)
    if (info.workflow) {
      await this.loadGraphData(JSON.parse(info.workflow), true)
    } else if (info.prompt) {
      this.loadApiJson(JSON.parse(info.prompt))
    }
  }

  isApiJson(data) {
    return Object.values(data).every(v => v && v.class_type)
  }

  loadApiJson(apiData) {
    this.missingNodeTypes = Object.values(apiData).filter(
      (n) => !LiteGraph.registered_node_types[n.class_type]
    )

    if (this.missingNodeTypes.length>0) {
      this.showMissingNodesError(this.missingNodeTypes.map(t => t.class_type), false)
      return
    }

    const ids = Object.keys(apiData)

    this.graph.clear()

    for (const id of ids) {
      const data = apiData[id]
      const node = LiteGraph.createNode(data.class_type)
      node.id = isNaN(+id) ? id : +id
      this.graph.add(node)
    }

    for (const id of ids) {
      const data = apiData[id]
      const node = this.graph.getNodeById(id)
      for (const input in data.inputs ?? {}) {
        const value = data.inputs[input]
        if (value instanceof Array) {
          const [fromId, fromSlot] = value
          const fromNode = this.graph.getNodeById(fromId)
          const toSlot = node.inputs?.findIndex((inp) => inp.name === input)
          if (toSlot !== -1) {
            fromNode.connect(fromSlot, node, toSlot)
          }
        } else {
          const widget = node.widgets?.find((w) => w.name === input)
          if (widget) {
            widget.value = value
            widget.callback?.(value)
          }
        }
      }
    }

    this.graph.arrange()
  }

  loadTemplateData(templateData) {
    if (!templateData?.templates) {
      return
    }

    const old = localStorage.getItem('graphclipboard')

    var maxY, nodeBottom, node

    for (const template of templateData.templates) {
      if (!template?.data) {
        continue
      }

      localStorage.setItem('graphclipboard', template.data)
      this.canvas.pasteFromClipboard()

      // Move mouse position down to paste the next template below

      maxY = false

      for (const i in this.canvas.selected_nodes) {
        node = this.canvas.selected_nodes[i]

        nodeBottom = node.pos[1] + node.size[1]

        if (maxY === false || nodeBottom > maxY) {
          maxY = nodeBottom
        }
      }

      this.canvas.graph_mouse[1] = maxY + 50
    }

    localStorage.setItem('graphclipboard', old)
  }

  /**
   * Loads workflow data from JSON file
   * @param {File} file
   */
  async loadJSONFile(file) {
    log('loadJSONFile')
    const reader = new FileReader()
    reader.onload = async () => {
      const json = JSON.parse(reader.result)

      if (json?.templates) {
        this.loadTemplateData(json)
      } else if (this.isApiJson(json)) {
        this.loadApiJson(json)
      } else {
        await this.loadGraphData(json, true)
      }
    }
    reader.readAsText(file)
  }

  /**
   * Loads workflow data from the specified file
   * @param {File} file
   */
  async handleFile(file) {
    const allowedImageTypes = ['image/png', 'image/webp', 'image/jpg', 'image/jpeg']

    this.deleteGraph()

    /* check for images with embeded SD metadata */
    if (allowedImageTypes.includes(file.type)) {
      const metadata = await extractImageSDMetadata(file)
      if (metadata) {
        if (metadata.workflow) {
          /* found image with embeded LiteGraph workflow */
          return await this.loadGraphData(metadata.workflow, true)
        } else if (metadata.prompt) {
          this.loadApiJson(metadata.prompt)
        } else if (metadata.parameters) {
          /* found image with embeded SD parameters */
          return await this.loadFromSDParameters(metadata.parameters)
        }
      }
    } else if (file.type === 'application/json' || file.name?.endsWith('.json')) {
      this.loadJSONFile(file)
    } else if (file.name?.endsWith('.latent') || file.name?.endsWith('.safetensors')) {
      this.loadLatentFile(file)
    }
  }

  /**
   * Registers an extension
   * @param {SDFXExtension} extension
   */
  registerExtension(extension) {
    if (!extension.name) {
      throw new Error("Extensions must have a 'name' property.")
    }
    if (this.extensions.find((ext) => ext.name === extension.name)) {
      throw new Error(`Extension named '${extension.name}' already registered.`)
    }
    this.extensions.push(extension)
  }

  showMissingNodesError(missingNodeTypes, hasAddedNodes = true) {
    let seenTypes = new Set()
    let types = []
    const missing = Array.from(new Set(missingNodeTypes)).map((t) => {
      if (typeof t === 'object') {
        if (seenTypes.has(t.type)) return null

        seenTypes.add(t.type)
        types.push(t.type)
      } else {
        if (seenTypes.has(t)) return null
        seenTypes.add(t)
        types.push(t)
      }
    }).filter(Boolean)

    console.warn(
      `The following node types were not found}`, types
    )
  }

  /**
   * Refresh combo list on whole nodes
   */
  async refreshComboInNodes() {
    const nodeDefs = await this.#getNodeDefs()

    for (const nodeId in LiteGraph.registered_node_types) {
      const node = LiteGraph.registered_node_types[nodeId]
      const nodeDef = nodeDefs[nodeId]
      if (!nodeDef) continue

      node.nodeData = nodeDef
    }

    for (let nodeNum in this.graph._nodes) {
      const node = this.graph._nodes[nodeNum]
      const def = nodeDefs[node.type]

      // Allow primitive nodes to handle refresh
      node.refreshComboInNode?.(nodeDefs)

      if (!def) continue

      for (const widgetNum in node.widgets) {
        const widget = node.widgets[widgetNum]
        if (
          widget.type == 'combo' &&
          def['input']['required'][widget.name] !== undefined
        ) {
          widget.options.values = def['input']['required'][widget.name][0]

          if (
            widget.name != 'image' &&
            !widget.options.values.includes(widget.value)
          ) {
            widget.value = widget.options.values[0]
            widget.callback(widget.value)
          }
        }
      }
    }

    await this.#invokeExtensionsAsync('refreshComboInNodes', nodeDefs)
  }

  setGridSize(size) {
    LiteGraph.CANVAS_GRID_SIZE = size
  }

  arrangeGraph() {
    if (!this.graph) return
    this.graph.arrange()
  }

  /**
   * hack to remove sdfx-input-file constantly
   * injected in the DOM and not properly cleaned
   */
  __hackClearInputElement() {
    if (document) {
      const inputElements = document.querySelectorAll('.sdfx-file-input')
      inputElements.forEach(inp => inp && inp.remove())
    }
  }

  deleteGraph() {
    if (this.groupNodes) {
      /* unregister group nodes */
      for (const g in this.groupNodes) {
        try {
          LiteGraph.unregisterNodeType('workflow/' + g)
        } catch (error) {}
      }
      this.groupNodes = null
    }
    this.resetGraphState()
    this.cleanAllImages()
    this.graph.clear()
    this.graphStore.unselectSDFXNode()
    this.graphStore.clearCurrentWorkflow()
    this.__hackClearInputElement()
  }

  zoomFit() {
    if (!this.canvas) return
    this.canvas.zoomFit()
    const z = this.canvas.ds.getScale()
    this.setGraphZoom(z)
  }

  zoomIn(x=0.05) {
    if (!this.canvas) return
    let z = this.canvas.ds.getScale()
    z += x
    this.setGraphZoom(z)
  }

  zoomOut(x=0.05) {
    if (!this.canvas) return
    let z = this.canvas.ds.getScale()
    z -= x
    this.setGraphZoom(z)
  }

  setGraphZoom(z) {
    if (!this.canvas) return
    this.canvas.setZoom(z)
    this.graphStore.setCanvasZoom(z)
  }

  setGraphPosition(position) {
    if (!this.canvas) return
    this.canvas.setPosition(position)
    this.graphStore.setCanvasPosition(position)
  }

  restoreGraphState () {
    if (!this.canvas) return
    const z = this.graphStore.getCanvasZoom()
    const position = this.graphStore.getCanvasPosition()
    this.canvas.setZoom(z)
    this.canvas.setPosition(position)
  }

  resetGraphState() {
    this.setGraphZoom(1.0)
    this.setGraphPosition({x:0, y:0})
    this.graphStore.setProcessingQueue(false)
    this.graphStore.setLastNodeErrors(null)
    this.graphStore.setLastExecutionError(null)
    this.graphStore.setRunningNodeId(null)
    this.graphStore.unselectSDFXNode()
  }

  /**
   * Clean all images
   */
  cleanAllImages() {
    this.graphStore.cleanImages()
  }
}

export const sdfx = new SDFXApp()