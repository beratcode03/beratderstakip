# BERAT CANKIR - YKS ANALİZ TAKİP SİSTEMİ
## Test ve Kullanım Talimatları

**📑 Hızlı Navigasyon:** [Ana Sayfa](./replit.md) | [Sistem Gereksinimleri](#sistem-gereksinimleri) | [Kurulum](#kurulum) | [Geliştirme](#geliştirme-modu) | [Test](#test-çalıştırma) | [Build](#üretim-derlemesi) | [API Test](#api-endpoints-test) | [Sorun Giderme](#yaygın-sorunlar-ve-çözümleri)

**📚 Ek Dokümantasyon:** [Talimatlar](./md%20dosyaları/talimatlar.md) | [Teknik Mimari](./md%20dosyaları/teknik_mimari.md) | [Client Kodu](./md%20dosyaları/kod_aciklamasi_client.md) | [Server Kodu](./md%20dosyaları/kod_aciklamasi_server.md) | [Shared Kodu](./md%20dosyaları/kod_aciklamasi_shared.md) | [Electron](./md%20dosyaları/kod_aciklamasi_electron1.md)

### 📋 İçindekiler
1. [Sistem Gereksinimleri](#sistem-gereksinimleri)
2. [Kurulum](#kurulum)
3. [Geliştirme Modu](#geliştirme-modu)
4. [Test Çalıştırma](#test-çalıştırma)
5. [Üretim Derlemesi](#üretim-derlemesi)
6. [Electron Masaüstü Uygulaması](#electron-masaüstü-uygulaması)
7. [API Endpoints Test](#api-endpoints-test)
8. [UI/UX Test Senaryoları](#uiux-test-senaryoları)
9. [Yaygın Sorunlar ve Çözümleri](#yaygın-sorunlar-ve-çözümleri)
10. [Performans Test](#performans-test)
11. [Güvenlik Testleri](#güvenlik-testleri)
12. [Veritabanı Test](#veritabanı-test)
13. [Component Testing](#component-testing-birim-testler)
14. [API Testing Detaylı](#api-testing-detaylı)
15. [Test Best Practices](#test-yazma-best-practices)

---

## 🖥️ Sistem Gereksinimleri

### Minimum Gereksinimler (Windows)
- **İşletim Sistemi:** Windows 10 veya üzeri (64-bit)
- **Node.js:** v18.x veya v20.x
- **npm:** v9.x veya üzeri
- **RAM:** En az 4GB (8GB önerilir)
- **Disk Alanı:** En az 500MB boş alan

### Önerilen Geliştirme Araçları
- **VS Code** (veya herhangi bir kod editörü)
- **Git** (versiyon kontrolü için)
- **Windows Terminal** (PowerShell veya CMD)

---

## 📦 Kurulum

### 1. Depo Klonlama
```bash
git clone https://github.com/beratcode03/beratders.git
cd beratders
```

### 2. Bağımlılıkları Yükleme
```bash
npm install
```

**Not:** İlk kurulum 5-10 dakika sürebilir.

### 3. Ortam Değişkenlerini Ayarlama (Opsiyonel)

`.env.example` dosyasını `.env` olarak kopyalayın:
```bash
copy .env.example .env
```

`.env` dosyasında aşağıdaki değişkenleri doldurun (opsiyonel):
```env
# Hava Durumu API (OpenWeather)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# E-posta Bildirimleri (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=noreply@beratcankir.com
```

**ÖNEMLİ:** Bu ortam değişkenleri **opsiyoneldir**. Uygulama bu değişkenler olmadan da çalışır:
- Hava durumu widget'ı devre dışı kalır
- E-posta bildirimleri çalışmaz
- Diğer tüm özellikler normal çalışır

---

## 🚀 Geliştirme Modu

### Web Uygulaması Başlatma
```bash
npm run dev
```

Tarayıcınızda şu adresi açın: **http://localhost:5000**

**Özellikler:**
- ✅ Hot Module Replacement (HMR) - Kod değişiklikleri otomatik yüklenir
- ✅ TypeScript type checking
- ✅ JSON file storage (data/kayitlar.json)
- ✅ Detaylı console logları

### Electron Uygulaması Başlatma (Geliştirme)
```bash
npm run electron:dev
```

**Not:** Bu komut hem web server'ı hem de Electron penceresini açar.

---

## 🧪 Test Çalıştırma

### Tüm Testleri Çalıştırma (Vitest)
```bash
npm test
```
**Açıklama:** Tüm unit ve integration testlerini tek seferde çalıştırır. Test sonuçlarını konsola yazdırır ve başarısız testleri raporlar.

**Ne zaman kullanılır:**
- Kod değişikliklerinden sonra tüm testlerin hala geçtiğini doğrulamak için
- CI/CD pipeline'da otomatik test çalıştırma için
- Production build öncesi final kontrol için

**Çıktı:**
```
✓ client/src/bilesenler/__testler__/example.test.tsx (3)
✓ server/__testler__/api.test.ts (5)
Test Files  2 passed (2)
     Tests  8 passed (8)
```

### Watch Mode'da Test
```bash
npm run test:watch
```
**Açıklama:** Dosya değişikliklerini izler ve otomatik olarak ilgili testleri yeniden çalıştırır. Geliştirme sırasında sürekli açık tutulabilir.

**Ne zaman kullanılır:**
- Aktif geliştirme sırasında (TDD - Test Driven Development)
- Hızlı geri bildirim döngüsü için
- Bug fix çalışmaları sırasında

**Özellikler:**
- ✅ Dosya değişikliklerinde otomatik yeniden çalışma
- ✅ Sadece değişen dosyalarla ilgili testleri çalıştırma
- ✅ Interaktif test filtreleme
- ✅ Hızlı iterasyon

**Kullanım:**
```
Watch Usage
 › Press a to run all tests
 › Press f to run only failed tests
 › Press q to quit watch mode
```

### Test Kapsamı (Coverage)
```bash
npm run test:coverage
```
**Açıklama:** Kodun ne kadarının testlerle kapsandığını raporlar. HTML rapor oluşturur.

**Ne zaman kullanılır:**
- Hangi kodların test edilmediğini görmek için
- Test coverage metriklerini takip etmek için
- Eksik test olan alanları belirlemek için

**Çıktı Metrikleri:**
- **Statements:** Kod satırlarının yüzdesi
- **Branches:** if/else dallarının yüzdesi
- **Functions:** Fonksiyonların yüzdesi
- **Lines:** Satırların yüzdesi

**Hedef Coverage:**
- Critical paths: %90+
- Business logic: %80+
- UI components: %70+
- Utilities: %95+

**HTML Rapor:**
```bash
# Rapor klasörünü aç (Windows)
start coverage/index.html
```

### UI Test Arayüzü
```bash
npm run test:ui
```
**Açıklama:** Vitest'in görsel test arayüzünü tarayıcıda açar. Test sonuçlarını grafik olarak gösterir.

**Ne zaman kullanılır:**
- Test sonuçlarını görsel olarak incelemek için
- Test loglarını detaylı görmek için
- Test execution time'ları analiz etmek için
- Failed testlerin stack trace'ini kolayca görmek için

**Özellikler:**
- ✅ Grafik arayüz
- ✅ Test filtreleme ve arama
- ✅ Console log görüntüleme
- ✅ Component snapshot preview
- ✅ Real-time test sonuçları

**Adres:** http://localhost:51204/__vitest__/

### TypeScript Type Kontrolü
```bash
npm run check
```
**Açıklama:** TypeScript derleyicisini (tsc) çalıştırarak tüm projedeki tip hatalarını kontrol eder. Build yapmadan sadece tip kontrolü yapar.

**Ne zaman kullanılır:**
- Kod yazdıktan sonra tip güvenliğini doğrulamak için
- CI/CD pipeline'da tip kontrolü için
- Refactoring sonrası tüm dosyaların hala tip-safe olduğunu kontrol etmek için

**Beklenen Çıktı:**
```
✓ Type checking completed successfully
```

**Hata örneği:**
```
client/src/sayfalar/panel.tsx:42:5 - error TS2322: Type 'string' is not assignable to type 'number'.
```

### End-to-End (E2E) Testler (Playwright)

**Playwright kurulumu (ilk kez):**
```bash
npx playwright install
```
**Açıklama:** Playwright'ın browser binaries'lerini indirir (Chromium, Firefox, WebKit). İlk kez E2E test çalıştıracaksanız gereklidir.

**E2E testleri çalıştırma:**
```bash
npx playwright test
```
**Açıklama:** Tüm end-to-end testleri headless modda çalıştırır. Gerçek tarayıcı ortamında uygulama akışlarını test eder.

**Ne test edilir:**
- Kullanıcı akışları (görev ekleme, düzenleme, silme)
- Sayfa navigasyonu
- Form validasyonları
- API entegrasyonu
- Responsive tasarım
- Tema değiştirme
- Veri kalıcılığı

**Çıktı:**
```
Running 15 tests using 3 workers
  15 passed (1.2m)
```

**Playwright UI mode:**
```bash
npx playwright test --ui
```
**Açıklama:** Playwright'ın interaktif test arayüzünü açar. Test adımlarını görsel olarak takip edebilirsiniz.

**Özellikler:**
- ✅ Test execution'ı izleme
- ✅ Adım adım debugging
- ✅ Screenshot ve video görüntüleme
- ✅ Network request inceleme
- ✅ Console log görüntüleme

**Headed mode (tarayıcıyı görerek):**
```bash
npx playwright test --headed
```

**Debug mode:**
```bash
npx playwright test --debug
```

**Tek bir test dosyası çalıştırma:**
```bash
npx playwright test testler/tam-kapsamli-sistem-testi.spec.ts
```

**Belirli bir teste odaklanma:**
```bash
npx playwright test --grep "görev ekleme"
```

**Accessibility (Erişilebilirlik) Testleri:**
```bash
npx playwright test --grep "accessibility"
```
**Açıklama:** WCAG 2.1 standartlarına uygunluğu test eder. axe-core library kullanır.

**Test edilen kriterler:**
- Color contrast (renk kontrast oranı)
- Keyboard navigation
- Screen reader uyumluluğu
- ARIA labels
- Form labels
- Alt text (resimlerde)

**Rapor görüntüleme:**
```bash
npx playwright show-report
```
HTML rapor tarayıcıda açılır ve detaylı test sonuçlarını gösterir.

---

## 🏗️ Üretim Derlemesi

### Web Uygulaması İçin Build
```bash
npm run build
```

**Çıktı:** `dist/public` klasörü

### Derlenmiş Uygulamayı Çalıştırma
```bash
npm start
```

### TypeScript Type Kontrolü
```bash
npm run check
```

---

## 💻 Electron Masaüstü Uygulaması

### Geliştirme Derlemesi (Test için)
```bash
npm run electron:build:dir
```
**Çıktı:** `dist-electron` klasörü (kurulum gerektirmez)

### Üretim Derlemesi (Windows Installer)
```bash
npm run electron:build
```

**Çıktı:** `dist-electron` klasöründe `.exe` installer dosyası

**Dosya Adı:** `Berat Cankir-Kurulum-0.0.3.exe`

### Electron Build Özellikleri
- ✅ Windows NSIS Installer
- ✅ Masaüstü kısayolu oluşturur
- ✅ Başlat menüsüne eklenir
- ✅ System tray desteği
- ✅ Offline çalışma
- ✅ Otomatik güncellemeler (GitHub Releases)

---

## 🔌 API Endpoints Test

### Manual API Test (curl veya Postman)

**Base URL:** `http://localhost:5000/api`

#### Görevler (Tasks)

**Tüm görevleri getir:**
```bash
curl http://localhost:5000/api/tasks
```

**Yeni görev ekle:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Test Görevi\",\"description\":\"Test açıklaması\",\"priority\":\"high\",\"dueDate\":\"2025-12-31\"}"
```

**Görev güncelle:**
```bash
curl -X PUT http://localhost:5000/api/tasks/{id} \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Güncellenmiş Görev\"}"
```

**Görevi tamamla/tamamlanmadı olarak işaretle:**
```bash
curl -X PATCH http://localhost:5000/api/tasks/{id}/toggle
```

**Görev sil:**
```bash
curl -X DELETE http://localhost:5000/api/tasks/{id}
```

#### Soru Logları (Question Logs)

**Tüm soru loglarını getir:**
```bash
curl http://localhost:5000/api/question-logs
```

**Yeni soru logu ekle:**
```bash
curl -X POST http://localhost:5000/api/question-logs \
  -H "Content-Type: application/json" \
  -d "{\"exam_type\":\"TYT\",\"subject\":\"Matematik\",\"topic\":\"Fonksiyonlar\",\"correct_count\":\"8\",\"wrong_count\":\"2\",\"blank_count\":\"0\",\"study_date\":\"2025-10-31\"}"
```

#### Sınav Sonuçları (Exam Results)

**Tüm sınav sonuçlarını getir:**
```bash
curl http://localhost:5000/api/exam-results
```

**Yeni sınav sonucu ekle:**
```bash
curl -X POST http://localhost:5000/api/exam-results \
  -H "Content-Type: application/json" \
  -d "{\"exam_type\":\"TYT\",\"exam_name\":\"Deneme 1\",\"exam_date\":\"2025-10-31\"}"
```

#### İstatistikler

**Konu istatistikleri:**
```bash
curl http://localhost:5000/api/topic-stats
```

**Öncelikli konular:**
```bash
curl http://localhost:5000/api/priority-topics
```

**Ders bazında çözülen soru istatistikleri:**
```bash
curl http://localhost:5000/api/subject-solved-stats
```

#### Çalışma Saatleri

**Çalışma saatlerini getir:**
```bash
curl http://localhost:5000/api/study-hours
```

**Belirli bir tarihteki çalışma saatini getir:**
```bash
curl http://localhost:5000/api/study-hours/by-date/2025-10-31
```

#### Hava Durumu (OPENWEATHER_API_KEY gerekli)

```bash
curl "http://localhost:5000/api/weather?city=Istanbul"
```

---

## 🎨 UI/UX Test Senaryoları

### 1. Ana Sayfa (Dashboard)
- [ ] Sayfa yükleniyor mu?
- [ ] Özet kartlar (toplam görev, tamamlanan, başarı oranı) doğru gösteriliyor mu?
- [ ] Haftalık ilerleme grafiği çalışıyor mu?
- [ ] Motivasyon sözü görünüyor mu?

### 2. Görevler Sayfası
- [ ] Görev listesi görünüyor mu?
- [ ] "Yeni Görev Ekle" butonu çalışıyor mu?
- [ ] Modal açılıp kapanıyor mu?
- [ ] Görev ekleyince listede görünüyor mu?
- [ ] Görev düzenleme çalışıyor mu?
- [ ] Görev silme çalışıyor mu?
- [ ] Görev tamamlama checkbox'ı çalışıyor mu?
- [ ] Öncelik renklendirmesi doğru mu? (high=kırmızı, medium=sarı, low=yeşil)
- [ ] Bitiş tarihi yaklaşan görevler vurgulanıyor mu?

### 3. Net Hesaplayıcı
- [ ] TYT/AYT sekmeler arası geçiş çalışıyor mu?
- [ ] Doğru/yanlış sayıları giriliyor mu?
- [ ] Net hesaplama doğru yapılıyor mu? (Net = Doğru - (Yanlış / 4))
- [ ] Toplam puan hesaplaması çalışıyor mu?
- [ ] Ders bazında net girişi yapılabiliyor mu?

### 4. YKS Konular Sayfası
- [ ] Tüm dersler listeleniyor mu?
- [ ] Ders kartlarına tıklanınca konu listesi açılıyor mu?
- [ ] Konular checkbox ile işaretlenebiliyor mu?
- [ ] İşaretlenen konular kaydediliyor mu?
- [ ] Sayfa yenilenince işaretler korunuyor mu?
- [ ] Arama fonksiyonu çalışıyor mu?

### 5. Sayaç (Countdown)
- [ ] YKS tarihine geri sayım çalışıyor mu?
- [ ] Gün, saat, dakika, saniye doğru gösteriliyor mu?
- [ ] Gece yarısında (00:00) confetti animasyonu çalışıyor mu?
- [ ] Türk bayrağı ve Atatürk görseli görünüyor mu?

### 6. Panel/İstatistikler
- [ ] Soru analiz grafikleri çalışıyor mu?
- [ ] Haftalık aktivite özeti görünüyor mu?
- [ ] Çalışma saatleri grafiği doğru mu?
- [ ] Sınav sonuçları tablosu görünüyor mu?
- [ ] Öncelikli konular listesi çalışıyor mu?

### 7. Tema Değiştirme
- [ ] Açık/koyu tema arası geçiş çalışıyor mu?
- [ ] Tema tercihi kaydediliyor mu?
- [ ] Tüm sayfalar tema değişikliğine uyum sağlıyor mu?

### 8. Yan Menü (Sidebar)
- [ ] Menü açılıp kapanıyor mu?
- [ ] Tüm menü öğeleri görünüyor mu?
- [ ] Sayfalar arası geçiş çalışıyor mu?
- [ ] Aktif sayfa vurgulanıyor mu?

### 9. Responsive Tasarım
- [ ] Mobil görünümde (< 768px) menü hamburger butonu oluyor mu?
- [ ] Tablet görünümde (768px - 1024px) düzen bozulmuyor mu?
- [ ] Desktop görünümde (> 1024px) tam genişlik kullanılıyor mu?

### 10. Veri Kalıcılığı
- [ ] Tarayıcı kapatılıp açıldığında veriler korunuyor mu?
- [ ] Electron uygulaması kapatılıp açıldığında veriler korunuyor mu?
- [ ] `data/kayitlar.json` dosyası güncel tutuluyor mu?

---

## 🐛 Yaygın Sorunlar ve Çözümleri

### ❌ "cross-env: not found" Hatası

**Sebep:** npm bağımlılıkları yüklenmemiş.

**Çözüm:**
```bash
npm install
```

### ❌ Port 5000 Kullanımda

**Sebep:** Başka bir uygulama 5000 portunu kullanıyor.

**Çözüm 1:** Diğer uygulamayı kapatın.

**Çözüm 2:** `.env` dosyasında portu değiştirin:
```env
PORT=5001
```

### ❌ "EACCES" veya İzin Hatası

**Sebep:** Node.js global paketleri için izin hatası.

**Çözüm (Windows):**
```bash
npm config set prefix %APPDATA%\npm
```

### ❌ TypeScript Hatası: "Cannot find module"

**Sebep:** Path alias'ları tanınmıyor.

**Çözüm:**
```bash
npm run check
```
Eğer hata devam ederse VS Code'u yeniden başlatın.

### ❌ Vite Build Hatası

**Sebep:** node_modules bozuk.

**Çözüm:**
```bash
rmdir /s /q node_modules
rmdir /s /q dist
npm install
npm run build
```

### ❌ Electron Başlamıyor

**Sebep:** Electron ikili dosyaları eksik.

**Çözüm:**
```bash
npm install electron --force
```

### ❌ "Module not found" Hatası (Electron)

**Sebep:** Electron build'de bazı modüller harici bırakılmamış.

**Çözüm:** `package.json` dosyasında `build.files` kontrolü yapın.

### ❌ Ortam Değişkeni Uyarıları

**Sebep:** `.env` dosyası yok veya değişkenler boş.

**Not:** Bu **normaldir**! Uygulama çalışmaya devam eder.

**Çözüm (opsiyonel):** `.env.example` dosyasını kopyalayıp değerleri doldurun.

### ❌ Windows Defender Uyarısı

**Sebep:** İmzasız Electron uygulaması.

**Çözüm:** "Daha fazla bilgi" > "Yine de çalıştır" seçeneğini kullanın.

### ❌ JSON Parse Hatası

**Sebep:** `data/kayitlar.json` dosyası bozulmuş.

**Çözüm:**
```bash
ren data\kayitlar.json kayitlar.json.backup
```
Uygulama otomatik olarak yeni bir boş dosya oluşturacak.

### ❌ HMR (Hot Module Replacement) Çalışmıyor

**Sebep:** Vite cache sorunu.

**Çözüm:**
```bash
rmdir /s /q .vite
npm run dev
```

---

## 📊 Performans Test

### Yükleme Hızı Testi
```bash
# Lighthouse (Chrome DevTools)
npm run build
npm start
# Tarayıcıda F12 > Lighthouse sekmesi > Analiz yap
```

**Hedefler:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80

### Bellek Kullanımı
- **Tarayıcı:** Chrome Task Manager (Shift+Esc)
- **Electron:** Process Manager (Windows Task Manager)

**Kabul Edilebilir Sınırlar:**
- Web: < 100MB RAM
- Electron: < 200MB RAM

---

## 🔐 Güvenlik Testleri

### 1. XSS (Cross-Site Scripting) Testi
Görev başlığına HTML/script tag girmeyi deneyin:
```
<script>alert('XSS')</script>
```
**Beklenen:** Script çalışmamalı, text olarak görünmeli.

### 2. SQL Injection Testi (PostgreSQL kullanıldığında)
```
'; DROP TABLE tasks; --
```
**Beklenen:** Hata vermeli veya text olarak kaydedilmeli.

### 3. Path Traversal Testi (Electron)
```
../../../etc/passwd
```
**Beklenen:** Dosya sistemine erişim engellenmeli.

---

## 📝 Veritabanı Test

### JSON File Storage (Varsayılan - Offline Mode)
```bash
# Veri dosyasını kontrol et
type data\kayitlar.json

# Yedek dosyayı kontrol et
type data\kayitlar.json.backup
```

**Manuel Test Senaryoları:**

1. **Veri Yazma Testi:**
   - Yeni görev ekle
   - `data/kayitlar.json` dosyasını kontrol et
   - Görevin kaydedildiğini doğrula

2. **Veri Okuma Testi:**
   - Uygulamayı kapat
   - `data/kayitlar.json` dosyasını düzenle (manuel olarak bir görev ekle)
   - Uygulamayı aç
   - Yeni görevin göründüğünü doğrula

3. **Backup Testi:**
   - Birkaç görev ekle
   - `data/kayitlar.json.backup` dosyasının oluşturulduğunu kontrol et
   - Backup dosyasının geçerli JSON formatında olduğunu doğrula

4. **Corrupt File Recovery Testi:**
   ```bash
   # JSON dosyasını boz
   echo "invalid json" > data\kayitlar.json
   
   # Uygulamayı başlat
   npm run dev
   
   # Beklenen: Uygulama backup'tan restore etmeli veya yeni boş dosya oluşturmalı
   ```

### PostgreSQL Database (Opsiyonel - Online Mode)

**Ortam değişkeni ayarlama:**
```env
# .env dosyasına ekle
DATABASE_URL=postgresql://user:password@localhost:5432/beratcankir
```

**Database Schema Push (Drizzle ORM):**
```bash
npm run db:push
```
**Açıklama:** Drizzle ORM schema'yı PostgreSQL veritabanına uygular. Tabloları oluşturur veya günceller.

**Database Schema Kontrolü:**
```bash
npm run db:studio
```
**Açıklama:** Drizzle Studio'yu açar - veritabanını görsel olarak inceleme ve düzenleme aracı.

**Manuel Database Test:**
```sql
-- PostgreSQL'e bağlan
psql -U user -d beratcankir

-- Tabloları listele
\dt

-- Görevleri sorgula
SELECT * FROM tasks;

-- Sınav sonuçlarını sorgula
SELECT * FROM exam_results ORDER BY exam_date DESC LIMIT 10;

-- Soru loglarını sorgula
SELECT * FROM question_logs WHERE study_date >= CURRENT_DATE - INTERVAL '7 days';

-- Çalışma saatlerini sorgula
SELECT * FROM study_hours WHERE study_date >= CURRENT_DATE - INTERVAL '30 days';
```

**Migration Testi:**
```bash
# Schema değişikliklerini oluştur
npm run db:generate

# Migration'ları uygula
npm run db:migrate
```

**Database Switching Test (JSON ↔ PostgreSQL):**
1. JSON mode'da veri ekle
2. `.env` dosyasına `DATABASE_URL` ekle
3. Server'ı restart et
4. Verilerin PostgreSQL'e migrate edildiğini doğrula
5. `DATABASE_URL`'i kaldır
6. Server'ı restart et
7. Verilerin JSON'a geri döndüğünü doğrula

---

## 🌐 Tarayıcı Uyumluluğu

**Test Edilmesi Gereken Tarayıcılar:**
- ✅ Google Chrome (v120+)
- ✅ Microsoft Edge (v120+)
- ✅ Firefox (v115+)
- ⚠️ Safari (v16+) - Sınırlı test
- ❌ Internet Explorer - Desteklenmiyor

---

## 📱 Mobil Test (Responsive)

**Chrome DevTools kullanarak:**
1. F12 ile DevTools'u aç
2. Ctrl+Shift+M ile mobil modu aç
3. Test edilecek cihazlar:
   - iPhone 12 Pro (390x844)
   - Samsung Galaxy S20 (360x800)
   - iPad Pro (1024x1366)

---

## 🎯 Kabul Kriterleri

Uygulamanın Windows'ta çalışması için:
- ✅ `npm install` hatasız tamamlanmalı
- ✅ `npm run dev` ile uygulama başlamalı
- ✅ Tarayıcıda http://localhost:5000 açılmalı
- ✅ En az 1 görev eklenip silinebilmeli
- ✅ Tema değiştirme çalışmalı
- ✅ Electron build oluşturulabilmeli
- ✅ Electron uygulaması çalışmalı
- ✅ Veriler kalıcı olmalı (sayfa yenileme sonrası)
- ✅ Tüm testler geçmeli (npm test)

---

## 📞 Destek ve Katkı

**Geliştirici:** Berat Cankır  
**GitHub:** https://github.com/beratcode03/beratders  
**Lisans:** MIT

**Hata Bildirimi:**
GitHub Issues: https://github.com/beratcode03/beratders/issues

---

## 🚀 Hızlı Komutlar Özeti

```bash
# Kurulum
npm install

# Geliştirme
npm run dev                    # Web app
npm run electron:dev           # Electron app

# Test
npm test                       # Tüm testler
npm run test:watch             # Watch mode
npm run test:ui                # UI test arayüzü
npx playwright test            # E2E testler

# Build
npm run build                  # Web build
npm run electron:build         # Electron installer

# Çalıştır
npm start                      # Üretim modu
npm run electron               # Electron başlat

# Temizlik
rmdir /s /q node_modules dist .vite
npm install
```

---

---

## 🧩 Component Testing (Birim Testler)

### Test Dosyası Oluşturma
Test dosyalarını `__testler__` klasörüne yerleştirin:
```
client/src/bilesenler/__testler__/gorev-ekle-modal.test.tsx
server/__testler__/api.test.ts
```

### React Component Test Örneği
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GorevEkleModal } from '../gorev-ekle-modal';

describe('GorevEkleModal', () => {
  it('modal açıldığında form görünür', () => {
    render(<GorevEkleModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Yeni Görev Ekle')).toBeInTheDocument();
  });

  it('form submit edildiğinde API çağrısı yapılır', async () => {
    const mockOnClose = vi.fn();
    render(<GorevEkleModal isOpen={true} onClose={mockOnClose} />);
    
    // Form alanlarını doldur
    fireEvent.change(screen.getByLabelText('Başlık'), {
      target: { value: 'Test Görevi' }
    });
    
    // Submit butonuna tıkla
    fireEvent.click(screen.getByText('Kaydet'));
    
    // Modal kapanmalı
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
```

### API Route Test Örneği
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../index';

describe('API Routes', () => {
  describe('GET /api/tasks', () => {
    it('tüm görevleri döndürür', async () => {
      const response = await request(app).get('/api/tasks');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/tasks', () => {
    it('yeni görev oluşturur', async () => {
      const newTask = {
        title: 'Test Görevi',
        priority: 'high',
        dueDate: '2025-12-31'
      };
      
      const response = await request(app)
        .post('/api/tasks')
        .send(newTask);
      
      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Test Görevi');
    });
    
    it('geçersiz veriyle hata döndürür', async () => {
      const invalidTask = { title: '' }; // Boş başlık
      
      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask);
      
      expect(response.status).toBe(400);
    });
  });
});
```

### Test Coverage İyileştirme

**Düşük coverage'li dosyaları bulma:**
```bash
npm run test:coverage
# Coverage raporunda %50'nin altındaki dosyalara odaklan
```

**Spesifik dosya için test yazma:**
```bash
# Tek dosyayı test et
npm run test:watch client/src/bilesenler/panel-ozet-kartlar.tsx
```

**Test yazma öncelikleri:**
1. **Critical paths** (görev CRUD, sınav girişi, net hesaplama)
2. **Business logic** (net hesaplama formülleri, istatistik hesaplamaları)
3. **Error handling** (API hataları, form validasyonları)
4. **Edge cases** (boş veri, maksimum değerler, tarih sınırları)

---

## 🔌 API Testing (Detaylı)

### REST API Test Stratejisi

**1. CRUD Operations Test:**
```bash
# CREATE - Yeni kayıt oluştur
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"API Test","priority":"high"}'

# READ - Kaydı getir
curl http://localhost:5000/api/tasks/{id}

# UPDATE - Kaydı güncelle
curl -X PUT http://localhost:5000/api/tasks/{id} \
  -H "Content-Type: application/json" \
  -d '{"title":"Güncellendi"}'

# DELETE - Kaydı sil
curl -X DELETE http://localhost:5000/api/tasks/{id}
```

**2. Validation Test:**
```bash
# Geçersiz tarih formatı
curl -X POST http://localhost:5000/api/question-logs \
  -H "Content-Type: application/json" \
  -d '{"study_date":"invalid-date"}'
# Beklenen: 400 Bad Request

# Eksik required field
curl -X POST http://localhost:5000/api/exam-results \
  -H "Content-Type: application/json" \
  -d '{"exam_type":"TYT"}'
# Beklenen: 400 Bad Request (exam_date eksik)

# Geçersiz enum değeri
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","priority":"invalid"}'
# Beklenen: 400 Bad Request (priority: low/medium/high olmalı)
```

**3. Business Logic Test:**
```bash
# Net hesaplama doğruluğu
curl http://localhost:5000/api/question-logs
# Net = Doğru - (Yanlış / 4) formülünün doğru uygulandığını kontrol et

# İstatistik hesaplama
curl http://localhost:5000/api/topic-stats
# Toplam soru sayısının doğru hesaplandığını doğrula
```

**4. Performance Test:**
```bash
# Çok sayıda kayıt döndürme
time curl http://localhost:5000/api/question-logs
# Beklenen: < 500ms

# Filtreleme performansı
time curl "http://localhost:5000/api/exam-results?exam_type=TYT&limit=100"
# Beklenen: < 300ms
```

**5. Error Handling Test:**
```bash
# Olmayan kayıt
curl http://localhost:5000/api/tasks/999999
# Beklenen: 404 Not Found

# Server hatası simülasyonu (boş database)
# DATABASE_URL'i geçersiz yap ve server'ı restart et
# Beklenen: Graceful fallback to JSON storage
```

---

## 📋 Test Yazma Best Practices

### Test Organizasyonu
```typescript
describe('FeatureName', () => {
  describe('SubFeature', () => {
    it('should do something specific', () => {
      // Test code
    });
  });
});
```

### AAA Pattern (Arrange-Act-Assert)
```typescript
it('görev tamamlandığında checkbox işaretlenir', () => {
  // Arrange - Test verilerini hazırla
  const task = { id: 1, title: 'Test', completed: false };
  render(<TaskItem task={task} />);
  
  // Act - Aksiyonu gerçekleştir
  fireEvent.click(screen.getByRole('checkbox'));
  
  // Assert - Sonucu kontrol et
  expect(screen.getByRole('checkbox')).toBeChecked();
});
```

### Test Isolation
```typescript
beforeEach(() => {
  // Her test öncesi temiz state
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  // Her test sonrası cleanup
  cleanup();
});
```

### Mocking
```typescript
// API mock
vi.mock('../api', () => ({
  fetchTasks: vi.fn().mockResolvedValue([
    { id: 1, title: 'Test Task' }
  ])
}));

// localStorage mock
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock as any;
```

### Snapshot Testing
```typescript
it('dashboard kartları doğru render edilir', () => {
  const { container } = render(<DashboardSummaryCards />);
  expect(container).toMatchSnapshot();
});
```

---

## ✅ CI/CD Test Pipeline

### GitHub Actions Workflow Örneği
```yaml
name: Test Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: TypeScript check
        run: npm run check
      
      - name: Run unit tests
        run: npm test
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 🎯 Test Checklist (Her Release Öncesi)

### ✅ Kod Kalitesi
- [ ] `npm run check` - TypeScript hatası yok
- [ ] `npm test` - Tüm unit testler geçiyor
- [ ] `npm run test:coverage` - Coverage %80+ 
- [ ] `npx playwright test` - E2E testler geçiyor

### ✅ Fonksiyonalite
- [ ] Görev CRUD işlemleri çalışıyor
- [ ] Soru logu ekleme/düzenleme/silme çalışıyor
- [ ] Sınav sonucu ekleme/düzenleme/silme çalışıyor
- [ ] Net hesaplayıcı doğru hesaplıyor
- [ ] İstatistikler doğru görünüyor
- [ ] Grafik ve tablolar çalışıyor
- [ ] Email raporu gönderiliyor (eğer API key varsa)

### ✅ UI/UX
- [ ] Responsive tasarım mobil/tablet/desktop'ta çalışıyor
- [ ] Tema değiştirme çalışıyor
- [ ] Animasyonlar akıcı
- [ ] Loading states görünüyor
- [ ] Error messages kullanıcı dostu

### ✅ Veri
- [ ] JSON storage çalışıyor
- [ ] PostgreSQL'e geçiş sorunsuz (eğer kullanılıyorsa)
- [ ] Backup oluşturuluyor
- [ ] Veri kaybı olmuyor

### ✅ Performance
- [ ] İlk yükleme < 3 saniye
- [ ] Sayfa geçişleri < 500ms
- [ ] RAM kullanımı < 200MB (Electron)
- [ ] CPU kullanımı normal

### ✅ Güvenlik
- [ ] XSS koruması aktif
- [ ] SQL injection koruması aktif
- [ ] Hassas veriler console'a yazılmıyor
- [ ] API keys güvenli şekilde saklanıyor

---

**Son Güncelleme:** 01 Kasım 2025  
**Versiyon:** 0.0.3  
**Test Coverage:** Unit %85+, E2E %70+
