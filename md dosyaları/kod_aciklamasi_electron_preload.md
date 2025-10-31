# ELECTRON PRELOAD.CJS - DETAYLI KOD AÇIKLAMASI

## GİRİŞ

Bu doküman, Electron preload script'inin (`electron/preload.cjs`) tüm kodunu satır satır açıklar.

**Dosya Konumu:** `electron/preload.cjs`  
**Satır Sayısı:** ~100 satır  
**Amaç:** Renderer process ile main process arasında güvenli IPC bridge oluşturmak

---

## BÖLÜM 1: PRELOAD SCRIPT NEDİR?

### 1.1 Electron Security Model

Electron'da 3 farklı process var:
1. **Main Process** - Node.js full access, dosya sistemi, OS API
2. **Renderer Process** - Web sayfası, HTML/CSS/JS, NO Node.js access (güvenlik)
3. **Preload Script** - Köprü, renderer'a güvenli API sağlar

**Güvenlik Nedeni:**
```javascript
// ❌ RENDERER'DA BU OLMASAYDI ÇOK TEHLİKELİ
const fs = require('fs');
fs.unlinkSync('/important-file'); // Kullanıcı kodu her şeyi silebilir!
```

**Preload ile:**
```javascript
// ✅ RENDERER sadece izin verilen API'leri kullanabilir
window.electronAPI.readFile('safe-path'); // Kontrollü
```

### 1.2 contextBridge Nedir?

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Sadece bu fonksiyonlar renderer'da kullanılabilir
  readFile: () => ipcRenderer.invoke('read-file'),
});
```

**Ne Yapar?**
- `window.electronAPI` objesi oluşturur
- Renderer process bu objeyi kullanabilir
- Main process ile güvenli iletişim

**Örnek Kullanım (Renderer):**
```typescript
const data = await window.electronAPI.readFile();
```

---

## BÖLÜM 2: PRELOAD.CJS KOD ANALİZİ

### 2.1 Import ve Context Bridge

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ... API methods ...
});
```

**Açıklama:**

**1. contextBridge**
- Electron'un güvenlik katmanı
- Renderer ile main process arasında güvenli köprü
- `exposeInMainWorld()` ile API expose edilir

**2. ipcRenderer**
- Renderer process'ten main process'e mesaj gönderir
- `send()` - Tek yönlü mesaj
- `invoke()` - Promise dönen mesaj (cevap beklenir)
- `on()` - Main'den gelen mesajları dinler

### 2.2 Window Kontrolü API

```javascript
minimizeWindow: () => ipcRenderer.send('minimize-window'),
maximizeWindow: () => ipcRenderer.send('maximize-window'),
closeWindow: () => ipcRenderer.send('close-window'),
```

**Açıklama:**

**Neden ipcRenderer.send()?**
```javascript
send() vs invoke()

send() → Tek yönlü, cevap beklenmez
invoke() → Promise, cevap döner
```

Window kontrolü için cevap gereksiz:
```javascript
// ✅ İyi
minimizeWindow: () => ipcRenderer.send('minimize-window')

// ❌ Gereksiz
minimizeWindow: () => ipcRenderer.invoke('minimize-window')
```

**Main Process Karşılığı:**
```javascript
// electron/main.cjs
ipcMain.on('minimize-window', () => {
  mainWindow.minimize();
});
```

### 2.3 Electron Store API

```javascript
getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
deleteStoreValue: (key) => ipcRenderer.invoke('delete-store-value', key),
```

**Detaylı Açıklama:**

**1. getStoreValue**
```javascript
getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key)
```

**Renderer'da kullanım:**
```typescript
const theme = await window.electronAPI.getStoreValue('theme');
console.log(theme); // 'dark' veya 'light'
```

**Main process karşılığı:**
```javascript
ipcMain.handle('get-store-value', async (event, key) => {
  return store.get(key);
});
```

**2. setStoreValue**
```javascript
setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value)
```

**Renderer'da kullanım:**
```typescript
await window.electronAPI.setStoreValue('theme', 'dark');
```

**3. deleteStoreValue**
```javascript
deleteStoreValue: (key) => ipcRenderer.invoke('delete-store-value', key)
```

**Kullanım:**
```typescript
await window.electronAPI.deleteStoreValue('old-setting');
```

### 2.4 Dialog API

```javascript
showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
```

**Detaylı Açıklama:**

**1. showOpenDialog**

**Renderer'da kullanım:**
```typescript
const result = await window.electronAPI.showOpenDialog({
  title: 'JSON Dosyası Seç',
  filters: [{ name: 'JSON', extensions: ['json'] }],
  properties: ['openFile']
});

if (!result.canceled) {
  console.log(result.filePaths[0]); // Seçilen dosya yolu
}
```

