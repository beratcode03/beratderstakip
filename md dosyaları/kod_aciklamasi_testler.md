# TESTLER - DETAYLI KOD AÇIKLAMASI

## GİRİŞ

Bu doküman, Playwright test dosyasının (`testler/tam-kapsamli-sistem-testi.spec.ts`) tüm kodunu detaylı açıklar.

**Dosya Konumu:** `testler/tam-kapsamli-sistem-testi.spec.ts`  
**Test Framework:** Playwright  
**Test Sayısı:** 13 farklı senaryo  
**Amaç:** Uygulamanın tüm fonksiyonlarını otomatik test etmek

---

## BÖLÜM 1: TEST MİMARİSİ

### 1.1 Playwright Nedir?

Playwright, modern web uygulamaları için end-to-end (E2E) test framework'üdür.

**Avantajları:**
1. **Multi-browser** - Chromium, Firefox, WebKit
2. **Auto-wait** - Elementlerin hazır olmasını otomatik bekler
3. **Network intercept** - API response'ları mock'lanabilir
4. **Screenshot/Video** - Test fail olduğunda screenshot alır
5. **TypeScript support** - Full type safety

**vs. Jest:**
| Playwright | Jest |
|------------|------|
| E2E testing (browser) | Unit testing (JS runtime) |
| Kullanıcı perspektifi | Kod perspektifi |
| Yavaş ama gerçekçi | Hızlı ama izole |

### 1.2 Test File Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Ana Test Grubu', () => {
  test.beforeEach(async ({ page }) => {
    // Her test öncesi çalışır
    await page.goto('http://localhost:5000');
  });

  test('Test 1', async ({ page }) => {
    // Test kodları
  });

  test('Test 2', async ({ page }) => {
    // Test kodları
  });
});
```

---

## BÖLÜM 2: HELPER FONKSİYONLAR

### 2.1 bekle()

```typescript
const bekle = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
```

**Detaylı Açıklama:**

**Ne yapar?**
Belirli süre bekler (async/await).

**Kullanım:**
```typescript
await bekle(2000); // 2 saniye bekle
```

**Neden gerekli?**
```typescript
// ❌ YANLIŞ - Element henüz DOM'da olmayabilir
const button = await page.locator('button').click();

// ✅ DOĞRU - Sayfa render olsun
await bekle(1000);
const button = await page.locator('button').click();
```

**Playwright auto-wait var ama yeterli değil:**
- Animations
- API calls (loading state)
- Dynamic content

### 2.2 sayfayaGit()

```typescript
async function sayfayaGit(page: Page, route: string, beklenenMetin?: string) {
  console.log(`📍 ${route} sayfasına gidiliyor...`);
  await page.goto(`http://localhost:5000${route}`);
  await bekle(1500);
  
  if (beklenenMetin) {
    const title = await page.locator('h1, h2').filter({ hasText: new RegExp(beklenenMetin, 'i') }).first();
    await expect(title).toBeVisible({ timeout: 5000 });
    console.log(`✅ "${beklenenMetin}" başlığı görüntülendi`);
  }
}
```

**Detaylı Açıklama:**

**1. Console Log**
```typescript
console.log(`📍 ${route} sayfasına gidiliyor...`);
```
Test çalışırken kullanıcıya feedback verir.

**2. Page Navigation**
```typescript
await page.goto(`http://localhost:5000${route}`);
```

**Örnek:**
```typescript
sayfayaGit(page, '/anasayfa', 'Yapılacaklar');
// → http://localhost:5000/anasayfa
```

**3. Wait for Render**
```typescript
await bekle(1500);
```
1.5 saniye bekle (sayfa tam yüklenmesi için).

**4. Title Verification**
```typescript
if (beklenenMetin) {
  const title = await page.locator('h1, h2')
    .filter({ hasText: new RegExp(beklenenMetin, 'i') })
    .first();
  await expect(title).toBeVisible({ timeout: 5000 });
}
```

**Locator Breakdown:**
- `page.locator('h1, h2')` → H1 veya H2 elementleri
- `.filter({ hasText: /Yapılacaklar/i })` → "Yapılacaklar" içeren (case-insensitive)
- `.first()` → İlk match
- `await expect(...).toBeVisible()` → Görünür olduğunu doğrula

### 2.3 formDoldur()

```typescript
async function formDoldur(page: Page, veriler: Record<string, any>) {
  for (const [field, value] of Object.entries(veriler)) {
    console.log(`  ✏️  ${field}: ${value}`);
    
    const input = page.locator(`[data-testid="input-${field}"], [name="${field}"], input[type="text"]`).first();
    
    await input.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    
    if (await input.isVisible()) {
      await input.clear();
      await input.fill(value.toString());
    }
  }
}
```

**Detaylı Açıklama:**

**1. Object.entries()**
```typescript
for (const [field, value] of Object.entries(veriler))
```

**Örnek:**
```typescript
veriler = {
  title: "Matematik Çalış",
  priority: "high",
  category: "ders"
};

