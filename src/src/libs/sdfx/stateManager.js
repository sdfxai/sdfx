const MAX_HISTORY = 50

function clone(obj) {
  try {
    if (typeof structuredClone !== 'undefined') {
      return structuredClone(obj)
    }
  } catch (error) {
    // structuredClone is stricter than using JSON.parse/stringify so fallback to that
  }

  return JSON.parse(JSON.stringify(obj))
}

function graphEqual(a, b, root = true) {
  if (a === b) return true

  if (typeof a == 'object' && a && typeof b == 'object' && b) {
    const keys = Object.getOwnPropertyNames(a)

    if (keys.length != Object.getOwnPropertyNames(b).length) {
      return false
    }

    for (const key of keys) {
      let av = a[key]
      let bv = b[key]
      if (root && key === 'nodes') {
        // Nodes need to be sorted as the order changes when selecting nodes
        av = [...av].sort((a, b) => a.id - b.id)
        bv = [...bv].sort((a, b) => a.id - b.id)
      }

      if (!graphEqual(av, bv, false)) {
        return false
      }
    }

    return true
  }

  return false
}

const bindInput = (activeEl) => {
  if (activeEl?.tagName !== 'CANVAS' && activeEl?.tagName !== 'BODY') {
    for (const evt of ['change', 'input', 'blur']) {
      if (`on${evt}` in activeEl) {
        const listener = () => {
          StateManager.update()
          activeEl.removeEventListener(evt, listener)
        }
        activeEl.addEventListener(evt, listener)
        return true
      }
    }
  }
}

const handleMouseUp = (e) => {
  StateManager.update()
}

const handleKeyDown = (e) => {
  requestAnimationFrame(async () => {
    const activeEl = document.activeElement
    if (activeEl?.tagName === 'INPUT' || activeEl?.type === 'textarea') {
      // Ignore events on inputs, they have their native history
      return
    }

    // Check if this is a ctrl+z or ctrl+y
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'y') {
        StateManager.redo()
        return true
      } else if (e.key === 'z') {
        StateManager.undo()
        return true
      }
    }

    // If our active element is some type of input then handle changes after they're done
    //if (bindInput(activeEl)) return
    // StateManager.update()
  })
}

export const StateManager = {
  undoStack: [],
  redoStack: [],
  lastState: null,
  initied: false,

  init(sdfx) {
    if (this.initied || !sdfx?.graph) return
    this.sdfx = sdfx
    window.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('mouseup', handleMouseUp, true)
    this.initied = true
  },

  destroy() {
    window.removeEventListener('keydown', handleKeyDown, true)
    document.removeEventListener('mouseup', handleMouseUp, true)
    this.initied = false
    this.lastState = null
    this.undoStack = []
    this.redoStack = []
  },

  reset() {
    if (!this.sdfx?.graph) return
    this.lastState = this.sdfx.graph.serialize()
    console.log('Reset Active State', this.lastState)
    this.undoStack = []
    this.redoStack = []
  },

  update() {
    if (!this.sdfx?.graph) return

    const currentState = this.sdfx.graph.serialize()

    if (!graphEqual(this.lastState, currentState)) {
      this.undoStack.push(this.lastState)
      console.log('ADD TO UNDO STACK', this.undoStack)

      if (this.undoStack.length > MAX_HISTORY) {
        this.undoStack.shift()
      }

      this.lastState = clone(currentState)
      this.redoStack.length = 0
    }
  },

  async updateState(source, target) {
    const prevState = source.pop()

    if (prevState) {
      target.push(this.lastState)
      await this.sdfx.loadGraphData(prevState, false)
      this.lastState = prevState
    }
  },

  undo() {
    if (this.undoStack.length === 0) return
    this.updateState(this.undoStack, this.redoStack)
    console.log('undo', this.undoStack)
    return this.undoStack
  },

  redo() {
    if (this.redoStack.length === 0) return
    this.updateState(this.redoStack, this.undoStack)
    return this.redoStack
  }
}
