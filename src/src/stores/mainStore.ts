import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

const defStatus = () => ({
  ready: false,
  spinning: false,
  socket: 'disconnected', /* disconnected | connecting | connected | error */
  generation: 'idle', /* idle | started | generating */
  isSocketConnected: false,
  isLeftPaneVisible: false,
  isRightPaneVisible: true,
  isBottomPaneVisible: false,
  isNavigatorPaneVisible: false
})

const defProgress = {
  percent: 0.00,
  runningNodeId: null,
  runningNodeTitle: null,
  averageStepDuration: 0,
  remainingSteps: 0,
  stepsPerSecond: 0,
  currentStep: 0,
  totalSteps: 0,
  eta: 0,
  currentImage: null,
  job_count: 0,
  job_no: 0,
}

export const useMainStore = defineStore('mainStore', {
  state: () => ({
    darkMode: useStorage('vueuse-color-scheme', 'dark'),
    fontSize: useStorage('fontSize', 0.85),
    status: useStorage('status', defStatus()),
    progress: useStorage('progress', defProgress),

    server: useStorage('server', {
      clientId: null as string | null,
      token: null as string | null,
      ws_endpoint: null as string | null,
      http_endpoint: null as string | null,
      host: null as string | null
    }),

    workspaces: useStorage('workspaces', {
      selectedId: 'main', /* current selected workspace id */

      spaces: [
        {
          id: 'main',
          title: 'Main View',
          data: {}
        },
        {
          id: 'graph',
          title: 'Graph View',
          data: {}
        }
      ]
    })
  }),

  actions: {
    reset() {
      this.status = defStatus()
      this.progress = defProgress
    },

    spinner(bool: boolean) {
      this.status.spinning = bool
    },

    setAuthToken(token: string) {
      this.server.token = token
    },

    getAuthToken() {
      return this.server.token
    },

    setClientId(clientId: string) {
      this.server.clientId = clientId
    },

    getClientId() {
      return this.server.clientId
    },

    setEndpointURLs({http_endpoint, ws_endpoint}: any) {
      const u = new URL(http_endpoint)
      if (!u.origin) {
        console.error('Invalid or missing .env', http_endpoint)
        return
      }

      this.server.host = u.host
      this.server.http_endpoint = http_endpoint
      this.server.ws_endpoint = ws_endpoint
    },

    setupHTTPHost(host: string) {
      const u = new URL(host)
      if (!u.origin) {
        console.error('Invalid HTTP server URL', host)
        return
      }

      this.server.host = u.host

      if (u.protocol==='http:') {
        this.server.http_endpoint = `http://${u.host}`
      }

      if (u.protocol==='https:') {
        this.server.http_endpoint = `https://${u.host}`
      }
    },

    setupWSHost(host: string) {
      this.server.ws_endpoint = host
    },

    setupHostFromURL(host: string) {
      const u = new URL(host)
      if (!u.origin) {
        console.error('Invalid host URL', host)
        return
      }

      this.server.host = u.host

      if (u.protocol==='http:') {
        this.server.http_endpoint = `http://${u.host}`
        this.server.ws_endpoint = `ws://${u.host}`
      }

      if (u.protocol==='https:') {
        this.server.http_endpoint = `https://${u.host}`
        this.server.ws_endpoint = `wss://${u.host}`
      }
    },

    updateProgress(progress: any) {
      if (progress) {
        this.progress = progress
      } else {
        this.progress = {
          percent: 0.00,
          runningNodeId: null,
          runningNodeTitle: null,
          averageStepDuration: 0,
          remainingSteps: 0,
          stepsPerSecond: 0,
          currentStep: 0,
          totalSteps: 0,
          eta: 0,
          currentImage: null,
          job_count: 0,
          job_no: 0,
        }
      }
    },

    setFontSize(size: number) {
      this.fontSize = size
    },

    setSocketStatus(socketStatus: string) {
      this.status.socket = socketStatus
      this.status.isSocketConnected = socketStatus==='connected' ? true : false
      // console.log('#socket:', socketStatus)
    },

    setLeftPane(isLeftPaneVisible: boolean) {
      this.status.isLeftPaneVisible = isLeftPaneVisible
    },

    toggleLeftPane() {
      this.status.isLeftPaneVisible = !this.status.isLeftPaneVisible
    },

    setRightPane(isRightPaneVisible: boolean) {
      this.status.isRightPaneVisible = isRightPaneVisible
    },
    
    toggleRightPane() {
      this.status.isRightPaneVisible = !this.status.isRightPaneVisible
    },

    setBottomPane(isBottomPaneVisible: boolean) {
      this.status.isBottomPaneVisible = isBottomPaneVisible
    },
    
    toggleBottomPane() {
      this.status.isBottomPaneVisible = !this.status.isBottomPaneVisible
    }
  }
})

