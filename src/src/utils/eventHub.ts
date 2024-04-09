class Hub {
  events: any = {}

  emit(event: string, data: any) {
    if (this.events[event]) {
      this.events[event].forEach((fn: any) => fn(data))
    }
  }

  off(event: string, fn: any) {
    if (!this.events[event]) return

    const idx = this.events[event].findIndex((f: any) => f === fn)
    if (idx>-1) {
      this.events[event].splice(idx, 1)
      // console.log('--- removed event subscription', event, this.events[event])
    }
  }

  on(event: string, fn: any) {
    if (this.events[event]) {
      const c = this.events[event].findIndex((f: any) => f === fn)
      if (c<=-1) {
        this.events[event].push(fn)
      }
    } else {
      this.events[event] = [fn]
    }

    // console.log('+++ new event subscription', event, this.events[event])
  }
}

export const eventHub = new Hub()