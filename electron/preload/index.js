import { contextBridge, ipcRenderer } from 'electron'

const SEND_CHANNELS = new Set([
  'ipListToMain',
  'connected',
  'installUpdateRequested',
  'runOnSystemStartupChanged',
])

const RECEIVE_CHANNELS = new Set([
  'ipListFromMain',
  'readyToInstall',
])

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => {
    if (!SEND_CHANNELS.has(channel)) return
    ipcRenderer.send(channel, data)
  },

  receive: (channel, func) => {
    if (!RECEIVE_CHANNELS.has(channel)) return () => {}

    const listener = (_event, ...args) => func(...args)
    ipcRenderer.on(channel, listener)

    return () => {
      ipcRenderer.removeListener(channel, listener)
    }
  },

  once: (channel, func) => {
    if (!RECEIVE_CHANNELS.has(channel)) return
    ipcRenderer.once(channel, (_event, ...args) => func(...args))
  },
})
