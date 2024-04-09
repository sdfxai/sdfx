// import { storeToRefs } from 'pinia'
import { useMainStore, useModelStore } from '@/stores'

export const debounce = (func: any, wait: number) => {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const fnv1aHash = (str: string) => {
  const FNV_OFFSET_BASIS_32 = 0x811c9dc5
  const FNV_PRIME_32 = 0x01000193
  
  let hash = FNV_OFFSET_BASIS_32
  
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash *= FNV_PRIME_32
  }

  // Ensure positive 32-bit integer
  return hash >>> 0
}

export const getTempFileName = (extention: string) => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  return `temp_${timestamp}_${randomString}.${extention}`
}

export const saveImageFile = (filename: string, url: string, fileselector=true) => {
  const a = document.createElement('a')
  if (fileselector) {
    a.href = url
  } else {
    // TODO: Check with Vincent why a.url = url
    // @ts-ignore
    a.url = url
  }
  a.setAttribute('download', filename)
  document.body.appendChild(a)
  a.style.display = 'none'
  a.click()
  requestAnimationFrame(() => a.remove())
}

export const saveJSONFile = (filename: string, obj: any, fileselector=true) => {
  // convert obj to a JSON string
  const json = JSON.stringify(obj, null, 2)
  const blob = new Blob([json], {type: 'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  if (fileselector) {
    a.href = url
  } else {
    // TODO: Check with Vincent why a.url = url
    // @ts-ignore
    a.url = url
  }
  a.setAttribute('download', filename)
  document.body.appendChild(a)
  a.style.display = 'none'
  a.click()
  requestAnimationFrame(() => {
    a.remove()
    window.URL.revokeObjectURL(url)
  })
}