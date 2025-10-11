# Afyonlu 
# Berat Cankır 
# Ders Analiz/Takip Projesi

Bu proje Telif Hakkı ve lisans kapsamında korunmaktadır. Proje kodları, dokümantasyonu ve tüm yazılım bileşenleri, yalnızca orijinal yazar tarafından sağlanan izin doğrultusunda kullanılabilir.  

Herhangi bir üçüncü tarafın, yazılımı kopyalaması, dağıtması, çoğaltması veya değiştirmesi durumunda, önceden yazılı izin alınması zorunludur. Özellikle projenin isimlendirilmesinde veya yazarlık bilgilerinde değişiklik yapmak, orijinal yazarın adı belirtilmeden kullanım yapmak kesinlikle yasaktır.  

Bu lisans koşullarının ihlali, ilgili yasal mevzuat çerçevesinde ciddi hukuki sorumluluk doğurur. Projenin izinsiz kullanımı veya çoğaltılması tespit edildiğinde, telif hakları ve lisans hükümleri doğrultusunda gerekli tüm yasal adımlar atılacaktır.  

Kullanıcıların projeyi kullanmadan önce lisans metnini dikkatle okumaları ve belirtilen koşullara tamamen uymaları beklenmektedir. Projenin amacı, eğitim ve analiz süreçlerini geliştirmek olup, herhangi bir ticari kullanım veya izinsiz dağıtım yasalara aykırıdır.

---

## 📚 Proje Hakkında

Türk öğrencilerin YKS/TYT/AYT sınavlarına hazırlanma sürecini takip etmek, analiz etmek ve optimize etmek için geliştirilmiş kapsamlı bir masaüstü uygulamasıdır.

### ✨ Özellikler

- 📊 **Deneme Takibi**: TYT ve AYT deneme sonuçlarını kaydedin ve analiz edin
- 📝 **Soru Çözüm Takibi**: Günlük soru çözüm kayıtlarınızı tutun
- 📈 **Gelişmiş Grafikler**: Net analizi, ders analizi ve branş deneme grafikleri
- 🎯 **Hedef Net Belirleme**: TYT ve AYT hedef netlerinizi belirleyin ve takip edin
- 🗓️ **Takvim & Heatmap**: Çalışma günlerinizi mor tonlarda heatmap ile görselleştirin
- ⏰ **Çalışma Saati Takibi**: Günlük çalışma sürelerinizi kaydedin
- 🔄 **Arşivleme**: Gün sonu otomatik arşivleme özelliği
- 📧 **Rapor Gönderme**: Aylık raporlarınızı e-posta ile gönderin
- 🌙 **Dark Mode**: Karanlık ve aydınlık tema desteği
- ✅ **Hata Takibi**: Yanlış konuları işaretleyin ve düzeltilenleri takip edin

---

## 🚀 Kurulum Talimatları

### Gereksinimler

- Node.js (v18 veya üzeri)
- npm veya yarn paket yöneticisi
- Windows işletim sistemi (Electron masaüstü uygulaması için)

### Adım 1: Projeyi Klonlayın

```bash
git clone [PROJE_URL]
cd [PROJE_KLASORU]
```

### Adım 2: Bağımlılıkları Yükleyin

```bash
npm install
```

### Adım 3: Geliştirme Ortamında Çalıştırın

Web uygulaması olarak çalıştırmak için:

```bash
npm run dev
```

Tarayıcınızda `http://localhost:5000` adresini açın.

### Adım 4: Electron Masaüstü Uygulaması Olarak Çalıştırın

Electron uygulamasını başlatmak için:

```bash
npm run electron
```

---

## 📦 Windows Installer Oluşturma

Windows için kurulum dosyası oluşturmak için:

```bash
npm run build:win
```

Bu komut `dist/` klasöründe bir `.exe` kurulum dosyası oluşturacaktır.

### Kurulum Sihirbazı Özellikleri

- ✅ KVKK Onay Ekranı
- 👋 Hoşgeldiniz Ekranı
- ⏳ Yükleme Ekranı
- ✨ Tamamlandı Ekranı

---

## 🎨 Özellik Kullanımı

### Deneme Ekleme

1. Ana sayfada **"Deneme Ekle"** butonuna tıklayın
2. TYT veya AYT seçin
3. Ders bazında doğru, yanlış, boş sayılarını girin
4. Yanlış konuları ekleyin (opsiyonel)
5. Kaydet butonuna tıklayın

### Soru Çözümü Kaydetme

1. **"Soru Ekle"** butonuna tıklayın
2. Sınav türünü (TYT/AYT) ve dersi seçin
3. Doğru, yanlış, boş sayılarını girin (otomatik limit kontrolü var)
4. Yanlış konuları kategori ve zorluk derecesiyle ekleyin
5. Kaydet

### Heatmap Kullanımı

- Takvim üzerinde herhangi bir güne tıklayarak o günün detaylarını görüntüleyin
- Mor tonları çalışma yoğunluğunu gösterir (açık mor: az, koyu mor: çok)
- 6+ saat çalışma günleri özel renk ile işaretlenir

### Grafik Analizleri

- **Net Analizi**: TYT ve AYT net gelişiminizi görün, hedef net belirleyin
- **Ders Analizi**: TYT ve AYT ders bazında radar grafikleri
- **Branş Analizi**: Branş denemelerinizin net gelişimini takip edin

---

## 🛠️ Teknolojiler

- **Frontend**: React, TypeScript, TailwindCSS, Recharts
- **Backend**: Express.js, Node.js
- **Veritabanı**: JSON tabanlı dosya sistemi (MemStorage)
- **Desktop**: Electron, Electron Builder
- **UI Bileşenleri**: Radix UI, Shadcn/ui
- **State Management**: TanStack Query

---

## 📁 Proje Yapısı

```
.
├── client/              # React frontend
│   ├── src/
│   │   ├── sayfalar/    # Sayfa bileşenleri
│   │   ├── bilesenler/  # UI bileşenleri
│   │   └── kutuphane/   # Yardımcı fonksiyonlar
├── server/              # Express backend
│   ├── rotalar.ts       # API rotaları
│   └── depolama.ts      # Veri depolama katmanı
├── electron/            # Electron ana süreç
│   ├── main.cjs         # Ana pencere yapılandırması
│   └── preload.cjs      # Preload script
├── shared/              # Paylaşılan tipler ve şemalar
└── data/                # JSON veri dosyaları
```

---

## 🔒 Güvenlik

- Tüm veriler yerel olarak saklanır (data/kayitlar.json)
- Hassas bilgiler için şifreleme (isteğe bağlı)
- Otomatik yedekleme ve arşivleme sistemi

---

## 📝 Soru Limitleri

### TYT
- Türkçe: 40
- Sosyal: 20
- Matematik: 30
- Geometri: 10
- Fizik: 7
- Kimya: 7
- Biyoloji: 6

### AYT
- Matematik: 30
- Geometri: 10
- Fizik: 14
- Kimya: 13
- Biyoloji: 13

---

## 🐛 Hata Bildirimi

Herhangi bir hata veya öneriniz için lütfen proje sahibi ile iletişime geçin.

---

## 📄 Lisans

Bu proje telif hakkı koruması altındadır. Detaylar için yukarıdaki lisans metnini okuyun.

---

## 👨‍💻 Geliştirici

**Berat Cankır**  
📍 Sakarya, Serdivan

---

## 🙏 Teşekkürler

Bu projeyi kullandığınız için teşekkür ederiz. Başarılar dileriz! 🎯