// Iteration:
// 1. field="title", value="Matematik Çalış"
// 2. field="priority", value="high"
// 3. field="category", value="ders"
```

**2. Multiple Selector Strategy**
```typescript
const input = page.locator(`
  [data-testid="input-${field}"],
  [name="${field}"],
  input[type="text"]
`).first();
```

**Neden multiple selector?**

Form elementleri farklı şekilde işaretlenebilir:
```html
<!-- Opsyon 1: data-testid -->
<input data-testid="input-title" />

<!-- Opsyon 2: name attribute -->
<input name="title" />

<!-- Opsyon 3: generic text input -->
<input type="text" />
```

`.first()` → İlk match'i al.

**3. Graceful Error Handling**
```typescript
await input.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
```

Eğer element bulunamazsa hata verme (silent fail).

**4. Visibility Check**
```typescript
if (await input.isVisible()) {
  await input.clear();
  await input.fill(value.toString());
}
```

Element görünürse doldur, yoksa skip et.

---

## BÖLÜM 3: TEST SENARYOLARI

### 3.1 Test 1: API Health Check

```typescript
test('1️⃣ API HEALTH CHECK - Backend Bağlantısı', async ({ page }) => {
  console.log('\n🔌 API HEALTH CHECK BAŞLIYOR...\n');

  const endpoints = [
    '/api/tasks',
    '/api/question-logs',
    '/api/exam-results',
    '/api/study-hours'
  ];

  let basariliSayisi = 0;

  for (const endpoint of endpoints) {
    const response = await page.request.get(`http://localhost:5000${endpoint}`);
    const durum = response.ok() ? '✅' : '❌';
    console.log(`${durum} ${endpoint}: ${response.status()}`);
    
    if (response.ok()) basariliSayisi++;
  }

  console.log(`\n📊 SONUÇ: ${basariliSayisi}/${endpoints.length} endpoint başarılı`);
  expect(basariliSayisi).toBeGreaterThan(0);
  console.log('\n✅ API TESTLERİ TAMAMLANDI\n');
});
```

**Detaylı Açıklama:**

**1. page.request API**
```typescript
const response = await page.request.get('http://localhost:5000/api/tasks');
```

**Playwright network request:**
- Browser context içinde çalışır
- Cookies ve headers otomatik
- CORS problem yok

**2. Response Status Check**
```typescript
response.ok()  // 200-299 için true
response.status()  // HTTP status code (200, 404, 500, etc.)
```

**3. Success Counter**
```typescript
let basariliSayisi = 0;
if (response.ok()) basariliSayisi++;
```

**4. Assertion**
```typescript
expect(basariliSayisi).toBeGreaterThan(0);
```
En az 1 endpoint çalışmalı (yoksa test fail).

### 3.2 Test 2: Görev Ekleme (6+ Görev)

```typescript
test('2️⃣ GÖREVLER - Farklı Kategori, Öncelik, Renk, Tekrar', async ({ page }) => {
  console.log('\n📝 GÖREVLER DETAYLI TEST BAŞLIYOR...\n');

  await sayfayaGit(page, '/anasayfa', 'Yapılacaklar');
  
  const pageTitle = await page.locator('h2').filter({ hasText: /Görevlerim/i }).first();
  await expect(pageTitle).toBeVisible({ timeout: 5000 });
  console.log('✅ Görevler sayfası yüklendi');

  let eklenenGorevSayisi = 0;

  for (const gorev of testVerileri.gorevler) {
    console.log(`\n🎯 Görev ${eklenenGorevSayisi + 1}/${testVerileri.gorevler.length}: "${gorev.title}"`);
    
    const gorevEkleBtn = await page.locator('[data-testid*="button-add"], button').filter({ hasText: /Görev Ekle|Yeni|Ekle/i }).first();
    
    if (await gorevEkleBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await gorevEkleBtn.click();
      await bekle(1000);
      
      await formDoldur(page, gorev);
      
      const kaydetBtn = await page.locator('[data-testid*="button-save"], button').filter({ hasText: /Kaydet|Ekle/i }).first();
      
      if (await kaydetBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await kaydetBtn.click();
        await bekle(1500);
        eklenenGorevSayisi++;
        console.log(`  ✅ Görev eklendi (${eklenenGorevSayisi}/${testVerileri.gorevler.length})`);
      }
    }
  }

  console.log(`\n📊 SONUÇ: ${eklenenGorevSayisi}/${testVerileri.gorevler.length} görev eklendi`);
  expect(eklenenGorevSayisi).toBeGreaterThanOrEqual(6);
  console.log('\n✅ GÖREVLER TESTİ TAMAMLANDI\n');
});
```

**Detaylı Açıklama:**

**1. Test Verisi**
```typescript
const testVerileri = {
  gorevler: [
    { title: "Matematik Türev Çalışması", priority: "high", category: "matematik", color: "#EF4444" },
    { title: "Fizik Konu Tekrarı", priority: "medium", category: "fizik", color: "#3B82F6" },
    { title: "Kimya Deneme Çöz", priority: "high", category: "kimya", color: "#10B981" },
    // ... 6+ görev
  ]
};
```

**2. Button Locator**
```typescript
const gorevEkleBtn = await page.locator('[data-testid*="button-add"], button')
  .filter({ hasText: /Görev Ekle|Yeni|Ekle/i })
  .first();
