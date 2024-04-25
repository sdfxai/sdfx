import { api } from '@/apis'
import { defineStore } from 'pinia'
import { useStorage, useStorageAsync } from '@vueuse/core'

const defStatus = {
  queueItems: [],
  processingQueue: false,
  queueSize: 0,
  lastQueueSize: 0,
  runningNodeId: null as any,
  lastNodeErrors: null,
  lastExecutionError: null
}

const defClipspace = {
  widgets: null,
  imgs: null,
  original_imgs: null,
  images: null,
  selectedIndex: null as any,
  img_paste_mode: null
}

export const useGraphStore = defineStore('graphStore', {
  state: () => ({
    appList: useStorage('appList', [] as any[]),
    templateList: useStorage('templateList', [] as any[]),

    canvasSettings: useStorageAsync('canvasSettings', {
      zoom: 1.0,
      position: {
        x: 0,
        y: 0
      }
    }),

    clipspace: useStorage('clipspace', defClipspace),
    nodeDefs: useStorage('nodeDefs', {} as any),

    history: [] as any[],
    queue: {
      running: [] as any[],
      pending: [] as any[]
    },

    /**
     * List of available and allowed extensions to be loaded
     * @type {string[]}
     */
    availableExtensions: useStorage('availableExtensions', [] as string[]),

    nodegraph: useStorage('nodegraph', {
      selectorMap: {} as any,
      registeredNodes: [] as any[],
      
      currentAppId: null as any,
      currentDependencies: [] as any[],
      currentNodes: [] as any[],
      currentWorkflow: null as any,
      currentMapping: null as any,
      selectedNode: null as any,

      /**
       * Stores the execution output data for each node
       * @type {Record<string, any>}
       */
      nodeOutputs: {} as any,

      status: defStatus,

      settings: {
        batchCount: 1,
        autoQueueCheckbox: true,
        previewFormat: 'jpeg;80', /* e.g. webp, jpeg;80, webp;50 */
      }
    }),

    /**
     * Stores the preview image data for each node
     * @type {Record<string, Image>}
     */
    preview: useStorage('preview', {
      nodePreviewImages: {} as any,
      currentPreviewImage: null as any,
      lastBatch: [] as any[],
      currentBatch: [] as any[]
    })
  }),

  actions: {
    reset(){
      this.queue.pending = []
      this.queue.running = []
      this.history = []
      this.nodegraph.status = defStatus
      this.availableExtensions = []
      this.clearClipspace()
      this.clearCurrentWorkflow()
    },

    clearClipspace() {
      this.clipspace = defClipspace
    },

    /* -------------------------------------------------------- */

    async addTemplate(template: any){
      const json = await api.addTemplate(template)
      this.templateList.push({
        uid: json.uid,
        ...template
      })
    },

    async removeTemplate(uid: string){
      await api.removeTemplate(uid)

      const idx = this.templateList.findIndex(t => t.uid === uid)
      this.templateList.splice(idx, 1)
    },

    async getTemplate(uid: string){
      return await api.getTemplate(uid)
    },

    async getTemplateList() {
      this.templateList = await api.getTemplateList()      
      return this.templateList
    },

    getLocalTemplateList() {
      return this.templateList
    },

    /* -------------------------------------------------------- */

    async getAppList() {
      const list = await api.getWorkflowList()
      this.appList = list && Array.isArray(list) ? list : []
      return this.appList
    },

    setCurrentAppId(uid: string) {
      this.nodegraph.currentAppId = uid
    },

    async addApp(workflow: any) {
      if (!workflow) return
      const resp = await api.addWorkflow(workflow)
      await this.getAppList()
    },

    async getAppDetails(uid: string) {
      return await api.getWorkflow(uid)
    },

    async removeApp(uid: string) {
      const idx = this.appList.findIndex(g => g.uid === uid)
      if (idx>-1) {
        this.appList.splice(idx, 1)
      }

      await api.removeWorkflow(uid)
    },

    async updateApp(uid: string, workflow: any) {
      const idx = this.appList.findIndex(g => g.uid === uid)
      if (idx>-1) {
        this.appList[idx] = {
          uid: workflow.uid,
          name: workflow.name,
          meta: workflow.meta,
          dateCreated: workflow.dateCreated
        }
        await api.updateWorkflow(uid, workflow)
      }
    },

    getCurrentAppDefaults() {
      const w = this.nodegraph.currentWorkflow
      return w && w.defaults ? w.defaults : null
    },

    async loadExternalWorkflow(workflowURL: string) {
      const m = await fetch(workflowURL)
      this.nodegraph.currentWorkflow = await m.json()
    },

    getCurrentWorkflow() {
      return this.nodegraph.currentWorkflow
    },

    getSDFXNodeById(nodeId: number) {
      return this.nodegraph.currentNodes.find((n: any) => n.id === nodeId)
    },

    setCurrentDependencies(dependencies: any[]) {
      if (dependencies && dependencies.length>=0) {
        this.nodegraph.currentDependencies = dependencies
      }
    },

    addCurrentDependenciesToWorkflow() {
      const dependencies = this.nodegraph.currentDependencies
      this.nodegraph.currentWorkflow.dependencies = dependencies.map((dep: any) => {
        return {
          type: dep.type,
          name: dep.name,
          url: dep.url
        }
      })
    },

    setCurrentMapping(mapping: any) {
      this.nodegraph.currentMapping = mapping
    },

    clearCurrentWorkflow() {
      this.nodegraph.currentAppId = null
      this.nodegraph.currentDependencies = []
      this.nodegraph.currentWorkflow = null
      this.nodegraph.currentNodes = []
      this.nodegraph.currentMapping = null
      this.nodegraph.selectedNode = null
      this.cleanImages()
    },

    getCurrentStatus() {
      return this.nodegraph.status
    },

    /*
     * map widget options for selectors (i.e: sampler_name, ckpt_name ...)
     * used to feed our dropdowns and selector inputs with available options
     */
    updateSelectorMap() {
      const map: any = {}

      Object.keys(this.nodeDefs).map(nodeType => {
        const requiredInputs = this.nodeDefs[nodeType].input?.required

        if (requiredInputs) {
          Object.keys(requiredInputs).map(widgetName => {
            const widgetOptions = requiredInputs[widgetName]

            if (widgetOptions[0] && Array.isArray(widgetOptions[0])) {
              map[nodeType] = map[nodeType] || {}
              map[nodeType][widgetName] = widgetOptions[0]
            }
          })
        }
      })

      this.nodegraph.selectorMap = map
    },

    selectSDFXNode(sdfxNode: any) {
      this.nodegraph.selectedNode = sdfxNode
      // console.log('selectSDFXNode', this.nodegraph.selectedNode)
    },

    selectSDFXNodeById(nodeId: any) {
      if (this.nodegraph.selectedNode && this.nodegraph.selectedNode.id === nodeId) {
        return
      }
      const sdfxNode = this.getSDFXNodeById(nodeId) 
      this.selectSDFXNode(sdfxNode)
    },

    unselectSDFXNode() {
      this.nodegraph.selectedNode = null
    },

    /**
     * @returns null | number
     */
    getRunningNodeId() {
      return this.nodegraph.status.runningNodeId
    },

    /**
     * @param {id} null | number
     */
    setRunningNodeId(id: any) {
      this.nodegraph.status.runningNodeId = id
    },

    getRunningNode() {
      const runningNodeId = Number(this.nodegraph.status.runningNodeId)
      return this.getSDFXNodeById(runningNodeId)
    },

    setProcessingQueue(bool: boolean) {
      this.nodegraph.status.processingQueue = bool
    },

    setLastNodeErrors(errors: any) {
      this.nodegraph.status.lastNodeErrors = errors
    },

    clearLastNodeError(nodeId: any) {
      const lastNodeErrors = this.nodegraph.status.lastNodeErrors
      if (!lastNodeErrors) return

      if (lastNodeErrors[String(nodeId)]) {
        delete lastNodeErrors[String(nodeId)]
      }
    },

    setLastExecutionError(error: any) {
      this.nodegraph.status.lastExecutionError = error
    },

    /**
     * position of the canvas --> {x, y}
     **/
    setCanvasPosition(position: { x: number, y: number }) {
      this.canvasSettings.position = position
    },

    getCanvasPosition() {
      return this.canvasSettings.position || {x:0, y:0}
    },

    setCanvasZoom(z: number) {
      return this.canvasSettings.zoom = z
    },

    getCanvasZoom() {
      return this.canvasSettings.zoom
    },

    /* ------------------- */

    setNodeOutputs(nodeId: string, nodeOutputs: any) {
      this.nodegraph.nodeOutputs[nodeId] = nodeOutputs
    },

    setNodeOutputImages(nodeId: string, imageOutputArray: any[]) {
      if (!this.nodegraph.nodeOutputs[nodeId]) {
        this.nodegraph.nodeOutputs[nodeId] = {}
      }

      this.nodegraph.nodeOutputs[nodeId].images = imageOutputArray

      const imageList = imageOutputArray.map(i => {
        return i.type + '/' + i.filename
      })

      console.log('setNodeOutputImages', imageList)
    },

    cleanImages() {
      this.nodegraph.nodeOutputs = {}
      this.preview.nodePreviewImages = {}
      this.preview.currentPreviewImage = null
      this.preview.lastBatch = []
      this.preview.currentBatch = []
    },

    setCurrentPreviewImage(imageUrl: string) {
      this.preview.currentPreviewImage = imageUrl
    },

    setLastImageBatch(imageUrlArray: any[]) {
      this.preview.lastBatch = imageUrlArray
    },

    setCurrentImageBatch(imageUrlArray: any[]) {
      this.preview.currentBatch = imageUrlArray
    },

    setNodePreviewImages(nodeId: any, imageArray: any[]) {
      if (nodeId === null || !imageArray) return
      this.preview.nodePreviewImages[nodeId] = imageArray
    },

    clearNodePreviewImages(nodeId: number) {
      delete this.preview.nodePreviewImages[nodeId]
    },

    async getHistory() {
      this.history = await api.getHistorySDFX()
    },

    async deleteHistoryItem(id: number) {
      await api.deleteItem('history', id)
      const idx = this.history.findIndex(h => h.prompt[1] === id)
      if (idx>-1) this.history.splice(idx, 1)
    },

    async clearHistory() {
      this.history = []
      await api.clearItems('history')
    },

    async getQueue() {
      const { queue_running, queue_pending } = await api.getQueueSDFX()
      this.queue = {
        running: queue_running,
        pending: queue_pending 
      }
    },

    popPendingQueue() {
      this.queue.pending.pop()
    },

    emptyPendingQueue() {
      this.queue.pending = []
    },

    emptyRunningQueue() {
      this.queue.running = []
    },

    async deleteQueueItem(id: number) {
      await api.deleteItem('queue', id)
    },

    async clearQueue() {
      this.emptyPendingQueue()
      this.emptyRunningQueue()
      await api.clearItems('queue')
    },

    async interrupt() {
      await api.interrupt()
      this.queue.running = []
    },

    setNodeDefs(nodeDefs: any) {
      this.nodeDefs = nodeDefs
      this.updateSelectorMap()
    },

    getNodeDefs() {
      return this.nodeDefs
    },

    async getExtensionList() {
      //console.log('api.getExtensionList()')
      this.availableExtensions = await api.getExtensions()
      return this.availableExtensions
    }
  }
})
