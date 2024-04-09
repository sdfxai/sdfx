import { lstat } from 'fs/promises'
import { cwd } from 'process'
import { ipcRenderer } from 'electron'

/*
ipcRenderer.on('main-process-message', (event, ...args) => {
  console.log('[Receive Main-process message]:', ...args)
})

const stats = await lstat(cwd())
console.log('[fs.lstat]', stats)

*/

export const NodeAPI = {
  init() {

  }
}
