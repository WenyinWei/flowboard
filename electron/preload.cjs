const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('flowboard', {
  detectInterpreters: () => ipcRenderer.invoke('detect-interpreters'),
  detectCompilers: () => ipcRenderer.invoke('detect-compilers'),
  runCell: (payload) => ipcRenderer.invoke('run-cell', payload),
  saveWorkflow: (state) => ipcRenderer.invoke('save-workflow', state),
  loadWorkflow: () => ipcRenderer.invoke('load-workflow'),
  openInEditor: (payload) => ipcRenderer.invoke('open-in-editor', payload)
});
