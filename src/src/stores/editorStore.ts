import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

const defEditorPreview = {
  image: null as any,
  mask: null as any,
  blend: null as any,
  width: 768,
  height: 768
}

const defEditor = {
  state: null as any,

  maskPaths: [] as any[],
  undoStack: [] as any[],
  redoStack: [] as any[],

  parameters: {
    relativeZoom: 0.08,
    brushSize: 50,
    drawingColor: 'rgba(255, 255, 255)',
  }
}

export const useEditorStore = defineStore('editorStore', {
  state: () => ({
    editorPreview: defEditorPreview,
    editor: useStorage('editor', defEditor)
  }),
  
  actions: {
    reset() {
      this.editor = defEditor
    }
  }
})
