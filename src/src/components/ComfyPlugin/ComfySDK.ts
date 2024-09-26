// ComfySDK.ts

class ComfySDK {
  private eventListeners: { [key: string]: Function[] } = {}

  constructor() {
    window.addEventListener('message', this.handleMessage.bind(this))
  }

  init() {
    console.log('-- ComfySDK initialized --')
  }

  close() {
    this.send({ action: 'close' })
  }

  on(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event].push(callback)
  }

  send(message: { action: string; payload?: any }) {
    window.parent.postMessage(message, '*')
  }

  resize(width: number, height: number) {
    this.send({ action: 'resize', payload: { width, height } })
  }

  private handleMessage(event: MessageEvent) {
    const { action, payload } = event.data
    if (this.eventListeners[action]) {
      this.eventListeners[action].forEach(callback => callback(payload))
    }
  }
}

export default new ComfySDK()