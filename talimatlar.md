# Berat Cankır YKS Analiz Takip Sistemi - Kurulum Talimatları

## İçindekiler
- [Uygulamaya Genel Bakış](#uygulamaya-genel-bakış)
- [Gereksinimler](#gereksinimler)
- [Web Versiyonu Kurulumu](#web-versiyonu-kurulumu)
- [Electron (Masaüstü) Versiyonu Build ve Kurulum](#electron-masaüstü-versiyonu-build-ve-kurulum)
- [Verilerin Konumu ve Cache Temizleme](#verilerin-konumu-ve-cache-temizleme)
- [Uygulama Özellikleri](#uygulama-özellikleri)
- [Sorun Giderme](#sorun-giderme)

---

## Uygulamaya Genel Bakış

**Berat Cankır YKS Analiz Takip Sistemi**, YKS'ye hazırlanan öğrenciler için kapsamlı bir takip ve analiz sistemidir. Uygulama hem web tarayıcısında hem de Windows masaüstü uygulaması olarak çalışabilir.

### Temel Özellikler
- 📊 **Soru Analizi**: Çözdüğünüz soruları dersler ve konular bazında takip edin
- 📈 **Deneme Sınavı Takibi**: TYT ve AYT deneme sonuçlarınızı kaydedin ve analiz edin
- ✅ **Görev Yönetimi**: Günlük ve haftalık çalışma görevlerinizi planlayın
- 📅 **Çalışma Saati Takibi**: Her ders için ne kadar süre çalıştığınızı kaydedin
- 🎯 **Hedef Belirleme**: Kendinize hedefler koyun ve ilerlemenizi takip edin
- 📉 **Detaylı Grafikler**: Gelişiminizi görsel olarak takip edin
- 🌙 **Karanlık/Aydınlık Tema**: Gözlerinizi yormayan tema desteği
- ⏰ **Geri Sayım**: YKS sınavına kalan süreyi görün
- 🎨 **Ruh Hali Takibi**: Günlük motivasyonunuzu kaydedin

---

## Gereksinimler

### Otomatik Kurulum İçin
Uygulama, gerekli yazılımların varlığını kontrol eder. Eğer sisteminizde yoksa kurulum sırasında bilgilendirilirsiniz.

### Manuel Kurulum İçin Gerekenler
- **Node.js** (v18 veya üzeri) - [İndir](https://nodejs.org/)
- **npm** (Node.js ile birlikte gelir)
- **Git** (opsiyonel) - [İndir](https://git-scm.com/)

### Sistem Gereksinimleri
- **İşletim Sistemi**: Windows 10/11, macOS, Linux
- **RAM**: Minimum 4GB (8GB önerilir)
- **Disk Alanı**: 500MB boş alan

---

## Web Versiyonu Kurulumu

### Adım 1: Projeyi İndirin
```bash
git clone https://github.com/beratcode03/beratders.git
cd beratders
```

veya ZIP dosyası olarak indirip çıkartın.

### Adım 2: Node.js'in Kurulu Olup Olmadığını Kontrol Edin
Terminal veya Komut İstemcisi'nde şu komutları çalıştırın:

```bash
node --version
npm --version
```

Eğer "komut bulunamadı" hatası alırsanız, Node.js'i kurun: https://nodejs.org/

### Adım 3: Bağımlılıkları Yükleyin
```bash
npm install
```

Bu komut tüm gerekli paketleri otomatik olarak indirecektir. İşlem 2-5 dakika sürebilir.

### Adım 4: Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

Tarayıcınızda şu adresi açın: `http://localhost:5000`

### Adım 5: Production Build Oluşturma (Opsiyonel)
```bash
npm run build
npm start
```

---

## Electron (Masaüstü) Versiyonu Build ve Kurulum

### Adım 1: Bağımlılıkları Yükleyin
Önce web versiyonu kurulum adımlarını tamamlayın (yukarıdaki Adım 1-3).

### Adım 2: Electron Build Oluşturun
Terminal'de proje klasöründeyken şu komutu çalıştırın:

```bash
npm run electron:build
```

Bu komut:
1. Frontend'i derler (Vite build)
2. Backend'i derler (esbuild)
3. Electron uygulamasını paketler
4. Windows kurulum dosyası (.exe) oluşturur

İşlem 3-10 dakika sürebilir.

### Adım 3: Kurulum Dosyasını Bulun
Build tamamlandıktan sonra kurulum dosyası şu konumda olacaktır:
```
dist-electron/Berat Cankır-Kurulum-0.0.3.exe
```

### Adım 4: Uygulamayı Kurun
1. `.exe` dosyasına çift tıklayın
2. Kurulum sihirbazı açılacaktır
3. **LİSANS SÖZLEŞMESİNİ (LICENSE.txt)** okuyun ve kabul edin
4. Kurulum dizinini seçin (varsayılan: `C:\Users\[KullanıcıAdı]\AppData\Local\Programs\BeratCankir`)
5. "Masaüstünde kısayol oluştur" seçeneğini işaretleyin
6. "Kur" butonuna tıklayın
7. Kurulum tamamlandığında "Bitir" butonuna tıklayın

### Adım 5: Uygulamayı Çalıştırın
- Masaüstündeki **Berat Cankır** kısayoluna çift tıklayın
- veya Başlat menüsünden **Berat Cankır** uygulamasını açın

### Geliştirme Modunda Electron Çalıştırma
```bash
npm run electron:dev
```

---

## Verilerin Konumu ve Cache Temizleme

### Web Versiyonu Veri Konumları

#### Tarayıcı Local Storage
Veriler tarayıcınızın Local Storage'ında saklanır:
- **Chrome/Edge**: 
  ```
  C:\Users\[KullanıcıAdı]\AppData\Local\Google\Chrome\User Data\Default\Local Storage
  ```
- **Firefox**: 
  ```
  C:\Users\[KullanıcıAdı]\AppData\Roaming\Mozilla\Firefox\Profiles\[Profil]\storage
  ```

#### Tarayıcı Cache
- **Chrome/Edge**: `C:\Users\[KullanıcıAdı]\AppData\Local\Google\Chrome\User Data\Default\Cache`
- **Firefox**: `C:\Users\[KullanıcıAdı]\AppData\Local\Mozilla\Firefox\Profiles\[Profil]\cache2`

### Electron Versiyonu Veri Konumları

#### Uygulama Verileri
```
C:\Users\[KullanıcıAdı]\AppData\Roaming\BeratCankir\
├── data\
│   └── kayitlar.json          # Tüm verileriniz burada
├── Cache\                     # Vite ve uygulama cache'leri
├── Code Cache\                # JavaScript cache
├── GPUCache\                  # GPU cache
└── Session Storage\           # Oturum verileri
```

### Geliştirme Ortamı Cache'leri

Proje klasöründe:
```
beratders/
├── .vite/                     # Vite geliştirme cache
├── node_modules/              # NPM paketleri
├── dist/                      # Web build çıktısı
├── dist-electron/             # Electron build çıktısı
├── data/
│   └── kayitlar.json          # Geliştirme verileri
└── .cache/                    # Genel cache
```

### Tüm Verileri Sıfırlama

#### Web Versiyonu - Tarayıcıda
1. **Chrome/Edge**:
   - Ayarlar → Gizlilik ve güvenlik → Tarama verilerini temizle
   - "Tüm zamanlar" seçin
   - "Önbelleğe alınmış görüntüler ve dosyalar" ✓
   - "Çerezler ve site verileri" ✓
   - "Temizle" butonuna tıklayın

2. **Firefox**:
   - Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri
   - "Verileri Temizle" → "Önbellek" ve "Çerezler" seçin
   - "Temizle" butonuna tıklayın

#### Electron Versiyonu - Masaüstü Uygulama
1. Uygulamayı kapatın
2. Dosya Gezgini'nde şu konuma gidin:
   ```
   C:\Users\[KullanıcıAdı]\AppData\Roaming\
   ```
3. `BeratCankir` klasörünü silin
4. Uygulamayı yeniden başlatın (veriler sıfırdan başlar)

**UYARI**: Bu işlem TÜM verilerinizi siler!

#### Geliştirme Ortamı - Kod Klasörü
Terminal'de proje klasöründeyken:

```bash
# Windows Command Prompt
rmdir /s /q .vite
rmdir /s /q dist
rmdir /s /q dist-electron
rmdir /s /q .cache
del /f data\kayitlar.json

# Git Bash veya PowerShell
rm -rf .vite dist dist-electron .cache data/kayitlar.json

# node_modules'ü de temizlemek isterseniz:
rmdir /s /q node_modules
npm install
```

---

## Uygulama Özellikleri

### 1. Anasayfa
- Hoş geldin mesajı ve kişiselleştirme
- Geri sayım sayacı (YKS'ye kalan gün)
- Hızlı özet kartlar (bugünün görevleri, haftalık ilerleme)
- Motivasyon sözleri
- Hava durumu widget'ı

### 2. Yapılacaklar
- Görev ekleme, düzenleme, silme
- Kategorilere göre görev gruplandırma (Türkçe, Matematik, Fizik, vs.)
- Öncelik seviyeleri (Düşük, Orta, Yüksek)
- Renk kodlama sistemi
- Tamamlanan görevleri arşivleme
- Haftalık ve aylık tekrarlayan görevler
- Tarih bazlı filtreleme

### 3. Raporlarım
- **Soru İstatistikleri**: Hangi dersten kaç soru çözdünüz
- **Konu Analizi**: En çok yanlış yaptığınız konular (öncelikli çalışma için)
- **Zaman Analizi**: Ders başına çalışma süreleri ve verimliliğiniz
- **Deneme Sonuçları**: 
  - TYT/AYT deneme net grafikleri
  - Genel deneme ortalamaları
  - Branş deneme ortalamaları
- **İlerleme Grafikleri**: Zamana göre gelişim trendi
- **Haftalık Aktivite**: Isı haritası ile çalışma yoğunluğu

### 4. Net Hesaplayıcı
- TYT ve AYT için ayrı ayrı net hesaplama
- Doğru/Yanlış girişi ile otomatik net hesaplama
- Konu bazında detaylı analiz
- Puan tahmini (yaklaşık)

### 5. Sayaç
- YKS'ye kalan gün, saat, dakika, saniye
- Gece yarısı özel geri sayım
- Motivasyon mesajları
- Hedef belirleme ve takip

### 6. YKS Konuları
- Tüm dersler için detaylı konu listesi
- TYT ve AYT konuları ayrı ayrı
- Konu bazında işaretleme sistemi
- İlerleme takibi ve yüzdelik gösterim

### 7. Veri Yönetimi
- JSON formatında lokal veri saklama
- Otomatik yedekleme (her Pazar 23:59)
- Manuel arşivleme özellikleri
- Veri sıfırlama seçenekleri

---

## Sorun Giderme

### "npm: command not found" hatası
**Neden**: Node.js kurulu değil.  
**Çözüm**: Node.js'i indirin ve kurun: https://nodejs.org/

### "Port 5000 kullanımda" hatası
**Neden**: Başka bir uygulama 5000 portunu kullanıyor.  
**Çözüm**: 
```bash
# Windows'ta 5000 portunu kullanan programı bulun:
netstat -ano | findstr :5000

# Veya farklı port kullanın (package.json'da değiştirin)
```

### Bağımlılık yükleme hatası
**Çözüm**: 
```bash
# node_modules ve package-lock.json'u silin
rm -rf node_modules package-lock.json
# Yeniden yükleyin
npm install
```

### Electron build hatası
**Çözüm**: 
```bash
# Adım adım build:
npm run build
npm run build-server-electron
npm run electron-build
```

### Veriler görünmüyor
**Neden**: Cache sorunu veya veri dosyası bozuk.  
**Çözüm**: 
1. Tarayıcı cache'ini temizleyin (Ctrl+Shift+Del)
2. Uygulamayı yeniden başlatın
3. Sorun devam ederse `data/kayitlar.json` dosyasını silin

### Uygulama yavaş çalışıyor
**Çözüm**:
1. Cache'leri temizleyin
2. Arşivlenmiş eski verileri silin
3. Tarayıcı/Electron'u yeniden başlatın

---

## Sık Sorulan Sorular

### Verilerim kaybolur mu?
Hayır. Electron versiyonunda veriler yerel dosya sisteminizde (`kayitlar.json`) güvenle saklanır. Web versiyonunda ise tarayıcınızın Local Storage'ında tutulur. Ancak tarayıcı verilerini temizlerseniz silinebilir.

### İnternet bağlantısı gerekli mi?
Hayır. Uygulama tamamen offline çalışır. Sadece hava durumu widget'ı için internet gerekir (opsiyonel).

### Birden fazla bilgisayarda kullanabilir miyim?
Evet, ancak veriler otomatik senkronize olmaz. `kayitlar.json` dosyasını manuel olarak kopyalayabilirsiniz:
- Electron: `C:\Users\[KullanıcıAdı]\AppData\Roaming\BeratCankir\data\kayitlar.json`
- Web: Tarayıcı export/import özelliğini kullanın

### Electron ve web versiyonu arasındaki fark nedir?
- **Electron**: Masaüstü uygulaması, daha hızlı, sistem tepsisinde çalışabilir, Windows görev çubuğunda sabit
- **Web**: Tarayıcıda çalışır, platform bağımsız, kurulum gerektirmez

### Lisans sözleşmesi neden önemli?
Kurulum sırasında gösterilen LICENSE.txt dosyası, uygulamanın kullanım koşullarını içerir. Kabul etmeden uygulamayı kuramazsınız.

---

## Lisans

Bu uygulama MIT lisansı altında dağıtılmaktadır. Detaylar için `LICENSE.txt` dosyasına bakın.

Kurulum sırasında lisans sözleşmesini okuyup kabul etmeniz gerekmektedir.

---

## Destek ve İletişim

Sorun bildirmek veya öneride bulunmak için:
- GitHub Issues: https://github.com/beratcode03/beratders/issues
- GitHub Repository: https://github.com/beratcode03/beratders

---

## Güncelleme Geçmişi

### Versiyon 0.0.3 (25 Ekim 2025)
- ✅ TYT/AYT deneme kategorizasyonu düzeltildi
- ✅ Sayı input önde gelen sıfır problemi çözüldü
- ✅ Deneme gösterim mantığı iyileştirildi
- ✅ UI/UX iyileştirmeleri
- ✅ Performans optimizasyonları

---

**İyi Çalışmalar! 📚🎯**

*Son Güncelleme: 25 Ekim 2025*
