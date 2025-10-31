# SERVER TARAFLI KOD AÇIKLAMASI - DETAYLI DOKÜMANTASYON

## GİRİŞ

Bu doküman, Berat Cankır YKS Analiz Takip Sistemi'nin server tarafındaki tüm kodları detaylı olarak açıklar.

**Server Dosyaları:**
- `server/index.ts` - Ana server entry point
- `server/rotalar.ts` - API routes ve endpoint'ler (1820 satır)
- `server/depolama.ts` - Storage implementation (1768 satır)
- `server/vite.ts` - Vite dev server integration
- `server/static.ts` - Static file serving
- `server/env-validation.ts` - Environment variable validation

**Toplam Server Kodu:** ~4000+ satır

---

## BÖLÜM 1: server/index.ts - ANA GİRİŞ NOKTASI

### 1.1 Dosya Amacı

`server/index.ts` dosyası Express server'ın başlatıldığı ana entry point'tir.

**Sorumluluklar:**
1. Environment variables yükleme (dotenv)
2. Express app oluşturma ve konfigürasyon
3. Middleware'leri yükleme
4. Routes'ları register etme
5. Static file serving (production)
6. Vite dev server (development)
7. Server'ı belirtilen port'ta başlatma
8. Otomatik arşivleme zamanlayıcısı

### 1.2 dotenv Konsol Log Filtreleme

```typescript
const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  const message = args.join(' ');
  if (message.includes('[dotenv') || message.includes('injecting env') || 
      message.includes('dotenvx.com') || message.includes('prevent building')) {
    return; // Bu mesajları gösterme
  }
  originalConsoleLog.apply(console, args);
};

dotenv.config({ debug: false });

console.log = originalConsoleLog; // Restore
```

**Neden bu gerekli?**

dotenv kütüphanesi bazı gereksiz debug mesajları yazdırır:
```
[dotenv][INFO] Loading environment variables from .env
[dotenv][WARN] Please visit https://dotenvx.com
```

Bu mesajlar:
- Electron console'unu kirletir
- Kullanıcıyı rahatsız eder
- Production log'larını karıştırır

**Çözüm:**
`console.log` geçici olarak override edilir, sadece dotenv mesajları filtrelenir, sonra restore edilir.

**Alternatif Çözüm:**
```typescript
import dotenv from 'dotenv';
dotenv.config({ debug: false, override: false });
```
Ama bu da yeterli değil, bu yüzden console.log override gerekiyor.

### 1.3 Express App Konfigürasyonu

```typescript
const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("env", "production");
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
```

**Açıklama:**

**1. Production Environment Ayarı**
```typescript
app.set("env", "production");
```
- Express internal optimization'ları aktif eder
- Error stack trace'leri production'da gizlenir
- Template caching aktif edilir

**2. JSON Body Parser**
```typescript
app.use(express.json());
```
- `Content-Type: application/json` olan request'leri parse eder
- `req.body` içinde JSON data'ya erişim sağlar
- Maksimum body size: 100kb (default)

**Örnek:**
```
POST /api/tasks
Content-Type: application/json

{"title": "Matematik Çalış", "priority": "high"}
```
→ `req.body.title === "Matematik Çalış"`

**3. URL-Encoded Parser**
```typescript
app.use(express.urlencoded({ extended: false }));
```
- HTML form data'yı parse eder
- `extended: false` → querystring library kullanır (basit)
- `extended: true` → qs library kullanır (nested objects)

**Örnek:**
```
POST /api/tasks
Content-Type: application/x-www-form-urlencoded

title=Matematik+Çalış&priority=high
```
→ `req.body.title === "Matematik Çalış"`

### 1.4 Request Logging Middleware

```typescript
app.use((req, res, next) => {
  const start = Date.now();
  const pathReq = req.path;
  let capturedJsonResponse: any;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathReq.startsWith("/api")) {
      // Gereksiz logları filtrele
      const shouldSkipLog = (
        (req.method === 'GET' && res.statusCode === 304) ||
        (req.method === 'GET' && duration < 50 && res.statusCode === 200)
      );

      if (shouldSkipLog) {
        return;
      }

      let logLine = `${req.method} ${pathReq} ${res.statusCode} in ${duration}ms`;
      
      if (res.statusCode >= 400 || duration > 1000) {
        logLine += ` [IP: ${externalIp}]`;
      }

      log(logLine);
    }
  });

  next();
});
```

