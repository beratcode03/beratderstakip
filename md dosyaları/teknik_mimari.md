# BERAT CANKIR YKS ANALİZ TAKİP SİSTEMİ - TEKNİK MİMARİ VE DOKÜMANTASYON

**📑 Hızlı Navigasyon:** [Ana Sayfa](../replit.md) | [Talimatlar](./talimatlar.md) | [Client Kodu](./kod_aciklamasi_client.md) | [Server Kodu](./kod_aciklamasi_server.md) | [Shared Kodu](./kod_aciklamasi_shared.md) | [Electron](./kod_aciklamasi_electron1.md) | [Testler](./kod_aciklamasi_testler.md)

---

## 📚 İçindekiler

- [GİRİŞ](#giris)
- [MİMARİ GENEL BAKIŞ](#mimari-genel-bakis)
  - [Katmanlı Mimari (Layered Architecture)](#katmanli-mimari-layered-architecture)
- [TEKNOLOJİ SEÇİMLERİ VE GEREKÇELERİ](#teknoloji-secimleri-ve-gerekceleri)
  - [1. Electron - Desktop Application Framework](#1-electron-desktop-application-framework)
  - [2. React 18 - UI Library](#2-react-18-ui-library)
  - [3. TypeScript - Typed JavaScript](#3-typescript-typed-javascript)
  - [4. Vite - Build Tool](#4-vite-build-tool)
  - [5. Express.js - Web Framework](#5-expressjs-web-framework)
  - [6. Drizzle ORM - Type-Safe ORM](#6-drizzle-orm-type-safe-orm)
  - [7. TanStack React Query v5 - Data Fetching](#7-tanstack-react-query-v5-data-fetching)
  - [8. Tailwind CSS - Utility-First CSS](#8-tailwind-css-utility-first-css)
  - [9. shadcn/ui - Component Library](#9-shadcnui-component-library)
- [PACKAGE.JSON DETAYLI AÇIKLAMA](#packagejson-detayli-aciklama)
  - [Dependencies (Production - Canlı Ortamda Gerekli)](#dependencies-production-canli-ortamda-gerekli)
    - [Core Dependencies (Temel Bağımlılıklar)](#core-dependencies-temel-bagimliliklar)
    - [React Ecosystem (React Ekosistemi)](#react-ecosystem-react-ekosistemi)
    - [UI & Styling (Arayüz ve Stillendirme)](#ui-styling-arayuz-ve-stillendirme)
    - [Form & Validation (Form ve Doğrulama)](#form-validation-form-ve-dogrulama)
    - [Database & ORM (Veritabanı ve ORM)](#database-orm-veritabani-ve-orm)
    - [Utilities (Yardımcı Araçlar)](#utilities-yardimci-araclar)
- [BÖLÜM 12: EMAIL & COMMUNICATION PAKETLERİ](#bolum-12-email-communication-paketleri)
  - [12.1 @sendgrid/mail](#121-sendgridmail)
  - [12.2 nodemailer](#122-nodemailer)
- [BÖLÜM 13: CHARTS & VISUALIZATION](#bolum-13-charts-visualization)
  - [13.1 Recharts](#131-recharts)
  - [13.2 embla-carousel-react](#132-embla-carousel-react)
- [BÖLÜM 14: TESTING KÜTÜPHANELERİ](#bolum-14-testing-kutuphaneleri)
  - [14.1 Vitest](#141-vitest)
  - [14.2 @playwright/test](#142-playwrighttest)
  - [14.3 @axe-core/playwright](#143-axe-coreplaywright)
- [BÖLÜM 15: ELECTRON-SPECIFIC PAKETLER](#bolum-15-electron-specific-paketler)
  - [15.1 electron](#151-electron)
  - [15.2 electron-builder](#152-electron-builder)
  - [15.3 electron-updater](#153-electron-updater)
- [BÖLÜM 16: DEPLOYMENT STRATEJİSİ](#bolum-16-deployment-stratejisi)
  - [16.1 Development (Geliştirme) Ortamı](#161-development-gelistirme-ortami)
  - [16.2 Production (Canlı) Build](#162-production-canli-build)
  - [16.3 Electron Packaging](#163-electron-packaging)
  - [16.4 Release Stratejisi](#164-release-stratejisi)
- [Yeni Özellikler](#yeni-ozellikler)
- [Bug Fixes](#bug-fixes)
- [İyileştirmeler](#iyilestirmeler)
- [ÖZET](#ozet)

---

## GİRİŞ

Bu doküman, Berat Cankır YKS Analiz Takip Sistemi'nin teknik mimarisini, teknoloji seçimlerini ve proje yapısını en detaylı şekilde açıklar. Her terim somutlaştırılarak, İngilizce kavramlar Türkçe karşılıklarıyla birlikte açıklanmıştır.

**Proje Özeti:**
- **Tür:** Hybrid Desktop + Web Application (Hibrit Masaüstü + Web Uygulaması)
  - **Hybrid nedir?** Hem masaüstünde (Windows, Mac, Linux) hem de web tarayıcısında çalışabilen uygulama
  - **Desktop nedir?** Bilgisayara yüklenen, çift tıkla çalışan normal program
  - **Web Application nedir?** Tarayıcıda çalışan, internet bağlantısı gerektiren uygulama

- **Platform:** Electron (Desktop) + Web (Browser)
  - **Electron:** VSCode, Discord, Slack gibi uygulamaların yapıldığı framework (çerçeve, iskelet)
  - **Browser (Tarayıcı):** Chrome, Firefox gibi web tarayıcılarında çalışma

- **Frontend:** React 18 + TypeScript + Vite
  - **Frontend nedir?** Kullanıcının gördüğü ve tıkladığı arayüz (butonlar, formlar, grafikler)
  - **React 18:** Facebook'un geliştirdiği UI (kullanıcı arayüzü) kütüphanesi
  - **TypeScript:** JavaScript'e tip kontrolü ekleyen dil (hataları önceden yakalar)
  - **Vite:** Çok hızlı çalışan build tool (derleme aracı)

- **Backend:** Node.js + Express + Drizzle ORM
  - **Backend nedir?** Veriyi kaydeden, hesaplayan, kullanıcı görmeden çalışan arka plan kısmı
  - **Node.js:** Sunucu tarafında JavaScript çalıştıran platform
  - **Express:** Node.js için minimalist web framework (web çerçevesi)
  - **Drizzle ORM:** Veritabanı işlemlerini TypeScript ile yapan araç

- **Database:** PostgreSQL (Production) / JSON File (Development/Offline)
  - **Database (Veritabanı):** Verilerin organize şekilde saklandığı yer
  - **PostgreSQL:** Güçlü, açık kaynaklı SQL veritabanı (Oracle, MySQL gibi)
  - **JSON File:** Geliştirme ve offline kullanım için basit dosya sistemi
  - **Production:** Canlı ortam (gerçek kullanıcıların eriştiği)
  - **Development:** Geliştirme ortamı (programcının test ettiği)
  - **Offline:** İnternet olmadan çalışma

- **UI Framework:** Tailwind CSS + shadcn/ui
  - **UI (User Interface):** Kullanıcı arayüzü (butonlar, renkler, yazılar)
  - **Tailwind CSS:** Utility-first CSS framework (hazır class'larla hızlı tasarım)
  - **shadcn/ui:** Hazır React component'leri (buton, dialog, form vs.)

- **State Management:** TanStack React Query v5
  - **State Management:** Uygulamadaki verilerin yönetimi (kim giriş yaptı, hangi görevler var vs.)
  - **React Query:** Sunucudan veri çekme, cache'leme, yenileme işlemlerini yöneten kütüphane
  - **Cache:** Verileri geçici olarak saklama (her seferinde sunucudan çekmemek için)

---

## MİMARİ GENEL BAKIŞ

### Katmanlı Mimari (Layered Architecture)

**Layered Architecture nedir?**
- Uygulamanın farklı sorumluluklara sahip katmanlara bölünmesi
- Her katman sadece kendi işini yapar ve altındaki katmanla konuşur
- Üst katman alt katmanı kullanır, alt katman üst katmanı bilmez
- **Avantajları:**
  - Kod organizasyonu (her şey yerli yerinde)
  - Kolay test edilebilirlik (her katman ayrı test edilir)
  - Değiştirilebilirlik (bir katmanı değiştirince diğerleri etkilenmez)
  - Takım çalışması (frontend ekibi backend'i beklemeden mock data ile çalışabilir)

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (SUNUM KATMANI)        │
│  React Components + shadcn/ui + Tailwind CSS                │
│  (client/src/sayfalar/, client/src/bilesenler/)            │
│                                                              │
│  SORUMLULUĞU: Kullanıcıya görsel arayüz sunmak             │
│  - Butonlar, formlar, tablolar, grafikler göstermek         │
│  - Kullanıcı tıklamalarını yakalamak                        │
│  - Loading (yükleniyor) durumlarını göstermek               │
│  - Hata mesajlarını toast ile göstermek                     │
│                                                              │
│  DOSYALAR:                                                   │
│  - client/src/sayfalar/AnaSayfa.tsx (homepage)             │
│  - client/src/sayfalar/Gorevler.tsx (tasks page)           │
│  - client/src/bilesenler/GorevKarti.tsx (task card)        │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ HTTP REST API (fetch/axios)
               │ ÖRNEKLER:
               │ - GET /api/gorevler → Tüm görevleri getir
               │ - POST /api/gorevler → Yeni görev ekle
               │ - PUT /api/gorevler/:id → Görevi güncelle
               │ - DELETE /api/gorevler/:id → Görevi sil
               │
┌──────────────▼──────────────────────────────────────────────┐
│                    API LAYER (API KATMANI)                   │
│  Express.js Routes + Middleware                              │
│  (server/rotalar.ts)                                        │
│                                                              │
│  SORUMLULUĞU: HTTP isteklerini karşılamak                   │
│  - URL'leri parse etmek (/api/gorevler/:id)                │
│  - Request body'yi validate etmek (Zod ile)                 │
│  - Authentication kontrol etmek (giriş yapmış mı?)          │
│  - Storage katmanını çağırmak                               │
│  - Hataları yakalamak ve JSON response döndürmek            │
│                                                              │
│  MIDDLEWARE'LER:                                             │
│  - express.json() → JSON parse                              │
│  - express.urlencoded() → Form data parse                   │
│  - Hata yakalama middleware                                 │
│  - Logging middleware                                       │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ Storage Interface (IStorage)
               │ INTERFACE NEDİR?
               │ - Sözleşme (contract): Bu fonksiyonlar olmalı
               │ - Implementasyon bağımsız: MemStorage veya PgStorage kullanabilirsin
               │ - Değiştirilebilirlik: Storage'ı değiştirince API katmanı etkilenmez
               │
┌──────────────▼──────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER (İŞ MANTIĞI KATMANI) │
│  Storage Implementation (MemStorage / PgStorage)             │
│  (server/depolama.ts)                                       │
│                                                              │
│  SORUMLULUĞU: Veritabanı işlemlerini yapmak                 │
│  - CRUD işlemleri (Create, Read, Update, Delete)            │
│  - İş kurallarını uygulamak                                 │
│  - Veri dönüşümleri yapmak                                  │
│  - Transaction yönetimi                                     │
│                                                              │
│  2 İMPLEMENTASYON:                                          │
│  1. MemStorage: In-memory Map + JSON file                   │
│     - Avantaj: Hızlı, basit, offline çalışır               │
│     - Dezavantaj: RAM'de tutar, restart'ta kaybolur (JSON save ile korunur) │
│  2. PgStorage: PostgreSQL database                          │
│     - Avantaj: Production-ready, scalable, güvenli          │
│     - Dezavantaj: İnternet bağlantısı gerekir              │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ Drizzle ORM / File System
               │ ORM NEDİR?
               │ - Object-Relational Mapping (Nesne-İlişkisel Eşleme)
               │ - SQL yazmadan TypeScript ile veritabanı işlemleri
               │ - ÖRNEK: db.select().from(tasks).where(eq(tasks.id, id))
               │
┌──────────────▼──────────────────────────────────────────────┐
│                    DATA LAYER (VERİ KATMANI)                 │
│  PostgreSQL Database / JSON File (kayitlar.json)            │
│  (shared/sema.ts for schema)                                │
│                                                              │
│  SORUMLULUĞU: Verileri fiziksel olarak saklamak             │
│  - PostgreSQL: Tablolar, index'ler, constraint'ler          │
│  - JSON File: {gorevler: [], denemeler: [], calismalar: []} │
│                                                              │
│  SCHEMA (ŞEMA) NEDİR?                                       │
│  - Veritabanı yapısı (hangi tablolar, hangi kolonlar)       │
│  - Veri tipleri (string, number, boolean, date)             │
│  - İlişkiler (foreign key, one-to-many, many-to-many)       │
│  - Constraint'ler (not null, unique, primary key)           │
└─────────────────────────────────────────────────────────────┘
```

**Katmanlar Arası İletişim Akışı (Data Flow):**

**1. Kullanıcı Buton Click → API İstek:**
```typescript
// PRESENTATION LAYER (client/src/sayfalar/Gorevler.tsx)
const mutation = useMutation({
  mutationFn: (data) => apiRequest('/api/gorevler', 'POST', data)
});

<Button onClick={() => mutation.mutate({ baslik: 'Yeni Görev' })}>
  Ekle
</Button>

// AÇIKLAMA:
// 1. Kullanıcı butona tıklar
// 2. React Query mutation başlatır
// 3. fetch() ile HTTP POST isteği gönderilir
// 4. Request body: { baslik: 'Yeni Görev' }
```

**2. API Layer İsteği Karşılar:**
```typescript
// API LAYER (server/rotalar.ts)
app.post('/api/gorevler', async (req, res) => {
  // 1. Validate request body
  const parsed = insertGorevSchema.parse(req.body);
  
  // 2. Storage'ı çağır
  const yeniGorev = await storage.gorevEkle(parsed);
  
  // 3. Response döndür
  res.json(yeniGorev);
});

// AÇIKLAMA:
// 1. Express route handler çalışır
// 2. Zod ile validasyon (baslik boş mu? tip doğru mu?)
// 3. Storage interface'i çağırır (hangi implementasyon olduğunu bilmez)
// 4. Sonucu JSON olarak döndürür
```

**3. Storage Veritabanına Yazar:**
```typescript
// BUSINESS LOGIC LAYER (server/depolama.ts)
class MemStorage implements IStorage {
  async gorevEkle(gorev: InsertGorev): Promise<Gorev> {
    const id = nanoid(); // Unique ID oluştur
    const yeniGorev = { ...gorev, id, tamamlandi: false };
    
    this.gorevler.set(id, yeniGorev); // Map'e ekle
    await this.dosyayaKaydet(); // JSON'a kaydet
    
    return yeniGorev;
  }
}

// AÇIKLAMA:
// 1. Unique ID oluşturulur (nanoid)
// 2. Default değerler eklenir (tamamlandi: false)
// 3. Memory'deki Map'e eklenir (hızlı erişim)
// 4. JSON dosyasına yazılır (kalıcı saklama)
```

**4. Response Kullanıcıya Döner:**
```typescript
// PRESENTATION LAYER (React Query)
const mutation = useMutation({
  mutationFn: (data) => apiRequest('/api/gorevler', 'POST', data),
  onSuccess: (yeniGorev) => {
    // Cache'i invalidate et (yenile)
    queryClient.invalidateQueries({ queryKey: ['/api/gorevler'] });
    
    // Toast göster
    toast({ title: 'Görev eklendi!', variant: 'success' });
  }
});

// AÇIKLAMA:
// 1. API'den response gelir
// 2. React Query cache'i günceller
// 3. UI otomatik yenilenir (re-render)
// 4. Kullanıcı yeni görevi listede görür
```

---

## TEKNOLOJİ SEÇİMLERİ VE GEREKÇELERİ

Bu bölüm, projede kullanılan her teknolojinin **neden seçildiğini**, **alternatiflerin neden seçilmediğini** ve **nasıl kullanıldığını** detaylı olarak açıklar.

### 1. Electron - Desktop Application Framework

**Electron Nedir?**
- **Basit Tanım:** Web teknolojileri (HTML, CSS, JavaScript) ile masaüstü uygulaması yapmanızı sağlayan framework
- **Nasıl Çalışır?** Chromium (Chrome tarayıcısı) + Node.js (sunucu tarafı JavaScript) birleşimi
- **Örnekler:** VSCode, Discord, Slack, Figma, Notion

**Seçim Gerekçesi:**

✅ **Cross-platform (Çapraz Platform):**
- Tek kod tabanı ile Windows, macOS, Linux uygulaması
- Platform-specific kod yazmaya gerek yok
- **Örnek:** Aynı TypeScript kodu her platformda çalışır
- **Alternatif Yaklaşım:** C++ ile Windows için, Swift ile macOS için ayrı kod (2-3x iş yükü)

✅ **Web teknolojileri ile native app:**
- React biliyorsanız, desktop app yapabilirsiniz
- CSS ile tasarım, JavaScript ile mantık
- **Avantaj:** Öğrenme eğrisi minimal (zaten React biliyoruz)

✅ **System tray, notifications, file system access:**
- **System Tray:** Saat yanındaki simge (uygulama arka planda çalışır)
  ```javascript
  const tray = new Tray('icon.png');
  tray.setToolTip('YKS Takip Sistemi');
  ```
- **Notifications:** Windows/Mac bildirimleri
  ```javascript
  new Notification('Çalışma Saati!', { body: 'Matematik için 1 saat geçti' });
  ```
- **File System Access:** Dosya okuma/yazma
  ```javascript
  fs.writeFileSync('kayitlar.json', JSON.stringify(data));
  ```

✅ **Offline çalışabilme:**
- İnternet bağlantısı gerektirmez
- Tüm veriler local'de (bilgisayarda) saklanır
- **Kullanım Senaryosu:**
  - Öğrenci kütüphanede çalışıyor, internet yok
  - Yine de görevlerini ekleyip çalışma saatini kaydedebilir
  - Eve gelince internet'e bağlanır, veriler sync olur

✅ **Güvenli local storage:**
- JSON dosyaları bilgisayarda (`C:\Users\Berat\AppData\kayitlar.json`)
- Şifreleme eklenebilir (electron-store)
- Kullanıcı verisi hiçbir sunucuya gitmez

**Alternatifler ve Neden Seçilmediler:**

❌ **Tauri:**
- **Artıları:** Rust tabanlı, daha hafif (3MB vs 150MB), daha hızlı başlatma
- **Eksileri:** 
  - Ecosystem küçük (az npm paketi desteği)
  - Rust bilgisi gerekir (learning curve)
  - Community küçük (az tutorial, az Stack Overflow sorusu)
- **Sonuç:** Electron daha mature (olgun), daha fazla kaynak var

❌ **NW.js:**
- **Artıları:** Electron'a benzer, biraz daha hafif
- **Eksileri:**
  - Daha az popüler (VSCode, Discord gibi büyük örnekler yok)
  - Community küçük
  - Update frequency düşük
- **Sonuç:** Electron industry standard

❌ **Qt/WPF/JavaFX:**
- **Artıları:** Gerçek native UI, daha performanslı
- **Eksileri:**
  - C++ (Qt), C# (WPF), Java (JavaFX) öğrenmek gerekir
  - Web teknolojisi bilgisi transfer edilemez
  - React component'leri kullanılamaz
- **Sonuç:** Web stack biliyoruz, Electron mantıklı seçim

**Electron Versiyonu:**
```json
"electron": "latest"
```
- **latest nedir?** Her zaman en güncel versiyonu kullan
- **Avantajı:** En yeni Chromium features (CSS Grid, Flexbox, ES2022)
- **Dezavantajı:** Breaking changes olabilir (major version update'lerde)
- **Çözüm:** package-lock.json ile version lock

**Electron Proses Yapısı:**

```
┌─────────────────────────────────────────────────────────┐
│                      MAIN PROCESS                        │
│  (electron/main.cjs - Node.js environment)              │
│                                                          │
│  SORUMLULUĞU:                                           │
│  - Uygulama yaşam döngüsü (başlat, kapat)              │
│  - BrowserWindow oluşturma (pencere)                    │
│  - System tray, menu, notifications                     │
│  - File system, database erişimi                        │
│  - IPC (Inter-Process Communication) ile Renderer'a mesaj gönder │
│                                                          │
│  DOSYALAR:                                              │
│  - electron/main.cjs (ana process)                      │
│  - electron/activity-tracker.cjs (aktivite takip)      │
│  - electron/preload.cjs (güvenlik köprüsü)             │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ IPC (Inter-Process Communication)
                 │ - ipcMain.on('mesaj', handler) → Main process dinler
                 │ - ipcRenderer.send('mesaj', data) → Renderer gönderir
                 │
┌────────────────▼────────────────────────────────────────┐
│                   RENDERER PROCESS                       │
│  (client/src/ - Web browser environment)                │
│                                                          │
│  SORUMLULUĞU:                                           │
│  - React UI render                                      │
│  - Kullanıcı etkileşimi (click, input)                 │
│  - API istekleri (fetch)                                │
│  - IPC ile Main process'e mesaj gönder                  │
│                                                          │
│  KISITLAMALAR (Güvenlik):                               │
│  - Node.js API'lerine direkt erişim YOK                 │
│  - File system'e direkt erişim YOK                      │
│  - Preload script ile sınırlı API kullanır              │
└─────────────────────────────────────────────────────────┘
```

**IPC (Inter-Process Communication) Örneği:**

```javascript
// MAIN PROCESS (electron/main.cjs)
ipcMain.on('gorev-ekle', (event, gorev) => {
  console.log('Renderer\'dan görev geldi:', gorev);
  // Veritabanına kaydet
  storage.gorevEkle(gorev);
  // Geri bildir
  event.reply('gorev-eklendi', { success: true });
});

// RENDERER PROCESS (client/src/sayfalar/Gorevler.tsx)
// Preload script üzerinden güvenli IPC
window.electronAPI.gorevEkle({ baslik: 'Matematik çöz' });
window.electronAPI.onGorevEklendi((result) => {
  console.log('Görev eklendi!', result);
});
```

### 2. React 18 - UI Library

**React Nedir?**
- **Basit Tanım:** Kullanıcı arayüzü (butonlar, formlar, tablolar) yapmak için JavaScript kütüphanesi
- **Kimin?** Facebook (Meta) tarafından geliştirildi (2013'ten beri)
- **Kullanım:** Facebook, Instagram, Netflix, Airbnb, Uber

**Seçim Gerekçesi:**

✅ **Component-based architecture (Bileşen Tabanlı Mimari):**
- **Component nedir?** Yeniden kullanılabilir UI parçası
- **Örnek:**
  ```tsx
  // GorevKarti.tsx - Tek bir görev kartı
  function GorevKarti({ baslik, tamamlandi, onToggle }) {
    return (
      <div className="p-4 border rounded">
        <Checkbox checked={tamamlandi} onCheckedChange={onToggle} />
        <span>{baslik}</span>
      </div>
    );
  }
  
  // Gorevler.tsx - Tüm görevler
  function Gorevler() {
    return gorevler.map(g => <GorevKarti key={g.id} {...g} />);
  }
  ```
- **Avantajı:** GorevKarti'yi 100 yerde kullanabilirsin, bir yerde değiştirince her yere yansır

✅ **Virtual DOM (Sanal DOM):**
- **DOM nedir?** Document Object Model - Tarayıcının HTML'i temsil etme şekli
- **Problem:** DOM manipülasyonu yavaş (jQuery'de her değişiklik gerçek DOM'a dokunur)
- **Çözüm:** React virtual DOM kullanır
  ```
  1. State değişir (setGorevler)
  2. React sanal DOM'da değişikliği hesaplar
  3. Gerçek DOM'a sadece değişen kısımları uygular (diffing)
  4. Sonuç: Çok daha hızlı (batching + efficient updates)
  ```
- **Örnek:**
  ```tsx
  // 1000 görev var, sadece 1 görevin tamamlandi değişti
  setGorevler(prev => prev.map(g => 
    g.id === '123' ? { ...g, tamamlandi: true } : g
  ));
  // React sadece 1 checkbox'ı günceller, 999 görev aynı kalır
  ```

✅ **Hooks API:**
- **Hooks nedir?** React 16.8 ile gelen, state ve lifecycle'ı fonksiyonel component'lerde kullanma yöntemi
- **useState:** State (durum) tutmak
  ```tsx
  const [sayi, setSayi] = useState(0);
  <Button onClick={() => setSayi(sayi + 1)}>Artır ({sayi})</Button>
  ```
- **useEffect:** Side effect'ler (API call, subscription, timer)
  ```tsx
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('1 dakika geçti');
    }, 60000);
    return () => clearInterval(timer); // Cleanup
  }, []); // [] = Sadece mount'ta çalış
  ```
- **useContext:** Global state paylaşma
  ```tsx
  const { kullanici } = useContext(KullaniciContext);
  ```

✅ **Concurrent rendering (Eşzamanlı Render):**
- **React 18 Özelliği:** UI'ı bloklamadan render
- **Örnek:**
  ```tsx
  // Öncelikli update (kullanıcı input)
  startTransition(() => {
    setAramaMetni(event.target.value);
  });
  // Input anında güncellenir, arama sonuçları arka planda yüklenir
  ```

✅ **Büyük ecosystem:**
- 200,000+ npm paketi React uyumlu
- shadcn/ui, Material-UI, Ant Design gibi hazır component kütüphaneleri
- React Router, React Query, Zustand gibi state management araçları

**Alternatifler:**

❌ **Vue.js:**
- **Artıları:** Öğrenmesi daha kolay, daha basit syntax
- **Eksileri:** Ecosystem küçük, iş ilanları az
- **Sonuç:** React industry standard

❌ **Svelte:**
- **Artıları:** Compiler-based (no virtual DOM), daha hızlı
- **Eksileri:** Yeni (2019), ecosystem küçük, iş ilanları az
- **Sonuç:** Production'da risk

❌ **Angular:**
- **Artıları:** Full-featured framework (routing, HTTP, forms hepsi dahil)
- **Eksileri:** Ağır (bundle size büyük), öğrenmesi zor (RxJS, Decorators)
- **Sonuç:** Bu proje için overkill (gereğinden fazla)

**React 18 Özellikleri:**

```typescript
// 1. Functional components (Class component yok)
import { useState, useEffect } from 'react';

function GorevListesi() {
  const [gorevler, setGorevler] = useState<Gorev[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  
  useEffect(() => {
    fetch('/api/gorevler')
      .then(res => res.json())
      .then(data => {
        setGorevler(data);
        setYukleniyor(false);
      });
  }, []); // Dependency array boş = sadece mount'ta çalış
  
  if (yukleniyor) return <Skeleton />;
  
  return (
    <div>
      {gorevler.map(gorev => (
        <GorevKarti key={gorev.id} {...gorev} />
      ))}
    </div>
  );
}
```

**Component Yapısı:**
```
AnaSayfa.tsx
├── Navbar.tsx
│   ├── Logo.tsx
│   ├── NavigationMenu.tsx
│   └── UserAvatar.tsx
├── Sidebar.tsx
│   ├── SidebarItem.tsx (x5)
│   └── SidebarFooter.tsx
└── MainContent.tsx
    ├── Dashboard.tsx
    │   ├── StatsCard.tsx (x4)
    │   ├── PerformansGrafigi.tsx
    │   └── SonCalismalar.tsx
    └── Gorevler.tsx
        ├── GorevListesi.tsx
        │   └── GorevKarti.tsx (xN)
        └── GorevEkleDialog.tsx
            └── GorevFormu.tsx
```

### 3. TypeScript - Typed JavaScript

**TypeScript Nedir?**
- **Basit Tanım:** JavaScript'e tip (type) ekleme sistemi
- **Kimin?** Microsoft tarafından geliştirildi
- **Derlenme:** TypeScript (.ts) → JavaScript (.js)

**Seçim Gerekçesi:**

✅ **Type safety (Tip Güvenliği):**
- **Problem (JavaScript):**
  ```javascript
  function topla(a, b) {
    return a + b;
  }
  topla(5, 3);       // 8 ✅
  topla('5', 3);     // '53' ❌ (string concatenation)
  topla(5);          // NaN ❌ (undefined + 5)
  topla(5, 3, 7);    // 8 (3. parametre ignore edilir)
  ```
- **Çözüm (TypeScript):**
  ```typescript
  function topla(a: number, b: number): number {
    return a + b;
  }
  topla(5, 3);       // 8 ✅
  topla('5', 3);     // ERROR: Argument of type 'string' is not assignable
  topla(5);          // ERROR: Expected 2 arguments, but got 1
  ```

✅ **Better IDE support:**
- **Autocomplete:** IDE tip bildiğinden otomatik tamamlar
  ```typescript
  const gorev: Gorev = { /* */ };
  gorev. // IDE otomatik gösterir: id, baslik, tamamlandi, olusturmaTarihi
  ```
- **Refactoring:** Fonksiyon ismini değiştirince her yerde değişir
- **Error highlighting:** Hata yazmadan IDE gösterir

✅ **Self-documenting code:**
- **JavaScript:**
  ```javascript
  // gorevEkle fonksiyonu ne alır? Döküman oku
  function gorevEkle(gorev) {
    // ...
  }
  ```
- **TypeScript:**
  ```typescript
  // Tipler dokümantasyon gibi
  function gorevEkle(gorev: InsertGorev): Promise<Gorev> {
    // gorev: { baslik: string, oncelik: 'dusuk' | 'orta' | 'yuksek' }
    // Dönüş: Promise<Gorev> (async fonksiyon, Gorev döndürür)
  }
  ```

✅ **Easier refactoring:**
- **Senaryo:** `Gorev` type'ına `etiketler: string[]` ekledik
- **JavaScript:** Runtime'da hata (gorev.etiketler undefined)
- **TypeScript:** Compile-time'da hata (her yerde kırmızı çizgi)
  ```typescript
  interface Gorev {
    id: string;
    baslik: string;
    tamamlandi: boolean;
    etiketler: string[]; // YENİ
  }
  
  // Eski kod hata verir:
  const gorev = { id: '1', baslik: 'Test', tamamlandi: false };
  // ERROR: Property 'etiketler' is missing
  ```

**TypeScript Konfigürasyonu (tsconfig.json):**
```json
{
  "compilerOptions": {
    "strict": false,            // Strict mode KAPALI
    "module": "ESNext",         // ES6 import/export
    "target": "ES2022",         // Modern JavaScript features
    "jsx": "preserve",          // JSX'i Babel'a bırak (Vite kullanıyor)
    "moduleResolution": "node", // Node.js module çözümleme
    "esModuleInterop": true,    // CommonJS uyumluluğu
    "skipLibCheck": true,       // node_modules type check'i atla (hız için)
    "paths": {
      "@/*": ["./client/src/*"], // @ ile import kısayolu
      "@shared/*": ["./shared/*"]
    }
  }
}
```

**Neden `strict: false`?**
- **Strict mode nedir?** Tüm type check'leri en sıkı seviyede
- **Strict mode özellikleri:**
  ```typescript
  // strict: true olsaydı:
  let sayi: number;
  console.log(sayi); // ERROR: Variable used before being assigned
  
  function test(x: string | null) {
    console.log(x.length); // ERROR: Object is possibly 'null'
  }
  
  // strict: false olunca:
  // Bu hatalar warning verir ama derlenir
  ```
- **Neden kapalı?**
  - Development hızını artırır (prototype aşamasında)
  - Bazı library type definitions eksik (any kullanmak zorunda kalırsın)
  - Production'da yine de type safety var (partial types bile yardımcı)
- **Gelecek:** Production'a geçerken strict: true yapılabilir

**Type Örnekleri:**

```typescript
// 1. Primitive types
let isim: string = 'Berat';
let yas: number = 18;
let ogrenci: boolean = true;

// 2. Array types
let notlar: number[] = [70, 85, 90];
let isimler: Array<string> = ['Ali', 'Veli'];

// 3. Object types
interface Gorev {
  id: string;
  baslik: string;
  aciklama?: string; // Optional (olması şart değil)
  tamamlandi: boolean;
  olusturmaTarihi: Date;
}

const gorev: Gorev = {
  id: '1',
  baslik: 'Matematik çöz',
  tamamlandi: false,
  olusturmaTarihi: new Date()
  // aciklama yok ama sorun değil (optional)
};

// 4. Union types
type Oncelik = 'dusuk' | 'orta' | 'yuksek';
let oncelik: Oncelik = 'yuksek'; // 'yuksek', 'orta', 'dusuk' dışında değer verilemez

// 5. Generic types
function getIlkEleman<T>(dizi: T[]): T | undefined {
  return dizi[0];
}
const ilkSayi = getIlkEleman([1, 2, 3]); // type: number | undefined
const ilkIsim = getIlkEleman(['Ali', 'Veli']); // type: string | undefined

// 6. Type inference (otomatik tip çıkarımı)
const sayi = 42; // TypeScript anlar: number
const isim = 'Berat'; // TypeScript anlar: string
const gorevler = []; // TypeScript anlar: any[] (empty array)
const gorevler2: Gorev[] = []; // Biz söyleriz: Gorev[]
```

### 4. Vite - Build Tool

**Vite Nedir?**
- **Basit Tanım:** JavaScript projelerini derleyen, geliştirme sunucusu sağlayan araç
- **Okunuş:** "Vit" (Fransızca "hızlı" anlamına gelir)
- **Kimin?** Evan You (Vue.js'in yaratıcısı)

**Build Tool Nedir?**
- **Problem:** Modern web geliştirme karmaşık
  - TypeScript → JavaScript derleme
  - JSX → JavaScript derleme
  - SCSS → CSS derleme
  - ES6 modules → Browser-compatible JavaScript
  - Minification (küçültme)
  - Bundle optimization
- **Çözüm:** Build tool hepsini yapar

**Seçim Gerekçesi:**

✅ **Çok hızlı HMR (Hot Module Replacement):**
- **HMR nedir?** Kod değişikliğini tarayıcıya anında yansıtma (sayfa yenilenmeden)
- **Örnek:**
  ```
  1. GorevKarti.tsx'de renk değiştirdin (bg-blue-500 → bg-green-500)
  2. Kaydet (Ctrl+S)
  3. 50ms içinde tarayıcıda renk değişir (state kaybolmaz!)
  ```
- **Webpack HMR:** 1-2 saniye
- **Vite HMR:** <100ms (10-20x daha hızlı)

✅ **ES modules native support:**
- **ES Modules nedir?** Modern JavaScript import/export sistemi
  ```javascript
  // Eski (CommonJS)
  const express = require('express');
  
  // Yeni (ES Modules)
  import express from 'express';
  ```
- **Vite:** ES modules'ü tarayıcıya direkt gönderir (dev mode'da)
- **Webpack:** Her şeyi bundle eder (yavaş)

✅ **Out-of-the-box TypeScript support:**
- **Webpack:** loader config gerekir (ts-loader, babel-loader)
- **Vite:** Hiçbir config gerektirmez
  ```typescript
  // Component.tsx yazıyorsun, Vite otomatik derliyor
  export default function Component() {
    return <div>Merhaba</div>;
  }
  ```

✅ **Production build optimization:**
- **Rollup kullanır:** Modern, optimize bundler
- **Tree-shaking:** Kullanılmayan kodu siler
- **Code splitting:** Lazy loading için chunk'lara böler
- **Minification:** Kod boyutunu küçültür

**Vite vs Webpack Karşılaştırması:**

| Özellik | Vite | Webpack |
|---------|------|---------|
| Dev server start | <1s | 5-10s |
| HMR (Hot Module Replacement) | <100ms | 1-2s |
| Build speed (production) | Fast | Slower |
| Config karmaşıklığı | Simple (minimal config) | Complex (webpack.config.js 100+ satır) |
| Learning curve | Easy | Steep (loader, plugin, chunk optimization) |
| Bundle size | Smaller (Rollup optimization) | Larger |
| ES modules support | Native | Polyfill gerekir |

**Vite Konfigürasyonu (vite.config.ts):**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()], // React JSX desteği
  
  // Development server
  server: {
    host: "0.0.0.0",     // Tüm network interface'lerden erişim (Replit için önemli!)
    port: 5000,          // Port 5000 (frontend)
    allowedHosts: true,  // Proxy/iframe içinde çalışması için (Replit özelliği)
    proxy: {
      // API isteklerini backend'e yönlendir
      '/api': {
        target: 'http://localhost:3000', // Backend port
        changeOrigin: true
      }
    }
  },
  
  // Build config
  build: {
    outDir: 'dist',      // Build çıktısı
    sourcemap: true,     // Debug için kaynak haritası
    rollupOptions: {
      output: {
        // Chunk optimization
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    }
  },
  
  // Path aliases (import kısayolları)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared')
    }
  }
});
```

**Vite Nasıl Çalışır?**

**Development Mode:**
```
1. npm run dev
2. Vite dev server başlar (port 5000)
3. index.html serve edilir
4. index.html içinde <script type="module" src="/src/main.tsx">
5. Browser /src/main.tsx ister
6. Vite on-the-fly derler (TypeScript → JavaScript)
7. Browser ES modules olarak yükler
8. Her import için ayrı HTTP request (no bundling!)
9. HMR WebSocket bağlantısı (canlı güncelleme)

AVANTAJ: Çok hızlı (sadece değişen dosya derlenir)
```

**Production Mode:**
```
1. npm run build
2. Vite production build başlar
3. Rollup ile tüm dosyalar bundle'lanır
4. Minification (uglify, terser)
5. Tree-shaking (kullanılmayan kod silinir)
6. Code splitting (lazy load chunk'lar)
7. CSS extraction (ayrı CSS dosyası)
8. Asset optimization (image, font)
9. dist/ klasörüne çıktı

ÇIKTI:
dist/
├── index.html
├── assets/
│   ├── index-a1b2c3d4.js (main bundle)
│   ├── vendor-e5f6g7h8.js (React, libraries)
│   ├── ui-i9j0k1l2.js (shadcn components)
│   └── index-m3n4o5p6.css (styles)
```

### 5. Express.js - Web Framework

**Express.js Nedir?**
- **Basit Tanım:** Node.js için minimalist web framework (HTTP sunucusu + routing)
- **İlk Çıkış:** 2010 (14 yaşında, çok olgun)
- **Kullanım:** IBM, Uber, Accenture, PayPal

**Seçim Gerekçesi:**

✅ **Minimalist ve esnek:**
- **Minimalist:** Az özellik, çok genişletilebilir
- **Örnek:** Express sadece routing + middleware, database yoktur (sen eklersin)
- **Avantaj:** İstediğin gibi şekillendirirsin (opinionated değil)

✅ **Middleware ecosystem:**
- **Middleware nedir?** Request-response cycle'ında çalışan fonksiyonlar
- **Örnekler:**
  ```typescript
  // 1. Body parser middleware (JSON parse)
  app.use(express.json());
  
  // 2. Logging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next(); // Sonraki middleware'e geç
  });
  
  // 3. Authentication middleware
  app.use('/api/gorevler', (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  });
  
  // 4. Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message });
  });
  ```

✅ **RESTful API için ideal:**
- **REST nedir?** Representational State Transfer (API tasarım prensibi)
- **RESTful Endpoints:**
  ```typescript
  // CRUD operations
  app.get('/api/gorevler',        () => { /* Tüm görevleri listele */ });
  app.get('/api/gorevler/:id',    () => { /* Tek görev getir */ });
  app.post('/api/gorevler',       () => { /* Yeni görev ekle */ });
  app.put('/api/gorevler/:id',    () => { /* Görevi güncelle */ });
  app.delete('/api/gorevler/:id', () => { /* Görevi sil */ });
  ```

✅ **Kolay öğrenme eğrisi:**
- **İlk Express uygulaması:**
  ```typescript
  import express from 'express';
  const app = express();
  
  app.get('/', (req, res) => {
    res.send('Merhaba Dünya!');
  });
  
  app.listen(3000, () => {
    console.log('Sunucu çalışıyor: http://localhost:3000');
  });
  ```
- **5 dakikada öğrenilir**

**Express vs Alternatifler:**

❌ **Fastify:**
- **Artıları:** 2x daha hızlı (JSON schema validation, pipelining)
- **Eksileri:** 
  - Ecosystem küçük (az middleware)
  - Learning curve (schema validation öğrenmek gerekir)
- **Sonuç:** Express mature, proven

❌ **Koa:**
- **Artıları:** Modern (async/await native), minimalist
- **Eksileri:**
  - Community küçük
  - Middleware ecosystem Express'ten az
- **Sonuç:** Express daha popüler

❌ **NestJS:**
- **Artıları:** Enterprise-grade (TypeScript, decorators, dependency injection)
- **Eksileri:**
  - Ağır (çok abstraction)
  - Öğrenmesi zor (Angular benzeri)
  - Bu proje için overkill
- **Sonuç:** Express yeterli

**Express Middleware Stack (Sıralı Çalışır):**

```typescript
import express from 'express';
const app = express();

// 1. Body parser middleware
app.use(express.json()); // Content-Type: application/json
app.use(express.urlencoded({ extended: false })); // Form data

// 2. CORS middleware (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// 3. Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 4. Routes
app.use('/api', rotalar); // rotalar.ts dosyasındaki routes

// 5. 404 handler (route bulunamadı)
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 6. Error handling middleware (en son olmalı!)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Hata:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(3000);
```

**Middleware Çalışma Prensibi:**

```
REQUEST: GET /api/gorevler
  ↓
1. express.json() middleware
   - Content-Type check
   - JSON parse (body string → object)
   ↓
2. CORS middleware
   - Headers ekle
   ↓
3. Logging middleware
   - Console.log
   ↓
4. Routes
   - /api/gorevler match
   - Route handler çalışır
   ↓
5. Response gönderilir
   ↓
RESPONSE: { gorevler: [...] }
```

**Hata Durumu:**
```
REQUEST: POST /api/gorevler (invalid JSON)
  ↓
1. express.json() middleware
   - JSON parse FAIL → Error throw
   ↓
2. CORS, Logging middleware atlanır
   ↓
3. Error handling middleware
   - err.status = 400
   - err.message = 'Invalid JSON'
   ↓
RESPONSE: 400 { error: 'Invalid JSON' }
```

### 6. Drizzle ORM - Type-Safe ORM

**ORM Nedir?**
- **Object-Relational Mapping:** Nesne-İlişkisel Eşleme
- **Basit Tanım:** Veritabanı tablolarını TypeScript class/interface'leri gibi kullanma
- **Örnek:**
  ```typescript
  // SQL ile:
  const result = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
  const task = result.rows[0]; // type: any (güvensiz!)
  
  // ORM ile (Drizzle):
  const task = await db.select().from(tasks).where(eq(tasks.id, taskId));
  // type: Gorev (type-safe!)
  ```

**Drizzle ORM Nedir?**
- **Headless TypeScript ORM:** Schema-first, type-safe
- **İlk Çıkış:** 2022 (yeni ama hızla büyüyen)
- **Felsefe:** SQL-like syntax, full type safety

**Seçim Gerekçesi:**

✅ **Full TypeScript support:**
- **Schema → Types otomatik:**
  ```typescript
  // Schema tanımı (shared/sema.ts)
  export const gorevler = pgTable("gorevler", {
    id: varchar("id").primaryKey(),
    baslik: text("baslik").notNull(),
    tamamlandi: boolean("tamamlandi").default(false)
  });
  
  // Drizzle otomatik type çıkarır:
  type Gorev = typeof gorevler.$inferSelect;
  // { id: string, baslik: string, tamamlandi: boolean }
  
  type InsertGorev = typeof gorevler.$inferInsert;
  // { id?: string, baslik: string, tamamlandi?: boolean }
  ```

✅ **SQL-like syntax:**
- **Öğrenmesi kolay (SQL biliyorsan):**
  ```typescript
  // SQL:
  SELECT * FROM gorevler WHERE tamamlandi = false ORDER BY id DESC;
  
  // Drizzle:
  await db
    .select()
    .from(gorevler)
    .where(eq(gorevler.tamamlandi, false))
    .orderBy(desc(gorevler.id));
  ```

✅ **Migration system:**
- **Migration nedir?** Veritabanı değişikliklerini versiyonlama
- **Drizzle Kit:**
  ```bash
  # 1. Schema değiştir (shared/sema.ts)
  export const gorevler = pgTable("gorevler", {
    // YENİ: etiketler kolonu ekledik
    etiketler: text("etiketler").array().default([])
  });
  
  # 2. Migration oluştur
  npm run db:generate
  # → drizzle/0001_add_etiketler.sql
  
  # 3. Migration uygula
  npm run db:push
  # → ALTER TABLE gorevler ADD COLUMN etiketler text[] DEFAULT '{}';
  ```

✅ **Lightweight:**
- **Bundle size:** 15KB (gzipped)
- **Prisma:** 50KB (binary dependency)
- **TypeORM:** 200KB

**Drizzle vs Alternatifler:**

❌ **Prisma:**
- **Artıları:** En popüler, büyük community, admin UI
- **Eksileri:**
  - Binary dependency (Electron'da problem: platform-specific binary)
  - Schema language ayrı (Prisma Schema Language, TypeScript değil)
  - Daha ağır
- **Sonuç:** Drizzle daha hafif, Electron-friendly

❌ **TypeORM:**
- **Artıları:** Mature, decorator-based (Java Spring gibi)
- **Eksileri:**
  - Ağır (200KB)
  - Decorator syntax (learning curve)
  - Type inference zayıf
- **Sonuç:** Drizzle modern, type-safe

❌ **Kysely:**
- **Artıları:** Type-safe SQL query builder
- **Eksileri:**
  - Query builder (ORM değil: relation yok, cascade yok)
  - Manuel type tanımlama gerekir
- **Sonuç:** Drizzle hem query builder hem ORM

**Drizzle Şema Örneği (shared/sema.ts):**

```typescript
import { pgTable, varchar, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

// 1. Tablo tanımı
export const gorevler = pgTable("gorevler", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // varchar: değişken uzunlukta string
  // primaryKey: unique identifier, index otomatik
  // gen_random_uuid(): PostgreSQL fonksiyonu (rastgele UUID)
  
  baslik: text("baslik").notNull(),
  // text: uzun string (varchar sınırsız versiyonu)
  // notNull: boş olamaz (SQL: NOT NULL)
  
  aciklama: text("aciklama"),
  // nullable (default), boş olabilir
  
  tamamlandi: boolean("tamamlandi").default(false),
  // default: insert'te değer verilmezse false
  
  oncelik: text("oncelik", { enum: ['dusuk', 'orta', 'yuksek'] }).default('orta'),
  // enum: sadece bu 3 değer olabilir
  
  son_tarih: timestamp("son_tarih"),
  // timestamp: tarih + saat (SQL: TIMESTAMP)
  
  olusturma_tarihi: timestamp("olusturma_tarihi").defaultNow(),
  // defaultNow(): insert anında şimdiki zaman
  
  etiketler: text("etiketler").array().default([]),
  // array(): PostgreSQL array tipi (text[])
  // default([]): boş array
});

// 2. Zod şema oluştur (validation için)
export const insertGorevSchema = createInsertSchema(gorevler).omit({
  id: true,                    // id otomatik, kullanıcı girmez
  olusturma_tarihi: true      // timestamp otomatik
});

// 3. Type çıkarımı
export type Gorev = typeof gorevler.$inferSelect;
// {
//   id: string,
//   baslik: string,
//   aciklama: string | null,
//   tamamlandi: boolean,
//   oncelik: 'dusuk' | 'orta' | 'yuksek',
//   son_tarih: Date | null,
//   olusturma_tarihi: Date,
//   etiketler: string[]
// }

export type InsertGorev = typeof gorevler.$inferInsert;
// {
//   id?: string,
//   baslik: string,
//   aciklama?: string | null,
//   tamamlandi?: boolean,
//   oncelik?: 'dusuk' | 'orta' | 'yuksek',
//   son_tarih?: Date | null,
//   olusturma_tarihi?: Date,
//   etiketler?: string[]
// }
```

**Drizzle Query Örnekleri:**

```typescript
import { db } from './database';
import { gorevler } from '@shared/sema';
import { eq, and, or, desc, like } from 'drizzle-orm';

// 1. Tüm görevleri getir
const tumGorevler = await db.select().from(gorevler);

// 2. ID ile tek görev
const gorev = await db
  .select()
  .from(gorevler)
  .where(eq(gorevler.id, '123'));

// 3. Tamamlanmamış görevler
const tamamlanmamis = await db
  .select()
  .from(gorevler)
  .where(eq(gorevler.tamamlandi, false));

// 4. AND koşulu (tamamlanmamış VE yüksek öncelikli)
const acilGorevler = await db
  .select()
  .from(gorevler)
  .where(
    and(
      eq(gorevler.tamamlandi, false),
      eq(gorevler.oncelik, 'yuksek')
    )
  );

// 5. OR koşulu (yüksek VEYA orta öncelikli)
const oncelikliGorevler = await db
  .select()
  .from(gorevler)
  .where(
    or(
      eq(gorevler.oncelik, 'yuksek'),
      eq(gorevler.oncelik, 'orta')
    )
  );

// 6. Sıralama (azalan)
const sonGorevler = await db
  .select()
  .from(gorevler)
  .orderBy(desc(gorevler.olusturma_tarihi));

// 7. Arama (LIKE sorgusu)
const arananGorevler = await db
  .select()
  .from(gorevler)
  .where(like(gorevler.baslik, '%matematik%'));

// 8. Insert
const yeniGorev = await db
  .insert(gorevler)
  .values({
    baslik: 'Fizik çöz',
    oncelik: 'yuksek'
  })
  .returning(); // PostgreSQL: inserted row döndür

// 9. Update
await db
  .update(gorevler)
  .set({ tamamlandi: true })
  .where(eq(gorevler.id, '123'));

// 10. Delete
await db
  .delete(gorevler)
  .where(eq(gorevler.id, '123'));
```

### 7. TanStack React Query v5 - Data Fetching

**React Query Nedir?**
- **Basit Tanım:** Sunucu state'ini yönetme kütüphanesi (cache, fetch, refetch, invalidate)
- **Eski Adı:** React Query
- **Yeni Adı:** TanStack Query (framework-agnostic, Vue/Solid/Svelte de destekler)

**Server State vs Client State:**

**Client State:**
- **Tanım:** Tarayıcıda tutulan, sunucuyla ilgisi olmayan state
- **Örnekler:**
  - Modal açık mı? (isModalOpen)
  - Hangi tab seçili? (activeTab)
  - Form input değerleri (formData)
- **Yönetim:** useState, useReducer, Zustand

**Server State:**
- **Tanım:** Sunucudan gelen, cache'lenen, invalidate edilebilen state
- **Örnekler:**
  - Görevler listesi (sunucudan geliyor)
  - Kullanıcı profili (sunucudan geliyor)
  - Deneme sonuçları (sunucudan geliyor)
- **Yönetim:** React Query

**Seçim Gerekçesi:**

✅ **Server state management:**
- **Automatic caching:**
  ```typescript
  // 1. Component mount oldu → fetch
  const { data } = useQuery({ queryKey: ['/api/gorevler'] });
  
  // 2. Component unmount → cache'de kaldı
  // 3. Component tekrar mount → cache'den anında gösterir, arka planda refetch
  ```
  
- **Background refetching:**
  ```typescript
  useQuery({
    queryKey: ['/api/gorevler'],
    staleTime: 5000,    // 5 saniye boyunca fresh
    refetchInterval: 60000  // Her 60 saniyede arka planda refetch
  });
  ```
  
- **Cache invalidation:**
  ```typescript
  // Görev eklendi → cache'i invalidate et (yeniden fetch)
  await gorevEkleMutation.mutateAsync(yeniGorev);
  queryClient.invalidateQueries({ queryKey: ['/api/gorevler'] });
  ```

✅ **Automatic loading/error states:**
```typescript
const { data, isLoading, error } = useQuery({ queryKey: ['/api/gorevler'] });

if (isLoading) return <Skeleton />;
if (error) return <div>Hata: {error.message}</div>;
return <GorevListesi gorevler={data} />;

// Manuel loading state yok!
```

✅ **Optimistic updates:**
```typescript
const mutation = useMutation({
  mutationFn: (id) => apiRequest(`/api/gorevler/${id}`, 'DELETE'),
  onMutate: async (id) => {
    // 1. Cache'den görevi kaldır (optimistic)
    queryClient.setQueryData(['/api/gorevler'], (prev) =>
      prev.filter(g => g.id !== id)
    );
    // Kullanıcı anında silindi görür (API response beklemez)
  },
  onError: (err, id, context) => {
    // 2. Hata olursa geri al
    queryClient.setQueryData(['/api/gorevler'], context.previousData);
  }
});
```

**React Query vs Alternatifler:**

❌ **SWR (stale-while-revalidate):**
- **Artıları:** Hafif, benzer API
- **Eksileri:**
  - Ecosystem küçük
  - Mutation desteği zayıf
  - DevTools yok
- **Sonuç:** React Query feature-rich

❌ **Redux + Redux Toolkit Query:**
- **Artıları:** Redux ile entegre
- **Eksileri:**
  - Redux öğrenmek gerekir (boilerplate)
  - Server state için overkill
- **Sonuç:** React Query specialized

❌ **Zustand:**
- **Artıları:** Hafif, basit state management
- **Eksileri:**
  - Server state için özel değil (caching, refetching yok)
  - Manuel fetch mantığı yazmak gerekir
- **Sonuç:** React Query server state için ideal

**Query Örneği:**

```typescript
import { useQuery } from '@tanstack/react-query';

function GorevListesi() {
  const {
    data: gorevler,      // API response
    isLoading,           // İlk yüklenme
    isFetching,          // Background refetch
    error,               // Hata varsa
    refetch              // Manuel refetch fonksiyonu
  } = useQuery({
    queryKey: ['/api/gorevler'],
    // queryFn yok çünkü global default fetcher var (client/src/kutuphane/queryClient.ts)
    staleTime: 5000,     // 5 saniye boyunca fresh (refetch yok)
    gcTime: 10 * 60 * 1000, // 10 dakika cache'de tut (eski adı: cacheTime)
    refetchOnWindowFocus: true, // Pencere focus olunca refetch
    retry: 3             // Hata olursa 3 kere dene
  });
  
  if (isLoading) return <Skeleton className="h-40" />;
  if (error) return <Alert variant="destructive">{error.message}</Alert>;
  
  return (
    <div>
      <Button onClick={() => refetch()}>Yenile</Button>
      {gorevler.map(gorev => <GorevKarti key={gorev.id} {...gorev} />)}
    </div>
  );
}
```

**Mutation Örneği:**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/kutuphane/queryClient';

function GorevEkleDialog() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (data: InsertGorev) => 
      apiRequest('/api/gorevler', 'POST', data),
    
    onSuccess: (yeniGorev) => {
      // 1. Cache'i invalidate et (refetch)
      queryClient.invalidateQueries({ queryKey: ['/api/gorevler'] });
      
      // 2. Toast göster
      toast({
        title: 'Başarılı!',
        description: `"${yeniGorev.baslik}" eklendi.`
      });
      
      // 3. Dialog'u kapat
      setIsOpen(false);
    },
    
    onError: (error) => {
      toast({
        title: 'Hata!',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  return (
    <Form onSubmit={(data) => mutation.mutate(data)}>
      <Input name="baslik" />
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Ekleniyor...' : 'Ekle'}
      </Button>
    </Form>
  );
}
```

**React Query v5 Değişiklikleri:**

```typescript
// v4 (eski)
useQuery(['gorevler'], fetchGorevler, {
  onSuccess: (data) => console.log(data)
});

// v5 (yeni)
useQuery({
  queryKey: ['/api/gorevler'],
  // queryFn: fetchGorevler (artık global default)
  // onSuccess deprecated, useMutation'da kullan
});

// v4: cacheTime
// v5: gcTime (garbage collection time)

// v4: useQuery(['key'], fn)
// v5: useQuery({ queryKey: ['key'], queryFn: fn })
```

### 8. Tailwind CSS - Utility-First CSS

**Tailwind CSS Nedir?**
- **Basit Tanım:** Hazır CSS class'larıyla hızlı UI yapma framework'ü
- **Felsefe:** Utility-first (her class tek bir şey yapar)
- **İlk Çıkış:** 2017

**Utility-First CSS Nedir?**

**Geleneksel CSS:**
```css
/* style.css */
.gorev-karti {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: white;
}

.gorev-karti:hover {
  background-color: #f9fafb;
}
```
```html
<div class="gorev-karti">Görev</div>
```

**Tailwind CSS (Utility-First):**
```html
<div class="p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50">
  Görev
</div>
```
- **p-4:** padding: 1rem (16px)
- **border:** border-width: 1px
- **border-gray-200:** border-color: #e5e7eb
- **rounded-lg:** border-radius: 0.5rem (8px)
- **bg-white:** background-color: white
- **hover:bg-gray-50:** hover'da background

**Seçim Gerekçesi:**

✅ **Rapid UI development:**
- **Hızlı prototipleme:** CSS dosyası açmadan tasarım
- **Örnek:** Buton rengi değiştir
  ```html
  <!-- Kırmızı → Yeşil (1 saniyede değişir) -->
  <Button className="bg-red-500 hover:bg-red-700">Sil</Button>
  <Button className="bg-green-500 hover:bg-green-700">Kaydet</Button>
  ```

✅ **No naming headaches:**
- **Problem (BEM, CSS Modules):**
  ```css
  /* CSS modülü isim bulmak zor */
  .task-card { }
  .task-card__header { }
  .task-card__header--active { }
  ```
- **Çözüm (Tailwind):**
  ```html
  <!-- İsim düşünmeye gerek yok -->
  <div class="p-4 border">
    <div class="font-bold">Başlık</div>
  </div>
  ```

✅ **Production optimization (PurgeCSS):**
- **Problem:** CSS dosyası çok büyük olabilir
- **Çözüm:** Tailwind sadece kullanılan class'ları bundle'a ekler
  ```
  Development: tailwind.css (3.5MB - tüm utility class'lar)
  Production: output.css (5KB - sadece kullanılanlar)
  ```

✅ **Responsive design kolaylığı:**
```html
<!-- Mobil: 1 kolon, Tablet: 2 kolon, Desktop: 4 kolon -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card />
  <Card />
  <Card />
  <Card />
</div>

<!-- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px
-->
```

**Tailwind vs Alternatifler:**

❌ **Bootstrap:**
- **Artıları:** Component-based (hazır buton, card, navbar)
- **Eksileri:**
  - Component-based (özelleştirmesi zor)
  - jQuery dependency (eski versiyonlar)
  - Her site aynı görünür
- **Sonuç:** Tailwind daha flexible

❌ **Material-UI:**
- **Artıları:** Google Material Design, React-specific
- **Eksileri:**
  - Ağır bundle (200KB+)
  - Material Design stuck (değiştirmesi zor)
  - Runtime CSS-in-JS (performans)
- **Sonuç:** Tailwind daha hafif

❌ **Styled Components:**
- **Artıları:** CSS-in-JS, component-scoped styles
- **Eksileri:**
  - Runtime overhead (CSS runtime'da oluşur)
  - Bundle size büyük
  - SSR karmaşık
- **Sonuç:** Tailwind build-time

**Tailwind Örneği:**

```tsx
// Geleneksel yöntem
<div style={{
  padding: '16px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  backgroundColor: 'white',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
}}>
  <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Başlık</h2>
  <p style={{ color: '#6b7280' }}>Açıklama</p>
</div>

// Tailwind yöntemi (daha okunabilir)
<div className="p-4 border border-gray-200 rounded-lg bg-white shadow">
  <h2 className="text-xl font-bold">Başlık</h2>
  <p className="text-gray-500">Açıklama</p>
</div>
```

**Tailwind Class'ları:**

```
SPACING (boşluk):
- p-4 = padding: 1rem (16px)
- px-4 = padding-left + padding-right
- py-4 = padding-top + padding-bottom
- m-4 = margin: 1rem
- space-x-4 = children arasında 1rem boşluk

COLORS (renkler):
- bg-blue-500 = background mavi
- text-red-500 = text kırmızı
- border-gray-200 = border gri
(50, 100, 200...900 = renk tonu)

TYPOGRAPHY (yazı):
- text-sm = 14px
- text-base = 16px
- text-xl = 20px
- font-bold = kalın
- italic = eğik

LAYOUT:
- flex = display: flex
- grid = display: grid
- block = display: block
- hidden = display: none

RESPONSIVE:
- md:flex = 768px'den sonra flex
- lg:grid = 1024px'den sonra grid

INTERACTIVE:
- hover:bg-blue-700 = hover'da koyu mavi
- focus:ring-2 = focus'ta ring
- disabled:opacity-50 = disabled'da soluk
```

### 9. shadcn/ui - Component Library

**shadcn/ui Nedir?**
- **Basit Tanım:** Kopyala-yapıştır React component'leri (npm dependency değil!)
- **Felsefe:** Component'leri kendi projenize kopyalayın, istediğiniz gibi değiştirin
- **İlk Çıkış:** 2023 (yeni ama çok popüler)

**Geleneksel Component Library vs shadcn/ui:**

**Geleneksel (Material-UI, Chakra UI):**
```bash
npm install @mui/material
```
```tsx
import { Button } from '@mui/material';
// node_modules'den gelir
// Özelleştirmesi zor
// Bundle size büyür
```

**shadcn/ui:**
```bash
npx shadcn@latest add button
```
```tsx
import { Button } from '@/bilesenler/arayuz/button';
// client/src/bilesenler/arayuz/button.tsx dosyasından gelir
// Kendi kodun, istediğin gibi değiştir
// Bundle size minimal (sadece kullandığın)
```

**Seçim Gerekçesi:**

✅ **Copy-paste components:**
- **npm dependency yok:**
  ```bash
  # shadcn/ui component ekle
  npx shadcn@latest add dialog
  
  # Dosya oluşturulur:
  client/src/bilesenler/arayuz/dialog.tsx
  
  # Artık kendi kodun, değiştirebilirsin
  ```
- **Avantajı:**
  - Bundle size küçük
  - Version conflict yok
  - İstediğin gibi customize

✅ **Full customization:**
- **Tailwind based:** Tüm style'lar Tailwind class'ları
- **Örnek:**
  ```tsx
  // button.tsx (shadcn component)
  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    {children}
  </button>
  
  // İstersen değiştir:
  <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl">
    {children}
  </button>
  ```

✅ **Accessible (Radix UI primitives):**
- **Radix UI nedir?** Unstyled, accessible UI primitives
- **shadcn/ui:** Radix UI + Tailwind CSS
  ```tsx
  // shadcn/ui Dialog komponenti
  import * as DialogPrimitive from '@radix-ui/react-dialog';
  
  // Radix: Accessibility (keyboard, screen reader, ARIA)
  // shadcn: Styling (Tailwind CSS)
  ```
- **Accessibility özellikleri:**
  - Keyboard navigation (Tab, Enter, Escape)
  - Screen reader support (ARIA labels)
  - Focus management

✅ **Modern design:**
- **Tasarım:** Vercel Design System benzeri
- **Dark mode:** Built-in dark mode desteği
- **Responsive:** Mobil uyumlu

**shadcn/ui vs Alternatifler:**

❌ **Chakra UI:**
- **Artıları:** Component-based, TypeScript support
- **Eksileri:**
  - npm dependency (35KB gzipped)
  - Runtime CSS-in-JS
  - Özelleştirmesi zor (theme override)
- **Sonuç:** shadcn/ui daha hafif

❌ **Ant Design:**
- **Artıları:** Enterprise-grade, çok component
- **Eksileri:**
  - Çok ağır (500KB+)
  - Çin tasarımı (batı sitelerine uymuyor)
  - Özelleştirmesi çok zor
- **Sonuç:** shadcn/ui daha modern

❌ **Material-UI:**
- **Artıları:** Google Material Design
- **Eksileri:**
  - Ağır (200KB)
  - Material Design stuck
  - Runtime CSS-in-JS
- **Sonuç:** shadcn/ui daha flexible

**Component Kullanımı:**

```bash
# Component listesi
npx shadcn@latest add

# Belirli component ekle
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add select
npx shadcn@latest add toast
```

```tsx
// Kullanım (client/src/sayfalar/Gorevler.tsx)
import { Button } from "@/bilesenler/arayuz/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/bilesenler/arayuz/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/bilesenler/arayuz/select";

function GorevEkle() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Görev Ekle</Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Görev</DialogTitle>
        </DialogHeader>
        
        <form className="space-y-4">
          <Input name="baslik" placeholder="Görev başlığı" />
          
          <Select name="oncelik">
            <SelectTrigger>
              <SelectValue placeholder="Öncelik seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dusuk">Düşük</SelectItem>
              <SelectItem value="orta">Orta</SelectItem>
              <SelectItem value="yuksek">Yüksek</SelectItem>
            </SelectContent>
          </Select>
          
          <Button type="submit">Ekle</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## PACKAGE.JSON DETAYLI AÇIKLAMA

Package.json, projenin bağımlılıklarını, scriptlerini ve metadata'sını içeren config dosyasıdır.

### Dependencies (Production - Canlı Ortamda Gerekli)

#### Core Dependencies (Temel Bağımlılıklar)

**1. express (^4.21.2)**
```json
"express": "^4.21.2"
```
- **Amaç:** HTTP server ve routing (yönlendirme)
- **Kullanım:** REST API endpoints
  - `GET /api/gorevler` → Tüm görevleri listele
  - `POST /api/gorevler` → Yeni görev ekle
  - `PUT /api/gorevler/:id` → Görevi güncelle
  - `DELETE /api/gorevler/:id` → Görevi sil
- **Version:** ^4.21.2
  - `^` (caret): Minor ve patch güncellemeleri kabul (4.x.x)
  - 4.21.2 → 4.22.0 olabilir ama 5.0.0 olamaz
- **Alternatifsiz:** Express.js Node.js web app'lerde standard

**2. dotenv (^17.2.2)**
```json
"dotenv": "^17.2.2"
```
- **Amaç:** Environment variables (çevre değişkenleri) yükleme
- **Kullanım:** `.env` dosyasından secret'ları okur
  ```
  # .env dosyası
  DATABASE_URL=postgresql://user:pass@host/db
  EMAIL_USER=berat@gmail.com
  OPENWEATHER_API_KEY=abc123
  ```
  ```typescript
  // server/index.ts
  import dotenv from 'dotenv';
  dotenv.config(); // .env dosyasını process.env'e yükler
  
  console.log(process.env.DATABASE_URL);
  ```
- **Güvenlik:** `.env` dosyası `.gitignore`'da (git'e commit edilmez)
- **Environment:** Development ve production farklı .env kullanır

**3. @neondatabase/serverless (^0.10.4)**
```json
"@neondatabase/serverless": "^0.10.4"
```
- **Amaç:** Neon PostgreSQL cloud database bağlantısı
- **Neon nedir?** Serverless PostgreSQL (AWS Lambda uyumlu)
- **Özellikler:**
  - Auto-scaling (ihtiyaç kadar kaynak)
  - Connection pooling (bağlantı havuzu)
  - Instant branching (test için kopya DB)
- **Kullanım (Replit ortamında):**
  ```typescript
  import { neon } from '@neondatabase/serverless';
  
  const sql = neon(process.env.DATABASE_URL);
  const result = await sql`SELECT * FROM gorevler`;
  ```
- **Electron'da:** Kullanılmaz (JSON file storage)

#### React Ecosystem (React Ekosistemi)

**4. react + react-dom (^18.3.1)**
```json
"react": "^18.3.1",
"react-dom": "^18.3.1"
```
- **react:** Core library (useState, useEffect, component logic)
- **react-dom:** Browser DOM manipulation (ReactDOM.render)
- **React 18 Özellikleri:**
  - **Concurrent rendering:** UI'ı bloklamadan render
  - **Automatic batching:** Birden fazla setState birleştirilir (performans)
  - **Transitions API:** Öncelikli vs background update
    ```tsx
    startTransition(() => {
      setAramaMetni(input.value);
    });
    ```
  - **Suspense improvements:** Data fetching için Suspense
    ```tsx
    <Suspense fallback={<Loading />}>
      <DataComponent />
    </Suspense>
    ```

**5. @tanstack/react-query (^5.60.5)**
```json
"@tanstack/react-query": "^5.60.5"
```
- **Eski adı:** react-query
- **Yeni adı:** @tanstack/react-query (framework-agnostic)
- **Amaç:** Server state management
- **Özellikler:**
  - **Automatic caching:** Fetch sonuçları cache'lenir
  - **Background refetching:** Arka planda yenileme
  - **Optimistic updates:** UI anında güncellenir, sonra API call
  - **Dev tools:** Query durumlarını görselleştirme
- **v5 Değişiklikleri:**
  ```typescript
  // v4
  useQuery(['key'], fetchFn, { onSuccess, onError });
  
  // v5
  useQuery({ queryKey: ['key'], queryFn: fetchFn });
  // onSuccess/onError deprecated
  ```

**6. wouter (^3.3.5)**
```json
"wouter": "^3.3.5"
```
- **Amaç:** Client-side routing (SPA için sayfa yönlendirme)
- **Neden React Router değil?**
  - **Boyut:** wouter 2KB, React Router 20KB (10x küçük!)
  - **API:** Hooks-based, modern
  - **Yeterli:** Bu projenin ihtiyacını karşılıyor
- **Kullanım:**
  ```tsx
  import { Route, Switch, Link, useLocation } from 'wouter';
  
  function App() {
    return (
      <Switch>
        <Route path="/" component={AnaSayfa} />
        <Route path="/gorevler" component={Gorevler} />
        <Route path="/denemeler" component={Denemeler} />
        <Route path="/analiz" component={Analiz} />
      </Switch>
    );
  }
  
  // Navigation
  <Link href="/gorevler">Görevler</Link>
  
  // Programmatic navigation
  const [location, setLocation] = useLocation();
  setLocation('/gorevler');
  ```

#### UI & Styling (Arayüz ve Stillendirme)

**7. tailwindcss + autoprefixer + postcss**
```json
"tailwindcss": "latest",
"autoprefixer": "latest",
"postcss": "latest"
```
- **tailwindcss:** Utility-first CSS framework
- **postcss:** CSS processing pipeline (transform, optimize)
- **autoprefixer:** Vendor prefix'leri otomatik ekler
  ```css
  /* Yazdığın: */
  .box {
    display: flex;
  }
  
  /* autoprefixer output: */
  .box {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
  }
  ```
- **Build process:**
  ```
  Tailwind CSS (@apply, utilities)
    ↓ PostCSS
  Browser-compatible CSS
    ↓ Autoprefixer
  Cross-browser CSS (vendor prefixes)
    ↓ PurgeCSS (production)
  Optimized CSS (unused removed)
  ```

**8. @radix-ui/* (25+ paket)**
```json
"@radix-ui/react-dialog": "^1.1.7",
"@radix-ui/react-select": "^2.1.7",
"@radix-ui/react-checkbox": "^1.1.5",
"@radix-ui/react-toast": "^1.2.5",
// ... 20+ daha
```
- **Radix UI nedir?** Unstyled, accessible UI primitives
- **Unstyled:** Sadece logic/accessibility, style sen ekle (Tailwind ile)
- **Accessible:** WAI-ARIA uyumlu
  - **Keyboard navigation:** Tab, Enter, Escape, Arrow keys
  - **Screen reader:** ARIA labels, roles
  - **Focus management:** Otomatik focus trap
- **Örnek (Dialog):**
  ```tsx
  import * as Dialog from '@radix-ui/react-dialog';
  
  <Dialog.Root>
    <Dialog.Trigger>Aç</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg">
        <Dialog.Title>Başlık</Dialog.Title>
        <Dialog.Description>Açıklama</Dialog.Description>
        <Dialog.Close>Kapat</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
  
  // Otomatik:
  // - Escape tuşuyla kapanır
  // - Overlay'e tıklayınca kapanır
  // - Focus trap (Tab dialog içinde kalır)
  // - Screen reader announcement
  ```

**9. lucide-react (^0.453.0)**
```json
"lucide-react": "^0.453.0"
```
- **Amaç:** Icon library (simge kütüphanesi)
- **Özellikler:**
  - **1000+ icons:** Check, X, Plus, Trash, Edit, User, Calendar vs.
  - **Tree-shakeable:** Sadece kullandığın icon'lar bundle'a girer
  - **Customizable:** Size, color, stroke width
- **Kullanım:**
  ```tsx
  import { Check, X, Plus, Trash2, Calendar, User } from 'lucide-react';
  
  <Button>
    <Plus className="w-4 h-4 mr-2" />
    Yeni Görev
  </Button>
  
  <Button variant="destructive">
    <Trash2 className="w-4 h-4 mr-2" />
    Sil
  </Button>
  ```

#### Form & Validation (Form ve Doğrulama)

**10. react-hook-form (^7.55.0)**
```json
"react-hook-form": "^7.55.0"
```
- **Amaç:** Form state management (form yönetimi)
- **Özellikler:**
  - **Minimal re-renders:** Sadece değişen input re-render olur
  - **Built-in validation:** Required, min, max, pattern
  - **Easy Zod integration:** zodResolver ile type-safe validation
- **Kullanım:**
  ```tsx
  import { useForm } from 'react-hook-form';
  
  function GorevFormu() {
    const { register, handleSubmit, formState: { errors } } = useForm({
      defaultValues: {
        baslik: '',
        oncelik: 'orta'
      }
    });
    
    const onSubmit = (data) => {
      console.log(data); // { baslik: '...', oncelik: '...' }
    };
    
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('baslik', { required: 'Başlık gerekli' })} />
        {errors.baslik && <span>{errors.baslik.message}</span>}
        
        <select {...register('oncelik')}>
          <option value="dusuk">Düşük</option>
          <option value="orta">Orta</option>
          <option value="yuksek">Yüksek</option>
        </select>
        
        <button type="submit">Ekle</button>
      </form>
    );
  }
  ```

**11. zod + zod-validation-error (^3.24.2 + ^3.4.0)**
```json
"zod": "^3.24.2",
"zod-validation-error": "^3.4.0"
```
- **zod:** Runtime type validation (çalışma zamanı tip doğrulama)
- **zod-validation-error:** Zod hatalarını user-friendly mesajlara çevirir
- **Kullanım:**
  ```typescript
  import { z } from 'zod';
  
  const gorevSchema = z.object({
    baslik: z.string().min(1, 'Başlık boş olamaz').max(100, 'Maksimum 100 karakter'),
    oncelik: z.enum(['dusuk', 'orta', 'yuksek']),
    son_tarih: z.date().optional()
  });
  
  // Type inference
  type Gorev = z.infer<typeof gorevSchema>;
  // { baslik: string, oncelik: 'dusuk' | 'orta' | 'yuksek', son_tarih?: Date }
  
  // Validation
  const result = gorevSchema.safeParse({
    baslik: '',
    oncelik: 'invalid'
  });
  
  if (!result.success) {
    console.log(result.error);
    // ZodError: baslik boş olamaz, oncelik invalid
  }
  ```

**12. @hookform/resolvers (^3.10.0)**
```json
"@hookform/resolvers": "^3.10.0"
```
- **Amaç:** react-hook-form + Zod entegrasyonu
- **Kullanım:**
  ```tsx
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { z } from 'zod';
  
  const schema = z.object({
    baslik: z.string().min(1),
    oncelik: z.enum(['dusuk', 'orta', 'yuksek'])
  });
  
  function Form() {
    const { register, handleSubmit } = useForm({
      resolver: zodResolver(schema) // Zod validation otomatik!
    });
    
    return (
      <form onSubmit={handleSubmit(data => console.log(data))}>
        <input {...register('baslik')} />
        <select {...register('oncelik')}>
          <option value="dusuk">Düşük</option>
        </select>
        <button type="submit">Gönder</button>
      </form>
    );
  }
  ```

#### Database & ORM (Veritabanı ve ORM)

**13. drizzle-orm + drizzle-zod (^0.39.1 + ^0.7.0)**
```json
"drizzle-orm": "^0.39.1",
"drizzle-zod": "^0.7.0"
```
- **drizzle-orm:** Type-safe SQL ORM
- **drizzle-zod:** Drizzle schema → Zod schema converter
- **Kullanım:**
  ```typescript
  // 1. Drizzle schema (shared/sema.ts)
  export const gorevler = pgTable("gorevler", {
    id: varchar("id").primaryKey(),
    baslik: text("baslik").notNull()
  });
  
  // 2. Zod schema oluştur
  import { createInsertSchema } from 'drizzle-zod';
  export const insertGorevSchema = createInsertSchema(gorevler).omit({ id: true });
  
  // 3. API'de validate
  app.post('/api/gorevler', async (req, res) => {
    const parsed = insertGorevSchema.parse(req.body); // Hata fırlatır if invalid
    const yeniGorev = await storage.gorevEkle(parsed);
    res.json(yeniGorev);
  });
  ```

**14. drizzle-kit (dev-dependency)**
```json
"drizzle-kit": "latest"
```
- **Amaç:** Database migrations (veritabanı değişiklik yönetimi)
- **Komutlar:**
  ```bash
  # 1. Migration generate (schema değişikliğinden SQL oluştur)
  npm run db:generate
  # → drizzle/0001_add_etiketler.sql
  
  # 2. Migration push (SQL'i DB'ye uygula)
  npm run db:push
  # → ALTER TABLE gorevler ADD COLUMN etiketler text[];
  
  # 3. Schema pull (DB'den Drizzle schema oluştur)
  npx drizzle-kit introspect
  # → Mevcut DB'yi Drizzle schema'ya çevir
  ```

#### Utilities (Yardımcı Araçlar)

**15. date-fns (^3.6.0)**
```json
"date-fns": "^3.6.0"
```
- **Amaç:** Date manipulation (tarih işlemleri)
- **Neden moment.js değil?** Moment.js deprecated (2020'de destek kesildi)
- **Avantajlar:**
  - **Tree-shakeable:** Sadece kullandığın fonksiyonlar bundle'a girer
  - **Immutable:** Date'leri mutate etmez (yan etki yok)
  - **TypeScript:** Tam tip desteği
- **Kullanım:**
  ```typescript
  import { format, addDays, isBefore, differenceInDays, startOfWeek } from 'date-fns';
  import { tr } from 'date-fns/locale';
  
  // Format
  const tarih = new Date();
  format(tarih, 'dd MMMM yyyy', { locale: tr }); // "31 Ekim 2025"
  format(tarih, 'dd/MM/yyyy'); // "31/10/2025"
  
  // Ekleme/çıkarma
  const yarin = addDays(tarih, 1);
  const gecenHafta = addDays(tarih, -7);
  
  // Karşılaştırma
  isBefore(tarih, yarin); // true
  
  // Fark hesaplama
  differenceInDays(yarin, tarih); // 1
  
  // Hafta başlangıcı
  startOfWeek(tarih, { locale: tr }); // Pazartesi
  ```

**16. nanoid (^5.1.6)**
```json
"nanoid": "^5.1.6"
```
- **Amaç:** Unique ID generation (benzersiz kimlik oluşturma)
- **Özellikler:**
  - **21 karakter:** URL-safe (-, _ içerir)
  - **Collision-free:** 1 milyon ID/saniye 1 yıl çalışsa collision riski %1
  - **Güvenli:** Crypto API kullanır (random değil, cryptographic random)
- **UUID vs nanoid:**
  ```
  UUID v4: 550e8400-e29b-41d4-a716-446655440000 (36 karakter)
  nanoid:  V1StGXR8_Z5jdHi6B-myT (21 karakter, 40% daha kısa)
  ```
- **Kullanım:**
  ```typescript
  import { nanoid } from 'nanoid';
  
  const gorevId = nanoid(); // "V1StGXR8_Z5jdHi6B-myT"
  const kisa = nanoid(10); // "V1StGXR8_Z" (custom length)
  ```

**17. clsx + tailwind-merge (^2.1.1 + ^2.6.0)**
```json
"clsx": "^2.1.1",
"tailwind-merge": "^2.6.0"
```
- **clsx:** Conditional className'ler (şartlı class ekle/çıkar)
- **tailwind-merge:** Çakışan Tailwind class'larını merge eder
- **cn utility (her ikisini birleştirir):**
  ```typescript
  // client/src/kutuphane/utils.ts
  import { clsx } from 'clsx';
  import { twMerge } from 'tailwind-merge';
  
  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```
- **Kullanım:**
  ```tsx
  import { cn } from '@/kutuphane/utils';
  
  // clsx: Conditional classes
  <Button className={cn(
    "bg-blue-500",
    isDisabled && "opacity-50 cursor-not-allowed",
    isLoading && "animate-pulse"
  )} />
  
  // tailwind-merge: Conflicting classes
  <Button className={cn(
    "bg-blue-500", // Bu silinir
    "bg-red-500"   // Bu kalır (son yazılan geçerli)
  )} />
  // Sonuç: bg-red-500
  
  // Merge olmazsa: bg-blue-500 bg-red-500 (her ikisi de uygulanır, beklenmedik sonuç)
  ```

---

## BÖLÜM 12: EMAIL & COMMUNICATION PAKETLERİ

### 12.1 @sendgrid/mail

```json
"@sendgrid/mail": "^8.1.4"
```

**SendGrid Nedir?**
- **Basit Tanım:** Email gönderme servisi (transactional email)
- **Transactional Email:** Kullanıcı aksiyonundan sonra otomatik gönderilen emailler
- **Örnekler:**
  - Kayıt doğrulama (verification email)
  - Şifre sıfırlama
  - Hatırlatma bildirimleri
  - Görev deadline uyarıları

**Kullanım Örneği:**
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Email gönder
await sgMail.send({
  to: 'ogrenci@example.com',
  from: 'noreply@yksanaliz.com',
  subject: 'Görev Deadline Uyarısı',
  html: `
    <h1>Merhaba!</h1>
    <p>Matematik Türev görevi yarın bitiyor!</p>
    <a href="https://app.yksanaliz.com/gorevler">Görevleri Gör</a>
  `
});
```

**SendGrid vs Alternatifler:**

| Özellik | SendGrid | Nodemailer (SMTP) | AWS SES |
|---------|----------|-------------------|---------|
| **Kurulum** | Kolay (API key) | Karmaşık (SMTP config) | Orta (AWS setup) |
| **Fiyat** | 100 email/gün ücretsiz | Kendi SMTP server'ı gerekir | 62,000 email/ay ücretsiz |
| **Deliverability** | Çok iyi ✅ | SMTP'ye bağlı | Çok iyi ✅ |
| **Analytics** | Var (açılma, tıklama) | Yok ❌ | Var |
| **Template** | Var | Kendin yap ❌ | Var |

**Neden SendGrid?**
- ✅ Setup kolay (5 dakika)
- ✅ Free tier yeterli (100 email/gün)
- ✅ Email template'leri
- ✅ Analytics dahil

**Örnek Senaryo:**
```typescript
// server/rotalar.ts
app.post('/api/gorevler/:id/hatirlatma', async (req, res) => {
  const gorev = await storage.gorevGetir(req.params.id);
  
  await sgMail.send({
    to: req.user.email,
    from: 'noreply@yksanaliz.com',
    templateId: 'd-1234567890', // SendGrid template ID
    dynamicTemplateData: {
      gorevBaslik: gorev.baslik,
      deadline: gorev.bitisTarihi,
      link: `https://app.yksanaliz.com/gorevler/${gorev.id}`
    }
  });
  
  res.json({ success: true });
});
```

### 12.2 nodemailer

```json
"nodemailer": "^6.9.16"
```

**Nodemailer Nedir?**
- **Basit Tanım:** Node.js için email gönderme kütüphanesi (SMTP, SendGrid, Gmail destekler)
- **SMTP nedir?** Simple Mail Transfer Protocol - Email gönderme protokolü
- **Avantaj:** Her SMTP server ile çalışır (kendi server'ınızı kullanabilirsiniz)

**Kullanım Örnekleri:**

**1. Gmail ile Email Gönderme:**
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yksanaliz@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD // App-specific password
  }
});

await transporter.sendMail({
  from: 'YKS Analiz <yksanaliz@gmail.com>',
  to: 'ogrenci@example.com',
  subject: 'Haftalık Rapor',
  html: `
    <h1>Bu Haftanın Özeti</h1>
    <p>Toplam çalışma saati: 25 saat</p>
    <p>Çözülen soru: 500</p>
  `
});
```

**2. Kendi SMTP Server ile:**
```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'username',
    pass: 'password'
  }
});
```

**SendGrid vs Nodemailer:**
- **SendGrid:** API-based, daha kolay, analytics var
- **Nodemailer:** SMTP-based, her server ile çalışır, daha esnek

**Hangisini Kullanıyoruz?**
Bu projede **her ikisi de** var:
- **SendGrid:** Production (canlı) email'ler için
- **Nodemailer:** Development (test) email'leri için

**Development Email Testi:**
```typescript
// Development'ta console'a yaz, email gönderme
if (process.env.NODE_ENV === 'development') {
  console.log('EMAIL GÖNDERILECEKTI:');
  console.log('To:', emailData.to);
  console.log('Subject:', emailData.subject);
} else {
  // Production'da gerçek email gönder
  await sgMail.send(emailData);
}
```

---

## BÖLÜM 13: CHARTS & VISUALIZATION

### 13.1 Recharts

```json
"recharts": "^2.13.3"
```

**Recharts Nedir?**
- **Basit Tanım:** React için chart (grafik) kütüphanesi
- **D3.js tabanlı:** D3 (Data-Driven Documents) en güçlü visualization library
- **Declarative:** JSX ile grafik tanımlama (kolay, anlaşılır)

**Supported Chart Types:**
1. Line Chart (Çizgi grafiği)
2. Bar Chart (Bar grafiği)
3. Area Chart (Alan grafiği)
4. Pie Chart (Pasta grafiği)
5. Scatter Chart (Dağılım grafiği)
6. Radar Chart (Radar grafiği)
7. Composed Chart (Karma grafik)

**Örnek Kullanım:**

**1. Net Gelişim Grafiği (Line Chart):**
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Veri
const netData = [
  { tarih: '01 Eki', tyt: 75, ayt: 60 },
  { tarih: '08 Eki', tyt: 78, ayt: 62 },
  { tarih: '15 Eki', tyt: 80, ayt: 65 },
  { tarih: '22 Eki', tyt: 82, ayt: 68 },
  { tarih: '29 Eki', tyt: 85, ayt: 70 }
];

// Grafik
function NetGelisimGrafigi() {
  return (
    <LineChart width={800} height={400} data={netData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="tarih" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="tyt" stroke="#3B82F6" name="TYT Net" />
      <Line type="monotone" dataKey="ayt" stroke="#EF4444" name="AYT Net" />
    </LineChart>
  );
}
```

**2. Ders Dağılımı (Pie Chart):**
```tsx
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const dersData = [
  { ders: 'Matematik', saat: 120 },
  { ders: 'Fizik', saat: 80 },
  { ders: 'Kimya', saat: 60 },
  { ders: 'Biyoloji', saat: 50 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function DersDagilimi() {
  return (
    <PieChart width={400} height={400}>
      <Pie
        data={dersData}
        dataKey="saat"
        nameKey="ders"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
      >
        {dersData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}
```

**3. Günlük Çalışma Saati (Bar Chart):**
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const calismaSaatleri = [
  { gun: 'Pzt', saat: 8 },
  { gun: 'Sal', saat: 6 },
  { gun: 'Çar', saat: 7 },
  { gun: 'Per', saat: 9 },
  { gun: 'Cum', saat: 5 },
  { gun: 'Cmt', saat: 10 },
  { gun: 'Paz', saat: 4 }
];

function GunlukCalismaGrafigi() {
  return (
    <BarChart width={600} height={300} data={calismaSaatleri}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="gun" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="saat" fill="#8884d8" />
    </BarChart>
  );
}
```

**Neden Recharts?**

| Özellik | Recharts | Chart.js | Victory |
|---------|----------|----------|---------|
| **React Integration** | Mükemmel ✅ | Wrapper gerekir | İyi |
| **Declarative** | Evet ✅ | Imperative ❌ | Evet ✅ |
| **TypeScript** | Tam destek ✅ | Kısmi destek | Tam destek ✅ |
| **Bundle Size** | Orta (400KB) | Küçük (200KB) | Büyük (600KB) |
| **Customization** | Çok iyi ✅ | İyi | Çok iyi ✅ |
| **Öğrenme** | Kolay ✅ | Orta | Orta |

**Seçim:** Recharts → React-friendly, declarative, TypeScript support

### 13.2 embla-carousel-react

```json
"embla-carousel-react": "^8.5.2"
```

**Embla Carousel Nedir?**
- **Basit Tanım:** React için carousel (kaydırmalı galeri) kütüphanesi
- **Carousel nedir?** Yan yana slayt gösteren, kaydırılabilen component
- **Kullanım Yerleri:**
  - Deneme sonuçları kartları
  - Görev önizlemeleri
  - Öğretici slides

**Özellikler:**
- ✅ Touch/swipe desteği (mobil)
- ✅ Keyboard navigation (ok tuşları)
- ✅ Auto-play
- ✅ Loop (sonsuz döngü)
- ✅ Responsive (her ekran boyutunda çalışır)

**Örnek Kullanım:**
```tsx
import useEmblaCarousel from 'embla-carousel-react';

function DenemeSonuclariCarousel({ denemeler }) {
  const [emblaRef] = useEmblaCarousel({ loop: true });

  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container">
        {denemeler.map((deneme) => (
          <div key={deneme.id} className="embla__slide">
            <DenemeKarti deneme={deneme} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**CSS:**
```css
.embla {
  overflow: hidden;
}
.embla__container {
  display: flex;
}
.embla__slide {
  flex: 0 0 100%;
  min-width: 0;
}
```

---

## BÖLÜM 14: TESTING KÜTÜPHANELERİ

### 14.1 Vitest

```json
"vitest": "^2.1.8"
```

**Vitest Nedir?**
- **Basit Tanım:** Vite tabanlı test framework (Jest'in modern alternatifi)
- **Test nedir?** Kodunuzun doğru çalıştığını otomatik kontrol etme
- **Unit Test:** Bir fonksiyonun testi
- **Integration Test:** Birden fazla parçanın birlikte testi

**Neden Vitest?**

| Özellik | Vitest | Jest |
|---------|--------|------|
| **Hız** | Çok hızlı ✅ | Yavaş ❌ |
| **Vite Integration** | Native ✅ | Wrapper gerekir |
| **ESM Support** | Tam ✅ | Kısmi |
| **Watch Mode** | Instant ✅ | Yavaş |
| **TypeScript** | Zero-config ✅ | Config gerekir |

**Test Örneği:**
```typescript
// server/depolama.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { MemStorage } from './depolama';

describe('MemStorage', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  it('görev ekler', async () => {
    const gorev = await storage.gorevEkle({
      baslik: 'Test Görevi',
      oncelik: 'yuksek',
      kategori: 'matematik'
    });

    expect(gorev.id).toBeDefined();
    expect(gorev.baslik).toBe('Test Görevi');
    expect(gorev.tamamlandi).toBe(false);
  });

  it('görev toggle yapar', async () => {
    const gorev = await storage.gorevEkle({ baslik: 'Test' });
    const toggled = await storage.gorevToggle(gorev.id);

    expect(toggled.tamamlandi).toBe(true);
  });
});
```

**Çalıştırma:**
```bash
npm run test        # Tüm testleri çalıştır
npm run test:watch  # Watch mode (dosya değişince otomatik test)
npm run test:ui     # Web UI ile test
```

### 14.2 @playwright/test

```json
"@playwright/test": "^1.49.1"
```

**Playwright Nedir?**
- **Basit Tanım:** End-to-end (E2E) test framework
- **E2E Test nedir?** Gerçek kullanıcı gibi tüm uygulamayı test etme
- **Microsoft tarafından:** VSCode test etmek için yapıldı

**E2E Test Örneği:**
```typescript
// tests/gorev-ekle.spec.ts
import { test, expect } from '@playwright/test';

test('yeni görev ekleme', async ({ page }) => {
  // 1. Sayfaya git
  await page.goto('http://localhost:5000/gorevler');
  
  // 2. "Yeni Görev" butonuna tıkla
  await page.click('[data-testid="button-yeni-gorev"]');
  
  // 3. Formu doldur
  await page.fill('[data-testid="input-baslik"]', 'Matematik Çalış');
  await page.selectOption('[data-testid="select-oncelik"]', 'yuksek');
  
  // 4. Kaydet
  await page.click('[data-testid="button-kaydet"]');
  
  // 5. Toast mesajını kontrol et
  await expect(page.locator('[data-testid="toast"]')).toContainText('Görev eklendi');
  
  // 6. Görevin listede göründüğünü kontrol et
  await expect(page.locator('text=Matematik Çalış')).toBeVisible();
});
```

**Playwright Özellikleri:**
- ✅ Multi-browser (Chrome, Firefox, Safari, Edge)
- ✅ Auto-wait (element hazır olana kadar bekler)
- ✅ Screenshot + video recording
- ✅ Network interception (API mock)
- ✅ Parallel test execution (çok hızlı)

**Test Senaryoları:**
```typescript
// tests/deneme-kayit.spec.ts
test('deneme sonucu kaydetme', async ({ page }) => {
  await page.goto('/denemeler');
  await page.click('[data-testid="button-yeni-deneme"]');
  
  // Form doldur
  await page.fill('[data-testid="input-deneme-adi"]', 'TYT Deneme 5');
  await page.fill('[data-testid="input-tyt-matematik"]', '32');
  await page.fill('[data-testid="input-tyt-turkce"]', '28');
  
  // Kaydet ve grafik kontrolü
  await page.click('[data-testid="button-kaydet"]');
  await expect(page.locator('canvas')).toBeVisible(); // Grafik render
});
```

### 14.3 @axe-core/playwright

```json
"@axe-core/playwright": "^4.10.2"
```

**Axe Nedir?**
- **Basit Tanım:** Accessibility (erişilebilirlik) test aracı
- **Accessibility nedir?** Engelli kullanıcıların (görme engelli, işitme engelli) uygulamayı kullanabilmesi
- **WCAG:** Web Content Accessibility Guidelines (standart)

**Test Örneği:**
```typescript
import { test } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test('accessibility check', async ({ page }) => {
  await page.goto('/gorevler');
  
  // Axe'i sayfaya enjekte et
  await injectAxe(page);
  
  // Accessibility kontrol et
  await checkA11y(page);
});
```

**Kontrol Edilen Şeyler:**
- ✅ Alt text (image'lerde)
- ✅ Color contrast (yazı okunaklı mı?)
- ✅ Keyboard navigation (tab ile gezinme)
- ✅ ARIA labels (screen reader desteği)
- ✅ Form labels (input'ların label'ı var mı?)

**Neden Önemli?**
- 15% nüfus engelli (WHO verisi)
- Yasal gereklilik (birçok ülkede)
- SEO + (Google accessibility'yi önemser)
- Daha iyi UX (herkes için)

---

## BÖLÜM 15: ELECTRON-SPECIFIC PAKETLER

### 15.1 electron

```json
"electron": "latest"
```

**Versiyonlama:**
- **latest:** Her zaman en yeni version
- **Avantaj:** Son Chromium features
- **Dezavantaj:** Breaking changes riski

**Electron Lifecycle:**
```
1. app.on('ready') → Uygulama başladı
2. createWindow() → Ana pencere oluştur
3. app.on('window-all-closed') → Tüm pencereler kapandı
4. app.on('before-quit') → Uygulama kapanmadan önce
5. app.quit() → Uygulamayı kapat
```

### 15.2 electron-builder

```json
"electron-builder": "^25.1.8"
```

**Electron Builder Nedir?**
- **Basit Tanım:** Electron uygulamasını paketleme ve installer oluşturma aracı
- **Output:** .exe (Windows), .dmg (macOS), .AppImage (Linux)

**Konfigürasyon:**
```json
{
  "build": {
    "appId": "com.beratcankir.yksanaliz",
    "productName": "YKS Analiz Takip Sistemi",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "server/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "build/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "build/icon.png"
    }
  }
}
```

**Build Komutu:**
```bash
npm run build       # Vite build (dist/ oluştur)
npm run package     # Electron builder (installer oluştur)
```

**Output:**
```
release/
├── YKS-Analiz-Setup-1.0.0.exe     (Windows installer - 150MB)
├── YKS-Analiz-1.0.0.dmg           (macOS disk image - 140MB)
└── YKS-Analiz-1.0.0.AppImage      (Linux portable - 145MB)
```

### 15.3 electron-updater

```json
"electron-updater": "^6.3.9"
```

**Auto-Updater Nedir?**
- **Basit Tanım:** Uygulamanın otomatik güncellenmesi
- **Kullanıcı deneyimi:** Chrome gibi otomatik update

**Nasıl Çalışır?**
```
1. Uygulama başlar
2. Update server'ını kontrol eder (GitHub Releases)
3. Yeni version varsa indirir
4. Kullanıcıya bildirim gösterir
5. Restart sonrası yeni version çalışır
```

**Kod:**
```javascript
// electron/main.cjs
import { autoUpdater } from 'electron-updater';

autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    title: 'Güncelleme Mevcut',
    message: 'Yeni version indiriliyor...'
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: 'Güncelleme Hazır',
    message: 'Restart yaparak güncelleyin',
    buttons: ['Restart', 'Sonra']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});
```

---

## BÖLÜM 16: DEPLOYMENT STRATEJİSİ

### 16.1 Development (Geliştirme) Ortamı

**Komut:**
```bash
npm run dev
```

**Ne Olur?**
```
1. Vite dev server başlar (port 5173)
2. Express server başlar (port 5000)
3. Electron main process başlar
4. BrowserWindow açılır (localhost:5000)
5. HMR aktif (kod değişince otomatik yenilenir)
```

**Avantajlar:**
- ✅ Instant feedback (<50ms HMR)
- ✅ Source maps (debugging kolay)
- ✅ Console logs görünür

### 16.2 Production (Canlı) Build

**Komut:**
```bash
npm run build        # Vite build
npm run package      # Electron package
```

**Build Süreci:**
```
1. TypeScript → JavaScript (tsc)
2. React components → Optimized bundles (Vite)
3. CSS → Minified + tree-shaken (Tailwind)
4. Assets → Optimized images
5. Electron → Packaged app (.exe, .dmg, .AppImage)
```

**Optimizasyonlar:**
- Code splitting (chunk'lara böl)
- Tree shaking (kullanılmayan kod sil)
- Minification (dosya boyutu küçült)
- Image optimization (resim sıkıştır)

**Output Boyutları:**
```
dist/
├── assets/
│   ├── index-abc123.js      (500KB minified)
│   ├── index-def456.css     (50KB minified)
│   └── logo-xyz789.png      (20KB optimized)
└── index.html               (2KB)

Total bundle: ~600KB (gzip: ~180KB)
```

### 16.3 Electron Packaging

**Windows (.exe):**
```bash
electron-builder --win
```
- **Installer:** NSIS (Nullsoft Scriptable Install System)
- **Boyut:** ~150MB (Chromium + Node.js + App)
- **Auto-update:** Evet

**macOS (.dmg):**
```bash
electron-builder --mac
```
- **Format:** DMG disk image
- **Boyut:** ~140MB
- **Code signing:** Apple Developer hesabı gerekir (production)

**Linux (.AppImage):**
```bash
electron-builder --linux
```
- **Format:** AppImage (portable, dependency yok)
- **Boyut:** ~145MB
- **Çalıştırma:** `chmod +x app.AppImage && ./app.AppImage`

### 16.4 Release Stratejisi

**GitHub Releases:**
```
1. Git tag oluştur: git tag v1.0.0
2. GitHub'a push: git push --tags
3. electron-builder publish
4. GitHub Releases'de yeni version
5. Auto-updater bu release'i kontrol eder
```

**Semantic Versioning:**
```
v1.2.3
│ │ │
│ │ └─ Patch (bug fix)
│ └─── Minor (yeni feature, backward compatible)
└───── Major (breaking change)
```

**Changelog:**
```markdown
# v1.1.0 (2025-11-01)

## Yeni Özellikler
- ✨ Dark mode desteği
- 📊 Net gelişim grafiği

## Bug Fixes
- 🐛 Görev silme hatası düzeltildi
- 🐛 Deneme kaydetme performans iyileştirmesi

## İyileştirmeler
- ⚡ Uygulama başlatma hızı 2x arttı
- 💄 UI tasarım güncellemesi
```

---

## ÖZET

**Toplam Dosya Boyutu:** 2800+ satır

**Tamamlanan Bölümler:**
1. ✅ Giriş ve Temel Kavramlar
2. ✅ Mimari Genel Bakış
3. ✅ Teknoloji Seçimleri (Electron, React, TypeScript, Vite)
4. ✅ Backend Stack (Express, Drizzle ORM)
5. ✅ Database (PostgreSQL vs JSON)
6. ✅ UI Framework (Tailwind CSS, shadcn/ui)
7. ✅ State Management (React Query)
8. ✅ Veri Modelleri
9. ✅ File Structure
10. ✅ Dependencies Detayları
11. ✅ Utility Libraries
12. ✅ Email & Communication
13. ✅ Charts & Visualization
14. ✅ Testing Kütüphaneleri
15. ✅ Electron-Specific Paketler
16. ✅ Deployment Stratejisi

**Her açıklama içerir:**
- ✅ Terim açıklaması (İngilizce + Türkçe)
- ✅ Kod örnekleri (nasıl kullanılır?)
- ✅ Alternatif karşılaştırmaları (neden bu seçildi?)
- ✅ Best practices (en iyi uygulamalar)
- ✅ Real-world senaryolar (gerçek kullanım)
