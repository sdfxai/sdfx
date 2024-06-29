import { api } from '@/apis'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

const defParameters = {
  selectedCheckpointId: null,
  preserveAspectRatio: true,

  SDFXCompatibleBackend: true,

  gallery: {
    mode: 'slider',
    nb_images: 1,
    grid: 12
  },

  advanced: {
    prompt: false
  }
}

export const useModelStore = defineStore('modelStore', {
  state: () => ({
    modelMap: useStorage('modelMap', {} as any),
    parameters: useStorage('parameters', defParameters),
    imageGallery: useStorage('imageGallery', [] as any[]),
  }),
  
  actions: {
    reset() {
      this.modelMap = {}
      this.imageGallery = []
      this.parameters = defParameters
    },

    updateImageGallery(images: any[]) {
      this.imageGallery = images
    },

    appendImageGallery(images: any[]) {
      this.imageGallery = [
        ...this.imageGallery,
        ...images
      ]
    },

    getCheckpointByName(name: string) {
      const modelList = Object.keys(this.modelMap)
      const models = modelList.map(modelId => this.modelMap[modelId])
      return models.find(model => model.name === name)
    },

    setCheckpointCoverId(modelId: string, coverId: string) {
      this.modelMap[modelId].coverId = coverId
    },

    getCheckpointList() {
      return Object.keys(this.modelMap).map((modelId) => (
        { ...this.modelMap[modelId] }
      ))
    },

    async uploadToMediaGallery({modelId, filename, blob, metadata, type}: any) {
      const media = await api.uploadModelMedia({modelId, filename, blob, metadata, type})
      this.modelMap[modelId].gallery.unshift(media)
    },

    async fetchModels() {
      const models: any[] = await api.getModels()

      if (!models || !models.length) {
        this.parameters.SDFXCompatibleBackend = false
        return
      }

      this.parameters.SDFXCompatibleBackend = true

      models.forEach(model => {
        const coverId: number = this.modelMap[model.modelId]?.cover || 0

        this.modelMap[model.modelId] = {
          coverId,
          ...model,
        }
      })
    }
  }
})