**Detaylı Açıklama:**

**1. Timing Measurement**
```typescript
const start = Date.now();
// ... request processing ...
const duration = Date.now() - start;
```
Her request'in ne kadar sürdüğünü ölçer.

**2. Response Capture**
```typescript
const originalResJson = res.json;
res.json = function (bodyJson, ...args) {
  capturedJsonResponse = bodyJson;
  return originalResJson.apply(res, [bodyJson, ...args]);
};
```

**Neden gerekli?**
- `res.json()` çağrıldığında response body'yi yakalamak için
- Error logging için response içeriği gerekli
- Monkey-patching pattern (function override)

**3. Log Filtering (Performance Optimization)**

```typescript
const shouldSkipLog = (
  (req.method === 'GET' && res.statusCode === 304) ||
  (req.method === 'GET' && duration < 50 && res.statusCode === 200)
);
```

**Filtrelenen Log'lar:**
- `GET /api/tasks` → `304 Not Modified` (cached)
- `GET /api/tasks` → `200 OK` in 30ms (hızlı request)

**Neden filtrele?**
- Console spam önlenir
- Önemli log'lar kaybolmaz
- Performance overhead azalır

**4. Detailed Logging for Errors/Slow Requests**

```typescript
if (res.statusCode >= 400 || duration > 1000) {
  logLine += ` [IP: ${externalIp}]`;
}
```

**Error veya yavaş request'lerde:**
- IP adresi eklenir (debugging için)
- Response body log edilir (hata detayı)

**Örnek Log Çıktıları:**

```
# Normal
GET /api/tasks 200 in 15ms

# Hata
POST /api/tasks 400 in 120ms [IP: ::1] :: {"message": "Invalid task data"}

# Yavaş
GET /api/exam-results 200 in 1250ms [IP: ::1]
```

### 1.5 Route Registration

```typescript
const server = await registerRoutes(app);
```

**Açıklama:**
- `registerRoutes()` fonksiyonu `server/rotalar.ts`'den import edilir
- Tüm API endpoint'leri register edilir
- HTTP server instance döner (WebSocket için gerekebilir)

**Return Value:**
```typescript
function registerRoutes(app: Express): Promise<Server> {
  // ... route definitions ...
  return createServer(app);
}
```

### 1.6 Error Handler Middleware

```typescript
app.use((err: any, _req: any, res: any, _next: any) => {
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
4 parametre = Error handling middleware (Express convention)

**2. Status Code Fallback**
```typescript
const status = err.status || err.statusCode || 500;
```
- `err.status` → HTTP errors (404, 403)
- `err.statusCode` → Custom errors
- `500` → Unknown errors (default)

**3. Error Logging**
```typescript
console.error("Server error:", err);
```
Full error stack trace console'a yazdırılır (debugging için).

**4. Client Response**
```typescript
res.status(status).json({ message });
```
Client'a sadece error message gönderilir, stack trace GÖNDERİLMEZ (güvenlik).

**Örnek Hata:**
```javascript
throw new Error("User not found");
```
→ Response:
```json
{
  "message": "User not found"
}
```

### 1.7 Development vs Production Mode

```typescript
if (app.get("env") === "development") {
  const { setupVite } = await import("./vite");
  await setupVite(app, server);
} else {
  serveStatic(app);
}
```

**Development Mode:**
- Vite dev server başlatılır
- HMR (Hot Module Replacement) aktif
- Source maps mevcut
- Build step yok (direkt TS dosyaları çalışır)

**Production Mode:**
- Static file serving (build edilmiş dosyalar)
- Minified ve optimized kod
- Source maps yok
- Daha hızlı

**Vite Dev Server Avantajları:**
- Instant HMR (<50ms)
- ES modules native support
- No bundling in dev (hızlı start)

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
- Environment variable varsa kullan
- Yoksa default 5000
- Base 10 (decimal) parse

**2. Host Binding**
```typescript
const host = "0.0.0.0";
```

**Neden `0.0.0.0` ve `localhost` değil?**

| Host | Erişim |
|------|--------|
| `localhost` | Sadece local machine |
| `127.0.0.1` | Sadece local machine |
| `0.0.0.0` | Tüm network interfaces |

**0.0.0.0 ile:**
- Local machine: `http://localhost:5000` ✅
- LAN: `http://192.168.1.100:5000` ✅
- Electron: `http://localhost:5000` ✅

