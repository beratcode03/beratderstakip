const { contextBridge, ipcRenderer } = require('electron');

// Electron API'lerini güvenli şekilde frontend'e aç
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  // Window state listener
  onMaximizeChange: (callback) => {
    ipcRenderer.on('window-maximize-change', (_, isMaximized) => callback(isMaximized));
  }
});

// Kurulum için ayrı context
contextBridge.exposeInMainWorld('electron', {
  setupComplete: () => ipcRenderer.send('setup-complete')
});
