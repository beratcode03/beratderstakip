# ELECTRON ACTIVITY-LOGGER.CJS - DETAYLI KOD AÇIKLAMASI

## GİRİŞ

Bu doküman, Electron activity logger'ın (`electron/activity-logger.cjs`) tüm kodunu detaylı açıklar.

**Dosya Konumu:** `electron/activity-logger.cjs`  
**Amaç:** Kullanıcı aktivitelerini kaydetmek, yedeklemek ve activity window'da göstermek

---

## BÖLÜM 1: ACTIVITY LOGGER MİMARİSİ

### 1.1 Genel Bakış

Activity Logger şu görevleri yerine getirir:
1. **Aktivite Kaydetme** - Tüm kullanıcı işlemlerini log'lar
2. **Dosya Yönetimi** - JSON dosyasına yazar
3. **Activity Window** - Ayrı pencerede aktiviteleri gösterir
4. **Yedekleme** - Otomatik backup sistemi

### 1.2 Aktivite Türleri

```javascript
// Server'dan gelen aktiviteler
logActivity('Görev Eklendi', 'Matematik Türev Çalış');
logActivity('Deneme Sınav Eklendi', 'TYT Deneme 5');
logActivity('Görev Tamamlandı', 'Fizik Konu Tekrarı');
```

Her aktivite şu bilgileri içerir:
- `action` - Ne yapıldı?
- `description` - Detay
- `timestamp` - Ne zaman? (Türkiye saati)

---

## BÖLÜM 2: DOSYA YAPISI VE STORAGE

### 2.1 Activities Dosya Konumu

```javascript
const Store = require('electron-store');
const store = new Store();
const { app } = require('electron');
const fs = require('fs');
const path = require('path');

const ACTIVITIES_FILE = path.join(app.getPath('userData'), 'activities.json');
```

**Dosya Konumları (Platform bazlı):**

| Platform | Konum |
|----------|-------|
| Windows | `C:\Users\{user}\AppData\Roaming\berat-yks-analiz\activities.json` |
| macOS | `~/Library/Application Support/berat-yks-analiz/activities.json` |
| Linux | `~/.config/berat-yks-analiz/activities.json` |

**Neden userData?**
```javascript
// ✅ İYİ - userData (user writable)
app.getPath('userData')

// ❌ KÖTÜ - app path (read-only on macOS/Linux)
__dirname
```

### 2.2 Activities Array Structure

```json
[
  {
    "action": "Görev Eklendi",
    "description": "Matematik Türev Çalışması",
    "timestamp": "2025-10-30T14:30:45.123Z"
  },
  {
    "action": "Soru Kaydı Eklendi",
    "description": "TYT Matematik - 30D 5Y",
    "timestamp": "2025-10-30T15:15:20.456Z"
  }
]
```

**Array Avantajları:**
- Kolay ekleme (push)
- Kolay filtreleme
- Kolay sıralama (timestamp)
- JSON serialization kolay

---

## BÖLÜM 3: CORE FONKSİYONLAR

### 3.1 loadActivities()

```javascript
function loadActivities() {
  try {
    if (fs.existsSync(ACTIVITIES_FILE)) {
      const data = fs.readFileSync(ACTIVITIES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Activities yüklenirken hata:', error);
  }
  return [];
}
```

**Detaylı Açıklama:**

**1. Dosya Varlık Kontrolü**
```javascript
if (fs.existsSync(ACTIVITIES_FILE))
```
Eğer dosya yoksa (ilk çalıştırma), boş array döner.

**2. Senkron Okuma**
```javascript
fs.readFileSync(ACTIVITIES_FILE, 'utf-8')
```
**Neden sync?**
- Uygulama başlarken yüklenir (blocking OK)
- Async'e gerek yok (küçük dosya)

**3. Error Handling**
```javascript
try { ... } catch (error) {
  console.error('...', error);
  return [];
}
```
Eğer dosya corrupt ise boş array döner (uygulama crash olmaz).

**4. Return Value**
```javascript
return []; // Boş array fallback
```

