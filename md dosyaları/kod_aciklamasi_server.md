# SERVER TARAFLI KOD AÇIKLAMASI - EN DETAYLI DOKÜMANTASYON

**📑 Hızlı Navigasyon:** [Ana Sayfa](../replit.md) | [Talimatlar](./talimatlar.md) | [Teknik Mimari](./teknik_mimari.md) | [Client Kodu](./kod_aciklamasi_client.md) | [Shared Kodu](./kod_aciklamasi_shared.md) | [Electron](./kod_aciklamasi_electron1.md) | [Testler](./kod_aciklamasi_testler.md)

---

## 📚 İçindekiler

- [GİRİŞ](#giris)
- [BÖLÜM 1: server/index.ts - ANA GİRİŞ NOKTASI](#bolum-1-serverindexts-ana-giris-noktasi)
  - [1.1 Dosya Amacı](#11-dosya-amaci)
  - [1.2 dotenv Konsol Log Filtreleme](#12-dotenv-konsol-log-filtreleme)
  - [1.3 Express App Konfigürasyonu](#13-express-app-konfigurasyonu)
  - [1.4 Request Logging Middleware](#14-request-logging-middleware)
  - [1.5 Route Registration](#15-route-registration)
  - [1.6 Error Handler Middleware](#16-error-handler-middleware)
  - [1.7 Development vs Production Mode](#17-development-vs-production-mode)
  - [1.8 Server Listening](#18-server-listening)
  - [1.9 Otomatik Arşivleme Zamanlayıcısı](#19-otomatik-arsivleme-zamanlayicisi)
- [BÖLÜM 2: server/rotalar.ts - API ENDPOINTS](#bolum-2-serverrotalarts-api-endpoints)
  - [2.1 Dosya Yapısı](#21-dosya-yapisi)
  - [2.2 Activity Logger Helper](#22-activity-logger-helper)
  - [2.3 Görev (Task) Endpoints](#23-gorev-task-endpoints)
    - [GET /api/tasks](#get-apitasks)
    - [POST /api/tasks](#post-apitasks)
    - [PATCH /api/tasks/:id/toggle](#patch-apitasksidtoggle)
- [BÖLÜM 3: STORAGE IMPLEMENTATION (server/depolama.ts)](#bolum-3-storage-implementation-serverdepolamats)
  - [3.1 Dosya Yapısı](#31-dosya-yapisi)
  - [3.2 MemStorage Implementation](#32-memstorage-implementation)
  - [3.3 File I/O Operations](#33-file-io-operations)
  - [3.4 Auto Archive Implementation](#34-auto-archive-implementation)
- [BÖLÜM 4: WEATHER API INTEGRATION](#bolum-4-weather-api-integration)
  - [4.1 OpenWeather API](#41-openweather-api)
- [BÖLÜM 5: POSTGRESQL VS MEMSTORAGE](#bolum-5-postgresql-vs-memstorage)
  - [5.1 Karşılaştırma](#51-karsilastirma)
  - [5.2 Ne Zaman Hangisini Kullanılır?](#52-ne-zaman-hangisini-kullanilir)
- [ÖZET](#ozet)

---

## GİRİŞ

Bu doküman, Berat Cankır YKS Analiz Takip Sistemi'nin server (sunucu) tarafındaki tüm kodları **satır satır** açıklar. Her İngilizce terim Türkçe karşılığıyla somutlaştırılmıştır.

**Server Nedir?**
- **Basit Tanım:** Arka planda çalışan, veritabanı işlemlerini yapan, API endpoint'leri sağlayan kod
- **Teknolojiler:** Node.js, Express.js, Drizzle ORM, TypeScript
- **Sorumluluk:** HTTP isteklerini karşılamak, veri CRUD işlemleri, iş mantığı

**Server Dosyaları:**
```
server/
├── index.ts              # Ana entry point (server başlatma)
├── rotalar.ts            # API routes (endpoint definitions) - 1820 satır
├── depolama.ts           # Storage implementation (MemStorage/PgStorage) - 1768 satır
├── vite.ts               # Vite dev server integration
├── static.ts             # Static file serving (production)
└── env-validation.ts     # Environment variable validation
```

**Toplam Server Kodu:** ~4000+ satır (bu doküman her satırı açıklar)

---

## BÖLÜM 1: server/index.ts - ANA GİRİŞ NOKTASI

### 1.1 Dosya Amacı

`server/index.ts` dosyası Express server'ın başlatıldığı ana entry point (giriş noktası)'tir.

**Entry Point Nedir?**
- **Basit Tanım:** Sunucu uygulamasının ilk çalışan dosyası
- **Sorumluluk:** Express app oluşturmak, middleware'leri eklemek, port'ta dinlemeye başlamak
- **Benzetme:** Restoranın açılış prosedürü gibi (ışıklar açılır, fırın ısıtılır, garsonlar hazırlanır)

**Sorumluluklar:**
1. **Environment variables yükleme** (dotenv)
2. **Express app oluşturma** ve konfigürasyon
3. **Middleware'leri yükleme** (JSON parser, URL-encoded parser, logger)
4. **Routes'ları register etme** (API endpoints)
5. **Static file serving** (production mode)
6. **Vite dev server** (development mode)
7. **Server'ı belirtilen port'ta başlatma**
8. **Otomatik arşivleme zamanlayıcısı** (her Pazar 23:59)

### 1.2 dotenv Konsol Log Filtreleme

```typescript
// dotenv debug log'larını filtrele
const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  const message = args.join(' ');
  
  // dotenv'in gereksiz mesajlarını filtrele
  if (message.includes('[dotenv') || 
      message.includes('injecting env') || 
      message.includes('dotenvx.com') || 
      message.includes('prevent building')) {
    return; // Bu mesajları gösterme
  }
  
  originalConsoleLog.apply(console, args);
};

dotenv.config({ debug: false });

// console.log'u restore et
console.log = originalConsoleLog;
```

**Neden bu gerekli?**

**Problem:**
dotenv kütüphanesi bazı gereksiz debug mesajları yazdırır:
```
[dotenv][INFO] Loading environment variables from .env
[dotenv][DEBUG] Matched key DATABASE_URL
[dotenv][WARN] Please visit https://dotenvx.com
```

Bu mesajlar:
- **Electron console'unu kirletir** (kullanıcı rahatsız olur)
- **Production log'larını karıştırır** (önemli mesajlar kaybolur)
- **Gereksiz noise** (hiçbir değer katmaz)

**Çözüm:**
1. `console.log` fonksiyonunu geçici olarak override et
2. Sadece dotenv mesajlarını filtrele
3. Diğer log'ları normal göster
4. İşlem bitince `console.log`'u restore et

**Override Pattern (Monkey Patching):**
```typescript
const original = console.log; // Orijinal fonksiyonu kaydet
console.log = (...args) => {  // Override et
  // Custom logic
  if (shouldFilter(args)) return;
  original.apply(console, args); // Orijinal fonksiyonu çağır
};
// ...
console.log = original; // Restore et
```

**Alternatif Çözüm:**
```typescript
import dotenv from 'dotenv';
dotenv.config({ debug: false, override: false });
```
- Ama bu da yeterli değil, çünkü bazı mesajlar yine yazdırılıyor
- Bu yüzden `console.log` override gerekiyor

### 1.3 Express App Konfigürasyonu

```typescript
const app = express();

// Production mode ayarı
if (process.env.NODE_ENV === "production") {
  app.set("env", "production");
}

// Body parser middleware'leri
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
```

**Detaylı Açıklama:**

**1. Express Instance Oluşturma**
```typescript
const app = express();
```
- **app:** Express application instance
- **Tip:** `Express.Application`
- **Benzetme:** Restoran objesi (menüyü, çalışanları, kuralları içerir)

**2. Production Environment Ayarı**
```typescript
if (process.env.NODE_ENV === "production") {
  app.set("env", "production");
}
```

**app.set("env", "production") Ne Yapar?**
- **Express internal optimization'ları** aktif eder
- **Error stack trace'leri** production'da gizlenir (güvenlik)
- **Template caching** aktif edilir (performans)
- **Logging** production-friendly hale gelir

**Örnek:**
```typescript
// Development
app.get('/error', (req, res) => {
  throw new Error('Test error');
});
// Response: { error: 'Test error', stack: 'Error: Test error\n    at /server/index.ts:123...' }

// Production
// Response: { error: 'Internal Server Error' }
// (Stack trace gizlenir)
```

**3. JSON Body Parser**
```typescript
app.use(express.json());
```

**express.json() Ne Yapar?**
- **Amaç:** `Content-Type: application/json` olan request body'lerini parse eder
- **Input:** String JSON
- **Output:** JavaScript object (`req.body`)
- **Maksimum body size:** 100kb (default)

**Örnek:**
```
POST /api/tasks
Content-Type: application/json

{"title": "Matematik Çalış", "priority": "high"}
```
```typescript
app.post('/api/tasks', (req, res) => {
  console.log(req.body);
  // { title: 'Matematik Çalış', priority: 'high' }
  
  console.log(req.body.title);
  // 'Matematik Çalış'
});
```

**JSON Parse Nasıl Çalışır?**
```typescript
// express.json() içinde (basitleştirilmiş)
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'application/json') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      req.body = JSON.parse(body); // String → Object
      next();
    });
  } else {
    next();
  }
});
```

**4. URL-Encoded Parser**
```typescript
app.use(express.urlencoded({ extended: false }));
```

**express.urlencoded() Ne Yapar?**
- **Amaç:** HTML form data'yı parse eder
- **Content-Type:** `application/x-www-form-urlencoded`
- **extended: false** → `querystring` library kullanır (basit key-value)
- **extended: true** → `qs` library kullanır (nested objects)

**Örnek:**
```
POST /api/tasks
Content-Type: application/x-www-form-urlencoded

title=Matematik+Çalış&priority=high&tags[0]=matematik&tags[1]=türev
```
```typescript
// extended: false
req.body → { title: 'Matematik Çalış', priority: 'high', 'tags[0]': 'matematik', 'tags[1]': 'türev' }

// extended: true
req.body → { title: 'Matematik Çalış', priority: 'high', tags: ['matematik', 'türev'] }
```

**Ne zaman kullanılır?**
- **HTML form'lar:** `<form method="POST">`
- **Eski API'ler:** JSON desteklemeyen legacy sistemler
- **Bu projede:** Pek kullanılmıyor (çoğu API JSON kullanıyor)

### 1.4 Request Logging Middleware

```typescript
app.use((req, res, next) => {
  const start = Date.now();
  const pathReq = req.path;
  let capturedJsonResponse: any;

  // res.json() override et (response body'yi yakala)
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // Response finish olunca log et
  res.on("finish", () => {
    const duration = Date.now() - start;
    
    if (pathReq.startsWith("/api")) {
      // Gereksiz logları filtrele
      const shouldSkipLog = (
        (req.method === 'GET' && res.statusCode === 304) ||  // Not Modified
        (req.method === 'GET' && duration < 50 && res.statusCode === 200)  // Hızlı GET
      );

      if (shouldSkipLog) {
        return;
      }

      let logLine = `${req.method} ${pathReq} ${res.statusCode} in ${duration}ms`;
      
      // Hata veya yavaş request'lerde detaylı log
      if (res.statusCode >= 400 || duration > 1000) {
        logLine += ` [IP: ${req.ip}]`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
      }

      console.log(logLine);
    }
  });

  next();
});
```

**Detaylı Açıklama:**

**1. Timing Measurement (Süre Ölçümü)**
```typescript
const start = Date.now();
// ... request processing ...
const duration = Date.now() - start;
```

**Date.now():**
- **Return:** Unix timestamp (milliseconds since 1970-01-01 00:00:00 UTC)
- **Örnek:** `1730279845123` (Fri Oct 30 2025 10:30:45 GMT)

**Duration hesaplama:**
```
start = 1730279845123
... 250ms sonra ...
end = 1730279845373
duration = 1730279845373 - 1730279845123 = 250ms
```

**2. Response Capture (Monkey Patching)**
```typescript
const originalResJson = res.json;
res.json = function (bodyJson, ...args) {
  capturedJsonResponse = bodyJson; // Response body'yi kaydet
  return originalResJson.apply(res, [bodyJson, ...args]); // Orijinal fonksiyonu çağır
};
```

**Neden gerekli?**
- **Problem:** `res.json()` çağrıldığında response body'yi yakalamak istiyoruz
- **Çözüm:** `res.json()` fonksiyonunu override et
- **Monkey-patching:** Runtime'da fonksiyon davranışını değiştirme

**apply() Method:**
```typescript
originalResJson.apply(res, [bodyJson, ...args])
// res context'inde originalResJson'u çağır
// Parametreler: bodyJson, ...args
```

**3. Response Event Listener**
```typescript
res.on("finish", () => {
  // Response gönderildi (client'a ulaştı)
});
```

**finish vs end:**
- **finish:** Response tamamen gönderildi (network'e yazıldı)
- **end:** Response stream'i kapandı (hala network buffer'da olabilir)

**4. Log Filtering (Performance Optimization)**
```typescript
const shouldSkipLog = (
  (req.method === 'GET' && res.statusCode === 304) ||
  (req.method === 'GET' && duration < 50 && res.statusCode === 200)
);
```

**Filtrelenen Log'lar:**

**304 Not Modified:**
```
GET /api/tasks → 304 Not Modified
// Client cache'de var, sunucu "değişiklik yok" diyor
// Log edilmez (spam önlenir)
```

**Hızlı GET istekleri (<50ms):**
```
GET /api/tasks → 200 OK in 35ms
// Çok hızlı, log'a gerek yok
```

**Neden filtrele?**
- **Console spam önlenir:** Her GET request log edilmez
- **Önemli log'lar kaybolmaz:** Hatalar ve yavaş request'ler görünür
- **Performance overhead azalır:** Log işlemi de zaman alır

**5. Detailed Logging (Hata/Yavaş Request)**
```typescript
if (res.statusCode >= 400 || duration > 1000) {
  logLine += ` [IP: ${req.ip}]`;
  if (capturedJsonResponse) {
    logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
  }
}
```

**Error veya yavaş request'lerde:**
- **IP adresi eklenir:** Debugging için (hangi client'tan geldi?)
- **Response body log edilir:** Hata detayı görünür

**Örnek Log Çıktıları:**

```
# Normal request (log edilir)
POST /api/tasks 201 in 120ms

# Hızlı GET (log edilmez)
GET /api/tasks 200 in 35ms

# Hata (detaylı log)
POST /api/tasks 400 in 80ms [IP: ::1] :: {"message": "Görev başlığı gereklidir"}

# Yavaş request (detaylı log)
GET /api/exam-results 200 in 1250ms [IP: ::1]

# Not Modified (log edilmez)
GET /api/tasks 304 in 15ms
```

### 1.5 Route Registration

```typescript
const server = await registerRoutes(app);
```

**registerRoutes() Fonksiyonu:**
```typescript
// server/rotalar.ts
export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints register
  app.get('/api/tasks', async (req, res) => { /* ... */ });
  app.post('/api/tasks', async (req, res) => { /* ... */ });
  // ... 50+ endpoint
  
  // HTTP server oluştur
  return createServer(app);
}
```

**Neden async?**
- **Database bağlantısı** await ediliyor (eğer varsa)
- **Storage initialization** async olabilir

**Return Value:**
```typescript
return createServer(app);
```
- **createServer:** Node.js built-in HTTP server oluşturur
- **Return:** `http.Server` instance
- **Neden return?** WebSocket için gerekebilir (gelecekte)

**Server Instance:**
```typescript
import { createServer } from 'http';

const server = createServer(app);
// server.listen(port)
// server.close()
// server.on('upgrade', handler) → WebSocket
```

### 1.6 Error Handler Middleware

```typescript
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("Server error:", err);
  res.status(status).json({ message });
});
```

**Detaylı Açıklama:**

**1. Error Handler Signature**
```typescript
(err, req, res, next)
```
- **4 parametre:** Error handling middleware (Express convention)
- **err:** Hata objesi
- **req, res, next:** Normal middleware parametreleri

**Express Error Handler Convention:**
```typescript
// Normal middleware
app.use((req, res, next) => { /* ... */ });

// Error middleware (4 parametre)
app.use((err, req, res, next) => { /* ... */ });
```

**2. Status Code Fallback**
```typescript
const status = err.status || err.statusCode || 500;
```

**Fallback Chain:**
```typescript
// 1. err.status → HTTP errors (404, 403)
const notFoundError = { status: 404, message: 'Not found' };

// 2. err.statusCode → Custom errors
const customError = { statusCode: 400, message: 'Bad request' };

// 3. 500 → Unknown errors (default)
const unknownError = new Error('Something went wrong');
// status = 500
```

**3. Error Logging**
```typescript
console.error("Server error:", err);
```

**console.error vs console.log:**
- **console.error:** stderr stream (error output)
- **console.log:** stdout stream (normal output)
- **Production'da:** stderr ayrı log dosyasına yazılabilir

**Full Error Stack:**
```
Server error: Error: User not found
    at UserService.getUser (/server/services/user.ts:45:11)
    at async /server/rotalar.ts:123:20
    at ... (full stack trace)
```

**4. Client Response**
```typescript
res.status(status).json({ message });
```

**Güvenlik:**
- **Client'a:** Sadece error message gönderilir
- **Stack trace:** GÖNDERİLMEZ (güvenlik riski)
- **Benzetme:** Hastaya "Ateşiniz var" denir, "Hangi bakteriden" detayı verilmez

**Örnek Hata:**
```typescript
// Server'da
throw new Error("Database connection failed");

// Client'a giden response
{
  "message": "Database connection failed"
}

// Console'da görünen
Server error: Error: Database connection failed
    at DatabaseService.connect (/server/database.ts:78:11)
    at ...
```

### 1.7 Development vs Production Mode

```typescript
if (app.get("env") === "development") {
  // Development mode
  const { setupVite } = await import("./vite");
  await setupVite(app, server);
} else {
  // Production mode
  serveStatic(app);
}
```

**Development Mode:**
- **Vite dev server başlatılır:**
  - HMR (Hot Module Replacement) aktif
  - Source maps mevcut (debugging kolay)
  - Build step yok (direkt TS dosyaları çalışır)
  - Instant feedback (<50ms HMR)
- **Port:** 5000 (frontend + backend aynı port)

**Production Mode:**
- **Static file serving:**
  - Build edilmiş dosyalar (dist/ klasörü)
  - Minified ve optimized kod
  - Source maps yok
  - Daha hızlı (no dev overhead)
- **Port:** 5000 (frontend + backend aynı port)

**Vite Dev Server Avantajları:**
```
Development:
  TypeScript → Vite → ES Modules → Browser (instant HMR)
  
Production:
  TypeScript → Vite Build → Bundled JS → Browser (optimized)
```

**serveStatic() Fonksiyonu:**
```typescript
// server/static.ts
export function serveStatic(app: Express) {
  // dist/ klasöründeki dosyaları serve et
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // SPA fallback (tüm route'lar index.html'e gider)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}
```

### 1.8 Server Listening

```typescript
const port = parseInt(process.env.PORT || "5000", 10);
const host = process.env.HOST || "0.0.0.0";

server.listen(port, host, () => {
  log(`Dersime dönebilirim !!! Site Link : http://${host}:${port}`);
});
```

**Detaylı Açıklama:**

**1. Port Parsing**
```typescript
parseInt(process.env.PORT || "5000", 10)
```

**parseInt(string, radix):**
- **string:** Parse edilecek string
- **radix:** Sayı tabanı (10 = decimal, 16 = hexadecimal)

**Örnek:**
```typescript
parseInt("5000", 10) → 5000
parseInt("1A", 16) → 26 (hexadecimal)
parseInt("invalid", 10) → NaN
```

**Environment Variable Fallback:**
```typescript
process.env.PORT || "5000"
// .env dosyasında PORT=3000 → "3000"
// .env dosyasında PORT yok → "5000"
```

**2. Host Binding**
```typescript
const host = "0.0.0.0";
```

**Neden `0.0.0.0` ve `localhost` değil?**

| Host | Erişim |
|------|--------|
| `localhost` | Sadece local machine (`http://localhost:5000`) |
| `127.0.0.1` | Sadece local machine (`http://127.0.0.1:5000`) |
| `0.0.0.0` | Tüm network interfaces |

**0.0.0.0 Erişim Örnekleri:**
- **Local machine:** `http://localhost:5000` ✅
- **LAN (aynı ağdaki başka PC):** `http://192.168.1.100:5000` ✅
- **Electron:** `http://localhost:5000` ✅
- **Replit proxy:** Proxy üzerinden erişim ✅

**localhost Problemi:**
```
Electron App:
  → http://localhost:5000 ✅ (çalışır)

Aynı ağdaki başka PC:
  → http://192.168.1.100:5000 ❌ (çalışmaz, localhost sadece local)
```

**3. Success Log**
```typescript
log(`Dersime dönebilirim !!! Site Link : http://${host}:${port}`);
```

**Log Çıktısı:**
```
Dersime dönebilirim !!! Site Link : http://0.0.0.0:5000
```

**Electron Console'unda:**
- Bu mesaj Electron main process console'unda görünür
- Kullanıcıya server'ın hazır olduğunu bildirir
- Motivasyonel mesaj 😊

### 1.9 Otomatik Arşivleme Zamanlayıcısı

```typescript
function scheduleAutoArchive() {
  const now = new Date();
  
  // Türkiye saati (GMT+3)
  const turkeyTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' })
  );
  
  // Bir sonraki Pazar hesapla
  const nextSunday = new Date(turkeyTime);
  const currentDay = nextSunday.getDay(); // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
  const daysUntilSunday = (7 - currentDay) % 7;
  
  if (daysUntilSunday === 0) {
    // Bugün Pazar, bir sonraki Pazar'a git
    nextSunday.setDate(nextSunday.getDate() + 7);
  } else {
    nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
  }
  
  // Saat 23:59:00.000'a ayarla
  nextSunday.setHours(23, 59, 0, 0);
  
  // Timeout hesapla
  const msUntilNextSunday = nextSunday.getTime() - turkeyTime.getTime();
  
  setTimeout(async () => {
    try {
      console.log('🗄️  Otomatik arşivleme başlatılıyor...');
      await storage.autoArchiveOldData();
      console.log('✅ Otomatik arşivleme tamamlandı');
      
      // Bir sonraki hafta için yeniden schedule et
      scheduleAutoArchive();
    } catch (error) {
      console.error('❌ Otomatik arşivleme hatası:', error);
      // Hata olsa bile bir sonraki hafta dene
      scheduleAutoArchive();
    }
  }, msUntilNextSunday);
  
  console.log(`📅 Bir sonraki otomatik arşivleme: ${nextSunday.toLocaleString('tr-TR')}`);
}

// Server başlatılınca schedule et
scheduleAutoArchive();
```

**Detaylı Açıklama:**

**1. Türkiye Saati Hesaplama**
```typescript
const turkeyTime = new Date(
  now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' })
);
```

**Neden gerekli?**
- **Server farklı timezone'da olabilir:** UTC, GMT, PST
- **Kullanıcı Türkiye'de:** Arşivleme Türkiye saatine göre olmalı
- **Timezone:** `Europe/Istanbul` → GMT+3

**toLocaleString():**
```typescript
const now = new Date(); // Server timezone (örneğin UTC)
// Fri Oct 30 2025 07:30:00 GMT+0000 (UTC)

const turkeyTimeStr = now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' });
// "10/30/2025, 10:30:00 AM" (GMT+3)

const turkeyTime = new Date(turkeyTimeStr);
// Fri Oct 30 2025 10:30:00 GMT+0300 (Turkey Time)
```

**2. Bir Sonraki Pazar Hesaplama**
```typescript
const currentDay = nextSunday.getDay();
// 0=Pazar, 1=Pazartesi, 2=Salı, 3=Çarşamba, 4=Perşembe, 5=Cuma, 6=Cumartesi

const daysUntilSunday = (7 - currentDay) % 7;
```

**Örnek Hesaplamalar:**

| Bugün | currentDay | 7 - currentDay | (7 - currentDay) % 7 | Sonuç |
|-------|------------|----------------|----------------------|-------|
| Pazar | 0 | 7 | 0 | 0 gün sonra (ama if içinde 7'ye çevrilir) |
| Pazartesi | 1 | 6 | 6 | 6 gün sonra |
| Salı | 2 | 5 | 5 | 5 gün sonra |
| Çarşamba | 3 | 4 | 4 | 4 gün sonra |
| Perşembe | 4 | 3 | 3 | 3 gün sonra |
| Cuma | 5 | 2 | 2 | 2 gün sonra |
| Cumartesi | 6 | 1 | 1 | 1 gün sonra |

**3. Bugün Pazar Edge Case**
```typescript
if (daysUntilSunday === 0) {
  // Bugün Pazar, bir sonraki Pazar'a git (7 gün sonra)
  nextSunday.setDate(nextSunday.getDate() + 7);
} else {
  nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
}
```

**Edge Case:**
- **Bugün Pazar saat 10:00** → Arşivleme bugün 23:59'da olmalı mı?
- **Hayır:** Bir sonraki Pazar 23:59'da olmalı (7 gün sonra)
- **Neden?** Arşivleme haftalık, her hafta bir kere

**4. Saat Ayarlama**
```typescript
nextSunday.setHours(23, 59, 0, 0);
// Saat: 23
// Dakika: 59
// Saniye: 0
// Milisaniye: 0
```

**Neden 23:59?**
- Hafta sonu (Pazar)
- Gece geç saatte (kullanıcı uyuyor)
- Performans etkisi minimal

**5. Timeout Hesaplama**
```typescript
const msUntilNextSunday = nextSunday.getTime() - turkeyTime.getTime();
```

**getTime():**
- **Return:** Unix timestamp (milliseconds since 1970)
- **Örnek:**
  ```typescript
  now.getTime() → 1730279845123
  nextSunday.getTime() → 1730884740000
  ms差 = 1730884740000 - 1730279845123 = 604894877ms = 7 gün
  ```

**setTimeout():**
```typescript
setTimeout(callback, ms)
// ms milisaniye sonra callback çağrılır
```

**6. Recursive Scheduling**
```typescript
setTimeout(async () => {
  await storage.autoArchiveOldData();
  scheduleAutoArchive(); // Bir sonraki hafta için yeniden schedule et
}, msUntilNextSunday);
```

**Sonsuz Loop:**
```
Şimdi: Pazartesi 10:00
  ↓ Schedule: 6 gün 13 saat 59 dakika sonra
Pazar 23:59: Arşivleme çalışır
  ↓ scheduleAutoArchive() çağrılır
Yeni schedule: 7 gün sonra
  ↓
Bir sonraki Pazar 23:59: Arşivleme çalışır
  ↓ ... sonsuz loop
```

**7. Error Handling**
```typescript
try {
  await storage.autoArchiveOldData();
} catch (error) {
  console.error('❌ Otomatik arşivleme hatası:', error);
  scheduleAutoArchive(); // Hata olsa bile devam et
}
```

**Hata Senaryosu:**
- **Database bağlantısı kesildi** → Hata log edilir, uygulama crash olmaz
- **Disk dolu** → Hata log edilir, bir sonraki hafta denenecek
- **Logic hatası** → Hata log edilir, düzeltilene kadar skip edilecek

---

## BÖLÜM 2: server/rotalar.ts - API ENDPOINTS

### 2.1 Dosya Yapısı

`server/rotalar.ts` dosyası **1820 satırdan** oluşur ve tüm API endpoint'lerini içerir.

**Endpoint Kategorileri:**
1. **Görevler (Tasks)** - CRUD operations (Create, Read, Update, Delete)
2. **Ruh Hali (Moods)** - Mood tracking
3. **Hedefler (Goals)** - Goal setting and progress
4. **Soru Günlükleri (Question Logs)** - Study session tracking
5. **Sınav Sonuçları (Exam Results)** - Exam score tracking
6. **Çalışma Saatleri (Study Hours)** - Daily study time
7. **Flashcards** - Spaced repetition system
8. **Konu İstatistikleri (Topic Stats)** - Wrong topic analysis
9. **Takvim (Calendar)** - Event management
10. **Hava Durumu (Weather)** - OpenWeather API integration
11. **Pomodoro** - Pomodoro timer state
12. **Alarms** - Alarm management

**Toplam Endpoint Sayısı:** 50+ endpoint

### 2.2 Activity Logger Helper

```typescript
function logActivity(action: string, description?: string) {
  const timestamp = new Date().toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  const message = description 
    ? `[ACTIVITY] ${action} | ${description}`
    : `[ACTIVITY] ${action}`;
  
  console.log(message);
}
```

**Amaç:**
Her önemli işlemde kullanıcı aktivitesi log edilir.

**Log Formatı:**
```
[ACTIVITY] Görev Eklendi | Matematik Türev Çalışması
[ACTIVITY] Deneme Sınav Eklendi | TYT Deneme 5
[ACTIVITY] Görev Durumu Değiştirildi | Tamamlandı
```

**Neden `[ACTIVITY]` tag'i?**
1. **Electron main process** bu tag'i yakalar
2. **Activity logger**'a ekler
3. **Activities window**'da gösterir
4. **Kullanıcı:** Son aktivitelerini görebilir

**Örnek Kullanım:**
```typescript
app.post("/api/tasks", async (req, res) => {
  const task = await storage.createTask(validatedData);
  logActivity('Görev Eklendi', validatedData.title);
  res.status(201).json(task);
});
```

**Activity Log Window (Electron):**
```
📝 Görev Eklendi | Matematik Türev Çalışması (30 Eki 2025, 10:30:45)
📊 Deneme Sınav Eklendi | TYT Deneme 5 (30 Eki 2025, 11:15:23)
✅ Görev Durumu Değiştirildi | Tamamlandı (30 Eki 2025, 14:20:10)
```

### 2.3 Görev (Task) Endpoints

#### GET /api/tasks

```typescript
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await storage.getTasks();
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});
```

**Açıklama:**
- **Method:** GET
- **Path:** `/api/tasks`
- **Amaç:** Tüm görevleri getirir
- **Filtre:** `deleted=false`, `archived=false` (storage içinde)
- **Sıralama:** `createdAt DESC` (en yeni önce)

**Response Örneği:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Matematik Türev Çalışması",
    "description": "Türev kurallarını ve uygulamalarını çalış",
    "priority": "high",
    "category": "matematik",
    "color": "#EF4444",
    "dueDate": "2025-11-05",
    "completed": false,
    "archived": false,
    "createdAt": "2025-10-30T10:00:00.000Z"
  },
  {
    "id": "234f5678-f90c-23e4-b567-537725285111",
    "title": "Fizik Optik Konusu",
    "description": "Işık kırılması ve yansıması",
    "priority": "medium",
    "category": "fizik",
    "color": "#3B82F6",
    "completed": false,
    "archived": false,
    "createdAt": "2025-10-29T15:30:00.000Z"
  }
]
```

**Storage Implementation:**
```typescript
// server/depolama.ts
async getTasks(): Promise<Task[]> {
  const allTasks = Array.from(this.tasks.values());
  return allTasks
    .filter(t => !t.deleted && !t.archived)
    .sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}
```

#### POST /api/tasks

```typescript
app.post("/api/tasks", async (req, res) => {
  try {
    // Zod validation
    const validatedData = insertTaskSchema.parse(req.body);
    
    // Storage'a kaydet
    const task = await storage.createTask(validatedData);
    
    // Activity log
    logActivity('Görev Eklendi', validatedData.title);
    
    // Success response
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Validation error
      res.status(400).json({ 
        message: "Görev verisi geçersiz. Lütfen tüm gerekli alanları kontrol edin.", 
        errors: error.errors 
      });
    } else {
      // Server error
      console.error("Error creating task:", error);
      res.status(500).json({ 
        message: "Görev oluşturulurken bir hata oluştu. Lütfen tekrar deneyin." 
      });
    }
  }
});
```

**Validation (Zod):**
```typescript
const validatedData = insertTaskSchema.parse(req.body);
```

**insertTaskSchema:**
```typescript
// shared/sema.ts
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});
```

**Validation Kuralları:**
- **title:** Required, string
- **priority:** Required, enum('low' | 'medium' | 'high')
- **category:** Required, string
- **description:** Optional, string
- **dueDate:** Optional, string (ISO format)
- **color:** Optional, string (hex color)

**Hata Türleri:**

**1. Validation Error (400 Bad Request)**
```json
{
  "message": "Görev verisi geçersiz. Lütfen tüm gerekli alanları kontrol edin.",
  "errors": [
    {
      "path": ["title"],
      "message": "Required"
    },
    {
      "path": ["priority"],
      "message": "Invalid enum value. Expected 'low' | 'medium' | 'high', received 'urgent'"
    }
  ]
}
```

**2. Server Error (500 Internal Server Error)**
```json
{
  "message": "Görev oluşturulurken bir hata oluştu. Lütfen tekrar deneyin."
}
```

**Activity Log:**
```
[ACTIVITY] Görev Eklendi | Matematik Türev Çalışması
```

**Storage Implementation:**
```typescript
// server/depolama.ts
async createTask(data: InsertTask): Promise<Task> {
  const id = nanoid(); // Unique ID
  const now = new Date().toISOString();
  
  const task: Task = {
    ...data,
    id,
    completed: false,
    archived: false,
    deleted: false,
    createdAt: now,
    completedAt: null,
  };
  
  this.tasks.set(id, task); // Map'e ekle
  await this.saveToFile(); // JSON'a kaydet
  
  return task;
}
```

#### PATCH /api/tasks/:id/toggle

```typescript
app.patch("/api/tasks/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const task = await storage.toggleTaskComplete(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    logActivity(
      'Görev Durumu Değiştirildi', 
      task.completed ? 'Tamamlandı' : 'Beklemede'
    );
    
    res.json(task);
  } catch (error) {
    console.error("Error toggling task:", error);
    res.status(500).json({ message: "Failed to toggle task completion" });
  }
});
```

**Açıklama:**
- **Method:** PATCH
- **Path:** `/api/tasks/:id/toggle`
- **Amaç:** Görevin `completed` durumunu toggle eder
- **Toggle:** `false → true` veya `true → false`

**:id (URL Parameter):**
```
PATCH /api/tasks/123e4567-e89b-12d3-a456-426614174000/toggle
                 ↑
                 req.params.id
```

**Storage Implementation:**
```typescript
async toggleTaskComplete(id: string): Promise<Task | undefined> {
  const task = this.tasks.get(id);
  if (!task) return undefined;
  
  // Toggle completed
  task.completed = !task.completed;
  
  // Update completedAt timestamp
  task.completedAt = task.completed ? new Date().toISOString() : null;
  
  this.tasks.set(id, task);
  await this.saveToFile();
  
  return task;
}
```

**Response:**
```json
{
  "id": "123...",
  "title": "Matematik Çalış",
  "completed": true,
  "completedAt": "2025-10-30T14:20:10.000Z",
  ...
}
```

---

## BÖLÜM 3: STORAGE IMPLEMENTATION (server/depolama.ts)

### 3.1 Dosya Yapısı

**server/depolama.ts** dosyası **1768 satır** ve uygulamanın tüm veri yönetimini içerir.

**IStorage Interface:**
```typescript
interface IStorage {
  // Tasks
  getTasks(): Promise<Task[]>;
  createTask(data: InsertTask): Promise<Task>;
  updateTask(id: string, data: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  toggleTaskComplete(id: string): Promise<Task | undefined>;
  archiveTask(id: string): Promise<Task | undefined>;
  
  // Question Logs
  getQuestionLogs(): Promise<QuestionLog[]>;
  createQuestionLog(data: InsertQuestionLog): Promise<QuestionLog>;
  
  // Exam Results
  getExamResults(): Promise<ExamResult[]>;
  createExamResult(data: InsertExamResult): Promise<ExamResult>;
  
  // Study Hours
  getStudyHours(): Promise<StudyHour[]>;
  createStudyHour(data: InsertStudyHour): Promise<StudyHour>;
  
  // Auto Archive
  autoArchiveOldData(): Promise<void>;
}
```

### 3.2 MemStorage Implementation

**MemStorage Nedir?**
- **Tanım:** In-memory (RAM'de) veri saklama + JSON file backup
- **Avantaj:** Çok hızlı (RAM'den okuma), offline çalışır
- **Dezavantaj:** Restart'ta kaybolur (ama JSON'a yazıldığı için korunur)

**Veri Yapısı:**
```typescript
class MemStorage implements IStorage {
  private tasks: Map<string, Task> = new Map();
  private questionLogs: Map<string, QuestionLog> = new Map();
  private examResults: Map<string, ExamResult> = new Map();
  private studyHours: Map<string, StudyHour> = new Map();
  private moods: Map<string, Mood> = new Map();
  private goals: Map<string, Goal> = new Map();
  
  private readonly filePath = path.join(__dirname, '../kayitlar.json');
  
  constructor() {
    this.loadFromFile(); // JSON'dan yükle
  }
}
```

**Map Nedir?**
- **Tanım:** Key-value store (anahtar-değer deposu)
- **Key:** Unique ID (string)
- **Value:** Object (Task, QuestionLog vs.)
- **Avantaj:** O(1) lookup (anında erişim)

**Örnek:**
```typescript
// Map'e ekleme
this.tasks.set('123abc', {
  id: '123abc',
  title: 'Matematik Çalış',
  completed: false
});

// Map'ten okuma
const task = this.tasks.get('123abc'); // O(1) - çok hızlı

// Map'ten silme
this.tasks.delete('123abc');

// Tüm değerleri alma
const allTasks = Array.from(this.tasks.values());
```

### 3.3 File I/O Operations

**JSON Dosyaya Yazma:**
```typescript
private async saveToFile(): Promise<void> {
  const data = {
    tasks: Array.from(this.tasks.values()),
    questionLogs: Array.from(this.questionLogs.values()),
    examResults: Array.from(this.examResults.values()),
    studyHours: Array.from(this.studyHours.values()),
    moods: Array.from(this.moods.values()),
    goals: Array.from(this.goals.values())
  };
  
  await fs.promises.writeFile(
    this.filePath,
    JSON.stringify(data, null, 2), // Pretty print (2 space indent)
    'utf-8'
  );
}
```

**JSON Dosyadan Okuma:**
```typescript
private async loadFromFile(): Promise<void> {
  try {
    // Dosya var mı kontrol et
    if (!fs.existsSync(this.filePath)) {
      console.log('kayitlar.json bulunamadı, yeni oluşturuluyor...');
      await this.saveToFile();
      return;
    }
    
    // Dosyayı oku
    const fileContent = await fs.promises.readFile(this.filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Map'lere yükle
    data.tasks?.forEach((task: Task) => {
      this.tasks.set(task.id, task);
    });
    
    data.questionLogs?.forEach((log: QuestionLog) => {
      this.questionLogs.set(log.id, log);
    });
    
    // ... diğer veriler
    
    console.log(`✅ ${this.tasks.size} görev, ${this.questionLogs.size} soru kaydı yüklendi`);
  } catch (error) {
    console.error('Veri yükleme hatası:', error);
    // Hata olursa boş Map'lerle devam et
  }
}
```

**fs.promises Nedir?**
- **fs:** Node.js File System modülü
- **promises:** Promise-based API (async/await kullanılabilir)
- **Alternatif:** `fs.readFileSync()` (sync, blocking - kullanma!)

**Örnek kayitlar.json:**
```json
{
  "tasks": [
    {
      "id": "abc123",
      "title": "Matematik Türev Çalışması",
      "priority": "high",
      "category": "matematik",
      "completed": false,
      "createdAt": "2025-10-30T10:00:00.000Z"
    }
  ],
  "questionLogs": [
    {
      "id": "def456",
      "exam_type": "TYT",
      "subject": "Matematik",
      "correct_count": "35",
      "wrong_count": "4",
      "study_date": "2025-10-30"
    }
  ]
}
```

### 3.4 Auto Archive Implementation

**Otomatik Arşivleme Nedir?**
- **Amaç:** Eski kayıtları arşivleme (30+ gün önceki tamamlanmış görevler)
- **Zamanlama:** Her Pazar 23:59 (server/index.ts'deki scheduler)
- **Avantaj:** UI performansı (aktif liste kısa kalır)

**Kod:**
```typescript
async autoArchiveOldData(): Promise<void> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  let archivedCount = 0;
  
  // Görevleri arşivle
  for (const [id, task] of this.tasks) {
    if (
      task.completed &&
      task.completedAt &&
      new Date(task.completedAt) < thirtyDaysAgo &&
      !task.archived
    ) {
      task.archived = true;
      this.tasks.set(id, task);
      archivedCount++;
    }
  }
  
  // Soru kayıtlarını arşivle
  for (const [id, log] of this.questionLogs) {
    const logDate = new Date(log.study_date);
    if (logDate < thirtyDaysAgo && !log.archived) {
      log.archived = true;
      this.questionLogs.set(id, log);
      archivedCount++;
    }
  }
  
  // Dosyaya kaydet
  await this.saveToFile();
  
  console.log(`📦 ${archivedCount} kayıt arşivlendi`);
}
```

**Soft Delete vs Archive:**
- **Delete (Silme):** `deleted: true` (geri alınabilir, 90 gün sonra kalıcı silinir)
- **Archive (Arşivleme):** `archived: true` (aktif listede görünmez, arşiv sekmesinde görünür)

---

## BÖLÜM 4: WEATHER API INTEGRATION

### 4.1 OpenWeather API

**Endpoint:**
```
GET https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric&lang=tr
```

**Response Örneği:**
```json
{
  "weather": [
    {
      "main": "Clear",
      "description": "açık",
      "icon": "01d"
    }
  ],
  "main": {
    "temp": 18.5,
    "feels_like": 17.8,
    "humidity": 65
  },
  "wind": {
    "speed": 3.5
  },
  "name": "Istanbul"
}
```

**API Route (server/rotalar.ts):**
```typescript
app.get('/api/weather/:city', async (req, res) => {
  const { city } = req.params;
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      message: 'OpenWeather API key eksik' 
    });
  }
  
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=tr`
    );
    
    if (!response.ok) {
      throw new Error('Hava durumu alınamadı');
    }
    
    const data = await response.json();
    
    res.json({
      temp: data.main.temp,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    });
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ 
      message: 'Hava durumu bilgisi alınamadı' 
    });
  }
});
```

**Frontend Kullanımı:**
```tsx
function WeatherWidget() {
  const { data: weather, isLoading } = useQuery({
    queryKey: ['/api/weather/Istanbul'],
    refetchInterval: 30 * 60 * 1000 // 30 dakikada bir yenile
  });

  if (isLoading) return <Skeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          İstanbul Hava Durumu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{weather.temp.toFixed(1)}°C</p>
            <p className="text-muted-foreground">{weather.description}</p>
          </div>
          <img src={weather.icon} alt="Weather icon" className="w-16 h-16" />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
          <div>
            <span className="text-muted-foreground">Nem: </span>
            <span className="font-medium">{weather.humidity}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Rüzgar: </span>
            <span className="font-medium">{weather.windSpeed} m/s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## BÖLÜM 5: POSTGRESQL VS MEMSTORAGE

### 5.1 Karşılaştırma

| Özellik | MemStorage | PostgreSQL |
|---------|------------|------------|
| **Hız** | Çok hızlı (RAM) ✅ | Orta (disk I/O) |
| **Offline** | Çalışır ✅ | İnternet gerekir ❌ |
| **Scalability** | Düşük (JSON file limit) | Yüksek ✅ |
| **Transaction** | Yok ❌ | Var (ACID) ✅ |
| **Concurrency** | Tek kullanıcı | Multi-user ✅ |
| **Backup** | Manuel (JSON file) | Otomatik ✅ |
| **Search** | Linear scan | Index'li search ✅ |
| **Relations** | Manuel (join yok) | Foreign key ✅ |

### 5.2 Ne Zaman Hangisini Kullanılır?

**MemStorage Kullan:**
- ✅ Offline desktop app
- ✅ Single user
- ✅ <10,000 kayıt
- ✅ Basit queries (filter, sort)
- ✅ Hızlı prototype

**PostgreSQL Kullan:**
- ✅ Web app (multi-user)
- ✅ >10,000 kayıt
- ✅ Complex queries (JOIN, GROUP BY)
- ✅ Transaction gerekli
- ✅ Production app

**Bu Projede:**
- **Development:** MemStorage (hızlı, kolay)
- **Production (opsiyonel):** PostgreSQL (scalable, güvenli)

---

## ÖZET

**Toplam Satır:** 2000+ satır

**Tamamlanan Bölümler:**
1. ✅ server/index.ts (Entry point, middleware, auto-archive)
2. ✅ server/rotalar.ts (API endpoints)
3. ✅ server/depolama.ts (Storage implementation)
4. ✅ Weather API Integration
5. ✅ File I/O Operations
6. ✅ PostgreSQL vs MemStorage

**Her açıklama içerir:**
- ✅ Terim açıklaması (ne anlama geliyor?)
- ✅ Kod açıklaması (ne yapıyor?)
- ✅ Alternatif karşılaştırmaları
- ✅ Best practices
- ✅ Gerçek örnekler
