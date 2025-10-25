# BERAT CANKIR ANALİZ TAKİP SİSTEMİ - TALİMATLAR VE DOKÜMANTASYON

## 📋 GENEL BAKIŞ
Bu belge, Berat Cankır Özel Analiz Takip Sistemi için yapılan değişiklikleri, düzeltmeleri ve kullanım talimatlarını içermektedir.

---

## 🖥️ ELECTRON MASAÜSTÜ UYGULAMASI ÖZELLİKLERİ

### Tray İkonu (Sistem Tepsisi)
Electron masaüstü uygulamasında sistem tepsisine (system tray) ikonu eklemek için:

```javascript
// electron/main.cjs dosyasında
const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let tray = null;

function createTray() {
  const iconPath = path.join(__dirname, '../public/icon.png');
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Uygulamayı Aç', click: () => { mainWindow.show(); } },
    { label: 'Çıkış', click: () => { app.quit(); } }
  ]);
  
  tray.setToolTip('YKS Takip Sistemi - Berat Cankır');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => { mainWindow.show(); });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});
```

### İhlal Logu (Violation Log)
Kullanıcı aktivitelerini ve sistem olaylarını kaydetmek için:

```javascript
// server/ihlalLog.ts dosyası oluştur
import fs from 'fs';
import path from 'path';

const logDir = path.join(__dirname, '../logs');
const logFilePath = path.join(logDir, 'ihlal-log.txt');

// Log dizinini oluştur
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export function logViolation(event: string, details: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${event}: ${details}\n`;
  fs.appendFileSync(logFilePath, logEntry, 'utf8');
}

// Kullanım örnekleri:
logViolation('VERİ_SİLME', 'Tüm deneme sonuçları silindi');
logViolation('TOPLU_İŞLEM', 'Arşivleme yapıldı');
logViolation('HEDEF_DEĞİŞİKLİĞİ', 'TYT hedef neti 90 olarak güncellendi');
```

**NOT:** Bu özellikler yalnızca Electron masaüstü uygulamasında çalışır. Replit web ortamında çalışmaz.

---

## ✅ TAMAMLANAN DÜZELTMELER

### 1. TYT/AYT Ders Kategorizasyonu Düzeltmesi
**Sorun**: Fizik, Kimya, Biyoloji ve Geometri dersleri deneme eklenirken yanlış kategorize ediliyordu.

**Çözüm**: 
- `client/src/sayfalar/panel.tsx` dosyasındaki deneme kaydetme mantığı düzeltildi
- TYT denemesi eklendiğinde: Türkçe, Sosyal, Matematik, Geometri, Fen, Fizik, Kimya, Biyoloji → TYT olarak kaydediliyor
- AYT denemesi eklendiğinde: Matematik, Geometri, Fizik, Kimya, Biyoloji → AYT olarak kaydediliyor
- Artık sadece TYT denemesi eklendiğinde `tyt_net` hesaplanıyor ve `ayt_net` 0 olarak ayarlanıyor
- Sadece AYT denemesi eklendiğinde `ayt_net` hesaplanıyor ve `tyt_net` 0 olarak ayarlanıyor

**Dosyalar**: 
- `client/src/sayfalar/panel.tsx` (satır 4190-4220)

---

### 2. Sayı Input Önde Gelen Sıfır Problemi
**Sorun**: Sayı alanlarına "15" yazarken "0" varsa "015" olarak görünüyordu.

**Çözüm**: 
- `cleanNumberInput()` yardımcı fonksiyonu eklendi
- Tüm sayı inputlarının onChange event'lerinde bu fonksiyon kullanılmaya başlandı
- Önde gelen sıfırlar otomatik olarak temizleniyor

**Dosyalar**: 
- `client/src/sayfalar/panel.tsx` (satır 50-56 ve tüm onChange handler'lar)

---

### 3. Deneme Gösterim Düzeltmesi
**Sorun**: Sadece TYT veya sadece AYT denemesi eklendiğinde her ikisi de görünüyordu.

**Çözüm**: 
- Deneme gösterimi `exam_type` alanına göre akıllı hale getirildi
- TYT denemesi ise sadece "TYT: 80.00" gösteriliyor
- AYT denemesi ise sadece "AYT: 30.00" gösteriliyor
- Her iki tip de varsa "TYT: 80.00 • AYT: 30.00" şeklinde gösteriliyor

**Dosyalar**: 
- `client/src/sayfalar/panel.tsx` (satır 1992-2005)

---

### 4. AYT Öneki Kaldırma
**Sorun**: AYT derslerinde (Matematik, Fizik, Kimya, Biyoloji) gereksiz "AYT" öneki vardı.

**Çözüm**: 
- Görev kategorisi seçimlerinde "AYT" öneki kaldırıldı (sadece AYT Geometri'de kaldı)
- `getCategoryText()` fonksiyonu güncellendi
- Artık gösteriliyor: "Matematik", "Fizik", "Kimya", "Biyoloji" (AYT öneki yok)
- "AYT Geometri" öneki korundu (TYT Geometri ile ayrım için)

**Dosyalar**: 
- `client/src/bilesenler/gorevler-bolumu.tsx` (satır 232-239)

---

### 5. "Bitiş Tarihi" Label Değişikliği
**Sorun**: Görev eklerken "Bitiş Tarihi" yerine daha açıklayıcı bir etiket gerekiyordu.

**Çözüm**: 
- "Bitiş Tarihi" → "Tekrarın Bitiş Tarihi" olarak değiştirildi (görev ekleme modalında)
- Placeholder text "Görevin Bitirilme Tarihi" olarak güncellendi (görev listesi filtrelemesinde)

**Dosyalar**: 
- `client/src/bilesenler/gorev-ekle-modal.tsx` (satır 248)
- `client/src/bilesenler/gorevler-bolumu.tsx` (satır 422)

---

## ⚙️ UYGULAMA ÇALIŞMA MANTIĞI

### Veritabanı Yapısı
Uygulama PostgreSQL veritabanı kullanmaktadır:
- `tasks` - Görevler
- `moods` - Ruh hali kayıtları
- `goals` - Hedefler
- `questionLogs` - Soru çalışma kayıtları
- `examResults` - Deneme sınav sonuçları
- `examSubjectNets` - Deneme ders netleri
- `flashcards` - Flash kartlar
- `studyHours` - Çalışma saatleri

### API Routes
Backend API'leri `server/rotalar.ts` dosyasında tanımlıdır:
- `/api/tasks` - Görev işlemleri
- `/api/moods` - Ruh hali işlemleri
- `/api/goals` - Hedef işlemleri
- `/api/question-logs` - Soru log işlemleri
- `/api/exam-results` - Deneme işlemleri
- `/api/exam-subject-nets` - Deneme ders netleri işlemleri
- `/api/study-hours` - Çalışma saati işlemleri

---

## 🔧 ENVIRONMENT VARIABLES (.env dosyası)

Uygulamanın çalışması için gerekli environment variables:

```env
# OpenWeather API (Hava Durumu)
OPENWEATHER_API_KEY=your_api_key_here