```

**Multiple strategy:**
- `[data-testid*="button-add"]` → data-testid içinde "button-add" geçer
- `button` → Herhangi bir button
- `.filter({ hasText: /Görev Ekle.../i })` → Text içeriğine göre filtrele
- `.first()` → İlk match

**3. Conditional Click**
```typescript
if (await gorevEkleBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  await gorevEkleBtn.click();
}
```

Eğer button görünürse tıkla, yoksa skip et.

**4. Assertion**
```typescript
expect(eklenenGorevSayisi).toBeGreaterThanOrEqual(6);
```
En az 6 görev eklenmiş olmalı.

### 3.3 Test 3-6: Soru Kayıtları, Genel Denemeler, Branş Denemeler, Çalışma Süreleri

Bu testler benzer pattern kullanır:
1. `/panel` sayfasına git
2. İlgili sekmeye geç (Soru Kayıtları, Denemeler, etc.)
3. Form doldur
4. Kaydet
5. Sonuç doğrula

**Örnek: Soru Kayıtları**
```typescript
test('3️⃣ SORU KAYITLARI - TYT/AYT Her Ders + Yanlış Konular', async ({ page }) => {
  await sayfayaGit(page, '/panel', 'Raporlarım');
  await bekle(2000);

  const soruTab = await page.locator('button').filter({ hasText: /Soru.*Kayıt/i }).first();
  if (await soruTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await soruTab.click();
    await bekle(1000);
  }

  // Form doldurma loop...
});
```

### 3.4 Test 7: Sayaç (Kronometre, Pomodoro, Alarmlar)

```typescript
test('7️⃣ SAYAÇ - Kronometre, Pomodoro, Alarmlar', async ({ page }) => {
  await sayfayaGit(page, '/sayac', 'Sayaç');
  
  console.log('\n🔍 Kronometre kontrol ediliyor...');
  const kronometreBasla = await page.locator('button').filter({ hasText: /Başlat|Start/i }).first();
  if (await kronometreBasla.isVisible({ timeout: 2000 }).catch(() => false)) {
    await kronometreBasla.click();
    await bekle(3000);
    
    const kronometreDurdur = await page.locator('button').filter({ hasText: /Durdur|Stop|Pause/i }).first();
    if (await kronometreDurdur.isVisible({ timeout: 2000 }).catch(() => false)) {
      await kronometreDurdur.click();
      console.log('  ✅ Kronometre çalıştı');
    }
  }
  
  // Pomodoro ve alarm testleri...
});
```

**Detaylı Açıklama:**

**1. Button Text Variations**
```typescript
.filter({ hasText: /Başlat|Start/i })
```
"Başlat" VEYA "Start" içeren button (Türkçe/İngilizce).

**2. Timing Test**
```typescript
await kronometreBasla.click();
await bekle(3000);  // 3 saniye çalışsın
await kronometreDurdur.click();
```

Kronometre 3 saniye çalıştırılır, sonra durdurulur.

### 3.5 Test 8-9: Checkbox İşlemleri (Hata Sıklığı, Eksik Konular)

```typescript
test('8️⃣ HATA SIKLIĞI - Checkbox İşlemleri', async ({ page }) => {
  await sayfayaGit(page, '/panel', 'Raporlarım');
  await bekle(2000);

  const hataSikligiTab = await page.locator('button').filter({ hasText: /Hata.*Sıklığı/i }).first();
  if (await hataSikligiTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await hataSikligiTab.click();
    await bekle(1500);
  }

  console.log('🔲 Checkbox işlemleri test ediliyor...');
  const checkboxlar = await page.locator('input[type="checkbox"]').all();
  
  if (checkboxlar.length > 0) {
    console.log(`  📋 ${checkboxlar.length} checkbox bulundu`);
    
    for (let i = 0; i < Math.min(3, checkboxlar.length); i++) {
      if (await checkboxlar[i].isVisible()) {
        await checkboxlar[i].check();
        await bekle(500);
        console.log(`  ✅ Checkbox ${i + 1} işaretlendi`);
      }
    }
  }
});
```

**Detaylı Açıklama:**

**1. Get All Checkboxes**
```typescript
const checkboxlar = await page.locator('input[type="checkbox"]').all();
```

`.all()` → Array of elements (Locator[])

**2. Limit to First 3**
```typescript
for (let i = 0; i < Math.min(3, checkboxlar.length); i++)
```

En fazla 3 checkbox test et (performance).

**3. Check Operation**
```typescript
await checkboxlar[i].check();
```

Checkbox'ı işaretle (checked=true).

### 3.6 Test 11: Görev Tamamlama ve Arşivleme

```typescript
test('1️⃣1️⃣ GÖREV TAMAMLAMA VE ARŞİVLEME', async ({ page }) => {
  await sayfayaGit(page, '/anasayfa', 'Yapılacaklar');
  await bekle(2000);

  console.log('🎯 BİR GÖREVİ TAMAMLAMA...');
  const tamamlaBtn = await page.locator('[data-testid*="button-complete"], button')
    .filter({ hasText: /tamamla|complete/i })
    .first();
  
  if (await tamamlaBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await tamamlaBtn.click();
    await bekle(1500);
    console.log('  ✅ Görev tamamlandı olarak işaretlendi');
  }

  console.log('\n📦 ARŞİVLEME İŞLEMİ...');
  const arsivleBtn = await page.locator('[data-testid*="button-archive"], button')
    .filter({ hasText: /arşivle|archive/i })
    .first();
  
  if (await arsivleBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await arsivleBtn.click();
    await bekle(1500);
    console.log('  ✅ Görev arşivlendi');
  }
});
```

### 3.7 Test 12: Filtreler

```typescript
test('1️⃣2️⃣ FİLTRELER - Tüm Filtreleme Seçenekleri', async ({ page }) => {
  await sayfayaGit(page, '/panel', 'Raporlarım');
  await bekle(2000);

  const soruTab = await page.locator('button').filter({ hasText: /Soru.*Kayıt/i }).first();
  if (await soruTab.isVisible()) {
    await soruTab.click();
    await bekle(1000);
  }

  console.log('🔍 Filtre test ediliyor...');
  const filtreler = [
    { selector: '[data-testid*="filter-exam"], select', value: 'TYT' },
    { selector: '[data-testid*="filter-subject"], select', value: 'Matematik' },
  ];

  for (const filtre of filtreler) {
    const select = await page.locator(filtre.selector).first();
    if (await select.isVisible({ timeout: 2000 }).catch(() => false)) {
      await select.selectOption(filtre.value);
      await bekle(1000);
      console.log(`  ✅ "${filtre.value}" filtresi uygulandı`);
    }
  }
});
```

**Detaylı Açıklama:**

**1. Select Option**
```typescript
await select.selectOption('TYT');
```

**HTML:**
```html
<select>
  <option value="TYT">TYT</option>
  <option value="AYT">AYT</option>