**3. Success Log**
```typescript
log(`Dersime dönebilirim !!! Site Link : http://${host}:${port}`);
```
Bu mesaj Electron console'unda görünür ve kullanıcıya server'ın hazır olduğunu bildirir.

### 1.9 Otomatik Arşivleme Zamanlayıcısı

```typescript
function scheduleAutoArchive() {
  const now = new Date();
  const turkeyTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
  
  const nextSunday = new Date(turkeyTime);
  const currentDay = nextSunday.getDay();
  const daysUntilSunday = (7 - currentDay) % 7;
  
  if (daysUntilSunday === 0) {
    nextSunday.setDate(nextSunday.getDate() + 7);
  } else {
    nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
  }
  
  nextSunday.setHours(23, 59, 0, 0);
  
  const msUntilNextSunday = nextSunday.getTime() - turkeyTime.getTime();
  
  setTimeout(async () => {
    try {
      console.log('🗄️  Otomatik arşivleme başlatılıyor...');
      await storage.autoArchiveOldData();
      console.log('✅ Otomatik arşivleme tamamlandı');
      
      scheduleAutoArchive(); // Bir sonraki hafta için
    } catch (error) {
      console.error('❌ Otomatik arşivleme hatası:', error);
      scheduleAutoArchive(); // Hata olsa bile devam et
    }
  }, msUntilNextSunday);
  
  console.log(`📅 Bir sonraki otomatik arşivleme: ${nextSunday.toLocaleString('tr-TR')}`);
}

