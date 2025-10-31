# BERAT CANKIR - YKS ANALİZ TAKİP SİSTEMİ
## Test ve Kullanım Talimatları

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

### Tüm Testleri Çalıştırma
```bash
npm test
```

### Watch Mode'da Test
```bash
npm run test:watch
```

### Test Kapsamı (Coverage)
```bash
npm run test:coverage
```

### UI Test Arayüzü
```bash
npm run test:ui
```
Tarayıcınızda test sonuçlarını görsel olarak inceleyin.

### End-to-End (E2E) Testler (Playwright)

**Playwright kurulumu (ilk kez):**
```bash
npx playwright install
```

**E2E testleri çalıştırma:**
```bash
npx playwright test
```

**Playwright UI mode:**
```bash
npx playwright test --ui
```

**Tek bir test dosyası çalıştırma:**
```bash
npx playwright test testler/tam-kapsamli-sistem-testi.spec.ts
```

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

### JSON File Storage (Varsayılan)
```bash
# Veri dosyasını kontrol et
type data\kayitlar.json

# Yedek dosyayı kontrol et
type data\kayitlar.json.backup
```

### PostgreSQL Database (Opsiyonel)

**Bağlantı string'i `.env` dosyasına ekle:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/beratcankir
```

**Migration çalıştır:**
```bash
npm run db:push
```

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

**Son Güncelleme:** 31 Ekim 2025  
**Versiyon:** 0.0.3
