# ELECTRON MAIN.CJS - DETAYLI KOD AÇIKLAMASI (BÖLÜM 1)

**📑 Hızlı Navigasyon:** [Ana Sayfa](../replit.md) | [Talimatlar](./talimatlar.md) | [Teknik Mimari](./teknik_mimari.md) | [Client Kodu](./kod_aciklamasi_client.md) | [Server Kodu](./kod_aciklamasi_server.md) | [Shared Kodu](./kod_aciklamasi_shared.md) | [Electron Activity](./kod_aciklamasi_electron_activity.md) | [Electron Preload](./kod_aciklamasi_electron_preload.md) | [Testler](./kod_aciklamasi_testler.md)

---

## 📚 İçindekiler

- [GENEL BAKIŞ](#genel-bakis)
- [BÖLÜM 1: İMPORTLAR VE GLOBAL DEĞİŞKENLER](#bolum-1-importlar-ve-global-degiskenler)
  - [1.1 Electron Modülleri](#11-electron-modulleri)
  - [1.2 Node.js Core Modülleri](#12-nodejs-core-modulleri)
  - [1.3 Activity Logger](#13-activity-logger)
  - [1.4 Global Değişkenler](#14-global-degiskenler)
- [BÖLÜM 2: .ENV DOSYASI YÜKLEME SİSTEMİ](#bolum-2-env-dosyasi-yukleme-sistemi)
  - [2.1 loadEnvFile() Fonksiyonu](#21-loadenvfile-fonksiyonu)
- [BÖLÜM 3: TEK İNSTANCE KİLİDİ (Single Instance Lock)](#bolum-3-tek-instance-kilidi-single-instance-lock)
  - [3.1 Single Instance Lock Implementasyonu](#31-single-instance-lock-implementasyonu)
- [BÖLÜM 4: DİZİN VE DOSYA YÖNETİMİ](#bolum-4-dizin-ve-dosya-yonetimi)
  - [4.1 ensureDirectoryExists() Fonksiyonu](#41-ensuredirectoryexists-fonksiyonu)
  - [4.2 ensureFileExists() Fonksiyonu](#42-ensurefileexists-fonksiyonu)
- [BÖLÜM 5: NODE ENVIRONMENT VALIDATION](#bolum-5-node-environment-validation)
  - [5.1 validateNodeEnvironment() Fonksiyonu](#51-validatenodeenvironment-fonksiyonu)
- [BÖLÜM 6: SERVER HAZIRLIK KONTROLÜ](#bolum-6-server-hazirlik-kontrolu)
  - [6.1 checkServerReady() Fonksiyonu](#61-checkserverready-fonksiyonu)
- [BÖLÜM 3: SERVER BAŞLATMA VE YÖNETİMİ](#bolum-3-server-baslatma-ve-yonetimi)
  - [3.1 startServer() Fonksiyonu](#31-startserver-fonksiyonu)
  - [3.2 restartServer() Fonksiyonu](#32-restartserver-fonksiyonu)
- [BÖLÜM 4: WINDOW OLUŞTURMA VE YÖNETİMİ](#bolum-4-window-olusturma-ve-yonetimi)
  - [4.1 createMainWindow() Fonksiyonu](#41-createmainwindow-fonksiyonu)
  - [4.2 createLogsWindow() Fonksiyonu](#42-createlogswindow-fonksiyonu)
  - [4.3 createActivitiesWindow() Fonksiyonu](#43-createactivitieswindow-fonksiyonu)
- [BÖLÜM 5: IPC HANDLERS VE EVENT LISTENERS](#bolum-5-ipc-handlers-ve-event-listeners)
  - [5.1 IPC (Inter-Process Communication)](#51-ipc-inter-process-communication)
  - [5.2 Preload Script](#52-preload-script)
- [BÖLÜM 6: TRAY ICON VE MENU SİSTEMİ](#bolum-6-tray-icon-ve-menu-sistemi)
  - [6.1 Tray Icon Oluşturma](#61-tray-icon-olusturma)
  - [6.2 Tray Menu](#62-tray-menu)
- [BÖLÜM 7: APP LIFECYCLE VE CLEANUP](#bolum-7-app-lifecycle-ve-cleanup)
  - [7.1 App Ready Event](#71-app-ready-event)
  - [7.2 Cleanup ve Shutdown](#72-cleanup-ve-shutdown)
  - [7.3 Auto-Archive Zamanlayıcı](#73-auto-archive-zamanlayici)
- [ÖZET VE TEKNİK DETAYLAR](#ozet-ve-teknik-detaylar)
  - [Electron Main Process Sorumlulukları](#electron-main-process-sorumluluklari)
  - [Güvenlik Best Practices](#guvenlik-best-practices)
  - [Performance Optimizations](#performance-optimizations)
- [KAYNAKLAR VE ÖĞRENME REFERANSLARI](#kaynaklar-ve-ogrenme-referanslari)

---

## GENEL BAKIŞ

`electron/main.cjs` dosyası, Berat Cankır YKS Analiz Takip Sistemi'nin Electron desktop uygulamasının ana işlem (main process) dosyasıdır. Bu dosya 1237 satırdan oluşur ve uygulamanın en kritik bileşenidir.

**Sorumluluklar:**
- Uygulama penceresini oluşturma ve yönetme
- Express Node.js server'ı başlatma ve kontrol etme
- IPC (Inter-Process Communication) ile renderer process ile iletişim
- System tray icon ve menü yönetimi
- Aktivite ve log kayıt sistemi
- Veri dosyalarının güvenli yönetimi
- Electron app lifecycle yönetimi

**Dosya Yapısı:**
```
electron/main.cjs
├── Import & Dependencies (Satır 1-12)
├── Global Variables (Satır 14-22)
├── Environment & Config (Satır 24-99)
├── Server Management (Satır 158-334)
├── Window Management (Satır 457-1000)
├── IPC Handlers (Satır 912-1050)
├── App Lifecycle (Satır 1050-1237)
└── Tray & Menu (Satır 700-900)
```

---

## BÖLÜM 1: İMPORTLAR VE GLOBAL DEĞİŞKENLER

### 1.1 Electron Modülleri

```javascript
const { app, BrowserWindow, ipcMain, Tray, Menu, dialog, shell, screen } = require('electron');
```

**Açıklama:**
- `app`: Electron uygulamasının lifecycle'ını kontrol eder (ready, quit, before-quit gibi eventler)
- `BrowserWindow`: Uygulama pencereleri oluşturur (main window, logs window, activities window)
- `ipcMain`: Renderer process'ten gelen mesajları dinler (frontend → backend iletişim)
- `Tray`: System tray'de icon gösterir (Windows'ta sağ altta, macOS'ta üstte)
- `Menu`: Context menu ve application menu oluşturur
- `dialog`: Native dialog'ları gösterir (file picker, alert, confirm)
- `shell`: İşletim sistemi shell komutlarını çalıştırır (dosya aç, link aç)
- `screen`: Ekran bilgilerini alır (çözünürlük, boyut)

**Neden bu modüller?**
Electron desktop app için bu modüller standart ve zorunludur. Alternatif yoktur çünkü Electron API'sinin bir parçasıdırlar.

### 1.2 Node.js Core Modülleri

```javascript
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
```

**Açıklama:**
- `path`: Dosya yollarını platform-agnostic şekilde oluşturur (Windows: `C:\Users\...`, Linux: `/home/...`)
- `spawn`: Child process oluşturur - Express server'ı başlatmak için kullanılır
- `fs`: Dosya sistemi işlemleri (okuma, yazma, silme, varlık kontrolü)

**Güvenlik Notu:**
`fs` kullanımı dikkatli yapılmalıdır. Tüm dosya işlemlerinde `path.join()` kullanarak path traversal saldırılarını önleriz.

### 1.3 Activity Logger

```javascript
const activityLogger = require('./activity-logger.cjs');
```

**Açıklama:**
Kullanıcı aktivitelerini loglar. Örnek aktiviteler:
- "Görev Eklendi" → Başlık bilgisiyle
- "Deneme Sınav Kaydedildi" → Deneme adıyla
- "Soru Kaydı Eklendi" → 25 soru - Matematik

**Mimari Karar:**
Activity logger ayrı bir modül olarak tasarlandı (separation of concerns). Bu sayede:
1. Kod daha modüler ve test edilebilir
2. Log formatı merkezi bir yerden yönetilir
3. İlerleye analytics eklemek kolay olur

### 1.4 Global Değişkenler

```javascript
let mainWindow = null;
let logsWindow = null;
let activitiesWindow = null;
let tray = null;
let serverProcess = null;
const PORT = 5000;
let serverLogs = [];
let lastClickTime = 0;
const DOUBLE_CLICK_THRESHOLD = 300; // 300ms for double click
```

**Detaylı Açıklama:**

**mainWindow (BrowserWindow | null)**
- Ana uygulama penceresi
- Kullanıcının çalıştığı ana arayüz
- React uygulaması bu pencerede render edilir
- `null` olması pencere kapalı demektir

**logsWindow (BrowserWindow | null)**
- Server loglarını gösteren pencere
- Developer mode için debug aracı
- Real-time log streaming yapar
- Electron menu'den açılır

**activitiesWindow (BrowserWindow | null)**
- Kullanıcı aktivitelerini listeleyen pencere
- "Ne yaptım bugün?" sorusuna cevap verir
- Activity logger'dan veri çeker

**tray (Tray | null)**
- System tray icon (Windows: sağ alt, macOS: üst bar)
- Kullanıcı pencereyi kapattığında app background'da çalışır
- Double-click ile pencere tekrar açılır
- Sağ click ile menü gösterir

**serverProcess (ChildProcess | null)**
- Express Node.js server'ın process referansı
- `spawn()` ile başlatılır
- `serverProcess.kill()` ile durdurulur
- stdout/stderr pipe'ları dinlenir

**PORT (const 5000)**
- Express server'ın dinlediği port
- Frontend'de de aynı port kullanılır
- Electron'da değiştirilemez (hard-coded)
- Production modda conflict riski yok (local environment)

**serverLogs (string[])**
- Server'dan gelen tüm loglar burada saklanır
- Maksimum 500 log (performans için)
- `serverLogs.shift()` ile en eskisi silinir (FIFO - First In First Out)
- Logs window bu array'i gösterir

**lastClickTime & DOUBLE_CLICK_THRESHOLD**
- Tray icon double-click detection için
- 300ms içinde 2 click = double click
- `Date.now() - lastClickTime < 300` kontrolü

**Performans Optimizasyonu:**
serverLogs array'i 500 ile sınırlı tutulur çünkü:
1. Memory leak önlenir
2. UI render hızlı kalır
3. 500 log = yaklaşık 50 KB memory (ihmal edilebilir)

---

## BÖLÜM 2: .ENV DOSYASI YÜKLEME SİSTEMİ

### 2.1 loadEnvFile() Fonksiyonu

```javascript
function loadEnvFile() {
  const envVars = {};
  
  try {
    // .env dosyasının olası konumları - DÜZELTILMIŞ SIRALAMA
    const possiblePaths = [
      path.join(process.cwd(), '.env'),  // İlk önce çalışma dizininde ara
      path.join(__dirname, '..', '.env'),  // Electron klasörünün bir üstünde ara
      path.join(__dirname, '.env'),  // Electron klasöründe ara
      path.join(app.getPath('userData'), '.env'),
    ];
    
    // Production modda resources path'i de ekle
    if (app.isPackaged && process.resourcesPath) {
      possiblePaths.unshift(path.join(process.resourcesPath, '.env'));
      possiblePaths.unshift(path.join(process.resourcesPath, 'app.asar.unpacked', '.env'));
    }
    
    // ...parsing logic
  } catch (err) {
    console.error('❌ .env dosyası yüklenirken hata:', err.message);
  }
  
  return envVars;
}
```

**Detaylı Açıklama:**

**Neden .env manuel parse ediliyor?**
Electron packaged app'lerde `dotenv` kütüphanesi doğru çalışmayabilir çünkü:
1. ASAR arşivinde dosya yolları değişir
2. `app.asar.unpacked` klasörü farklı path'te olabilir
3. Development vs Production path'leri farklıdır

**Path Önceliklendirme Stratejisi:**

**Development Mode (isPackaged = false):**
1. `process.cwd()/.env` → Proje root directory
2. `__dirname/../.env` → Electron klasörünün üstü
3. `__dirname/.env` → Electron klasörü
4. `app.getPath('userData')/.env` → User data directory

**Production Mode (isPackaged = true):**
1. `resources/app.asar.unpacked/.env` → ASAR'dan çıkarılmış dosyalar
2. `resources/.env` → Resources directory
3. (Diğer fallback'ler)

**Parsing Algoritması:**

```javascript
const lines = envContent.split('\n');
for (const line of lines) {
  const trimmedLine = line.trim();
  
  // Boş satırları ve yorumları atla
  if (!trimmedLine || trimmedLine.startsWith('#')) {
    continue;
  }
  
  // KEY=VALUE formatını parse et
  const match = trimmedLine.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    
    // Tırnak işaretlerini kaldır
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    envVars[key] = value;
  }
}
```

**Parsing Özellikleri:**
1. **Yorum desteği:** `#` ile başlayan satırlar ignore edilir
2. **Boşluk toleransı:** Başta/sonda boşluklar temizlenir
3. **Tırnak desteği:** `KEY="value"` ve `KEY='value'` desteklenir
4. **Hata toleransı:** Hatalı satırlar atlanır, app crash'lemez

**Email Yapılandırması Kontrolü:**

```javascript
if (envVars.EMAIL_USER || envVars.GMAIL_USER) {
  console.log('✅ Email yapılandırması bulundu');
} else {
  console.warn('⚠️  Email yapılandırması eksik! EMAIL_USER veya GMAIL_USER bulunamadı.');
}
```

**Neden iki farklı değişken kontrolü?**
- `EMAIL_USER`: Nodemailer için generic SMTP
- `GMAIL_USER`: Gmail-specific configuration
- İkisi de desteklenir (backward compatibility)

**Güvenlik Notları:**
1. `.env` dosyası ASLA git'e commit edilmemelidir
2. Production build'de `.env` dosyası opsiyoneldir (environment variables kullanılabilir)
3. Secret değerler console'a log edilmez (sadece key isimleri)

---

## BÖLÜM 3: TEK İNSTANCE KİLİDİ (Single Instance Lock)

### 3.1 Single Instance Lock Implementasyonu

```javascript
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // İkinci instance açılmaya çalışıldığında mevcut pencereyi göster
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });
}
```

**Neden Single Instance?**

**Problem:**
Kullanıcı uygulamayı 2 kere açarsa:
- 2 ayrı Express server başlar (PORT conflict!)
- 2 ayrı JSON dosyası yazılır (data corruption!)
- 2 ayrı tray icon görünür (confusing UX!)
- Memory waste: 2x RAM kullanımı

**Çözüm:**
`requestSingleInstanceLock()` ile sadece 1 instance'a izin verilir.

**Davranış:**

**Senaryo 1: İlk Açılış**
1. `requestSingleInstanceLock()` çağrılır → `true` döner
2. Uygulama normal şekilde başlar
3. Lock sistemde tutulur

**Senaryo 2: İkinci Açılış Denemesi**
1. `requestSingleInstanceLock()` çağrılır → `false` döner
2. `app.quit()` çalışır → 2. instance kendini kapatır
3. İlk instance'a `second-instance` event'i tetiklenir
4. Mevcut pencere restore edilir ve focus alır

**Platform Farkları:**

**Windows:**
- Lock registry'de tutulur
- Çok hızlı çalışır (<10ms)
- Process arası mutex kullanır

**macOS:**
- Lock file descriptor ile yapılır
- Native macOS behavior'ı destekler
- Dock'ta tek icon gösterir

**Linux:**
- DBus veya lock file kullanır
- Distribution'a göre değişir
- Bazı durumlarda manuel cleanup gerekebilir

**Edge Case: Crashed Instance**
Eğer app crash olursa lock temizlenmeyebilir. Çözüm:
```javascript
app.on('will-quit', () => {
  app.releaseSingleInstanceLock(); // Explicit cleanup
});
```

---

## BÖLÜM 4: DİZİN VE DOSYA YÖNETİMİ

### 4.1 ensureDirectoryExists() Fonksiyonu

```javascript
function ensureDirectoryExists(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err) {
    console.error('Dizin oluşturma hatası:', err);
  }
}
```

**Detaylı Açıklama:**

**Sorumluluk:**
Bir dizinin var olduğundan emin olur. Yoksa oluşturur.

**`{ recursive: true }` Neden Önemli?**

**Örnek 1: Tek seviye**
```javascript
ensureDirectoryExists('/app/data');
// /app varsa → /app/data oluşturur
// /app yoksa ve recursive: false → HATA!
// /app yoksa ve recursive: true → /app ve /app/data oluşturur
```

**Örnek 2: Çok seviye**
```javascript
ensureDirectoryExists('/app/userData/data/backups');
// recursive: true → Tüm ara dizinleri oluşturur
// recursive: false → Sadece son dizini oluşturur (ara dizinler yoksa hata)
```

**Try-Catch Neden Var?**

Olası hatalar:
1. **Permission denied:** User'ın yazma yetkisi yok
2. **Disk full:** Disk dolu
3. **Path too long:** Windows'ta path çok uzun
4. **Invalid characters:** Path'te geçersiz karakterler

**Hata Yönetimi:**
```javascript
catch (err) {
  console.error('Dizin oluşturma hatası:', err);
  // App crash olmaz, sadece log edilir
  // Upstream kod hata kontrolü yapabilir
}
```

### 4.2 ensureFileExists() Fonksiyonu

```javascript
function ensureFileExists(filePath, defaultContent = '') {
  try {
    if (!fs.existsSync(filePath)) {
      const dir = path.dirname(filePath);
      ensureDirectoryExists(dir);
      fs.writeFileSync(filePath, defaultContent, 'utf-8');
    }
  } catch (err) {
    console.error('Dosya oluşturma hatası:', err);
  }
}
```

**Adım Adım Akış:**

**1. Dosya varlık kontrolü**
```javascript
if (!fs.existsSync(filePath))
```
- Dosya varsa hiçbir şey yapma
- Dosya yoksa oluştur

**2. Parent dizin oluştur**
```javascript
const dir = path.dirname(filePath);
ensureDirectoryExists(dir);
```
- `/app/data/kayitlar.json` için `/app/data` oluştur
- Recursive dizin oluşturma

**3. Dosya oluştur**
```javascript
fs.writeFileSync(filePath, defaultContent, 'utf-8');
```
- `defaultContent` parametresi opsiyonel (default: `''`)
- `utf-8` encoding → Türkçe karakter desteği

**Kullanım Örnekleri:**

```javascript
// Boş dosya oluştur
ensureFileExists('/app/data/kayitlar.json');

// Default JSON ile oluştur
ensureFileExists('/app/data/kayitlar.json', JSON.stringify({
  gorevler: [],
  soruGunlukleri: []
}, null, 2));

// Default config ile oluştur
ensureFileExists('/app/config.json', JSON.stringify({
  theme: 'dark',
  language: 'tr'
}));
```

**Güvenlik Kontrolü:**
```javascript
// Path traversal saldırısı önleme
const safePath = path.normalize(path.join(baseDir, userInput));
if (!safePath.startsWith(baseDir)) {
  throw new Error('Invalid path');
}
```

---

## BÖLÜM 5: NODE ENVIRONMENT VALIDATION

### 5.1 validateNodeEnvironment() Fonksiyonu

```javascript
function validateNodeEnvironment() {
  try {
    const nodeVersion = process.version;
    console.log('Node.js sürümü:', nodeVersion);
    
    // Gerekli dizinleri oluştur
    const dataDir = path.join(app.getPath('userData'), 'data');
    ensureDirectoryExists(dataDir);
    
    return true;
  } catch (err) {
    console.error('Node environment hatası:', err);
    return false;
  }
}
```

**Detaylı Açıklama:**

**Sorumluluk:**
Node.js environment'ının sağlıklı olduğunu kontrol eder ve gerekli setup'ları yapar.

**`process.version` Kontrolü:**
```javascript
const nodeVersion = process.version; // Örn: "v20.10.0"
```

**Neden version kontrolü önemli?**
- Electron, belirli Node.js versiyonu ile gelir
- Bazı native modüller spesifik version gerektirir
- Debug için version bilgisi önemli

**userData Directory:**
```javascript
app.getPath('userData')
```

**Platform-specific paths:**

**Windows:**
```
C:\Users\<username>\AppData\Roaming\beratcankir
```

**macOS:**
```
/Users/<username>/Library/Application Support/beratcankir
```

**Linux:**
```
/home/<username>/.config/beratcankir
```

**Neden userData kullanılıyor?**
1. **Güvenli:** User permissions var
2. **Persistent:** Uninstall'da bile kalabilir
3. **Standard:** OS'un önerdiği yer
4. **Sandbox-safe:** Mac App Store kurallarına uygun

**Data Directory Oluşturma:**
```javascript
const dataDir = path.join(app.getPath('userData'), 'data');
ensureDirectoryExists(dataDir);
```

**Örnek:**
```
/Users/berat/Library/Application Support/beratcankir/data/
├── kayitlar.json
├── kayitlar.json.backup
└── logs/
```

**Return Value:**
- `true`: Her şey OK
- `false`: Bir sorun var (app başlatılmamalı)

**Hata Senaryoları:**
1. Node.js version mismatch
2. Disk yazma izni yok
3. Corrupt file system
4. Antivirus block

---

## BÖLÜM 6: SERVER HAZIRLIK KONTROLÜ

### 6.1 checkServerReady() Fonksiyonu

```javascript
function checkServerReady(maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    let attempts = 0;

    const checkPort = () => {
      attempts++;
      
      const req = http.get(`http://localhost:${PORT}`, (res) => {
        if (res.statusCode === 200 || res.statusCode === 304) {
          console.log(`Server hazır! (${attempts}. deneme)`);
          resolve(true);
        } else {
          if (attempts < maxAttempts) {
            setTimeout(checkPort, 500);
          } else {
            reject(new Error('Server başlatılamadı - zaman aşımı'));
          }
        }
      });

      req.on('error', () => {
        if (attempts < maxAttempts) {
          setTimeout(checkPort, 500);
        } else {
          reject(new Error('Server başlatılamadı - zaman aşımı'));
        }
      });

      req.end();
    };

    checkPort();
  });
}
```

**Detaylı Akış Analizi:**

**1. Promise Pattern**
```javascript
return new Promise((resolve, reject) => {
  // Async işlem
});
```
Neden Promise? Çünkü:
- Server başlatma asynchronous
- Caller'ın `await checkServerReady()` yapması lazım
- Error handling için `try-catch` kullanılabilir

**2. Recursive Retry Logic**

```
Deneme 1 (0ms)     → HTTP GET → ECONNREFUSED → 500ms bekle
Deneme 2 (500ms)   → HTTP GET → ECONNREFUSED → 500ms bekle
Deneme 3 (1000ms)  → HTTP GET → 200 OK → ✅ resolve(true)
```

**Maksimum Bekleme Süresi:**
```javascript
maxAttempts = 30
delay = 500ms
total = 30 * 500ms = 15000ms = 15 saniye
```

**3. HTTP Status Code Kontrolü**

```javascript
if (res.statusCode === 200 || res.statusCode === 304) {
  resolve(true);
}
```

**Neden 200 VE 304?**
- `200 OK`: İlk request, fresh response
- `304 Not Modified`: Cache'li response (hala sağlıklı)

**İkisi de kabul edilir çünkü:**
- Express server ayakta demektir
- HTML/JSON dönüyor demektir
- Routing çalışıyor demektir

**4. Error Handling**

```javascript
req.on('error', () => {
  // Server henüz hazır değil, retry
});
```

**Olası Hatalar:**
- `ECONNREFUSED`: Port henüz dinlemiyor
- `ETIMEDOUT`: Network timeout
- `ENOTFOUND`: localhost resolve edilemiyor
- `EPIPE`: Connection broken

**5. Timeout Stratejisi**

```javascript
setTimeout(checkPort, 500);
```

**Neden 500ms?**
- Too fast → Gereksiz CPU kullanımı
- Too slow → Kullanıcı bekler
- 500ms → İyi bir balance

**Production Optimization:**
Exponential backoff kullanılabilir:
```javascript
const delay = Math.min(500 * Math.pow(2, attempts), 5000);
setTimeout(checkPort, delay);
```

**6. Başarı ve Başarısızlık**

**Başarı:**
```javascript
console.log(`Server hazır! (${attempts}. deneme)`);
resolve(true);
```

**Başarısızlık:**
```javascript
reject(new Error('Server başlatılamadı - zaman aşımı'));
```

**Caller'da kullanım:**
```javascript
try {
  await checkServerReady();
  console.log('Server hazır, pencere açılabilir');
} catch (err) {
  console.error('Server başlatılamadı:', err);
  // Kullanıcıya hata göster
  dialog.showErrorBox('Hata', 'Server başlatılamadı!');
}
```

---

---

## BÖLÜM 3: SERVER BAŞLATMA VE YÖNETİMİ

### 3.1 startServer() Fonksiyonu

**Amaç:** Express Node.js server'ı child process olarak başlatır.

**İşleyiş:**
1. `serverProcess` null ise yeni process oluşturulur
2. `spawn('node', ['server/index.js'])` ile Node.js çalıştırılır
3. stdout/stderr logları yakalanır ve `serverLogs` array'ine eklenir
4. Server çökmesi (error, exit) durumlarında otomatik restart
5. `checkServerReady()` ile port 5000'in hazır olması beklenir

**Kritik Detaylar:**
- `detached: false` → Parent process kapanınca child da kapanır
- `stdio: ['ignore', 'pipe', 'pipe']` → stdout ve stderr pipe'lanır
- Log buffer 500 ile sınırlı (memory leak önlemi)
- Auto-restart mekanizması ile crash recovery

### 3.2 restartServer() Fonksiyonu

**Amaç:** Server'ı güvenli şekilde yeniden başlatır.

**İşleyiş:**
1. Mevcut server process varsa `serverProcess.kill()` ile durdurulur
2. 1 saniye timeout ile process'in tamamen durması beklenir
3. `startServer()` ile yeni process başlatılır
4. mainWindow varsa yeniden yüklenir (`reload()`)

**Kullanım Senaryoları:**
- Kullanıcı "Restart Server" menü seçeneğine tıklarsa
- Server çöktüyse (auto-restart)
- Environment değişkenleri değiştiyse

---

## BÖLÜM 4: WINDOW OLUŞTURMA VE YÖNETİMİ

### 4.1 createMainWindow() Fonksiyonu

**Amaç:** Ana uygulama penceresini oluşturur.

**Pencere Özellikleri:**
```javascript
{
  width: 1280,
  height: 800,
  minWidth: 800,
  minHeight: 600,
  webPreferences: {
    nodeIntegration: false,    // Güvenlik
    contextIsolation: true,    // Güvenlik
    preload: path.join(__dirname, 'preload.js')
  },
  icon: path.join(__dirname, 'build', 'icon.png'),
  title: 'Berat Cankır - YKS Analiz Takip',
  show: false  // İçerik yüklenince göster
}
```

**Güvenlik Önlemleri:**
- `nodeIntegration: false` → Renderer'da Node.js API'leri devre dışı
- `contextIsolation: true` → Renderer ve preload ayrı context'ler
- `webSecurity: true` → CORS ve güvenlik kontrolleri aktif

**Event Handlers:**
- `ready-to-show` → Pencere hazır olunca göster (flash önleme)
- `close` → Pencere kapatılınca tray'e minimize et
- `closed` → Window referansını null yap

### 4.2 createLogsWindow() Fonksiyonu

**Amaç:** Server loglarını gösteren debug penceresi oluşturur.

**Özellikler:**
- 800x600 boyutunda modal pencere
- `parent: mainWindow` → Ana pencerenin child'ı
- Real-time log streaming (IPC ile)
- Auto-scroll (en yeni loglar görünür)

### 4.3 createActivitiesWindow() Fonksiyonu

**Amaç:** Kullanıcı aktivitelerini listeleyen pencere oluşturur.

**Özellikler:**
- Activity logger'dan veri çeker
- Tarih bazlı filtreleme
- Export to CSV özelliği

---

## BÖLÜM 5: IPC HANDLERS VE EVENT LISTENERS

### 5.1 IPC (Inter-Process Communication)

**IPC Nedir?**
Main process ve renderer process arasında güvenli veri alışverişi.

**İletişim Yöntemleri:**
1. **ipcMain.handle()** → Async request-response
2. **ipcMain.on()** → Event listener
3. **mainWindow.webContents.send()** → Main → Renderer mesaj

**Örnek Handlers:**

```javascript
// 1. Server log'larını getir
ipcMain.handle('get-server-logs', async () => {
  return serverLogs;
});

// 2. Activity log'larını getir  
ipcMain.handle('get-activities', async () => {
  return activityLogger.getActivities();
});

// 3. Server'ı restart et
ipcMain.handle('restart-server', async () => {
  await restartServer();
  return { success: true };
});

// 4. Dosya seç dialog'u
ipcMain.handle('select-file', async (event, options) => {
  const result = await dialog.showOpenDialog(options);
  return result.filePaths;
});
```

### 5.2 Preload Script

**Amaç:** Renderer'a sınırlı Node.js API'leri sunmak.

```javascript
// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getLogs: () => ipcRenderer.invoke('get-server-logs'),
  getActivities: () => ipcRenderer.invoke('get-activities'),
  restartServer: () => ipcRenderer.invoke('restart-server'),
  selectFile: (options) => ipcRenderer.invoke('select-file', options)
});
```

**Renderer'da kullanım:**
```typescript
// client/src/hooks/useElectron.ts
const logs = await window.electronAPI.getLogs();
```

---

## BÖLÜM 6: TRAY ICON VE MENU SİSTEMİ

### 6.1 Tray Icon Oluşturma

```javascript
function createTray() {
  const iconPath = path.join(__dirname, 'build', 'tray-icon.png');
  tray = new Tray(iconPath);
  
  tray.setToolTip('Berat Cankır - YKS Analiz Takip');
  tray.setContextMenu(createTrayMenu());
  
  // Double-click event
  tray.on('click', () => {
    const now = Date.now();
    if (now - lastClickTime < DOUBLE_CLICK_THRESHOLD) {
      // Double click
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    }
    lastClickTime = now;
  });
}
```

### 6.2 Tray Menu

```javascript
function createTrayMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'Aç',
      click: () => mainWindow?.show()
    },
    {
      label: 'Server Logları',
      click: () => createLogsWindow()
    },
    {
      label: 'Aktiviteler',
      click: () => createActivitiesWindow()
    },
    { type: 'separator' },
    {
      label: 'Server Restart',
      click: () => restartServer()
    },
    { type: 'separator' },
    {
      label: 'Çıkış',
      click: () => app.quit()
    }
  ]);
}
```

---

## BÖLÜM 7: APP LIFECYCLE VE CLEANUP

### 7.1 App Ready Event

```javascript
app.whenReady().then(async () => {
  // 1. Environment variables yükle
  const envVars = loadEnvFile();
  Object.assign(process.env, envVars);
  
  // 2. Activity logger'ı başlat
  activityLogger.init();
  
  // 3. Server'ı başlat
  await startServer();
  
  // 4. Server hazır olunca window oluştur
  await checkServerReady();
  createMainWindow();
  
  // 5. Tray icon oluştur
  createTray();
  
  // 6. Otomatik arşivleme zamanlayıcısı
  scheduleAutoArchive();
});
```

### 7.2 Cleanup ve Shutdown

```javascript
app.on('before-quit', (event) => {
  // Server'ı durdur
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  
  // Activity logger'ı flush et
  activityLogger.flush();
  
  // Tray icon'u temizle
  if (tray) {
    tray.destroy();
    tray = null;
  }
});

app.on('window-all-closed', () => {
  // macOS'ta CMD+Q ile çıkılmadıysa app açık kalır
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // macOS'ta dock icon'a tıklandığında
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
```

### 7.3 Auto-Archive Zamanlayıcı

```javascript
function scheduleAutoArchive() {
  // Her Pazar 23:59'da çalışır
  const schedule = require('node-schedule');
  
  schedule.scheduleJob('59 23 * * 0', async () => {
    console.log('📦 Otomatik arşivleme başlatılıyor...');
    
    try {
      // API'ye POST /api/auto-archive çağrısı
      const response = await fetch(`http://localhost:${PORT}/api/auto-archive`, {
        method: 'POST'
      });
      
      if (response.ok) {
        console.log('✅ Otomatik arşivleme tamamlandı');
        activityLogger.logActivity('Otomatik Arşivleme', 'Haftalık arşivleme yapıldı');
      }
    } catch (err) {
      console.error('❌ Arşivleme hatası:', err);
    }
  });
}
```

---

## ÖZET VE TEKNİK DETAYLAR

### Electron Main Process Sorumlulukları

**1. Process Yönetimi:**
- Express server'ı child process olarak başlatma
- Crash detection ve auto-restart
- Graceful shutdown

**2. Window Yönetimi:**
- Main window (1280x800)
- Logs window (800x600)
- Activities window (900x700)
- Minimize to tray

**3. IPC İletişimi:**
- Server log'ları streaming
- Activity log'ları fetching
- File system operations
- Dialog'lar

**4. Sistem Entegrasyonu:**
- System tray icon ve menu
- Klavye kısayolları
- Bildirimler
- Auto-launch (optional)

**5. Veri Yönetimi:**
- Environment variables loading
- Activity logging
- Auto-archive scheduling

### Güvenlik Best Practices

**1. Context Isolation:**
```javascript
webPreferences: {
  contextIsolation: true,  // ✅ Renderer ve preload ayrı
  nodeIntegration: false   // ✅ Node.js API'leri kapalı
}
```

**2. Preload Script:**
```javascript
// ✅ contextBridge ile sınırlı API expose
contextBridge.exposeInMainWorld('api', {
  safeFunction: () => { /* safe */ }
});

// ❌ window.require exposed (vulnerable)
```

**3. Content Security Policy:**
```javascript
mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ["default-src 'self'"]
    }
  });
});
```

### Performance Optimizations

**1. Log Buffer Limit:**
```javascript
if (serverLogs.length > 500) {
  serverLogs.shift(); // Remove oldest
}
```

**2. Lazy Window Creation:**
```javascript
// Logs window sadece gerektiğinde oluştur
if (!logsWindow) {
  logsWindow = new BrowserWindow({...});
}
```

**3. Auto-Archive Scheduling:**
```javascript
// Haftalık arşivleme (her Pazar gece)
// Memory kullanımını optimize eder
```

---

## KAYNAKLAR VE ÖĞRENME REFERANSLARI

**Electron Dokümantasyonu:**
- [Electron Main Process](https://www.electronjs.org/docs/latest/tutorial/process-model#the-main-process)
- [IPC Communication](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)

**Node.js Child Process:**
- [child_process.spawn()](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options)
- [Process Events](https://nodejs.org/api/process.html#process-events)

**Best Practices:**
- [Electron Forge](https://www.electronforge.io/) - Build ve package tool
- [electron-builder](https://www.electron.build/) - Installer oluşturma
- [Spectron](https://www.electronjs.org/spectron) - E2E testing

---

**DOKÜMANTASYON TAMAMLANDI**

Bu dosya electron/main.cjs'in tüm kritik bölümlerini detaylı olarak açıkladı:
- ✅ Import ve global değişkenler
- ✅ Environment variable loading
- ✅ Server başlatma ve yönetimi
- ✅ Window oluşturma ve lifecycle
- ✅ IPC handlers ve preload script
- ✅ Tray icon ve menu sistemi
- ✅ App lifecycle ve cleanup
- ✅ Güvenlik ve performance best practices

**Toplam Açıklama:** ~1100 satır detaylı dokümantasyon

**Son Güncelleme:** 01 Kasım 2025

