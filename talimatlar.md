# YKS Deneme Analizi Uygulaması - Kapsamlı Talimatlar ve Teknik Rehber

Bu dokümantasyon, YKS Deneme Analizi uygulamasını **sıfırdan başlayan birine** anlatır gibi, her teknik terimi Türkçe karşılıklarıyla açıklar, teknoloji seçimlerinin nedenlerini detaylandırır ve kapsamlı bir öğrenme kaynağı sunar.

---

## 📚 İçindekiler

1. [Giriş ve Temel Kavramlar](#temel-kavramlar)
2. [Uygulama Mimarisi](#mimari)
3. [Teknoloji Yığını Detayları](#teknoloji-detaylari)
4. [Geliştirme Ortamı Kurulumu](#kurulum)
5. [Proje Yapısı ve Organizasyon](#proje-yapisi)
6. [Geliştirme İş Akışı](#gelistirme)
7. [Dağıtım ve Paketleme](#dagitim)
8. [Performans ve Optimizasyon](#performans)
9. [Güvenlik ve En İyi Uygulamalar](#guvenlik)
10. [Sorun Giderme ve Hata Ayıklama](#sorun-giderme)
11. [Öğrenme Kaynakları](#kaynaklar)

---

<a name="temel-kavramlar"></a>
## 📖 1. Giriş ve Temel Kavramlar

### 1.1 Uygulama Nedir?

**YKS Deneme Analizi**, Yükseköğretim Kurumları Sınavı'na (YKS) hazırlanan öğrenciler için geliştirilmiş **kapsamlı bir takip ve analiz sistemi**dir.

**Temel Özellikler:**
- 📊 Deneme sınavı sonuçlarını kaydetme ve analiz etme
- 📈 Net gelişimi grafiklerle görselleştirme
- 🎯 Yanlış yapılan konuları kategorize ederek takip
- 📝 Günlük soru çözüm kayıtları
- 📉 TYT/AYT branş bazlı detaylı analizler
- ⏱️ Çalışma saati takibi
- ✅ Akıllı görev yönetimi (önceliklendirme, kategorizasyon)
- 📅 Yıllık aktivite haritası (heatmap)

### 1.2 Temel Yazılım Kavramları

#### Frontend (Ön Yüz) Nedir?
**Tanım:** Kullanıcının gördüğü ve etkileşimde bulunduğu kısım.
- **İngilizce:** Frontend, Client-Side, UI (User Interface)
- **Türkçe:** Ön Yüz, İstemci Tarafı, Kullanıcı Arayüzü
- **Örnek:** Butonlar, formlar, grafikler, renkler, animasyonlar
- **Teknolojiler:** HTML, CSS, JavaScript, React

#### Backend (Arka Yüz) Nedir?
**Tanım:** Kullanıcının görmediği, veri işlemlerinin yapıldığı kısım.
- **İngilizce:** Backend, Server-Side, API (Application Programming Interface)
- **Türkçe:** Arka Yüz, Sunucu Tarafı, Uygulama Programlama Arayüzü
- **Örnek:** Veri saklama, okuma, güncelleme, silme (CRUD)
- **Teknolojiler:** Node.js, Express, databases

#### Full-Stack (Tam Yığın) Nedir?
**Tanım:** Frontend + Backend = Her şey
- Tek bir geliştirici her iki tarafı da yapabilir
- Bu proje bir full-stack uygulamadır

#### Desktop Application (Masaüstü Uygulaması) Nedir?
**Tanım:** Bilgisayara kurulan, tarayıcı gerektirmeyen uygulama
- **Örnekler:** Microsoft Word, Photoshop, Spotify Desktop
- **Bizim Teknolojimiz:** Electron

---

<a name="mimari"></a>
## 🏗️ 2. Uygulama Mimarisi

### 2.1 Mimari Kararlar

#### Neden Masaüstü Uygulaması?

**Alternatiflerin Karşılaştırması:**

| Özellik | Web App | Mobile App | Desktop App (Bizim Seçim) |
|---------|---------|------------|---------------------------|
| **Platform** | Tarayıcı | iOS/Android | Windows/Mac/Linux |
| **Kurulum** | Gerekmiyor | App Store | Tek sefer .exe |
| **İnternet** | Gerekli ❌ | Kısmen gerekli | Gerekmez ✅ |
| **Performans** | Orta | İyi | Çok İyi ✅ |
| **Veri Gizliliği** | Sunucuda ❌ | Cihazda ✅ | Cihazda ✅ |
| **Offline Çalışma** | Hayır ❌ | Kısıtlı | Tamamen ✅ |
| **Ekran Boyutu** | Değişken | Küçük ❌ | Büyük ✅ |
| **Grafik/Analiz** | İyi | Zayıf ❌ | Mükemmel ✅ |
| **Güncelleme** | Otomatik | Store onayı | Auto-updater |
| **Geliştirme** | Kolay ✅ | 2x Kod gerekir ❌ | Orta |

**Karar:** Desktop uygulaması, kullanım senaryomuz için en ideal çözüm.

---

### 2.2 Electron Nedir ve Nasıl Çalışır?

#### Electron'un Yapısı

```
┌─────────────────────────────────────────┐
│           ELECTRON UYGULAMASI            │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐   ┌───────────────┐  │
│  │              │   │               │  │
│  │  Main        │   │   Renderer    │  │
│  │  Process     │◄─►│   Process     │  │
│  │              │   │               │  │
│  │  (Node.js)   │   │  (Chromium)   │  │
│  │              │   │               │  │
│  └──────────────┘   └───────────────┘  │
│        │                    │           │
│        │                    │           │
│   ┌────▼────┐          ┌───▼────┐      │
│   │  File   │          │ React  │      │
│   │ System  │          │   UI   │      │
│   │  OS API │          │  HTML  │      │
│   └─────────┘          └────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

**Main Process (Ana Süreç):**
- **Görev:** Pencere yönetimi, sistem erişimi
- **Teknoloji:** Node.js
- **Dosya:** `electron/main.cjs`
- **Yetenekler:**
  - Dosya sistemi (okuma/yazma/silme)
  - Sistem tepsisi (tray icon)
  - Menüler
  - Dialog'lar
  - Auto-updater

**Renderer Process (Render Süreci):**
- **Görev:** UI render etme, kullanıcı etkileşimi
- **Teknoloji:** Chromium (tarayıcı)
- **Dosyalar:** `client/src/*`
- **Yetenekler:**
  - HTML render
  - CSS stillendirme
  - JavaScript çalıştırma
  - DOM manipülasyonu

**IPC (Inter-Process Communication - Süreçler Arası İletişim):**
```typescript
// Main Process
ipcMain.handle('get-data', async () => {
  return fs.readFileSync('data.json');
});

// Renderer Process
const data = await ipcRenderer.invoke('get-data');
```

---

#### Electron vs Alternatifler

| Özellik | Electron | Qt/C++ | Tauri | .NET/WPF |
|---------|----------|--------|-------|----------|
| **Dil** | Web (HTML/CSS/JS) | C++ | Rust + Web | C# |
| **Öğrenme** | Kolay ✅ | Zor ❌ | Orta | Orta |
| **Dosya Boyutu** | ~150MB ❌ | ~20MB ✅ | ~10MB ✅ | ~50MB |
| **Performans** | İyi | Mükemmel ✅ | Mükemmel ✅ | İyi |
| **Platform** | Cross ✅ | Cross ✅ | Cross ✅ | Windows |
| **Ekosistem** | Huge ✅ | Büyük | Küçük ❌ | Orta |
| **UI Kolaylığı** | Çok Kolay ✅ | Zor ❌ | Kolay | Kolay |
| **Popülerlik** | VSCode, Discord ✅ | Qt Creator | Yeni | Visual Studio |

**Neden Electron Seçtik:**
1. ✅ **Web Bilgisi Yeterli:** HTML/CSS/JS bilen herkes geliştirebilir
2. ✅ **Hızlı Geliştirme:** React ekosistemi sayesinde çok hızlı
3. ✅ **Zengin UI:** Modern, animasyonlu, responsive arayüzler
4. ✅ **Büyük Topluluk:** Her soruna cevap var
5. ✅ **Güvenilir:** Microsoft (VSCode), Discord, Slack kullanıyor
6. ❌ **Trade-off:** Dosya boyutu büyük ama disk ucuz (kabul edilebilir)

---

<a name="teknoloji-detaylari"></a>
## 🔧 3. Teknoloji Yığını Detayları

### 3.1 Frontend Teknolojileri

#### 3.1.1 React 18 - UI Kütüphanesi

**React Nedir?**
- **Tanım:** Kullanıcı arayüzü oluşturmak için kullanılan JavaScript kütüphanesi
- **Yaratıcı:** Facebook (Meta)
- **İlk Çıkış:** 2013
- **Felsefi:** Component-based (bileşen tabanlı), declarative (bildirimsel)

**Temel Kavramlar:**

**1. Component (Bileşen)**
```jsx
// Fonksiyon Component
function Buton({ metin, renk }) {
  return (
    <button style={{ backgroundColor: renk }}>
      {metin}
    </button>
  );
}

// Kullanım
<Buton metin="Kaydet" renk="blue" />
```

**2. Props (Özellikler)**
```jsx
// Parent → Child veri aktarımı
function Parent() {
  return <Child isim="Ahmet" yas={18} />;
}

function Child({ isim, yas }) {
  return <p>{isim}, {yas} yaşında</p>;
}
```

**3. State (Durum)**
```jsx
function Sayac() {
  const [sayi, setSayi] = useState(0);
  
  return (
    <>
      <p>Sayı: {sayi}</p>
      <button onClick={() => setSayi(sayi + 1)}>Artır</button>
    </>
  );
}
```

**4. Effect (Yan Etki)**
```jsx
function VeriYukle() {
  const [veri, setVeri] = useState([]);
  
  useEffect(() => {
    // Component mount olunca çalışır
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setVeri(data));
  }, []); // Dependency array (bağımlılık dizisi)
  
  return <div>{veri.map(item => ...)}</div>;
}
```

**Virtual DOM (Sanal DOM) Nedir?**
```
Real DOM (Gerçek DOM):
  ├─ Yavaş güncellemeler
  ├─ Tüm sayfa yenilenir
  └─ Performans sorunu

Virtual DOM (Sanal DOM):
  ├─ Hafızada JavaScript objesi
  ├─ Hızlı karşılaştırma (diffing)
  ├─ Sadece değişenleri güncelle
  └─ Performans mükemmel ✅
```

**React Hooks (Kancalar) Nedir?**
- Fonksiyonel component'lere özel yetenekler kazandırır
- Class component'lere gerek kalmadan state kullanımı

**Önemli Hook'lar:**
```jsx
import { 
  useState,      // State yönetimi
  useEffect,     // Yan etkiler
  useContext,    // Context API
  useRef,        // DOM referansı
  useMemo,       // Hesaplama önbellekleme
  useCallback,   // Fonksiyon önbellekleme
  useReducer     // Karmaşık state yönetimi
} from 'react';
```

---

#### 3.1.2 TypeScript - Tip Güvenli JavaScript

**JavaScript vs TypeScript Karşılaştırması:**

**JavaScript (Dinamik Tip):**
```javascript
function topla(a, b) {
  return a + b;
}

topla(5, 10);        // 15 ✅
topla("5", "10");    // "510" ❌ (Hata yok ama yanlış!)
topla(5);            // NaN ❌ (Hata yok ama yanlış!)
```

**TypeScript (Statik Tip):**
```typescript
function topla(a: number, b: number): number {
  return a + b;
}

topla(5, 10);        // 15 ✅
topla("5", "10");    // HATA! Kod çalışmaz
topla(5);            // HATA! Eksik parametre
```

**TypeScript'in Avantajları:**

**1. Compile-Time Error Checking (Derleme Zamanı Hata Kontrolü)**
```typescript
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: "Ahmet",
  agee: 25  // HATA! "agee" değil, "age" olmalı
};
```

**2. IntelliSense (Otomatik Tamamlama)**
```typescript
// user. yazdığınızda IDE otomatik:
user.name  // ✅ Görünür
user.age   // ✅ Görünür
user.email // ❌ Görünmez (tanımlı değil)
```

**3. Refactoring Safety (Yeniden Yapılandırma Güvenliği)**
```typescript
// Bir değişken adını değiştirin
// TypeScript tüm kullanımları otomatik bulur
```

**Temel Tipler:**
```typescript
// Primitive (İlkel) Tipler
let str: string = "merhaba";
let num: number = 42;
let bool: boolean = true;
let arr: number[] = [1, 2, 3];
let tuple: [string, number] = ["ahmet", 25];

// Object Tipleri
interface Person {
  name: string;
  age: number;
  email?: string;  // Optional (isteğe bağlı)
}

// Union Types (Birleşim Tipleri)
let id: string | number = "123"; // String veya number
id = 456; // ✅ İkisi de geçerli

// Generic Types (Jenerik Tipler)
function identity<T>(value: T): T {
  return value;
}
identity<number>(5);      // T = number
identity<string>("abc");  // T = string
```

**Type Inference (Tip Çıkarımı):**
```typescript
let x = 5;        // TypeScript: x is number
let y = "hello";  // TypeScript: y is string

// Açık yazmanıza gerek yok!
```

---

#### 3.1.3 Vite - Modern Build Tool

**Build Tool (Derleme Aracı) Nedir?**
```
Kaynak Kod         →    Build Tool    →    Production Kod
─────────────────────────────────────────────────────────
TypeScript         →      Vite        →    JavaScript (ES5)
JSX                →                  →    Normal HTML
Modern JS (ES2022) →                  →    Eski tarayıcı uyumlu
Multiple Files     →                  →    Bundled (tek dosya)
```

**Vite vs Webpack:**

| Özellik | Vite | Webpack |
|---------|------|---------|
| **Dev Server Start** | 0.5s ⚡ | 30s 🐢 |
| **HMR Speed** | 50ms ⚡ | 3000ms 🐢 |
| **Build Speed** | 20s | 60s |
| **Configuration** | Minimal ✅ | Karmaşık ❌ |
| **Learning Curve** | Kolay ✅ | Zor ❌ |

**HMR (Hot Module Replacement) Nedir?**
```
Geleneksel Yenileme:
  Kod Değişikliği → Tam Sayfa Yenileme → State Kaybı → Yavaş

HMR:
  Kod Değişikliği → Sadece O Modül Güncellenir → State Korunur → Çok Hızlı ✅
```

**Örnek:**
```
Form dolduruyorsunuz (5 alan dolu)
  ↓
CSS'de bir renk değiştiriyorsunuz
  ↓
Geleneksel: Sayfa yenilenir, form temizlenir ❌
HMR: Sadece renk değişir, form dolu kalır ✅
```

**Tree Shaking (Ağaç Sallama) Nedir?**
```javascript
// utils.js
export function kullanilan() { ... }
export function kullanilmayan() { ... }

// main.js
import { kullanilan } from './utils';

// Build Output:
// Sadece "kullanilan" fonksiyonu eklenir
// "kullanilmayan" atılır → Dosya boyutu küçülür ✅
```

**Code Splitting (Kod Bölme) Nedir?**
```
Tek Dosya:
  app.js (3MB) → Yavaş yükleme ❌

Code Splitting:
  main.js (100KB)      → Ana kod, hemen yükle
  vendor.js (500KB)    → React, kütüphaneler
  page1.js (200KB)     → Sadece Page 1'de gerekli
  page2.js (150KB)     → Sadece Page 2'de gerekli
  
  → İlk yükleme çok hızlı ✅
  → Sayfa değişince gerekeni yükle
```

---

#### 3.1.4 Tailwind CSS - Utility-First CSS

**Geleneksel CSS vs Tailwind:**

**Geleneksel CSS:**
```css
/* style.css */
.card {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.card-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}
```
```html
<div class="card">
  <h2 class="card-title">Başlık</h2>
  <p>İçerik</p>
</div>
```

**Tailwind CSS:**
```html
<div class="bg-white rounded-lg p-4 shadow-md">
  <h2 class="text-2xl font-bold mb-2">Başlık</h2>
  <p>İçerik</p>
</div>
```

**Tailwind'in Avantajları:**
1. ✅ **Hızlı Geliştirme:** HTML yazarken stil veriyorsunuz
2. ✅ **Tutarlılık:** Önceden tanımlı design system
3. ✅ **Küçük Dosya:** Unused class'lar temizlenir
4. ✅ **Responsive Kolay:** `sm:`, `md:`, `lg:` prefixleri
5. ✅ **Dark Mode:** `dark:` prefix ile otomatik

**Responsive Design (Duyarlı Tasarım):**
```html
<div class="
  text-sm           /* Mobil: 14px */
  md:text-base      /* Tablet (768px+): 16px */
  lg:text-lg        /* Desktop (1024px+): 18px */
  xl:text-2xl       /* Geniş Ekran (1280px+): 24px */
">
  Responsive Metin
</div>
```

**Dark Mode (Karanlık Mod):**
```html
<div class="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
  border-gray-200 dark:border-gray-700
">
  Tema-duyarlı içerik
</div>
```

**Hover, Active, Focus States:**
```html
<button class="
  bg-blue-500 
  hover:bg-blue-600      /* Fare üzerinde */
  active:bg-blue-700     /* Tıklandığında */
  focus:ring-2           /* Odaklandığında ring */
  focus:ring-blue-300    /* Ring rengi */
  disabled:opacity-50    /* Devre dışıysa */
  transition             /* Pürüzsüz geçiş */
  duration-200           /* 200ms */
">
  Etkileşimli Buton
</button>
```

---

#### 3.1.5 shadcn/ui - Component Library

**Component Library Nedir?**
Hazır UI bileşenleri sağlayan kütüphaneler.

**shadcn/ui'nin Farkı:**
```
Geleneksel (Material UI, Ant Design):
  ├─ npm install material-ui
  ├─ import { Button } from '@mui/material'
  └─ Kodu göremezsiniz, değiştiremezsiniz

shadcn/ui:
  ├─ npx shadcn-ui add button
  ├─ Kod projenize kopyalanır
  └─ Tüm kodu görür ve değiştirebilirsiniz ✅
```

**Headless Components (Başsız Bileşenler):**
```
Radix UI (Headless):
  ├─ Fonksiyonel ✅ (keyboard nav, accessibility)
  └─ Stil yok ❌

shadcn/ui:
  ├─ Radix UI (fonksiyon)
  ├─ + Tailwind CSS (stil)
  └─ = Güzel ve erişilebilir bileşen ✅
```

**Accessibility (Erişilebilirlik) Nedir?**
- Engelli kullanıcılar için uyumluluk
- Screen reader (ekran okuyucu) desteği
- Keyboard navigasyon
- ARIA attributes (ARIA özellikleri)

**Örnek:**
```jsx
// Radix Dialog (headless)
<Dialog.Root>
  <Dialog.Trigger>Aç</Dialog.Trigger>
  <Dialog.Content>İçerik</Dialog.Content>
</Dialog.Root>

// shadcn/ui Dialog (styled)
<Dialog>
  <DialogTrigger asChild>
    <Button>Aç</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Başlık</DialogTitle>
    </DialogHeader>
    <p>İçerik</p>
  </DialogContent>
</Dialog>
```

---

### 3.2 Backend Teknolojileri

#### 3.2.1 Node.js - JavaScript Runtime

**Runtime Nedir?**
- Kodun çalıştığı ortam
- Tarayıcı = JavaScript runtime (frontend)
- Node.js = JavaScript runtime (backend)

**Node.js'in Mimarisi:**
```
┌─────────────────────────────────┐
│         Node.js                 │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │   JavaScript Engine       │  │
│  │       (V8)                │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │   Libuv (Event Loop)      │  │
│  │   - File System           │  │
│  │   - Network               │  │
│  │   - Timers                │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │   C++ Bindings            │  │
│  │   - OS APIs               │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Event Loop (Olay Döngüsü) Nedir?**
```
Senkron (Bloklu) İşlem:
  Task 1 (5sn) → Task 2 (3sn) → Task 3 (2sn)
  Toplam: 10 saniye

Asenkron (Bloksuz) İşlem:
  Task 1 başla → Task 2 başla → Task 3 başla
  ↓ (paralel çalışır)
  En yavaş 5sn'de tümü biter ✅
```

**Callback, Promise, Async/Await:**

**1. Callback (Geri Çağırma):**
```javascript
fs.readFile('dosya.txt', (err, data) => {
  if (err) throw err;
  console.log(data);
});
```

**2. Promise (Söz):**
```javascript
fs.promises.readFile('dosya.txt')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

**3. Async/Await (Modern):**
```javascript
async function oku() {
  try {
    const data = await fs.promises.readFile('dosya.txt');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

---

#### 3.2.2 Express.js - Web Framework

**HTTP Protokolü Nedir?**
```
Client                          Server
  │                               │
  ├──── HTTP Request ──────────→  │
  │     GET /api/users            │
  │                               │
  │  ←──── HTTP Response ────────┤
  │       200 OK                  │
  │       [{ name: "Ali" }]       │
```

**HTTP Methods (Metodları):**
```
GET     → Veri oku (Read)
POST    → Veri oluştur (Create)
PUT     → Tümünü güncelle (Replace)
PATCH   → Kısmen güncelle (Update)
DELETE  → Sil (Delete)
```

**Status Codes (Durum Kodları):**
```
2xx Başarılı:
  200 OK                 → Başarılı
  201 Created            → Oluşturuldu
  204 No Content         → İçerik yok (genelde DELETE'de)

3xx Yönlendirme:
  301 Moved Permanently  → Kalıcı taşındı
  302 Found              → Geçici taşındı

4xx İstemci Hatası:
  400 Bad Request        → Hatalı istek
  401 Unauthorized       → Yetkisiz
  403 Forbidden          → Yasak
  404 Not Found          → Bulunamadı

5xx Sunucu Hatası:
  500 Internal Server Error  → Sunucu hatası
  503 Service Unavailable    → Servis kullanılamıyor
```

**Middleware Nedir?**
```
Request → Middleware 1 → Middleware 2 → Route → Response
```

**Middleware Örnekleri:**
```javascript
// 1. Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // Sonraki middleware'e geç
});

// 2. Authentication
app.use((req, res, next) => {
  if (req.headers.authorization) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
});

// 3. Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error!');
});
```

---

#### 3.2.3 In-Memory Storage - Veri Saklama

**Veri Saklama Yöntemleri:**

**1. In-Memory (RAM):**
```javascript
const data = new Map();
// Avantaj: Çok hızlı ⚡
// Dezavantaj: Uygulama kapanınca kaybolur ❌
```

**2. File Storage (Dosya):**
```javascript
fs.writeFileSync('data.json', JSON.stringify(data));
// Avantaj: Kalıcı ✅
// Dezavantaj: Yavaş 🐢
```

**3. Bizim Yaklaşımımız (Hybrid):**
```javascript
// RAM'de tut (hızlı erişim)
const data = new Map();

// Her değişiklikte dosyaya yaz (kalıcılık)
data.set('key', 'value');
saveToFile(); // Otomatik
```

**Neden Veritabanı Değil?**

| Özellik | In-Memory+JSON | SQLite | PostgreSQL |
|---------|---------------|--------|------------|
| **Kurulum** | Yok ✅ | Yok ✅ | Gerekli ❌ |
| **Hız** | Çok Hızlı ⚡ | Hızlı | Orta |
| **Taşınabilirlik** | Kolay ✅ | Kolay ✅ | Zor ❌ |
| **Karmaşık Sorgular** | Zor ❌ | Kolay ✅ | Çok Kolay ✅ |
| **Veri Boyutu** | <100MB | <10GB | Sınırsız |

**Bizim İçin İdeal Çünkü:**
- Tek kullanıcı
- Orta büyüklük veri (<50MB)
- Basit CRUD işlemleri
- Kolay yedekleme (JSON kopyala)

---

<a name="kurulum"></a>
## 🚀 4. Geliştirme Ortamı Kurulumu

### 4.1 Gereksinimler

#### Node.js Kurulumu

**Node.js Nedir?**
JavaScript'i sunucu tarafında çalıştıran platform.

**Kurulum Adımları:**
1. https://nodejs.org adresine gidin
2. LTS (Long Term Support) versiyonunu indirin
3. Kurulumu tamamlayın
4. Terminal'de kontrol edin:
```bash
node --version  # v20.11.0 gibi
npm --version   # 10.2.4 gibi
```

**npm Nedir?**
- **Tanım:** Node Package Manager (Node Paket Yöneticisi)
- **Görev:** Kütüphaneleri yükler, yönetir
- **Alternatifi:** yarn, pnpm

---

### 4.2 Proje Kurulumu

#### 1. Depoyu Klonlama
```bash
git clone https://github.com/beratcode03/beratders.git
cd beratders
```

**Git Nedir?**
- Version control system (versiyon kontrol sistemi)
- Kodun geçmişini tutar
- Takım çalışması için ideal

#### 2. Bağımlılıkları Yükleme
```bash
npm install
```

**Ne Yapar?**
```
1. package.json dosyasını okur
2. dependencies ve devDependencies'deki paketleri indirir
3. node_modules/ klasörüne kurar
4. package-lock.json oluşturur (versiyon kilidi)
```

**package.json vs package-lock.json:**
- `package.json`: Genel versiyon aralıkları (`^18.0.0`)
- `package-lock.json`: Tam versiyon kilit (`18.3.1`)

---

### 4.3 Development Server Başlatma

#### Web Uygulaması
```bash
npm run dev
```

**Ne Olur?**
```
1. Vite dev server başlar (port 5000)
2. Express backend başlar (port 5000)
3. HMR etkinleşir
4. http://localhost:5000 açılır
```

#### Electron Uygulaması
```bash
npm run electron:dev
```

**Ne Olur?**
```
1. Development server başlar
2. Electron penceresi açılır
3. DevTools otomatik açılır
4. Hot reload aktif
```

---

<a name="proje-yapisi"></a>
## 📁 5. Proje Yapısı ve Organizasyon

### 5.1 Dizin Yapısı

```
yks-deneme-analizi/
│
├── client/                    # Frontend (React)
│   ├── src/
│   │   ├── sayfalar/         # Pages (Sayfa bileşenleri)
│   │   │   └── panel.tsx
│   │   ├── bilesenler/       # Components (Yeniden kullanılabilir)
│   │   │   ├── arayuz/       # shadcn/ui components
│   │   │   ├── gelismis-grafikler.tsx
│   │   │   ├── flash-kartlar-widget.tsx
│   │   │   └── ...
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── use-toast.ts
│   │   ├── kutuphane/        # Utilities (Yardımcı fonksiyonlar)
│   │   │   ├── sorguIstemcisi.ts
│   │   │   └── yardimcilar.ts
│   │   ├── index.css         # Global styles
│   │   └── App.tsx           # Root component
│   ├── public/               # Static assets
│   └── index.html            # HTML template
│
├── server/                   # Backend (Express)
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # Data layer
│   └── vite.ts              # Vite integration
│
├── shared/                  # Shared code
│   └── sema.ts             # Data models & types
│
├── electron/               # Desktop app
│   ├── main.cjs           # Electron main process
│   ├── preload.cjs        # Security bridge
│   ├── activity-logger.cjs # Activity logging
│   └── icons/             # App icons
│
├── data/                  # Persistent data
│   └── kayitlar.json     # JSON database
│
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
├── tailwind.config.ts    # Tailwind config
└── drizzle.config.ts     # Drizzle ORM config
```

---

### 5.2 Kod Organizasyonu Prensipleri

#### 1. Separation of Concerns (Endişelerin Ayrılması)
```
Frontend ─────→ Sadece UI
Backend ─────→ Sadece Data
Shared ──────→ Ortak Tipler
```

#### 2. DRY (Don't Repeat Yourself)
```javascript
// ❌ BAD
function calculateTYTNet(correct, wrong) {
  return correct - (wrong / 4);
}
function calculateAYTNet(correct, wrong) {
  return correct - (wrong / 4);
}

// ✅ GOOD
function calculateNet(correct, wrong) {
  return correct - (wrong / 4);
}
```

#### 3. Single Responsibility (Tek Sorumluluk)
```javascript
// ❌ BAD - Bir fonksiyon çok şey yapıyor
function handleSubmit() {
  validateForm();
  sendToAPI();
  updateUI();
  showNotification();
}

// ✅ GOOD - Her fonksiyon tek iş
function handleSubmit() {
  if (!validateForm()) return;
  const result = await sendToAPI();
  if (result.success) {
    updateUI(result.data);
    showSuccessNotification();
  }
}
```

---

<a name="gelistirme"></a>
## 🛠️ 6. Geliştirme İş Akışı

### 6.1 Yeni Özellik Ekleme

**Senaryo: Yeni bir grafik türü eklemek istiyoruz.**

#### Adım 1: Veri Modelini Tanımla
```typescript
// shared/sema.ts
export const yeniGrafik = pgTable("yeni_grafik", {
  id: serial("id").primaryKey(),
  tarih: varchar("tarih").notNull(),
  deger: integer("deger").notNull(),
  kategori: varchar("kategori")
});

export type YeniGrafik = typeof yeniGrafik.$inferSelect;
export const insertYeniGrafikSchema = createInsertSchema(yeniGrafik);
export type InsertYeniGrafik = z.infer<typeof insertYeniGrafikSchema>;
```

#### Adım 2: Storage'a Ekle
```typescript
// server/storage.ts
interface IStorage {
  getAllYeniGrafik(): YeniGrafik[];
  createYeniGrafik(data: InsertYeniGrafik): YeniGrafik;
}

class MemStorage implements IStorage {
  private yeniGrafikler = new Map<number, YeniGrafik>();
  
  getAllYeniGrafik(): YeniGrafik[] {
    return Array.from(this.yeniGrafikler.values());
  }
  
  createYeniGrafik(data: InsertYeniGrafik): YeniGrafik {
    const id = this.getNextId(this.yeniGrafikler);
    const yeni: YeniGrafik = { ...data, id };
    this.yeniGrafikler.set(id, yeni);
    this.saveToFile();
    return yeni;
  }
}
```

#### Adım 3: API Endpoint'i Ekle
```typescript
// server/routes.ts
app.get('/api/yeni-grafik', (req, res) => {
  try {
    const data = storage.getAllYeniGrafik();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/yeni-grafik', (req, res) => {
  try {
    const validData = insertYeniGrafikSchema.parse(req.body);
    const result = storage.createYeniGrafik(validData);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});
```

#### Adım 4: Frontend Bileşeni
```typescript
// client/src/bilesenler/yeni-grafik.tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export function YeniGrafik() {
  // Data fetching
  const { data, isLoading } = useQuery<YeniGrafik[]>({
    queryKey: ['/api/yeni-grafik']
  });
  
  // Data mutation
  const mutation = useMutation({
    mutationFn: (newData: InsertYeniGrafik) =>
      apiRequest('/api/yeni-grafik', { 
        method: 'POST', 
        body: JSON.stringify(newData) 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/yeni-grafik'] });
      toast({ title: "Başarılı", description: "Veri eklendi" });
    }
  });
  
  if (isLoading) return <Skeleton />;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni Grafik</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart width={600} height={300} data={data}>
          <XAxis dataKey="tarih" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="deger" stroke="#8884d8" />
        </LineChart>
      </CardContent>
    </Card>
  );
}
```

#### Adım 5: Sayfaya Ekle
```typescript
// client/src/sayfalar/panel.tsx
import { YeniGrafik } from '@bilesenler/yeni-grafik';

export function Panel() {
  return (
    <div>
      {/* ... mevcut bileşenler */}
      <YeniGrafik />
    </div>
  );
}
```

---

<a name="dagitim"></a>
## 📦 7. Dağıtım ve Paketleme

### 7.1 Production Build

#### Web Uygulaması
```bash
npm run build
```

**Ne Yapar?**
```
1. Vite frontend'i derler
   - TypeScript → JavaScript
   - JSX → Normal JS
   - Minification (küçültme)
   - Tree shaking (gereksiz kod silme)
   
2. esbuild backend'i derler
   - TypeScript → JavaScript
   - Bundle (tek dosya)
   
3. Çıktı:
   dist/
   ├── public/       # Frontend (HTML, JS, CSS)
   └── index.js      # Backend
```

#### Electron Build
```bash
npm run electron:build
```

**Süreç:**
```
1. npm run build (yukarıdaki)
2. electron-builder:
   - Electron runtime ekler
   - Node.js ekler
   - ASAR arşivi oluşturur
   - NSIS installer yapar
   
3. Çıktı:
   dist-electron/
   └── Berat Cankir-Kurulum-0.0.3.exe (~150MB)
```

**ASAR Nedir?**
- **Atom Shell Archive**
- Tüm dosyaları tek arşive sıkıştırır
- Hızlı okuma
- Basit kod koruması

**NSIS Nedir?**
- **Nullsoft Scriptable Install System**
- Windows installer oluşturur
- Kullanıcı dostu kurulum sihirbazı
- Başlat menüsü kısayolu
- Masaüstü kısayolu
- Kaldırıcı (uninstaller)

---

<a name="performans"></a>
## ⚡ 8. Performans ve Optimizasyon

### 8.1 React Optimizasyonları

#### 1. React.memo
```typescript
// ❌ Her parent render'da child da render olur
function Child({ data }) {
  return <div>{data}</div>;
}

// ✅ Props değişmedikçe render olmaz
const Child = React.memo(({ data }) => {
  return <div>{data}</div>;
});
```

#### 2. useMemo
```typescript
// ❌ Her render'da hesaplama yapılır
function Component({ items }) {
  const filtered = items.filter(item => item.active);
  return <List data={filtered} />;
}

// ✅ items değişmedikçe hesaplama yapılmaz
function Component({ items }) {
  const filtered = useMemo(() => {
    return items.filter(item => item.active);
  }, [items]);
  return <List data={filtered} />;
}
```

#### 3. useCallback
```typescript
// ❌ Her render'da yeni fonksiyon oluşur
function Parent() {
  const handleClick = () => console.log('clicked');
  return <Child onClick={handleClick} />;
}

// ✅ Fonksiyon referansı korunur
function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  return <Child onClick={handleClick} />;
}
```

#### 4. Code Splitting
```typescript
// ❌ Tüm kod başlangıçta yüklenir
import HeavyComponent from './heavy';

// ✅ Sadece gerektiğinde yüklenir
const HeavyComponent = lazy(() => import('./heavy'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

#### 5. Virtualization
```typescript
// ❌ 10000 öğe DOM'da (yavaş)
{items.map(item => <Item key={item.id} data={item} />)}

// ✅ Sadece görünür öğeler render edilir
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
});
```

---

<a name="guvenlik"></a>
## 🔐 9. Güvenlik ve En İyi Uygulamalar

### 9.1 Input Validation (Girdi Doğrulama)

#### Frontend Validation
```typescript
const schema = z.object({
  email: z.string().email("Geçersiz email"),
  age: z.number().min(0).max(150),
});

const form = useForm({
  resolver: zodResolver(schema)
});
```

#### Backend Validation
```typescript
app.post('/api/user', (req, res) => {
  try {
    const validData = userSchema.parse(req.body);
    // Güvenli, doğrulanmış veri
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
});
```

### 9.2 XSS Prevention (XSS Önleme)

**XSS (Cross-Site Scripting) Nedir?**
Kullanıcı kötü kod enjekte eder, çalıştırılır.

```javascript
// ❌ Tehlikeli
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Güvenli
<div>{userInput}</div> // React otomatik escape eder
```

### 9.3 SQL Injection Prevention

**SQL Injection Nedir?**
Kullanıcı SQL kodu enjekte eder.

```sql
-- ❌ Tehlikeli (Raw SQL)
db.query(`SELECT * FROM users WHERE name = '${userInput}'`);
-- userInput = "'; DROP TABLE users; --"

-- ✅ Güvenli (Parameterized Query)
db.query('SELECT * FROM users WHERE name = ?', [userInput]);
```

**Bizim Durumumuz:**
- SQL kullanmıyoruz
- In-memory Map kullanıyoruz
- Zod ile validasyon yapıyoruz
- XSS/SQL Injection riski yok ✅

---

<a name="sorun-giderme"></a>
## 🔧 10. Sorun Giderme ve Hata Ayıklama

### 10.1 Yaygın Sorunlar

#### "Module not found"
```bash
# Çözüm:
npm install
# veya
rm -rf node_modules package-lock.json
npm install
```

#### "Port 5000 already in use"
```bash
# Çözüm (Windows):
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Çözüm (Mac/Linux):
lsof -ti:5000 | xargs kill -9
```

#### TypeScript Hatası: "Cannot find module"
```bash
# Çözüm:
# 1. tsconfig.json'da path alias'ları kontrol et
# 2. vite.config.ts'de alias'ları kontrol et
# 3. IDE'yi yeniden başlat
```

### 10.2 Debug Araçları

#### React DevTools
```
1. Chrome Extension yükle: React Developer Tools
2. F12 → Components tab
3. Component ağacını incele
4. Props ve state'leri gör
```

#### Network Tab
```
1. F12 → Network tab
2. API isteklerini izle
3. Request/Response inceleme
4. Timing analizi
```

#### Console Logs
```typescript
// Basit log
console.log('Değişken:', deger);

// Obje yapısını gör
console.table(obje);

// Grup halinde
console.group('Grup Adı');
console.log('İçerik 1');
console.log('İçerik 2');
console.groupEnd();
```

---

<a name="kaynaklar"></a>
## 📚 11. Öğrenme Kaynakları

### 11.1 Resmi Dokümantasyonlar

#### React
- **Resmi:** https://react.dev
- **Türkçe:** https://tr.react.dev
- **Beta Docs:** En güncel, interactive

#### TypeScript
- **Resmi:** https://www.typescriptlang.org/docs
- **Handbook:** Comprehensive guide
- **Playground:** https://www.typescriptlang.org/play

#### Tailwind CSS
- **Resmi:** https://tailwindcss.com/docs
- **Cheat Sheet:** https://nerdcave.com/tailwind-cheat-sheet

#### Electron
- **Resmi:** https://www.electronjs.org/docs
- **Fiddle:** Interactive playground

### 11.2 Video Kaynakları (Türkçe)

- **Prototurk:** React, JavaScript
- **Kablosuzkedi:** Full-stack projeler
- **Tayfun Erbilen:** Web development
- **Sadık Turan:** Python, JS, React

### 11.3 Pratik Projeler

**Başlangıç:**
1. Todo App (To-do listesi)
2. Weather App (Hava durumu)
3. Calculator (Hesap makinesi)

**Orta:**
1. Blog sistemi
2. E-commerce (basit)
3. Chat uygulaması

**İleri:**
1. Social media clone
2. Project management tool
3. Video streaming platform

---

## 🎓 12. Sonuç ve Kariyer Yolu

### 12.1 Bu Projeden Öğrenilenler

**Frontend:**
- ✅ React component mimarisi
- ✅ State management
- ✅ TypeScript tip sistemi
- ✅ Tailwind CSS styling
- ✅ TanStack Query data fetching
- ✅ Recharts data visualization

**Backend:**
- ✅ Node.js ve Express
- ✅ RESTful API tasarımı
- ✅ Veri modelleme
- ✅ Validasyon (Zod)
- ✅ File-based persistence

**Desktop:**
- ✅ Electron mimarisi
- ✅ IPC communication
- ✅ System integration
- ✅ Build ve packaging

**DevOps:**
- ✅ Build tools (Vite, esbuild)
- ✅ Package management (npm)
- ✅ Version control (git)

### 12.2 Kariyer Yolu

**Junior Developer (0-2 yıl):**
- HTML, CSS, JavaScript temelleri
- React veya Vue öğren
- Basit projeler yap
- GitHub profili oluştur

**Mid-Level Developer (2-5 yıl):**
- TypeScript master
- Backend öğren (Node.js)
- Database (SQL)
- Testing (Jest, Cypress)
- CI/CD pipeline

**Senior Developer (5+ yıl):**
- System design
- Architecture patterns
- Mentoring
- Tech leadership

### 12.3 İş İlanlarında Aranan Beceriler

**En Çok Aranan (2024):**
1. React ⭐⭐⭐⭐⭐
2. TypeScript ⭐⭐⭐⭐⭐
3. Node.js ⭐⭐⭐⭐
4. Next.js ⭐⭐⭐⭐
5. Tailwind CSS ⭐⭐⭐
6. Git ⭐⭐⭐⭐⭐

**Bu Projede Hepsi Var! ✅**

---

## 📝 Son Notlar

Bu döküman, YKS Deneme Analizi uygulamasının teknik her yönünü, kullanılan tüm teknolojileri ve nedenleriyle birlikte açıklar. 

**Önemli Hatırlatmalar:**
- 💡 Kod yazmak pratik gerektirir
- 📚 Her gün biraz öğrenin
- 🤝 Toplulukla etkileşim kurun
- 🚀 Kendi projelerinizi yapın
- ❓ Soru sormaktan çekinmeyin

**Başarılar! 🎉**

---

**Son Güncelleme:** 29 Ekim 2025
**Geliştirici:** Berat Cankır
**GitHub:** https://github.com/beratcode03/beratders
**Lisans:** MIT (Açık Kaynak)
