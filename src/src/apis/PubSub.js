export class EventEmitter {
  constructor() {
    this.events = {}
  }

  on(eventName, listener) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    this.events[eventName].push(listener)
  }

  emit(eventName, ...args) {
    const listeners = this.events[eventName]
    if (listeners) {
      listeners.forEach((listener) => listener.apply(null, args))
    }
  }

  off(eventName, listener) {
    const listeners = this.events[eventName]
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
    }
  }
}

export const PubSub = {
  emitters: [],

  getChannel(channel) {
    const exist = PubSub.emitters.find((x) => {
      return x.channel === channel
    })

    if (exist) {
      return exist.wsEmitter
    } else {
      const emitterObj = {
        channel,
        wsEmitter: new EventEmitter(),
      }
      PubSub.emitters.push(emitterObj)
      return emitterObj.wsEmitter
    }
  }
}