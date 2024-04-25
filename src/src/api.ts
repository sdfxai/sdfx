import { api } from '@/apis'
import { formatExecutionError } from '@/utils/errors'
import { v4 as uuidv4 } from 'uuid'
// @ts-ignore
import { PubSub } from '@/apis/PubSub.js'
import { useMainStore, useGraphStore, storeToRefs } from '@/stores'

export const SDFXAPI = {
  globalChannel: null,

  async onready(clientId: string) {
  },

  initPubSub() {
    this.globalChannel = PubSub.getChannel('global')
    if (!this.globalChannel) return

    // @ts-ignore
    this.globalChannel.on('ready', (d: any) => {
      console.log('global channel ready')
    })

    // @ts-ignore
    this.globalChannel.on('ping', (d: any) => {
      api.socket!.send(
        JSON.stringify({
          type: 'pong',
          segment: 'global'
        })
      )
    })    
  },

  async connect() {
    const mainStore = useMainStore()
    const graphStore = useGraphStore()

    const { server, status } = storeToRefs(mainStore)

    const token = mainStore.getAuthToken()
    const clientId = mainStore.getClientId() || uuidv4()

    server.value.clientId = clientId
    status.value.ready = false

    mainStore.setSocketStatus('connecting')

    api.connect(clientId, token)
    this.initPubSub()

    api.socket!.addEventListener('open', (e) => {
      mainStore.setSocketStatus('connected')

      /* reboot SDFX app when the server has successfuly rebooted */
      if (mainStore.isRebooting()) {
        mainStore.setRebooting(false)
        window.location.reload()
        return
      }

      status.value.ready = true
      this.onready(clientId)
    })

    api.socket!.addEventListener('message', (e) => {
      try {
        const json = JSON.parse(e.data)
        const emitter = PubSub.getChannel(json.segment)
        if (emitter) {
          emitter.emit(json.type, json.data)
        }
      } catch (error) {
        const emitter = PubSub.getChannel('comfy')
        if (emitter) {
          // @ts-ignore
          emitter.emit('preview', error.data)
        }
      }
    })

    api.socket!.onerror = () => {
      mainStore.setSocketStatus('error')
      graphStore.setLastNodeErrors(null)
      graphStore.setLastExecutionError(null)
      graphStore.setRunningNodeId(null)
      status.value.ready = false
    }

    api.socket!.onclose = () => {
      mainStore.setSocketStatus('error')
      graphStore.setLastNodeErrors(null)
      graphStore.setLastExecutionError(null)
      graphStore.setRunningNodeId(null)
      status.value.ready = false
    }

    api.addEventListener('reconnecting', () => {
      mainStore.setSocketStatus('connecting')
    })

    api.addEventListener('reconnected', () => {
      mainStore.setSocketStatus('connected')

      /* reboot SDFX app when the server has successfuly rebooted */
      if (mainStore.isRebooting()) {
        mainStore.setRebooting(false)
        window.location.reload()
        return
      }

      status.value.ready = true
      this.onready(clientId)
    })

    let lastProgressTime: any = null
    let averageStepDuration = 0; // En millisecondes

    api.addEventListener('progress', ({ detail }: any) => {
      status.value.generation = 'generating'

      const currentTime = Date.now()
      const runningNode = graphStore.getRunningNode()
      const runningNodeId = runningNode ? runningNode.id : null
      const runningNodeTitle = runningNode ? (runningNode.title || runningNode.type) : null
      let timeElapsed = 0

      if (lastProgressTime !== null) {
        timeElapsed = currentTime - lastProgressTime
        averageStepDuration = (averageStepDuration + timeElapsed) / 2
      }

      lastProgressTime = currentTime

      const currentStep = detail.value
      const totalSteps = detail.max
      const percent = (100*currentStep) / totalSteps
      const remainingSteps = totalSteps - currentStep
      const stepsPerSecond = timeElapsed>0 ? currentStep / (timeElapsed / 1000) : 0
      const currentImage = null

      /* remaining time in milliseconds */
      const estimatedRemainingTimeMillis = averageStepDuration * remainingSteps;
      /* remaining time in seconds */
      const eta = estimatedRemainingTimeMillis / 1000

      const data = {
        percent,
        runningNodeId,
        runningNodeTitle,
        averageStepDuration,
        remainingSteps,
        stepsPerSecond,
        currentStep,
        totalSteps,
        eta,
        currentImage
      }

      mainStore.updateProgress(data)
    })

    api.addEventListener('execution_start', ({ detail }: any) => {
      console.log('* execution start')
      status.value.generation = 'started'

      graphStore.setRunningNodeId(null)
      graphStore.setLastExecutionError(null)
      graphStore.getQueue()
      graphStore.setLastImageBatch(graphStore.preview.currentBatch)
    })

    api.addEventListener('executing', ({ detail }: any) => {
      const runningNodeId = Number(detail)
      console.log('* executing', detail, status.value.generation)
      
      if (runningNodeId) {
        status.value.generation = 'generating'
        graphStore.setRunningNodeId(runningNodeId)
        graphStore.clearNodePreviewImages(runningNodeId)
      } else {
        status.value.generation = 'idle'
        mainStore.updateProgress(null)
        graphStore.setRunningNodeId(null)
      }
    })

    api.addEventListener('executed', ({ detail }: any) => {
      const nodeId = Number(detail.node)
      console.log('* executed node', nodeId)
    })

    api.addEventListener('execution_error', ({ detail }: any) => {
      status.value.generation = 'idle'

      graphStore.setLastExecutionError(detail)
      const formattedError = formatExecutionError(detail)
      console.error('* execution error', formattedError)
    })

    api.addEventListener('execution_interrupted', ({ detail }: any) => {
      console.log('* execution interrupted')
      status.value.generation = 'idle'
      mainStore.updateProgress(null)
      graphStore.setRunningNodeId(null)
    })

    api.addEventListener('execution_cached', ({ detail }: any) => {
      console.log('* execution cached')
    })

    api.addEventListener('crystools.monitor', ({ detail }: any) => {
      mainStore.updatePerformance(detail)
    })

    api.addEventListener('b_preview', ({ detail }: any) => {
      const nodeId = graphStore.getRunningNodeId()

      if (nodeId) {
        status.value.generation = 'generating'
        const blob = detail
        const blobUrl = URL.createObjectURL(blob)
        graphStore.setNodePreviewImages(nodeId, [blobUrl])
        graphStore.setCurrentPreviewImage(blobUrl)
      }
    })
  }
}
