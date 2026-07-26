/// <reference types="vite/client" />

interface ElectronAPI {
  getSystemInfo: () => Promise<{ platform: string; arch: string; version: string; electronVersion: string }>;
  scanBarcode: () => Promise<{ success: boolean; data: string | null; message: string }>;
  printReceipt: (data: { content: string; copies?: number }) => Promise<{ success: boolean; error?: string }>;
  saveOfflineData: (key: string, value: unknown) => Promise<{ success: boolean }>;
  getOfflineData: (key: string) => Promise<unknown>;
  getOfflineDataKeys: () => Promise<string[]>;
  onNavigate: (callback: (path: string) => void) => void;
  removeAllListeners: (channel: string) => void;
}

interface Window {
  electronAPI?: ElectronAPI;
}