### 3.2 saveActivities()

```javascript
function saveActivities(activities) {
  try {
    fs.writeFileSync(
      ACTIVITIES_FILE,
      JSON.stringify(activities, null, 2),
      'utf-8'
    );
  } catch (error) {
    console.error('Activities kaydedilirken hata:', error);
  }
}
```

**Detaylı Açıklama:**

**1. JSON Formatting**
```javascript
JSON.stringify(activities, null, 2)
```
- `null` - Replacer function yok
- `2` - Indentation 2 space (human-readable)

**Örnek Çıktı:**
```json
[
  {
    "action": "Görev Eklendi",
    "description": "Test",
    "timestamp": "2025-10-30..."
  }
]
```

**vs. Compressed:**
```json
[{"action":"Görev Eklendi","description":"Test","timestamp":"2025-10-30..."}]
```

**2. Senkron Yazma**
```javascript
fs.writeFileSync()
```
**Neden sync?**
- Veri kaybı riski yok (block edene kadar bitmeli)
- Küçük dosya (fast)

**3. Error Handling**
Dosya yazma başarısız olursa (disk full, permission error):
- Error log edilir
- Uygulama crash olmaz

### 3.3 addActivity()

```javascript
function addActivity(action, description = '') {
  const activities = loadActivities();
  
  const activity = {
    action,
    description,
    timestamp: new Date().toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Istanbul'
    })
  };
  
  activities.unshift(activity); // Başa ekle
  
  // Limit: 1000 aktivite
  if (activities.length > 1000) {
    activities.pop(); // Son aktiviteyi sil
  }
  
  saveActivities(activities);
  
  // Notify activity window
  if (activityWindow && !activityWindow.isDestroyed()) {
    activityWindow.webContents.send('activities-updated', activities);
  }
  
  return activity;
}
```

**Detaylı Açıklama:**

**1. Timestamp Formatting**
```javascript
new Date().toLocaleString('tr-TR', {
  day: '2-digit',        // 01, 02, ..., 31
  month: 'long',         // Ocak, Şubat, ...
  year: 'numeric',       // 2025
  hour: '2-digit',       // 00-23
  minute: '2-digit',     // 00-59
  second: '2-digit',     // 00-59
  timeZone: 'Europe/Istanbul'  // Türkiye saati
})
```

**Örnek Çıktı:**
```
30 Ekim 2025 14:30:45
```

**2. Array Beginning Insert**
```javascript
activities.unshift(activity); // Başa ekle
```

**unshift() vs push():**
| Method | Konum | Kullanım |
|--------|-------|----------|
| `unshift()` | Başa ekle | En yeni aktivite en üstte |
| `push()` | Sona ekle | En yeni aktivite en altta |

**Activity list'te en yeni üstte olmalı:**
```
[✓] 14:30 - Görev Eklendi        (NEWEST)
[✓] 14:15 - Soru Kaydı Eklendi
[✓] 14:00 - Deneme Sınav Eklendi (OLDEST)
```

**3. Limit Enforcement**
```javascript
if (activities.length > 1000) {
  activities.pop(); // Son (en eski) aktiviteyi sil
}
```

**Neden limit?**
- Dosya boyutu kontrolü (1000 aktivite ≈ 100KB)
- Performance (array iteration)
- Memory usage

**4. Activity Window Update**
```javascript
if (activityWindow && !activityWindow.isDestroyed()) {
  activityWindow.webContents.send('activities-updated', activities);
}
```

**Real-time Update:**
- Eğer activity window açıksa
- Hemen yeni aktivite gösterilir
- IPC message ile renderer'a gönderilir

---

## BÖLÜM 4: ACTIVITY WINDOW

### 4.1 createActivityWindow()

```javascript
function createActivityWindow() {
  if (activityWindow && !activityWindow.isDestroyed()) {
    activityWindow.focus();
    return;
  }
  
  activityWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Aktivite Geçmişi',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });
  
  activityWindow.loadFile('activity.html');
  
  activityWindow.on('closed', () => {
    activityWindow = null;
  });
}
```

