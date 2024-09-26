import { ref, Ref } from 'vue'

type Callback = (...args: any[]) => void

const generateRandomHash = ()=>{
  return Math.random().toString(36).substring(2, 18)
}

class ComfyPlugin {
  public iframe: Ref<HTMLIFrameElement | null> = ref(null)
  private eventListeners: { [key: string]: Callback[] } = {}

  init() {
    const iframe = document.createElement('iframe')

    /* 'allow-same-origin' should only be set for certified super plugins */

    iframe.sandbox.add(
      'allow-same-origin',
      'allow-scripts',
      'allow-popups',
      'allow-forms',
      'allow-modals'
    )

    iframe.allow = 'camera; microphone; geolocation'
    iframe.style.border = 'none'
    iframe.style.width = '100%'
    iframe.style.height = '100%'

    this.iframe.value = iframe

    window.removeEventListener('message', this.handleMessage.bind(this))
    window.addEventListener('message', this.handleMessage.bind(this))
  }

  loadUrl(url: string) {
    if (this.iframe.value) {
      const urlObject = new URL(url)
      const hashParams = new URLSearchParams()
      hashParams.append('host', 'comfyEngine')
      hashParams.append('version', '2.3.2')
      hashParams.append('hash', generateRandomHash())
      urlObject.hash = hashParams.toString()
      this.iframe.value.src = urlObject.toString()
    }
  }

  reload() {
    if (this.iframe.value) {
      const currentSrc = this.iframe.value.src
      console.log('reload', currentSrc)
      this.iframe.value.src = 'about:blank'
      // Force DOM redraw
      this.iframe.value.offsetHeight
      
      setTimeout(() => {
        this.loadUrl(currentSrc)
      }, 10)
    }
  }

  private handleMessage(event: MessageEvent) {
    console.log('ComfyPlugin::handleMessage', event)
    if (!this.iframe.value?.src || event.origin !== new URL(this.iframe.value?.src || '').origin) {
      return
    }

    const { action, payload } = event.data
    this.emit(action, payload)
  }

  on(event: string, callback: Callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event].push(callback)
  }

  off(event: string, callback?: Callback) {
    if (!this.eventListeners[event]) return

    if (callback) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        cb => cb !== callback
      )
    } else {
      delete this.eventListeners[event]
    }
  }

  once(event: string, callback: Callback) {
    const onceCallback = (...args: any[]) => {
      this.off(event, onceCallback)
      callback(...args)
    }
    this.on(event, onceCallback)
  }

  private emit(event: string, ...args: any[]) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(...args))
    }
  }
  
  close() {
    window.removeEventListener('message', this.handleMessage.bind(this))
    this.eventListeners = {}

    /*
    if (this.iframe.value && this.iframe.value.parentNode) {
      this.iframe.value.parentNode.removeChild(this.iframe.value)
    }
    */

    this.iframe.value = null
  }

  resize(width: string, height: string) {
    if (this.iframe.value) {
      console.log('resize iframe')
      this.iframe.value.style.width = `100%`
      this.iframe.value.style.height = `100%`
    }
  }

  sendMessage(message: any) {
    if (this.iframe.value && this.iframe.value.contentWindow) {
      this.iframe.value.contentWindow.postMessage(message, '*')
    }
  }
}

export default new ComfyPlugin()