# Email Configuration (E-posta Gönderimi)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

# Database (Veritabanı)
DATABASE_URL=your_postgresql_connection_string
```

**NOT**: API anahtarları ve şifreler Replit Secrets yerine `.env` dosyasında saklanmalıdır.

---

## 📊 İSTATİSTİK VE RAPORLAMA

### Genel Deneme İstatistikleri
Kullanıcının son 5 genel denemesinin ortalaması hesaplanır:
- TYT Net Ortalaması
- AYT Net Ortalaması
- Ders bazlı net ortalamaları (Türkçe, Matematik, Sosyal, Fen, Fizik, Kimya, Biyoloji, Geometri)

### Branş Deneme Ortalamaları
Her ders için ayrı ayrı branş deneme ortalamaları gösterilir.

### Soru İstatistikleri
Günlük/haftalık soru çözüm istatistikleri ve başarı oranları takip edilir.

---

## 🐛 BİLİNEN SORUNLAR VE ÇÖZÜM ÖNERİLERİ

### 1. "undefined soru" Hatası
**Durum**: Aktivite gösteriminde bazı durumlarda "undefined soru" yazısı çıkabiliyor.
**Çözüm Önerisi**: Tüm soru sayısı gösterimlerinde `|| 0` kontrolü eklenmeli.

### 2. Hava Durumu Doğruluğu
**Durum**: OpenWeather API ile çalışıyor ancak doğruluk arttırılabilir.
**Çözüm Önerisi**: 
- API çağrısı sıklığını kontrol et
- Konum belirleme hassasiyetini arttır
- Hata yönetimini iyileştir

### 3. Tarih Filtresi Eksikliği
**Durum**: Deneme Analiz Sistemi'nde tarih bazlı filtreleme yok.
**Önerilen Ekleme**: 
- Tarih seçici dropdown ekle
- Seçilen tarihteki denemeleri göster
- Tarih aralığı filtreleme özelliği

### 4. Veritabanı Kalıcılık Kontrolü
**Durum**: Electron uygulaması kurulumunda veritabanı yolları kontrol edilmeli.
**Öneri**: 
- Veritabanı dosya yollarını kullanıcı verisi klasörüne taşı
- Cache temizlendiğinde veri kaybını önle
- Yedekleme mekanizması ekle

---

## 🚀 ELECTRON UYGULAMASI

### Kurulum
Electron uygulaması `.exe` olarak derlenir ve kurulur.

### Gereksinimler
- Node.js (sürüm 16 veya üzeri)
- PostgreSQL (veritabanı için)

### Önerilen İyileştirmeler
1. **Node.js Otomatik Kurulumu**: Uygulama kurulurken Node.js varlığını kontrol et, yoksa otomatik indir
2. **Dependency Yönetimi**: Gerekli npm paketlerini otomatik kur
3. **Veritabanı Kurulumu**: İlk açılışta veritabanını otomatik oluştur

---

## 📝 İHLAL LOG SİSTEMİ

### Amaç
Kullanıcı aktivitelerini ve olaylarını loglama.

### Dosyalar
- `electron/activity-logger.cjs` - Aktivite kayıt sistemi
- `electron/ihlal-logger.cjs` - İhlal kayıt sistemi
- `electron/central-ihlal-server.cjs` - Merkezi log sunucusu

### Çalışma Prensibi
1. Kullanıcı aktiviteleri dinlenir
2. Önemli olaylar loglanır
3. Merkezi sunucuya gönderilir (opsiyonel)

### Kullanım
Log dosyaları otomatik olarak kaydedilir ve analiz için kullanılabilir.

---

## 🎨 TEMA VE GÖRÜNÜM

### Dark Mode
Uygulama light ve dark mode desteklemektedir.
- Tema geçişi otomatik çalışır
- Tüm componentler dark mode uyumludur

### Renkler
Ana renk paleti mor tonlarında (purple):
- Primary: #8B5CF6
- Accent renkler: Mavi, Yeşil, Turuncu, Pembe

---

## 🔐 GÜVENLİK

### API Keys
Tüm API anahtarları `.env` dosyasında saklanmalıdır.
**ASLA** kodda hard-code edilmemelidir.

### Veritabanı
PostgreSQL kullanılır ve connection string güvenli tutulmalıdır.

---

## 📖 KULLANIM KILAVUZU

### Deneme Ekleme
1. Panel sayfasında "Yeni Deneme Sonucu Ekle" butonuna tıklayın
2. Deneme tipini seçin (TYT veya AYT)
3. Deneme kapsamını seçin (Genel veya Branş)
4. Ders netlerini girin
5. Kaydet butonuna tıklayın

### Görev Ekleme
1. Anasayfa veya Panel'de "Yeni Görev Ekle" butonuna tıklayın
2. Görev başlığı ve açıklamasını girin
3. Ders kategorisini seçin
4. Öncelik ve tarih belirleyin
5. Kaydet butonuna tıklayın

### Soru Çalışması Ekleme
1. Panel'de "Yeni Soru Çalışması Ekle" butonuna tıklayın
2. Ders ve konuyu seçin
3. Doğru, yanlış, boş sayılarını girin
4. Yanlış konuları belirtin (opsiyonel)
5. Kaydet butonuna tıklayın

---

## 🔄 GÜNCELLEME GEÇMİŞİ

### Versiyon 1.1 (25 Ekim 2025)
- ✅ TYT/AYT kategorizasyon düzeltmeleri
- ✅ Sayı input önde gelen sıfır problemi çözümü
- ✅ Deneme gösterim mantığı iyileştirmesi
- ✅ AYT önek kaldırma
- ✅ Label değişiklikleri

### Planlanan Güncellemeler (Versiyon 1.2)
- 📅 Tarih filtreleme özellikleri
- 🌤️ Hava durumu doğruluğu iyileştirme
- 📊 İstatistik bölümleri yeniden düzenleme
- 🔧 Undefined soru hatasının düzeltilmesi
- 📧 Gelişmiş e-posta raporlama

---

## 💡 İPUÇLARI VE PÜFNOKTALAR

### Performans
- Heatmap büyük veri setlerinde yavaş olabilir → Tarih aralığını sınırla
- Arşivlenen veriler otomatik yüklenir → Gerekirse manuel temizle

### Veri Yönetimi
- Düzenli olarak veri yedekle
- Arşivleme özelliğini kullan (silme yerine)
- Gereksiz kayıtları temizle

### Deneme Analizi
- En az 5 deneme gir (ortalama için)
- Yanlış konuları mutlaka belirt (öncelik analizi için)
- Branş denemeleri ile eksik konuları tespit et

---

## 🆘 DESTEK VE İLETİŞİM

Sorun bildirimi veya önerilerde bulunmak için:
- GitHub Issues kullanın
- Veya doğrudan iletişime geçin

---

## 📄 LİSANS

Bu proje özel kullanım içindir.
© 2025 Berat Cankır

---

**Son Güncelleme**: 25 Ekim 2025
**Versiyon**: 1.1.0
**Durum**: Aktif Geliştirme