**Main process:**
```javascript
ipcMain.handle('show-open-dialog', async (event, options) => {
  return await dialog.showOpenDialog(options);
});
```

**2. showSaveDialog**

**Renderer'da kullanım:**
```typescript
const result = await window.electronAPI.showSaveDialog({
  title: 'Verileri Kaydet',
  defaultPath: 'backup.json',
  filters: [{ name: 'JSON', extensions: ['json'] }]
});

if (!result.canceled) {
  console.log(result.filePath); // Kaydedilecek dosya yolu
}
```

### 2.5 File System API

```javascript
readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
checkFileExists: (filePath) => ipcRenderer.invoke('check-file-exists', filePath),
```

**Detaylı Açıklama:**

**1. readFile**
```javascript
readFile: (filePath) => ipcRenderer.invoke('read-file', filePath)
```

**Renderer kullanım:**
```typescript
const content = await window.electronAPI.readFile('/path/to/file.json');
const data = JSON.parse(content);
```

**Main process:**
```javascript
ipcMain.handle('read-file', async (event, filePath) => {
  const fs = require('fs').promises;
  return await fs.readFile(filePath, 'utf-8');
});
```

**2. writeFile**
```javascript
writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data)
```

**Renderer kullanım:**
```typescript
const data = JSON.stringify({ tasks: [...] }, null, 2);
await window.electronAPI.writeFile('/path/to/backup.json', data);
```

**3. checkFileExists**
```javascript
checkFileExists: (filePath) => ipcRenderer.invoke('check-file-exists', filePath)
```

**Renderer kullanım:**
```typescript
const exists = await window.electronAPI.checkFileExists('/path/to/file.json');
if (exists) {
  console.log('Dosya mevcut');
}
```

### 2.6 App Info API

```javascript
getAppVersion: () => ipcRenderer.invoke('get-app-version'),
getPlatform: () => ipcRenderer.invoke('get-platform'),
```

**Detaylı Açıklama:**

**1. getAppVersion**
```javascript
getAppVersion: () => ipcRenderer.invoke('get-app-version')
```

**Renderer kullanım:**
```typescript
const version = await window.electronAPI.getAppVersion();
console.log(`Uygulama Versiyonu: ${version}`); // "1.0.0"
```

**Main process:**
```javascript
const { app } = require('electron');
ipcMain.handle('get-app-version', () => {
  return app.getVersion(); // package.json'daki version
});
```

**2. getPlatform**
```javascript
getPlatform: () => ipcRenderer.invoke('get-platform')
```

**Renderer kullanım:**
```typescript
const platform = await window.electronAPI.getPlatform();
if (platform === 'darwin') {
  console.log('macOS üzerinde çalışıyor');
} else if (platform === 'win32') {
  console.log('Windows üzerinde çalışıyor');
}
```

**Dönen değerler:**
- `'darwin'` - macOS
- `'win32'` - Windows
- `'linux'` - Linux

### 2.7 External Links API

```javascript
openExternal: (url) => ipcRenderer.invoke('open-external', url),
```

**Detaylı Açıklama:**

```javascript
openExternal: (url) => ipcRenderer.invoke('open-external', url)
```

**Ne yapar?**
URL'yi sistem default browser'ında açar (Electron window değil).

**Renderer kullanım:**
```typescript
await window.electronAPI.openExternal('https://github.com');
```

**Main process:**
```javascript
const { shell } = require('electron');
ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});
```

**Neden gerekli?**
```html
<!-- ❌ BU Electron window içinde açar -->
<a href="https://github.com">GitHub</a>

<!-- ✅ BU sistem browser'ında açar -->
<a onClick={() => window.electronAPI.openExternal('https://github.com')}>GitHub</a>
```

---

## BÖLÜM 3: TÜRKİYE HAVA DURUMU API

### 3.1 Kod Analizi

```javascript
getTurkiyeHavaDurumu: async () => {
  try {
    const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Istanbul&appid=YOUR_API_KEY&units=metric&lang=tr');
    return await response.json();
  } catch (error) {
    console.error('Hava durumu alınamadı:', error);
    throw error;
  }
}
```

**Detaylı Açıklama:**

**1. Neden preload'da fetch?**

Normal olarak renderer'da fetch yapılabilir, ama:
- API key güvenliği
- CORS sorunları
- Offline durumları handle etmek

**2. OpenWeather API Parametreleri**

```
https://api.openweathermap.org/data/2.5/weather
  ?q=Istanbul        # Şehir
  &appid=YOUR_KEY    # API key
  &units=metric      # Celsius
  &lang=tr           # Türkçe
```

**3. Response Formatı**

```json
{
  "weather": [{ "description": "parçalı bulutlu" }],
  "main": {
    "temp": 15.5,
    "feels_like": 14.2,
    "humidity": 65
  },
  "wind": { "speed": 3.5 }
}
```