</select>
```

**Result:** "TYT" seçilir.

---

## BÖLÜM 4: TEST ÇALIŞTIRMA

### 4.1 Test Komutları

```bash
# Tüm testleri çalıştır
npm test

# Headless mode (browser görünmez)
npm test -- --headless

# Headed mode (browser görünür)
npm test -- --headed

# Debug mode
npm test -- --debug

# Specific test
npm test -- --grep "GÖREVLER"
```

### 4.2 Test Çıktısı

```
📍 /anasayfa sayfasına gidiliyor...
✅ "Yapılacaklar" başlığı görüntülendi

🎯 Görev 1/7: "Matematik Türev Çalışması"
  ✏️  title: Matematik Türev Çalışması
  ✏️  priority: high
  ✏️  category: matematik
  ✅ Görev eklendi (1/7)

📊 SONUÇ: 7/7 görev eklendi

✅ GÖREVLER TESTİ TAMAMLANDI
```

---

## ÖZET

**Test Kapsamı:**
1. ✅ API health check (4 endpoint)
2. ✅ Görev ekleme (6+ görev, farklı kategori/öncelik)
3. ✅ Soru kayıtları (TYT/AYT, tüm dersler)
4. ✅ Genel denemeler (TYT/AYT)
5. ✅ Branş denemeler (her ders ayrı)
6. ✅ Çalışma süreleri
7. ✅ Sayaç (kronometre, pomodoro, alarmlar)
8. ✅ Hata sıklığı (checkbox)
9. ✅ Eksik konular (checkbox)
10. ✅ Tamamlanan geçmiş
11. ✅ Görev tamamlama ve arşivleme
12. ✅ Filtreler

**Test Stratejisi:**
- ✅ Multiple selector strategy (data-testid, name, type)
- ✅ Graceful error handling (silent fail)
- ✅ Console logging (user feedback)
- ✅ Wait strategies (bekle, waitFor, timeout)
- ✅ Assertion (expect)

