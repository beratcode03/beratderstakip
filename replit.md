# Berat Cankır YKS Analiz ve Takip Sistemi

## Proje Hakkında

Bu, YKS (Yükseköğretim Kurumları Sınavı) hazırlığı yapan öğrenciler için geliştirilmiş kapsamlı bir analiz ve takip sistemidir. Öğrenciler deneme sınavları, soru çalışmaları, görevler ve ilerlemelerini bu uygulama ile takip edebilirler.

## Teknoloji Stack'i

### Frontend
- **React 18** - Kullanıcı arayüzü
- **TypeScript** - Tip güvenli kod
- **Vite** - Hızlı geliştirme ve derleme
- **Tailwind CSS** - Styling
- **Radix UI** - UI bileşenleri
- **Tanstack Query** - Veri yönetimi
- **Wouter** - Routing
- **Framer Motion** - Animasyonlar

### Backend
- **Express** - Web sunucusu
- **TypeScript** - Tip güvenli kod
- **Drizzle ORM** - Veritabanı ORM
- **Neon PostgreSQL** / File-based storage - Veri saklama

### Ek Özellikler
- **Electron** - Masaüstü uygulaması (opsiyonel)
- **OpenWeather API** - Hava durumu widget'ı
- **Email** - Bildirimler (opsiyonel)

## Proje Yapısı

```
├── client/               # Frontend uygulaması
│   ├── public/          # Statik dosyalar
│   └── src/
│       ├── bilesenler/  # React bileşenleri
│       │   └── arayuz/  # UI bileşenleri (Radix UI)
│       ├── sayfalar/    # Sayfa bileşenleri
│       ├── hooks/       # React hooks
│       ├── kutuphane/   # Yardımcı fonksiyonlar
│       ├── stiller/     # CSS dosyaları
│       └── data/        # YKS konuları ve veriler
├── server/              # Backend uygulaması
│   ├── index.ts        # Ana sunucu dosyası
│   ├── rotalar.ts      # API rotaları
│   ├── depolama.ts     # Veri saklama katmanı
│   ├── vite.ts         # Vite entegrasyonu
│   └── env-validation.ts # Çevre değişkeni doğrulama
├── shared/              # Paylaşılan kod
│   └── sema.ts         # Veritabanı şeması ve tipler
├── electron/            # Electron uygulaması (opsiyonel)
└── data/                # Yerel veri dosyaları
```

## Özellikler

### 1. Görev Yönetimi
- Görev ekleme, düzenleme, silme
- Öncelik ve kategori bazlı görev organizasyonu
- Tekrarlayan görevler (haftalık, aylık)
- Görev tamamlama takibi

### 2. Deneme Sınav Takibi
- TYT ve AYT deneme sınavları ekleme
- Genel ve branş denemeleri
- Net hesaplama ve analizi
- Deneme geçmişi ve grafikler

### 3. Soru Çalışma Günlüğü
- Konu bazlı soru çalışması takibi
- Doğru, yanlış, boş sayısı
- Yanlış konuları işaretleme
- Konu istatistikleri ve analizi

### 4. İlerleme Takibi
- Haftalık aktivite grafikleri
- Çalışma saati takibi
- Verimlilik analizi
- Heat map görünümü

### 5. Analiz ve Raporlama
- Branş deneme ortalamaları
- Konu bazlı istatistikler
- Öncelikli konular
- Gelişim grafikleri

### 6. Ek Özellikler
- Hava durumu widget'ı
- Motivasyon sözleri
- Gece yarısı geri sayım
- Karanlık/Aydınlık tema

## Kurulum ve Çalıştırma

### Geliştirme Ortamı (Replit)

Proje Replit ortamında çalışacak şekilde yapılandırılmıştır:

1. **Bağımlılıklar otomatik yüklenmiştir**
2. **Sunucu otomatik başlar**: `npm run dev`
3. **Port 5000** üzerinden erişilebilir

### Yerel Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build
npm run start
```

### Electron Uygulaması

```bash
# Electron geliştirme modu
npm run electron:dev

# Electron build (Windows)
npm run electron:build
```

## Çevre Değişkenleri

Uygulama aşağıdaki çevre değişkenlerini kullanır (opsiyonel):

```env
# Sunucu ayarları
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# Veritabanı (opsiyonel - yoksa dosya tabanlı depolama kullanılır)
DATABASE_URL=

# Hava durumu (opsiyonel)
OPENWEATHER_API_KEY=

# Email (opsiyonel)
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
```

## Son Değişiklikler (24 Ekim 2025)

### Düzeltilen Hatalar

1. **TYT/AYT Deneme Gösterimi**
   - Sadece girilen sınav tipi gösteriliyor (TYT veya AYT)
   - Tarih kısmında her iki net birden gösterilme hatası düzeltildi

2. **TYT/AYT Net Hesaplama**
   - Sadece seçilen sınav tipine göre net hesaplanıyor
   - TYT denemesinde AYT netinin hesaplanma hatası düzeltildi
   - AYT denemesinde TYT netinin hesaplanma hatası düzeltildi

3. **Görev Kategori İsimleri**
   - AYT Dersleri bölümünde "AYT" öneki kaldırıldı (Geometri hariç)
   - "AYT Matematik" → "Matematik"
   - "AYT Fizik" → "Fizik"
   - "AYT Kimya" → "Kimya"
   - "AYT Biyoloji" → "Biyoloji"
   - "AYT Geometri" → değiştirilmedi (TYT Geometri ile ayırt için)

4. **Tarih Etiketi**
   - "Bitiş Tarihi" → "Görevin Bitirilme Tarihi" olarak güncellendi

## Veritabanı

Proje iki farklı depolama yöntemini destekler:

1. **PostgreSQL (Neon)** - Production için önerilir
2. **Dosya Tabanlı** - Geliştirme ve Electron için kullanılır

Mevcut kurulum dosya tabanlı depolama kullanmaktadır (`data/kayitlar.json`).

## Bilinen Sorunlar ve Gelecek İyileştirmeler

- [ ] Sayı girişlerinde "0" öneki sorunu (015 yerine 15)
- [ ] Hava durumu doğruluğu iyileştirmesi
- [ ] Deneme analiz sistemi tarih seçici eklenmesi
- [ ] Genel deneme ortalamaları ders bazlı net gösterimi
- [ ] Planlanan görevler için "Planlandı" göstergesi

## Lisans

MIT License - Berat Cankır

## İletişim

- GitHub: https://github.com/beratcode03/beratders