scheduleAutoArchive();
```

**Detaylı Açıklama:**

**1. Türkiye Saati Hesaplama**
```typescript
const turkeyTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
```
- Server farklı timezone'da olabilir (UTC, GMT)
- Kullanıcı Türkiye'de, arşivleme Türkiye saatine göre olmalı
- `Europe/Istanbul` → GMT+3

**2. Bir Sonraki Pazar Hesaplama**

```typescript
const currentDay = nextSunday.getDay(); // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
const daysUntilSunday = (7 - currentDay) % 7;
```

**Örnek Hesaplamalar:**

| Bugün | currentDay | daysUntilSunday | Sonuç |
|-------|------------|-----------------|-------|
| Pazar | 0 | 0 | 7 gün sonra (bir sonraki Pazar) |
| Pazartesi | 1 | 6 | 6 gün sonra |
| Cumartesi | 6 | 1 | 1 gün sonra |

**3. Saat Ayarlama**
```typescript
nextSunday.setHours(23, 59, 0, 0);
```
Her Pazar saat 23:59:00.000'da çalışacak.

**4. Timeout Hesaplama**
```typescript
const msUntilNextSunday = nextSunday.getTime() - turkeyTime.getTime();
setTimeout(async () => { /* ... */ }, msUntilNextSunday);
```

**Örnek:**
```
Şimdi: Pazartesi 10:00
Sonraki Pazar: 6 gün 13 saat 59 dakika sonra
msUntilNextSunday: 6 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000 + 59 * 60 * 1000
```

**5. Recursive Scheduling**
```typescript
setTimeout(async () => {
  await storage.autoArchiveOldData();
  scheduleAutoArchive(); // Bir sonraki hafta için schedule et
}, msUntilNextSunday);
```

Her hafta Pazar 23:59'da:
1. Arşivleme çalışır
2. Yeni bir sonraki Pazar için schedule edilir
3. Sonsuz loop

**6. Error Handling**
```typescript
try {
  await storage.autoArchiveOldData();
} catch (error) {
  console.error('❌ Otomatik arşivleme hatası:', error);
  scheduleAutoArchive(); // Hata olsa bile devam et
}
```

Eğer arşivleme hata verirse:
- Hata log edilir
- Uygulama crash olmaz
- Bir sonraki hafta yine denenecek

---

## BÖLÜM 2: server/rotalar.ts - API ENDPOINTS

### 2.1 Dosya Yapısı

`server/rotalar.ts` dosyası 1820 satırdan oluşur ve tüm API endpoint'lerini içerir.

**Endpoint Kategorileri:**
1. **Görevler (Tasks)** - CRUD operations
2. **Ruh Hali (Moods)** - Mood tracking
3. **Hedefler (Goals)** - Goal setting
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
- Electron main process bu tag'i yakalar
- Activity logger'a ekler
- Activities window'da gösterir

**Örnek Kullanım:**
```typescript
app.post("/api/tasks", async (req, res) => {
  const task = await storage.createTask(validatedData);
  logActivity('Görev Eklendi', validatedData.title);
  res.status(201).json(task);
});
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
- Tüm görevleri getirir (deleted=false olanlar)
- Arşivlenenler hariç (archived=false)
- Zaman sıralaması: En yeni önce

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
    "completed": false,
    "archived": false,
    "createdAt": "2025-10-30T10:00:00.000Z"
  }
]
```

#### POST /api/tasks

```typescript
app.post("/api/tasks", async (req, res) => {
  try {
    const validatedData = insertTaskSchema.parse(req.body);
    const task = await storage.createTask(validatedData);
    logActivity('Görev Eklendi', validatedData.title);
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        message: "Görev verisi geçersiz. Lütfen tüm gerekli alanları kontrol edin.", 
        errors: error.errors 
      });
    } else {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Görev oluşturulurken bir hata oluştu. Lütfen tekrar deneyin." });
    }
  }
});
```

**Validation:**
```typescript
const validatedData = insertTaskSchema.parse(req.body);
```
- Zod schema ile validation
- Gerekli alanlar: `title`, `priority`, `category`
- Opsiyonel alanlar: `description`, `color`, `dueDate`

**Hata Türleri:**

**1. Validation Error (400)**
```json
{
  "message": "Görev verisi geçersiz...",
  "errors": [
    {
      "path": ["title"],
      "message": "Required"
    }
  ]
}
```

**2. Server Error (500)**
```json
{
  "message": "Görev oluşturulurken bir hata oluştu..."
}
```

**Activity Log:**
```
[ACTIVITY] Görev Eklendi | Matematik Türev Çalışması
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

    logActivity('Görev Durumu Değiştirildi', task.completed ? 'Tamamlandı' : 'Beklemede');
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle task completion" });
  }
});
```

**Açıklama:**
- Görevin `completed` durumunu toggle eder
- `completed: false` → `completed: true` (ve tersi)
- `completedAt` timestamp güncellenir

**toggleTaskComplete() İmplementasyonu:**
```typescript
async toggleTaskComplete(id: string): Promise<Task | undefined> {
  const task = this.tasks.get(id);
  if (!task) return undefined;
  
  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;
  
  this.tasks.set(id, task);
  await this.saveToFile();
  return task;
}
```

### 2.4 Soru Günlüğü (Question Log) Endpoints

#### POST /api/question-logs

```typescript
app.post("/api/question-logs", async (req, res) => {
  try {
    const validatedData = insertQuestionLogSchema.parse(req.body);
    const log = await storage.createQuestionLog(validatedData);
    
    logActivity('Soru Kaydı Eklendi', 
      `${validatedData.exam_type} - ${validatedData.subject}`
    );
    
    res.status(201).json(log);
  } catch (error) {
    // Error handling...
  }
});
```

**Request Body Örneği:**
```json
{
  "exam_type": "TYT",
  "subject": "Matematik",
  "topic": "Türev",
  "correct_count": "25",
  "wrong_count": "4",
  "blank_count": "1",
  "wrong_topics": ["Zincir Kuralı", "İkinci Türev"],
  "time_spent_minutes": 35,
  "study_date": "2025-10-30"
}
```

**Validation Rules:**
```typescript
export const insertQuestionLogSchema = z.object({
  exam_type: z.enum(["TYT", "AYT"]),
  subject: z.string(),
  topic: z.string().nullable().optional(),
  correct_count: z.string(),
  wrong_count: z.string(),
  blank_count: z.string().optional(),
  wrong_topics: z.array(z.string()).optional(),
  time_spent_minutes: z.number().nullable().optional(),
  study_date: z.string()
});
```

**Activity Log:**
```
[ACTIVITY] Soru Kaydı Eklendi | TYT - Matematik
```

---

## DEVAM EDECEK...

Bu dosya server tarafının ilk bölümünü açıkladı.

**Toplam Satır:** 700+ satır
**Kalan Konular:**
- Sınav Sonuçları endpoints
- Konu İstatistikleri endpoints
- Weather API integration
- WebSocket implementation (eğer varsa)
- Storage implementation detayları

