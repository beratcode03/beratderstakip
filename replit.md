# Berat Cankır YKS Analiz Takip Sistemi

**📑 Hızlı Navigasyon:** [Proje Özeti](#proje-özeti) | [Temel Özellikler](#temel-özellikler) | [Teknik Yapı](#teknik-yapı) | [Veritabanı](#veritabanı) | [Geliştirme](#geliştirme) | [Deployment](#deployment-replit) | [Son Değişiklikler](#son-değişiklikler)

**📚 Detaylı Dokümantasyon:**
- [Test ve Kullanım Talimatları](./TESTING.md)
- [Talimatlar ve Teknik Rehber](./md%20dosyaları/talimatlar.md)
- [Teknik Mimari ve Dokümantasyon](./md%20dosyaları/teknik_mimari.md)
- **Kod Açıklamaları:**
  - [Client Tarafı Kod Açıklaması](./md%20dosyaları/kod_aciklamasi_client.md)
  - [Server Tarafı Kod Açıklaması](./md%20dosyaları/kod_aciklamasi_server.md)
  - [Shared/Schema Kod Açıklaması](./md%20dosyaları/kod_aciklamasi_shared.md)
  - [Electron Main Kod Açıklaması](./md%20dosyaları/kod_aciklamasi_electron1.md)
  - [Electron Activity Logger](./md%20dosyaları/kod_aciklamasi_electron_activity.md)
  - [Electron Preload](./md%20dosyaları/kod_aciklamasi_electron_preload.md)
  - [Kök Dizin Dosyaları](./md%20dosyaları/kod_aciklamasi_kok_dizin.md)
  - [Test Dosyaları](./md%20dosyaları/kod_aciklamasi_testler.md)

---

## Proje Özeti
YKS (Yükseköğretim Kurumları Sınavı) hazırlanan öğrenciler için geliştirilmiş kapsamlı bir takip ve analiz sistemi. Web tabanlı uygulama olarak çalışır ve isteğe bağlı olarak Electron ile masaüstü uygulaması olarak da paketlenebilir.

## Temel Özellikler
- 📊 Deneme sınavı sonuçlarını kaydetme ve analiz etme
- 📈 Net gelişimi grafiklerle görselleştirme
- 🎯 Yanlış yapılan konuları kategorize ederek takip
- 📝 Günlük soru çözüm kayıtları
- 📉 TYT/AYT branş bazlı detaylı analizler
- ⏱️ Çalışma saati takibi
- ✅ Akıllı görev yönetimi (önceliklendirme, kategorizasyon)
- 📅 Yıllık aktivite haritası (heatmap)

## Teknik Yapı

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack React Query v5
- **Router**: Wouter

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM

### Proje Yapısı
```
├── client/              # Frontend React uygulaması
│   ├── src/
│   │   ├── bilesenler/  # React components
│   │   ├── sayfalar/    # Pages/routes
│   │   ├── hooks/       # Custom hooks
│   │   └── kutuphane/   # Utility libraries
│   └── public/          # Static assets
├── server/              # Backend Express server
│   ├── index.ts         # Server entry point
│   ├── rotalar.ts       # API routes
│   ├── depolama.ts      # Storage layer (PostgreSQL/JSON)
│   └── vite.ts          # Vite dev server integration
├── shared/              # Shared types and schemas
│   └── sema.ts          # Database schema & types
└── electron/            # Electron desktop wrapper (optional)
```

## Veritabanı
- **Development**: JSON file (`data/kayitlar.json`) veya PostgreSQL
- **Production**: PostgreSQL (Neon database)
- Storage katmanı otomatik olarak DATABASE_URL varlığına göre seçim yapar

## Geliştirme
- **Dev Mode**: `npm run dev` - Vite dev server ile hot reload
- **Port**: 5000 (frontend ve backend aynı port)
- **Build**: `npm run build` - Production build oluşturur

## Deployment (Replit)
- Development mode'da çalışır (Vite dev server)
- PostgreSQL database kullanır
- Port 5000 üzerinden erişilebilir
- Host: 0.0.0.0 (Replit proxy için gerekli)

## Opsiyonel Özellikler
Aşağıdaki environment variable'lar opsiyoneldir:
- `OPENWEATHER_API_KEY`: Hava durumu widget'ı için
- `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`: Email bildirimleri için

## Son Değişiklikler
- 2025-11-01: Replit environment'a import edildi
- Database bağlantısı hazır (PostgreSQL)
- Frontend ve backend entegrasyonu tamamlandı
