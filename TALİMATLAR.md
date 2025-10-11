# BERAT CANKIR YKS ANALİZ SİSTEMİ - TALİMATLAR

## 📋 İçindekiler
1. [Uygulama Hakkında](#uygulama-hakkında)
2. [Kurulum ve İlk Ayarlar](#kurulum-ve-ilk-ayarlar)
3. [Geliştirme Ortamı](#geliştirme-ortamı)
4. [Uygulama Güncelleme Sistemi](#uygulama-güncelleme-sistemi)
5. [İhlal Takip ve Log Sistemi](#ihlal-takip-ve-log-sistemi)
6. [Merkezi İhlal Sunucusu](#merkezi-ihlal-sunucusu)
7. [Uygulama Dağıtımı](#uygulama-dağıtımı)
8. [Sık Sorulan Sorular](#sık-sorulan-sorular)

---

## 🎯 Uygulama Hakkında

**Uygulamagenel Adı:** Berat Cankır YKS Analiz Sistemi  
**Versiyon:** 0.0.3  
**Platform:** Windows (Electron)  
**Lisans:** MIT

### Özellikler
- 📊 TYT/AYT Deneme Takibi
- 📈 Soru Çözüm Analizi
- 🎯 Hedef Net Belirleme
- 📅 Çalışma Saati Takibi
- 🌤️ Hava Durumu Entegrasyonu (OpenWeather API)
- 📧 Email Bildirimleri (Gmail/NodeMailer)
- 🔐 İhlal Takip ve Koruma Sistemi
- 🌐 Merkezi Sunucu ile Client Takibi
- ✨ Otomatik Güncelleme Sistemi

---

## 📦 Kurulum ve İlk Ayarlar

### Sistem Gereksinimleri
- **İşletim Sistemi:** Windows 10 veya üzeri
- **RAM:** En az 4GB (8GB önerilir)
- **Disk Alanı:** 500MB boş alan
- **İnternet:** Güncellemeler ve API servisleri için gerekli

### İlk Kurulum Adımları

1. **Kurulum Dosyasını İndirin**
   - GitHub Releases sayfasından `BeratCankir-Setup-0.0.3.exe` dosyasını indirin
   - Alternatif: Build klasöründen `dist-electron` içindeki kurulum dosyasını kullanın

2. **Uygulamayı Kurun**
   - Setup dosyasını çalıştırın
   - Kurulum klasörünü seçin (varsayılan: `C:\Users\[Kullanıcı]\AppData\Local\Programs\berat-cankir`)
   - Masaüstü kısayolu ve başlangıç menüsü kısayolu oluşturulur
   - Kurulum tamamlandığında uygulama otomatik başlar

3. **İlk Açılış Kurulumu**
   - Hoş geldiniz ekranı gösterilir
   - Kullanım koşullarını kabul edin
   - Temel ayarlar otomatik yapılandırılır
   - Ana ekran açılır

### Veri Konumu
Tüm kullanıcı verileri şurada saklanır:
```
C:\Users\[Kullanıcı]\AppData\Roaming\berat-cankir\
├── data/
│   └── kayitlar.json      # Ana veri dosyası
├── ihlal-logs/            # İhlal takip logları
├── merkezi-ihlal-logs/    # Merkezi sunucu logları (sadece ana PC)
└── setup-completed.json   # Kurulum durumu
```

---

## 💻 Geliştirme Ortamı

### Gerekli Araçlar
```bash
# Node.js 20 veya üzeri
node --version  # v20.x.x

# npm 10 veya üzeri
npm --version   # 10.x.x
```

### Proje Kurulumu

1. **Depoyu Klonlayın**
```bash
git clone https://github.com/beratcode03/beratders.git
cd beratders
```

2. **Bağımlılıkları Yükleyin**
```bash
npm install
```

3. **Ortam Değişkenlerini Ayarlayın**
`.env` dosyası oluşturun:
```env
# Hava Durumu API (İsteğe Bağlı)
OPENWEATHER_API_KEY=your_api_key_here

# Email Ayarları (İsteğe Bağlı)
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password
# veya
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Merkezi İhlal Sunucusu (İsteğe Bağlı)
IHLAL_CENTRAL_SERVER_URL=http://192.168.1.100:45123/api/ihlal/report
```

> **Not:** Bu API'lar olmadan da uygulama çalışır, sadece ilgili özellikler devre dışı olur.

### Geliştirme Komutları

```bash
# Web versiyonunu çalıştır (localhost:5000)
npm run dev

# Electron uygulamasını geliştirme modunda çalıştır
npm run electron:dev

# TypeScript kontrolü
npm run check

# Production build (Web)
npm run build

# Production build (Electron)
npm run build-electron

# Kurulum dosyası oluştur (Windows)
npm run electron:build

# Klasör olarak build et (test için)
npm run electron:build:dir
```

### Veritabanı Komutları

```bash
# Drizzle schema'yı veritabanına uygula
npm run db:push

# Eğer veri kaybı uyarısı alırsanız
npm run db:push --force
```

---

## 🔄 Uygulama Güncelleme Sistemi

### Otomatik Güncelleme Nasıl Çalışır?

Uygulama **electron-updater** kullanarak GitHub Releases üzerinden otomatik güncellenir.

#### Güncelleme Akışı

1. **Kontrol:** Uygulama her başladığında GitHub'dan yeni sürüm kontrolü yapar
2. **İndirme:** Yeni sürüm varsa arka planda indirilir
3. **Bildirim:** İndirme tamamlandığında kullanıcıya bildirim gösterilir
4. **Kurulum:** Kullanıcı onayı ile uygulama yeniden başlatılır ve güncellenir

#### Güncelleme Süreci (Geliştirici)

1. **Sürüm Numarasını Güncelleyin**
   - `package.json` dosyasında `version` değerini artırın
   ```json
   {
     "version": "0.0.4"  // 0.0.3'ten 0.0.4'e
   }
   ```

2. **Değişiklikleri Commit Edin**
   ```bash
   git add .
   git commit -m "v0.0.4 - Yeni özellikler ve düzeltmeler"
   git push origin main
   ```

3. **Build Oluşturun**
   ```bash
   npm run electron:build
   ```
   
   Build dosyaları şurada oluşur:
   ```
   dist-electron/
   ├── BeratCankir-Setup-0.0.4.exe          # Kurulum dosyası
   ├── BeratCankir-Setup-0.0.4.exe.blockmap # Güncelleme metadata
   └── latest.yml                            # Güncelleme bilgileri
   ```

4. **GitHub Release Oluşturun**
   - GitHub repository sayfasına gidin
   - **Releases** → **Draft a new release** tıklayın
   - **Tag version:** `v0.0.4` yazın
   - **Release title:** `v0.0.4` yazın
   - **Describe this release:** Değişiklikleri yazın
   - Aşağıdaki dosyaları yükleyin:
     - `BeratCankir-Setup-0.0.4.exe`
     - `BeratCankir-Setup-0.0.4.exe.blockmap`
     - `latest.yml`
   - **Publish release** tıklayın

5. **Güncelleme Yayınlandı!**
   - Kullanıcılar uygulamayı açtığında otomatik olarak güncelleme alacaklar
   - İlk kullanıcı bildirim görecek: "Yeni sürüm (0.0.4) indiriliyor..."
   - İndirme tamamlandığında yeniden başlatma seçeneği sunulacak

### Manuel Güncelleme

Otomatik güncelleme çalışmazsa:

1. GitHub Releases sayfasından son sürümü indirin
2. Mevcut uygulamayı kapatın
3. Yeni setup dosyasını çalıştırın
4. Eski veriler korunur (aynı klasörde saklandığı için)

---

## 🔒 İhlal Takip ve Log Sistemi

### İhlal Takip Sistemi Nedir?

Uygulamanın yetkisiz kullanımını tespit etmek ve kayıt altına almak için geliştirilmiş bir güvenlik sistemidir.

### Toplanan Bilgiler

Uygulama her kurulumda aşağıdaki bilgileri toplar:

#### 1. Kullanıcı Bilgileri
- Windows kullanıcı adı
- Bilgisayar adı (hostname)
- İşletim sistemi detayları

#### 2. Donanım Bilgileri
- **MAC Adresi:** Ağ kartı fiziksel adresi
- **IP Adresi:** Dış IP adresi (ipify.org API)
- **Bilgisayar Özellikleri:**
  - İşlemci modeli ve çekirdek sayısı
  - RAM miktarı (toplam, kullanılan, boş)
  - Platform (Windows 10/11)
  - Mimari (x64)

#### 3. Ağ Bilgileri
- Aktif ağ bağlantıları
- Gateway ve DNS sunucuları
- WiFi detayları (SSID, sinyal gücü)
- VPN durumu
- GPU bilgileri

#### 4. Konum Bilgisi
- IP tabanlı konum (şehir, ülke)
- ISP bilgileri

#### 5. İhlal Bilgileri
- Kurulum sayısı
- Kurulum tarihi ve saati
- İhlal tipi (birden fazla kurulum, yetkisiz kullanım, vb.)

### Log Dosyaları Konumu

#### Client PC'lerde (Normal Kurulum)
```
C:\Users\[Kullanıcı]\AppData\Roaming\berat-cankir\ihlal-logs\
├── user-info/           # Kullanıcı bilgileri
├── violations/          # İhlal kayıtları
├── mac-address/         # MAC adresleri
├── ip-address/          # IP adresleri
├── pc-specs/           # Bilgisayar özellikleri
├── location/           # Konum bilgileri
├── wifi-specs/         # WiFi detayları
├── network-connections/# Ağ bağlantıları
├── gateway-dns/        # Gateway ve DNS
├── wifi-details/       # Detaylı WiFi bilgisi
├── vpn-status/         # VPN durumu
└── gpu-info/           # GPU bilgileri
```

#### Ana PC'de (Merkezi Sunucu)
```
C:\Users\[Kullanıcı]\AppData\Roaming\berat-cankir\merkezi-ihlal-logs\
├── client-data/        # Tüm client verilerinin tam kopyası
├── user-info/          # Tüm kullanıcı bilgileri
├── violations/         # Tüm ihlal kayıtları
├── mac-addresses/      # Tüm MAC adresleri
├── ip-addresses/       # Tüm IP adresleri
├── pc-specs/          # Tüm PC özellikleri
├── locations/         # Tüm konum bilgileri
└── install-reports/   # Kurulum özet raporları
    └── summary.json   # Genel özet
```

### Log Temizleme

Eski loglar otomatik temizlenir:
- **30 günden eski** loglar silinir
- Her uygulama başlangıcında temizlik yapılır

---

## 🌐 Merkezi İhlal Sunucusu

### Ana PC Kurulumu (Merkezi Sunucu)

Ana PC'de uygulama kurulduğunda **merkezi ihlal sunucusu** otomatik olarak başlar.

#### Sunucu Özellikleri
- **Port:** 45123
- **Protokol:** HTTP
- **Adres:** `http://0.0.0.0:45123`
- **Endpoint:** `/api/ihlal/report`

#### Sunucu Başlatma

Sunucu, ana PC'de uygulama her açıldığında otomatik başlar:
```
🌐 Merkezi İhlal Sunucusu Aktif: http://0.0.0.0:45123
```

### Client PC Kurulumu

Client PC'lerde uygulamayı kurduktan sonra, verilerin ana PC'ye gönderilmesi için ayar gerekir.

#### 1. Yöntem: Ortam Değişkeni

Client PC'lerde `.env` dosyası oluşturun:
```env
IHLAL_CENTRAL_SERVER_URL=http://192.168.1.100:45123/api/ihlal/report
```

> **Not:** `192.168.1.100` yerine ana PC'nin yerel IP adresini yazın.

#### 2. Yöntem: Manuel Ayar

Eğer `.env` dosyası yoksa, varsayılan olarak `http://localhost:45123` kullanılır.

### Ana PC IP Adresi Bulma

Ana PC'de PowerShell açın ve şu komutu çalıştırın:
```powershell
ipconfig | findstr /i "IPv4"
```

Çıktı:
```
IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

Bu IP adresini client PC'lerin `.env` dosyasına yazın.

### Veri Gönderimi

Client PC'ler şu durumlarda merkezi sunucuya veri gönderir:

1. **İlk Kurulum:** Kurulum tamamlandığında
2. **Uygulama Başlangıcı:** Her açılışta
3. **İhlal Tespiti:** Yetkisiz kullanım tespit edildiğinde

### Merkezi Sunucu Logları İnceleme

Ana PC'de logları görmek için:

```
C:\Users\[Kullanıcı]\AppData\Roaming\berat-cankir\merkezi-ihlal-logs\
```

#### Özet Rapor
```
merkezi-ihlal-logs/install-reports/summary.json
```

Örnek içerik:
```json
{
  "totalInstalls": 5,
  "violations": 2,
  "clients": [
    {
      "clientId": "client-1739289123456-abc123",
      "userName": "Ahmet",
      "pcName": "LAPTOP-ABC123",
      "ipAddress": "192.168.1.101",
      "installDate": "2025-10-11T18:30:00.000Z",
      "hasViolation": true,
      "violationType": "multiple_install"
    }
  ]
}
```

### Güvenlik Duvarı Ayarları

Ana PC'de port 45123'ü açmanız gerekebilir:

#### Windows Defender Firewall

1. **Başlat** → **Windows Defender Firewall** → **Advanced Settings**
2. **Inbound Rules** → **New Rule**
3. **Port** seçin → **Next**
4. **TCP** → **Specific local ports:** `45123`
5. **Allow the connection** seçin
6. **Domain, Private, Public** hepsini seçin
7. **Name:** `Berat Cankir Merkezi Sunucu`
8. **Finish**

---

## 📱 Uygulama Dağıtımı

### Kurulum Dosyası Oluşturma

```bash
# Build komutunu çalıştır
npm run electron:build
```

### Build Çıktıları

```
dist-electron/
├── win-unpacked/                           # Paketlenmemiş dosyalar (test için)
├── BeratCankir-Setup-0.0.3.exe            # Kurulum dosyası (NSIS)
├── BeratCankir-Setup-0.0.3.exe.blockmap   # Güncelleme için
└── latest.yml                              # Güncelleme meta verisi
```

### Dağıtım Yöntemleri

#### 1. GitHub Releases (Önerilen)
- Otomatik güncelleme destekler
- Merkezi dağıtım
- Sürüm kontrolü kolay

**Adımlar:**
1. GitHub'da release oluşturun
2. Kurulum dosyalarını yükleyin
3. Paylaşım linkini kullanıcılara gönderin

#### 2. Doğrudan Dağıtım
- USB veya ağ üzerinden paylaşım
- Kurulum dosyasını kopyalayın
- Kullanıcılar çalıştırsın

**Not:** Bu yöntemde otomatik güncelleme çalışmaz (GitHub release gerekir).

#### 3. Ağ Paylaşımı
- Ana PC'de paylaşılan klasör oluşturun
- Kurulum dosyasını paylaşın
- Client PC'ler ağdan kurar

### Kurulum Özelleştirme

#### NSIS Kurulum Ayarları

`package.json` içinde:
```json
"nsis": {
  "oneClick": false,                    // Kullanıcı klasör seçebilir
  "allowToChangeInstallationDirectory": true,
  "createDesktopShortcut": "always",    // Masaüstü kısayolu
  "createStartMenuShortcut": true,      // Başlat menüsü
  "runAfterFinish": true,              // Kurulumdan sonra çalıştır
  "installerIcon": "electron/icons/app-icon.ico",
  "language": 1055                     // Türkçe (1055)
}
```

#### Kurulum Görselleri

Özelleştirmek için:
```
electron/
├── installer-header.bmp    # Üst banner (150x57 piksel)
├── installer-sidebar.bmp   # Yan panel (164x314 piksel)
└── icons/
    └── app-icon.ico       # Uygulama ikonu
```

---

## ❓ Sık Sorulan Sorular

### Genel Sorular

**S: Uygulama internetsiz çalışır mı?**  
C: Evet! Sadece hava durumu ve email özellikleri çalışmaz. Tüm analiz ve takip özellikleri offline çalışır.

**S: Verilerim nerede saklanıyor?**  
C: Tüm veriler bilgisayarınızda, `C:\Users\[Kullanıcı]\AppData\Roaming\berat-cankir\data\` klasöründe `kayitlar.json` dosyasında saklanır.

**S: Veritabanı kullanıyor mu?**  
C: Şu anda JSON dosyası kullanıyor. İleride PostgreSQL desteği eklenebilir.

### Güncelleme Sorunları

**S: Güncelleme gelmiyor, ne yapmalıyım?**  
C: 
1. İnternet bağlantınızı kontrol edin
2. Uygulamayı kapatıp yeniden açın
3. GitHub Releases sayfasından manuel indirin
4. Güvenlik duvarı GitHub'ı engelliyor olabilir

**S: Güncelleme sırasında hata alıyorum**  
C:
1. Uygulamayı yönetici olarak çalıştırın
2. Antivirus geçici devre dışı bırakın
3. Manuel kurulum yapın

### İhlal Sistemi Sorunları

**S: Client PC verileri ana PC'ye gelmiyor**  
C:
1. Ana PC'de uygulamanın açık olduğundan emin olun
2. Client PC'de `.env` dosyasında doğru IP adresini yazdığınızdan emin olun
3. Güvenlik duvarı port 45123'ü engelliyor olabilir
4. Ana PC ve Client PC aynı ağda olmalı

**S: Merkezi sunucu başlamıyor**  
C:
1. Port 45123 başka program tarafından kullanılıyor olabilir
2. Yönetici izniyle çalıştırın
3. Güvenlik duvarı ayarlarını kontrol edin

**S: Log dosyaları çok yer kaplıyor**  
C: Loglar 30 günde bir otomatik temizlenir. Manuel temizlemek için `ihlal-logs` klasörünü silebilirsiniz.

### Build Sorunları

**S: `npm run electron:build` hata veriyor**  
C:
1. `node_modules` klasörünü silin ve `npm install` çalıştırın
2. `.gitignore`'a `dist-electron/` eklenmiş mi kontrol edin
3. Disk alanınız yeterli mi kontrol edin (en az 2GB)

**S: Kurulum dosyası çok büyük (>200MB)**  
C: Normal! Electron uygulamaları Chromium ve Node.js içerir, bu yüzden büyüktür.

### Geliştirme Sorunları

**S: `npm run dev` çalışmıyor**  
C:
1. Port 5000 başka uygulama tarafından kullanılıyor olabilir
2. `.env` dosyası gerekli mi kontrol edin
3. `npm install` tekrar çalıştırın

**S: Veritabanı hatası alıyorum**  
C:
```bash
npm run db:push --force
```
Komutu ile schema'yı sıfırlayın.

**S: TypeScript hataları var**  
C:
```bash
npm run check
```
Komutu ile hataları görün ve düzeltin.

---

## 📞 Destek ve İletişim

### GitHub Issues
Hata bildirimi ve özellik önerileri için:  
https://github.com/beratcode03/beratders/issues

### Geliştirici
**Berat Cankır**  
- GitHub: [@beratcode03](https://github.com/beratcode03)
- Email: [GitHub profilinde]

---

## 📝 Değişiklik Geçmişi

### v0.0.3 (2025-10-11)
- ✅ PostgreSQL veritabanı desteği eklendi
- ✅ Branş Hedef Net Ayarları kaldırıldı
- ✅ ReferenceLine import hatası düzeltildi
- ✅ Otomatik güncelleme sistemi aktif
- ✅ İhlal takip sistemi geliştirildi
- ✅ Merkezi sunucu desteği eklendi

### v0.0.2
- Deneme takip sistemi
- Soru çözüm analizi
- Grafik ve raporlama

### v0.0.1
- İlk sürüm
- Temel özellikler

---

## 🔐 Güvenlik Notları

1. **API Anahtarları:** `.env` dosyasını asla GitHub'a yüklemeyin
2. **İhlal Logları:** Hassas veri içerir, güvenli saklayın
3. **Merkezi Sunucu:** Sadece güvenilir ağlarda kullanın
4. **Güncelleme Dosyaları:** Sadece resmi GitHub Releases'den indirin

---

## 📄 Lisans

MIT License - Detaylar için `LICENSE.txt` dosyasına bakın.

---

## ⚠️ Sorumluluk Reddi

Bu uygulama eğitim amaçlıdır. İhlal takip sistemi sadece yetkisiz kullanımı tespit içindir ve yasal düzenlemelere uygun kullanılmalıdır.

---

**Son Güncelleme:** 11 Ekim 2025  
**Doküman Versiyonu:** 1.0
