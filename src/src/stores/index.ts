import { createPinia } from 'pinia'
import { useMainStore } from './mainStore'
import { useEditorStore } from './editorStore'
import { useGraphStore } from './graphStore'
import { useModelStore } from './modelStore'

export const pinia = createPinia()
export { storeToRefs } from 'pinia'
export { useMainStore } from './mainStore'
export { useEditorStore } from './editorStore'
export { useGraphStore } from './graphStore'
export { useModelStore } from './modelStore'

export const resetAllStores = () => {
  useMainStore().reset()
  useEditorStore().reset()
  useGraphStore().reset()
  useModelStore().reset()
}

export const isBrowser = typeof window !== "undefined"
export const isDev = process.env.NODE_ENV === "development"
