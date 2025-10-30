interface ElectronAPI {
  openExternal(url: string): Promise<void>;
  sendNotification(title: string, body: string): void;
  exitFullScreen(): void;
}

interface Window {
  electronAPI?: ElectronAPI;
}