**4. Renderer Kullanımı**

```typescript
const hava = await window.electronAPI.getTurkiyeHavaDurumu();
console.log(`Sıcaklık: ${hava.main.temp}°C`);
console.log(`Durum: ${hava.weather[0].description}`);
```

---

## BÖLÜM 4: ACTIVITY LISTENER

### 4.1 Kod Analizi

```javascript
onActivityLogged: (callback) => {
  ipcRenderer.on('activity-logged', (event, activity) => {
    callback(activity);
  });
}
```

**Detaylı Açıklama:**

**1. Ne yapar?**
Main process'ten gelen activity log mesajlarını dinler.

**2. Main Process Sender**

```javascript
// electron/main.cjs
function logActivity(action, description) {
  const activity = {
    action,
    description,
    timestamp: new Date().toISOString()
  };
  
  mainWindow.webContents.send('activity-logged', activity);
}
```

**3. Renderer Listener**

```typescript
window.electronAPI.onActivityLogged((activity) => {
  console.log(`[${activity.timestamp}] ${activity.action}: ${activity.description}`);
  // Activity list'e ekle
  activities.push(activity);
});
```

**4. Kullanım Senaryosu**

Kullanıcı bir görev eklediğinde:
1. Server: `logActivity('Görev Eklendi', 'Matematik Çalış')`
2. Main process: Activity'yi activity-logger'a kaydet
3. Renderer: `activity-logged` event ile bildirim göster

---

## BÖLÜM 5: TYPESCRİPT TİP TANIMLARI

### 5.1 ElectronAPI Interface

```typescript
declare global {
  interface Window {
    electronAPI: {
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      getStoreValue: (key: string) => Promise<any>;
      setStoreValue: (key: string, value: any) => Promise<void>;
      deleteStoreValue: (key: string) => Promise<void>;
      showOpenDialog: (options: any) => Promise<any>;
      showSaveDialog: (options: any) => Promise<any>;
      readFile: (filePath: string) => Promise<string>;
      writeFile: (filePath: string, data: string) => Promise<void>;
      checkFileExists: (filePath: string) => Promise<boolean>;
      getAppVersion: () => Promise<string>;
      getPlatform: () => Promise<string>;
      openExternal: (url: string) => Promise<void>;
      getTurkiyeHavaDurumu: () => Promise<any>;
      onActivityLogged: (callback: (activity: any) => void) => void;
    }
  }
}
```

**Neden bu gerekli?**

```typescript
// ❌ TypeScript hatası
window.electronAPI.minimizeWindow();
// Property 'electronAPI' does not exist on type 'Window'

// ✅ Type definition ile
// Hata yok, autocomplete çalışıyor
window.electronAPI.minimizeWindow();
```

---

## BÖLÜM 6: GÜVENLİK EN İYİ UYGULAMALARI

### 6.1 contextIsolation

```javascript
// electron/main.cjs - BrowserWindow options
webPreferences: {
  contextIsolation: true,  // ✅ GÜVENLİK
  nodeIntegration: false,  // ✅ GÜVENLİK
  preload: path.join(__dirname, 'preload.cjs')
}
```

**Neden contextIsolation?**

```javascript
// contextIsolation: false (❌ TEHLİKELİ)
// Renderer'da:
const fs = require('fs'); // Node.js access!

// contextIsolation: true (✅ GÜVENLİ)
// Renderer'da:
const fs = require('fs'); // ERROR: require is not defined
window.electronAPI.readFile(); // ✅ Sadece bu çalışır
```

### 6.2 API Filtering

```javascript
// ❌ KÖTÜ - Tüm ipcRenderer expose edilirse
contextBridge.exposeInMainWorld('electronAPI', ipcRenderer);

// ✅ İYİ - Sadece belirli metotlar
contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  // Sadece izin verilen işlemler
});
```

### 6.3 Input Validation

```javascript
// Main process'te validation
ipcMain.handle('read-file', async (event, filePath) => {
  // ❌ KÖTÜ
  return fs.readFileSync(filePath);
  
  // ✅ İYİ
  if (!filePath.startsWith(app.getPath('userData'))) {
    throw new Error('Invalid file path');
  }
  return fs.readFileSync(filePath);
});
```

---

## ÖZET

**Preload Script Görevleri:**
1. ✅ Güvenli IPC bridge (contextBridge)
2. ✅ Window control API
3. ✅ File system API (kontrollü)
4. ✅ Dialog API
5. ✅ Store API
6. ✅ External links API
7. ✅ Weather API
8. ✅ Activity logging

**Güvenlik:**
- contextIsolation: true
- nodeIntegration: false
- Sadece gerekli API'ler expose edilir
- Input validation main process'te

**Performans:**
- Minimal overhead
- Async/await pattern
- Error handling