**Detaylı Açıklama:**

**1. Singleton Pattern**
```javascript
if (activityWindow && !activityWindow.isDestroyed()) {
  activityWindow.focus();
  return;
}
```
**Neden?**
- Aynı anda birden fazla activity window olmasın
- Varsa focus et (ön plana getir)

**2. Window Dimensions**
```javascript
width: 800,
height: 600,
```
Activity list için ideal boyut (not too big, not too small).

**3. Security Settings**
```javascript
webPreferences: {
  contextIsolation: true,   // ✅ Güvenlik
  nodeIntegration: false,   // ✅ Güvenlik
  preload: path.join(__dirname, 'preload.cjs')
}
```

**4. HTML Loading**
```javascript
activityWindow.loadFile('activity.html');
```

**activity.html yapısı:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Aktivite Geçmişi</title>
  <style>
    /* ... styling ... */
  </style>
</head>
<body>
  <div id="activities-list"></div>
  <script>
    window.electronAPI.onActivitiesUpdated((activities) => {
      renderActivities(activities);
    });
  </script>
</body>
</html>
```

**5. Cleanup on Close**
```javascript
activityWindow.on('closed', () => {
  activityWindow = null;
});
```
Window kapatıldığında reference'ı temizle (memory leak önlenir).

---

## BÖLÜM 5: IPC HANDLERS

### 5.1 get-activities

```javascript
ipcMain.handle('get-activities', async () => {
  return loadActivities();
});
```

**Renderer kullanımı:**
```typescript
const activities = await window.electronAPI.getActivities();
console.log(`Toplam ${activities.length} aktivite`);
```

### 5.2 add-activity

```javascript
ipcMain.handle('add-activity', async (event, action, description) => {
  return addActivity(action, description);
});
```

**Renderer kullanımı:**
```typescript
await window.electronAPI.addActivity('Manuel Log', 'Test aktivite');
```

### 5.3 clear-activities

```javascript
ipcMain.handle('clear-activities', async () => {
  saveActivities([]);
  return true;
});
```

**Renderer kullanımı:**
```typescript
const confirmed = confirm('Tüm aktiviteler silinecek. Emin misiniz?');
if (confirmed) {
  await window.electronAPI.clearActivities();
}
```

### 5.4 export-activities

```javascript
ipcMain.handle('export-activities', async () => {
  const { dialog } = require('electron');
  const activities = loadActivities();
  
  const result = await dialog.showSaveDialog({
    title: 'Aktiviteleri Dışa Aktar',
    defaultPath: `aktiviteler-${new Date().toISOString().split('T')[0]}.json`,
    filters: [
      { name: 'JSON', extensions: ['json'] }
    ]
  });
  
  if (!result.canceled) {
    fs.writeFileSync(
      result.filePath,
      JSON.stringify(activities, null, 2),
      'utf-8'
    );
    return { success: true, path: result.filePath };
  }
  
  return { success: false };
});
```

**Detaylı Açıklama:**

**1. Default File Name**
```javascript
defaultPath: `aktiviteler-${new Date().toISOString().split('T')[0]}.json`
```
Örnek: `aktiviteler-2025-10-30.json`

**2. File Filters**
```javascript
filters: [{ name: 'JSON', extensions: ['json'] }]
```
Sadece .json uzantılı dosyalar gösterilir.

**3. Success Response**
```javascript
return { success: true, path: result.filePath };
```

**Renderer kullanımı:**
```typescript
const result = await window.electronAPI.exportActivities();
if (result.success) {
  alert(`Aktiviteler kaydedildi: ${result.path}`);
}
```

---

## BÖLÜM 6: OTOMATIK YEDEKLEME SİSTEMİ

### 6.1 Backup Schedule

```javascript
function scheduleBackup() {
  // Her gün saat 00:00'da backup al
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const msUntilMidnight = tomorrow.getTime() - now.getTime();
  
  setTimeout(() => {
    backupActivities();
    scheduleBackup(); // Recursive
  }, msUntilMidnight);
}
```

**Detaylı Açıklama:**

**1. Next Midnight Calculation**
```javascript
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);
```

**Örnek:**
```
Şimdi: 2025-10-30 14:30:00
Yarın gece: 2025-10-31 00:00:00
Kalan süre: 9 saat 30 dakika
```

**2. Recursive Scheduling**
```javascript
setTimeout(() => {
  backupActivities();
  scheduleBackup(); // Bir sonraki gün için
}, msUntilMidnight);
```

Her gün gece yarısı:
1. Backup alınır
2. Bir sonraki gün için schedule edilir
3. Sonsuz loop

### 6.2 backupActivities()

```javascript
function backupActivities() {
  try {
    const activities = loadActivities();
    const backupDir = path.join(app.getPath('userData'), 'backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupFile = path.join(backupDir, `activities-backup-${timestamp}.json`);
    
    fs.writeFileSync(
      backupFile,
      JSON.stringify(activities, null, 2),
      'utf-8'
    );
    
    console.log(`✅ Activities backup oluşturuldu: ${backupFile}`);
    
    // Eski backupları temizle (30 günden eski)
    cleanOldBackups(backupDir);
    
  } catch (error) {
    console.error('❌ Backup hatası:', error);
  }
}
```

**Detaylı Açıklama:**

**1. Backup Directory**
```javascript
const backupDir = path.join(app.getPath('userData'), 'backups');
```
Konum: `userData/backups/`

**2. Directory Creation**
```javascript
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}
```
`recursive: true` → Parent folder'lar da oluşturulur.

**3. Timestamp Formatting**
```javascript
const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
```

**Örnek:**
```
ISO: 2025-10-30T14:30:45.123Z
Replace :: 2025-10-30T14-30-45.123Z
Split .: 2025-10-30T14-30-45
```

**Dosya adı:** `activities-backup-2025-10-30T14-30-45.json`

### 6.3 cleanOldBackups()

```javascript
function cleanOldBackups(backupDir) {
  try {
    const files = fs.readdirSync(backupDir);
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    
    files.forEach(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > thirtyDaysMs) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Eski backup silindi: ${file}`);
      }
    });
  } catch (error) {
    console.error('Backup temizleme hatası:', error);
  }
}
```

**Detaylı Açıklama:**

**1. 30 Gün Hesaplama**
```javascript
const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
```
= 2,592,000,000 ms

**2. File Age Check**
```javascript
const stats = fs.statSync(filePath);
if (now - stats.mtimeMs > thirtyDaysMs) {
  // 30 günden eski
}
```

**mtimeMs:** Dosya son değiştirilme zamanı (milliseconds).

**3. File Deletion**
```javascript
fs.unlinkSync(filePath);
```

**Örnek Senaryo:**
```
Bugün: 2025-10-30
Backup 1: activities-backup-2025-10-01.json (29 gün önce) → SAKLA
Backup 2: activities-backup-2025-09-25.json (35 gün önce) → SİL
```

---

## ÖZET

**Activity Logger Özellikleri:**
1. ✅ Aktivite kaydetme (action, description, timestamp)
2. ✅ JSON file storage (userData/activities.json)
3. ✅ Activity window (ayrı pencere)
4. ✅ Real-time updates (IPC)
5. ✅ Export aktiviteler
6. ✅ Clear aktiviteler
7. ✅ Otomatik backup (her gün gece yarısı)
8. ✅ Eski backup temizleme (30 gün)
9. ✅ 1000 aktivite limiti

**Dosya Yapısı:**
```
userData/
├── activities.json           # Ana aktivite dosyası
└── backups/                  # Backup klasörü
    ├── activities-backup-2025-10-30T00-00-00.json
    ├── activities-backup-2025-10-29T00-00-00.json
    └── ...
```

**IPC API:**
- `get-activities` → Tüm aktiviteleri getir
- `add-activity` → Yeni aktivite ekle
- `clear-activities` → Tüm aktiviteleri sil
- `export-activities` → JSON export

