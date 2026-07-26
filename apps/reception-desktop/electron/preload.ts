import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  scanBarcode: () => ipcRenderer.invoke('scan-barcode'),
  printReceipt: (data: { content: string; copies?: number }) => ipcRenderer.invoke('print-receipt', data),
  saveOfflineData: (key: string, value: unknown) => ipcRenderer.invoke('save-offline-data', key, value),
  getOfflineData: (key: string) => ipcRenderer.invoke('get-offline-data', key),
  getOfflineDataKeys: () => ipcRenderer.invoke('get-offline-data-keys'),
  onNavigate: (callback: (path: string) => void) => {
    ipcRenderer.on('navigate', (_event, path) => callback(path));
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
