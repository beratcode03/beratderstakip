# ELECTRON MAIN.CJS - DETAYLI KOD AÇIKLAMASI (BÖLÜM 1)

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

## DEVAM EDECEK...

Bu dosya electron/main.cjs'in ilk bölümünü detaylı olarak açıkladı. Toplam 400+ satır açıklama yapıldı.

**Sonraki Bölümler:**
- Bölüm 2: Server başlatma ve yönetimi (startServer, restartServer)
- Bölüm 3: Window oluşturma (createMainWindow, createLogsWindow, createActivitiesWindow)
- Bölüm 4: IPC handlers ve event listeners
- Bölüm 5: Tray icon ve menu sistemi
- Bölüm 6: App lifecycle ve cleanup

**Dosya Boyutu:**
- Bu dosya: ~400 satır
- Toplam electron/main.cjs açıklaması: ~1200-1500 satır olacak (3 dosyaya bölünecek)

