import { useMainStore } from '@/stores'

export class SDFXAPI extends EventTarget {
  #registered = new Set()
  connectionAttempts = 0
  token: string | null = null
  clientId: string = ''
  socket: WebSocket | null = null
  reconnectTimer: any = null

  constructor() {
    super()
  }

  /**
   * Initialises websocket connection
   */
  init() {
    this.connectionAttempts = 0
    this.#createSocket()
  }

  addEventListener(type: string, callback: any, options?: any) {
    super.addEventListener(type, callback, options)
    this.#registered.add(type)
  }

  connect(clientId: string, token: string | null) {
    if (!clientId) {
      console.error('Missing clientId')
    }

    this.clientId = clientId
    this.token = token
    this.init()
  }

  apiURL(route: string) {
    const mainStore = useMainStore()
    return mainStore.server.http_endpoint + route
  }

  /**
   * Get request to the API
   * @param route 
   * @param options 
   * @returns 
   */
  fetchApi(route: string, options?: any) {
    try {
      if (this.token) {
        options = {
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          ...options
        }
      }
      return fetch(this.apiURL(route), options)
    } catch (e) {
      console.error(e)
      return null
    }
  }

  /**
   * Sends a request to the API
   * @param {*} method The method (POST, PUT, DELETE, etc)
   * @param {*} body Optional PUT data
   */
  async restApi(method: string, route: string, body: any = null) {
    try {
      const payload = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token ? `Bearer ${this.token}` : null
        },
        body: body ? JSON.stringify(body) : undefined
      }

      return await this.fetchApi(route, payload)
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Creates and connects a WebSocket for realtime updates
   * @param {boolean} isReconnect If the socket is connection is a reconnect attempt
   */
  #createSocket(isReconnect = false) {
    if (this.socket) {
      return
    }

    const mainStore = useMainStore()
    const ws_endpoint = mainStore.server.ws_endpoint

    let opened = false
    let clientId = window.name

    this.socket = new WebSocket(`${ws_endpoint}/ws?clientId=${this.clientId}`)
    this.socket.binaryType = 'arraybuffer'

    this.socket.addEventListener('open', () => {
      opened = true

      /**
       * subscribe our user to global channel
       **/
      if (this.token) {
        console.log('# user subscribed to global channel')
        // @ts-ignore
        this.socket.send(JSON.stringify({
          type: 'auth',
          segment: 'global',
          data: { token: this.token }
        }))
      }

      if (isReconnect) {
        this.dispatchEvent(new CustomEvent('reconnected'))
      }
    })

    this.socket.addEventListener('error', () => {
      if (this.socket) this.socket.close()
    })

    this.socket.addEventListener('close', () => {
      this.reconnectTimer = setTimeout(() => {
        this.connectionAttempts++
        if (this.connectionAttempts>50) {
          console.log('Max connection attempts reached, giving up', this.connectionAttempts)
          clearTimeout(this.reconnectTimer)
        } else {
          this.socket = null
          this.#createSocket(true)
        }

        console.log('Connection Attempts', this.connectionAttempts)
        this.dispatchEvent(new CustomEvent('connectionAttempt', { detail: this.connectionAttempts}))
      }, 1000)
      if (opened) {
        this.dispatchEvent(new CustomEvent('status', { detail: null }))
        this.dispatchEvent(new CustomEvent('reconnecting'))
      }
    })

