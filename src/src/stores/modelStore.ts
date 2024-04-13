import { api } from '@/apis'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { samplerList } from '@/stores/maps/samplers'

const defPromptTracks = [
  {
    trackId: 0,
    name: 'Track 1',
    muted: false,
    solo: false,
    height: 38,
    blocks: [
      {
        id: 'e30',
        prompt: "a giant eggplant in a garden",
        start: 0.00,
        end: 0.35
      },
      {
        id: 'e55',
        prompt: "electric terrifying clouds in the background",
        start: 0.39,
        end: 0.78
      },
      {
        id: 'e41',
        prompt: "greenery space",
        start: 0.70,
        end: 0.82
      }
    ]
  },
  {
    trackId: 1,
    name: 'Track 2',
    muted: false,
    solo: false,
    height: 38,
    blocks: [
      {
        id: 'e40',
        prompt: "a galaxy in a StarWar bio-mechanical spacecraft",
        start: 0.10,
        end: 0.63
      }
    ]
  },
  {
    trackId: 2,
    name: 'Track 3',
    muted: false,
    solo: false,
    height: 38,
    blocks: [
      {
        id: 'e50',
        prompt: "supergirl sitting on a spacecraft while wearing sexy spiderman outfit",
        start: 0.18,
        end: 0.75
      }
    ]
  },
  {
    trackId: 3,
    name: 'Track 4',
    muted: false,
    solo: false,
    height: 38,
    blocks: [
      {
        id: 'e60',
        prompt: "(wearing spiderman outfit:1.3)",
        start: 0.43,
        end: 1.00
      }
    ]
  },
  {
    trackId: 4,
    name: 'Track 5',
    muted: false,
    solo: false,
    height: 38,
    blocks: []
  },
  {
    trackId: 5,
    name: 'Track 6',
    muted: false,
    solo: false,
    height: 38,
    blocks: []
  }
]

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
    promptTracks: useStorage('promptTracks', defPromptTracks),
    imageGallery: useStorage('imageGallery', [] as any[]),
  }),
  
  actions: {
    reset() {
      this.modelMap = {}
      this.imageGallery = []
      this.parameters = defParameters
      this.promptTracks = defPromptTracks
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

      if (!models) {
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