    this.socket.addEventListener('message', (event) => {
      try {
        if (event.data instanceof ArrayBuffer) {
          const view = new DataView(event.data)
          const eventType = view.getUint32(0)
          const buffer = event.data.slice(4)
          switch (eventType) {
            case 1:
              const view2 = new DataView(event.data)
              const imageType = view2.getUint32(0)
              let imageMime
              switch (imageType) {
                case 1:
                default:
                  imageMime = 'image/jpeg'
                  break
                case 2:
                  imageMime = 'image/png'
              }
              const imageBlob = new Blob([buffer.slice(4)], { type: imageMime })
              this.dispatchEvent(new CustomEvent('b_preview', { detail: imageBlob }))
              break
            default:
              throw new Error(`Unknown binary websocket message of type ${eventType}`)
          }
        } else {
          const msg = JSON.parse(event.data)
          switch (msg.type) {
            case 'status':
              if (msg.data.sid) {
                this.clientId = msg.data.sid
                window.name = this.clientId
              }
              this.dispatchEvent(new CustomEvent('status', { detail: msg.data.status }))
              break
            case 'progress':
              this.dispatchEvent(new CustomEvent('progress', { detail: msg.data }))
              break
            case 'executing':
              this.dispatchEvent(new CustomEvent('executing', { detail: msg.data.node }))
              break
            case 'executed':
              this.dispatchEvent(new CustomEvent('executed', { detail: msg.data }))
              break
            case 'execution_start':
              this.dispatchEvent(new CustomEvent('execution_start', { detail: msg.data }))
              break
            case 'execution_interrupted':
              this.dispatchEvent(new CustomEvent('execution_interrupted', { detail: msg.data }))
              break
            case 'execution_error':
              this.dispatchEvent(new CustomEvent('execution_error', { detail: msg.data }))
              break
            case 'execution_cached':
              this.dispatchEvent(new CustomEvent('execution_cached', { detail: msg.data }))
              break

            /* Crystools Monitor specific events */  
            case 'crystools.monitor':
              this.dispatchEvent(new CustomEvent('crystools.monitor', { detail: msg.data }))
              break

            /* SDFX specific events */  
            case 'ping':
              this.dispatchEvent(new CustomEvent('ping'))
              break
            case 'ready':
              this.dispatchEvent(new CustomEvent('ready', { detail: msg.data }))
              break
            case 'sdfx-server-status':
              this.dispatchEvent(new CustomEvent('sdfx-server-status', { detail: msg.data }))
              break
            case 'sdfx-task-insert':
              this.dispatchEvent(new CustomEvent('sdfx-task-insert', { detail: msg.data }))
              break
            case 'sdfx-task-update':
              this.dispatchEvent(new CustomEvent('sdfx-task-update', { detail: msg.data }))
              break
            default:
              if (this.#registered.has(msg.type)) {
                this.dispatchEvent(new CustomEvent(msg.type, { detail: msg.data }))
              } else {
                throw new Error(`Unknown message type ${msg.type}`)
              }
          }
        }
      } catch (error) {
        console.warn('Unhandled message:', event.data, error)
      }
    })
  }

  /* ------------------------------------------------- */

  /**
   * Get list of custom nodes
   * (need ComfyUI-Manager)
   */
  async getCustomNodes() {
    try {
      const resp: any = await this.fetchApi(`/customnode/getlist?mode=url&skip_update=true`)
      const json = await resp.json()
      return json.custom_nodes
    } catch (e) {
      console.error('Unable to fetch list of custom nodes.')
      return null
    }    
  } 
  
  async getCustomNodeMapping() {
    try {
      const resp: any = await this.fetchApi(`/customnode/getmappings?mode=local`)
      return await resp.json()
    } catch (e) {
      console.error('Unable to fetch mapping of custom nodes.')
      return null
    }    
  } 

  /*
  async getUnresolvedNodesInComponent() {
    try {
      const resp: any = await this.fetchApi(`/component/get_unresolved`)
      return await resp.json()
    } catch (e) {
      console.error('Unable to fetch unresolved nodes.')
      return null
    }    
  } 
  */

  /**
   * Reboot server
   */
  async reboot() {
    try {
      const resp: any = await this.restApi('GET', '/manager/reboot')
      return await resp.json()
    } catch (e) {
      console.error('Unable to reboot server.')
      return null
    }    
  }
  
  /**
   * Install a custom node
   */
  async installCustomNode(node: any) {
    try {
      const resp: any = await this.restApi('POST', '/customnode/install', node)
      return await resp.json()
    } catch (e) {
      console.error('Unable to install custom node.', node)
      return null
    }    
  }

  /**
   * Install a custom node
   */
  async uninstallCustomNode(node: any) {
    try {
      const resp: any = await this.restApi('POST', '/customnode/uninstall', node)
      return await resp.json()
    } catch (e) {
      console.error('Unable to install custom node.', node)
      return null
    }    
  }

  /**
   * Update a custom node
   */
  async updateCustomNode(node: any) {
    try {
      const resp: any = await this.restApi('POST', '/customnode/update', node)
      return await resp.json()
    } catch (e) {
      console.error('Unable to update custom node.', node)
      return null
    }    
  }

  /**
   * Fix a custom node
   */
  async fixCustomNode(node: any) {
    try {
      const resp: any = await this.restApi('POST', '/customnode/fix', node)
      return await resp.json()
    } catch (e) {
      console.error('Unable to fix custom node.', node)
      return null
    }    
  }

  /**
   * Toggle enable / disable a custom node
   */
  async toggleCustomNode(node: any) {
    try {
      const resp: any = await this.restApi('POST', '/customnode/toggle_active', node)
      return await resp.json()
    } catch (e) {
      console.error('Unable to toggle custom node.', node)
      return null
    }    
  }

  /**
   * Get current snapshot of custom nodes
   */
  async getCustomNodeSnapshot() {
    try {
      const resp: any = await this.restApi('GET', '/snapshot/get_current')
      return await resp.json()
    } catch (e) {
      console.error('Unable to get snapshot of custom nodes.')
      return null
    }    
  }

  /* ------------------------------------------------- */

  /**
   * Get checkpoint list
   * @returns checkpoint list
   */
  async getModels() {
    try {
      const resp: any = await this.fetchApi('/sdfx/model/list', { cache: 'no-store' })
      return await resp.json()
    } catch (e) {
      console.error('Unable to fetch /sdfx/model/list API, please use a SDFX compatible backend.')
      return null
    }    
  }

  /* ---------------------------------------------------------- */

  /**
   * Get workflow list
   * @returns workflow list
   */
  async getWorkflowList() {
    try {
      const resp: any = await this.fetchApi('/sdfx/workflow/list', { cache: 'no-store' })
      return await resp.json()
    } catch (e) {
      console.error('Unable to fetch /sdfx/workflow/list API, please use a SDFX compatible backend.')
      return null
    }    
  }

  /**
   * Get a specific workflow
   */
  async getWorkflow(uid: string) {
    try {
      const resp: any = await this.fetchApi(`/sdfx/workflow?uid=${uid}`)
      return await resp.json()
    } catch (e) {
      console.error('Unable to fetch workflow, please use a SDFX compatible backend.')
      return null
    }    
  } 

  /**
   * Add a new workflow
   * @returns workflow details and metadata
   */
  async addWorkflow(workflow: any) {
    try {
      const resp: any = await this.restApi('POST', '/sdfx/workflow', workflow)
      return await resp.json()
    } catch (e) {
      console.error('Unable to add new workflow, please use a SDFX compatible backend.')
      return null
    }    
  }

  /**
   * Update a workflow
   */
  async updateWorkflow(uid: string, workflow: any) {
    try {
      const resp: any = await this.restApi('PUT', `/sdfx/workflow?uid=${uid}`, workflow)
      return await resp.json()
    } catch (e) {
      console.error('Unable to update workflow, please use a SDFX compatible backend.')
      return null
    }    
  }

  /**
   * Delete a workflow
   */
  async removeWorkflow(uid: string) {
    try {
      const resp: any = await this.restApi('DELETE', `/sdfx/workflow?uid=${uid}`)
      return await resp.json()
    } catch (e) {
      console.error('Unable to delete workflow, please use a SDFX compatible backend.')
      return null
    }    
  }

  /* ---------------------------------------------------------- */

  /**
   * Get template list
   * @returns template list
   */
  async getTemplateList() {
    try {
      const resp: any = await this.fetchApi('/sdfx/template/list', { cache: 'no-store' })
      return await resp.json()
    } catch (e) {
      console.error('Unable to fetch /sdfx/template/list API, please use a SDFX compatible backend.')
      return null
    }    
  }

  /**
   * Get a specific template
   */
  async getTemplate(uid: string) {
    try {
      const resp: any = await this.fetchApi(`/sdfx/template?uid=${uid}`)
      return await resp.json()
    } catch (e) {
      console.error('Unable to fetch template, please use a SDFX compatible backend.')
      return null
    }    
  } 

  /**
   * Add a new template
   * @returns template details and metadata
   */
  async addTemplate(template: any) {
    try {
      const resp: any = await this.restApi('POST', '/sdfx/template', template)
      return await resp.json()
    } catch (e) {
      console.error('Unable to add new template, please use a SDFX compatible backend.')
      return null
    }    
  }

  /**
   * Update a template
   */
  async updateTemplate(uid: string, template: any) {
    try {
      const resp: any = await this.restApi('PUT', `/sdfx/template?uid=${uid}`, template)
      return await resp.json()
    } catch (e) {
      console.error('Unable to update template, please use a SDFX compatible backend.')
      return null
    }    
  }

  /**
   * Delete a template
   */
  async removeTemplate(uid: string) {
    try {
      const resp: any = await this.restApi('DELETE', `/sdfx/template?uid=${uid}`)
      return await resp.json()
    } catch (e) {
      console.error('Unable to delete template, please use a SDFX compatible backend.')
      return null
    }    
  }

  /* ---------------------------------------------------------- */

  /**
   * Get media details
   * @returns media details
   */
  async getMedia() {
    try {
      const resp: any = await this.fetchApi('/sdfx/media', { cache: 'no-store' })
      return await resp.json()
    } catch (e) {
      console.error('Unable to fetch /sdfx/media API, please use a SDFX compatible backend.')
      return null
    }    
  }

  /**
   * Upload a media (picture, video ...) in the gallery of a model
   * @returns The media uploaded
   */
  async uploadModelMedia({modelId, filename, blob, metadata, type}: any) {
    const formData = new FormData()
    formData.append('modelId', modelId)
    formData.append('file', blob, filename)
    formData.append('type', type)

    const resp: any = await this.fetchApi('/sdfx/media', {
      method: 'POST',
      body: formData
    })

    return await resp.json()
  }

  /* ---------------------------------------------------------- */

  /**
   * Gets a list of extension urls
   * @returns An array of script urls to import
   */
  async getExtensions() {
    const resp: any = await this.fetchApi('/extensions', { cache: 'no-store' })
    return await resp.json()
  }

  /**
   * Gets a list of embedding names
   * @returns An array of script urls to import
   */
  async getEmbeddings() {
    const resp: any = await this.fetchApi('/embeddings', { cache: 'no-store' })
    return await resp.json()
  }

  /**
   * Loads node object definitions for the graph
   * @returns The node definitions
   */
  async getNodeDefs() {
    const resp: any = await this.fetchApi('/object_info', { cache: 'no-store' })
    return await resp.json()
  }

  /**
   *
   * @param {number} number The index at which to queue the prompt, passing -1 will insert the prompt at the front of the queue
   * @param {object} prompt The prompt data to queue
   */
  async queuePrompt(number: number, { output, workflow }: any) {
    const body: any = {
      client_id: this.clientId,
      prompt: output,
      extra_data: { extra_pnginfo: { workflow } },
    }

    if (number === -1) {
      body.front = true
    } else if (number !== 0) {
      body.number = number
    }

    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token ? `Bearer ${this.token}` : null
      },
      body: JSON.stringify(body),
    }

    const res: any = await this.fetchApi('/prompt', payload)

    if (res.status !== 200) {
      throw {
        response: await res.json(),
      }
    }

    return await res.json()
  }

  /**
   * Loads a list of items (queue or history)
   * @param {string} type The type of items to load, queue or history
   * @returns The items of the specified type grouped by their status
   */
  async getItems(type: string) {
    if (type === 'queue') {
      return this.getQueue()
    }
    return this.getHistory()
  }

  /**
   * Gets the current state of the queue
   * @returns The currently running and queued items
   */
  async getQueue() {
    const { queue_running, queue_pending } = await this.getQueueSDFX()

    return {
      // Running action uses a different endpoint for cancelling
      Running: queue_running.map((prompt: string) => ({
        prompt,
        remove: {
          name: 'Cancel', 
          cb: () => api.interrupt()
        }
      })),
      Pending: queue_pending.map((prompt: string) => ({ prompt }))
    }
  }

  async getQueueSDFX() {
    try {
      const res: any = await this.fetchApi('/queue')
      const data = await res.json()
      return data
    } catch (error) {
      console.error(error)
      return {
        queue_running: [] as any,
        queue_pending: [] as any
      }
    }
  }

  async getHistorySDFX(max_items=200) {
    try {
      const res: any = await this.fetchApi(`/history?max_items=${max_items}`)
      return Object.values(await res.json())
    } catch (error) {
      console.error(error)
      return []
    }
  }

  /**
   * Gets the prompt execution history
   * @returns Prompt history including node outputs
   */
  async getHistory(max_items=50) {
    try {
      const res: any = await this.fetchApi(`/history?max_items=${max_items}`)
      return { History: Object.values(await res.json()) }
    } catch (error) {
      console.error(error)
      return { History: [] }
    }
  }

  /**
   * Sends a POST request to the API
   * @param {*} type The endpoint to post to
   * @param {*} body Optional POST data
   */
  async #post(type: string, body: any) {
    try {

      const payload = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token ? `Bearer ${this.token}` : null
        },
        body: body ? JSON.stringify(body) : undefined
      }

      await this.fetchApi('/' + type, payload)
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Deletes an item from the specified list
   * @param {string} type The type of item to delete, queue or history
   * @param {number} id The id of the item to delete
   */
  async deleteItem(type: string, id: number) {
    await this.#post(type, { delete: [id] })
  }

  /**
   * Clears the specified list
   * @param {string} type The type of list to clear, queue or history
   */
  async clearItems(type: string) {
    await this.#post(type, { clear: true })
  }

  /**
   * Interrupts the execution of the running prompt
   */
  async interrupt() {
    await this.#post('interrupt', null)
  }
}

export const api = new SDFXAPI()
