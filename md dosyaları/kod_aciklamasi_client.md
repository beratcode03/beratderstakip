# CLIENT TARAFLI KOD AÇIKLAMASI - DETAYLI DOKÜMANTASYON

## GİRİŞ

Bu doküman, client tarafındaki tüm React bileşenlerini ve sayfalarını detaylı açıklar.

**Client Dizin Yapısı:**
```
client/
├── src/
│   ├── sayfalar/           # Pages (anasayfa, panel, sayac, etc.)
│   ├── bilesenler/         # Components (UI, modals, forms)
│   ├── kutuphane/          # Library (API client, utilities)
│   ├── App.tsx             # Main app component
│   └── index.css           # Global styles
```

**Toplam Client Kodu:** 9914+ satır

---

## BÖLÜM 1: ROUTING (App.tsx)

### 1.1 Kod Analizi

```typescript
import { Switch, Route } from "wouter";
import Homepage from "@/sayfalar/anasayfa-detay";
import Home from "@/sayfalar/anasayfa";
import Dashboard from "@/sayfalar/panel";
import NetCalculator from "@/sayfalar/net-hesaplayici";
import Timer from "@/sayfalar/sayac";
import YKSKonular from "@/sayfalar/yks-konular";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Homepage} />
      <Route path="/anasayfa" component={Home} />
      <Route path="/panel" component={Dashboard} />
      <Route path="/net-hesaplayici" component={NetCalculator} />
      <Route path="/sayac" component={Timer} />
      <Route path="/yks-konular" component={YKSKonular} />
      <Route component={NotFound} />
    </Switch>
  );
}
```

**Sayfalar:**
1. `/` - Homepage (landing page)
2. `/anasayfa` - Tasks page (görevler)
3. `/panel` - Dashboard (raporlar, istatistikler)
4. `/net-hesaplayici` - Net calculator
5. `/sayac` - Timer (kronometre, pomodoro)
6. `/yks-konular` - YKS konuları

---

## BÖLÜM 2: ANASAYFA (TASKS PAGE)

### 2.1 client/src/sayfalar/anasayfa.tsx

```typescript
export default function Home() {
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-4">
        <TasksSection onAddTask={() => setAddTaskModalOpen(true)} />
      </main>
      <AddTaskModal open={addTaskModalOpen} onOpenChange={setAddTaskModalOpen} />
    </div>
  );
}
```

**Bileşenler:**
1. **Header** - Başlık ve navigasyon
2. **TasksSection** - Görevler listesi
3. **AddTaskModal** - Görev ekleme modalı

### 2.2 TasksSection Bileşeni

**Özellikler:**
- Görev listeleme (in-memory storage veya API)
- Filtreleme (kategori, öncelik)
- Sıralama (tarih, öncelik)
- Görev tamamlama/arşivleme
- Drag & drop (opsiyonel)

**State Management:**
```typescript
const { data: tasks, isLoading } = useQuery({
  queryKey: ['/api/tasks'],
});
```

TanStack Query kullanır (caching, refetching, optimistic updates).

---

## BÖLÜM 3: PANEL (DASHBOARD)

### 3.1 client/src/sayfalar/panel.tsx

Panel sayfası çok büyük (2500+ satır). Birden fazla sekme içerir:

**Sekmeler:**
1. **Soru Kayıtları** - TYT/AYT soru çözümü kayıtları
2. **Genel Denemeler** - TYT/AYT tam deneme sonuçları
3. **Branş Denemeler** - Ders bazlı deneme sonuçları
4. **Çalışma Süreleri** - Günlük çalışma saatleri
5. **Hata Sıklığı** - Yanlış yapılan konular
6. **Eksik Konular** - Çalışılması gereken konular
7. **Tamamlanan Geçmiş** - Geçmiş kayıtlar (arşivlenen)
8. **Grafikler** - İstatistik grafikleri (Recharts)

### 3.2 Soru Kayıtları Sekmesi

```typescript
function SoruKayitlariTab() {
  const [formData, setFormData] = useState({
    exam_type: 'TYT',
    subject: '',
    topic: '',
    correct_count: '',
    wrong_count: '',
    blank_count: '',
    wrong_topics: [],
    time_spent_minutes: null,
    study_date: new Date().toISOString().split('T')[0]
  });

  const mutation = useMutation({
    mutationFn: (data: InsertQuestionLog) => 
      apiRequest('/api/question-logs', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/question-logs'] });
      toast({ title: 'Soru kaydı eklendi' });
      setFormData(initialState);
    }
  });

  return (
    <Form>
      {/* Form fields */}
    </Form>
  );
}
```

**Form Alanları:**
- Sınav Türü (TYT/AYT)
- Ders (Matematik, Fizik, etc.)
- Konu
- Doğru/Yanlış/Boş sayısı
- Yanlış konular (array)
- Çalışma süresi (dakika)
- Tarih

---

## BÖLÜM 4: SAYAÇ (TIMER)

### 4.1 client/src/sayfalar/sayac.tsx

**Özellikler:**
1. **Kronometre** - Basit sayaç (start/stop/reset)
2. **Pomodoro** - 25/5 dakika tekniği
3. **Alarmlar** - Zaman bazlı hatırlatıcılar

```typescript
function KronometreSection() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div>
      <div className="text-4xl font-bold">{formatTime(time)}</div>
      <Button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? 'Durdur' : 'Başlat'}
      </Button>
    </div>
  );
}
```

---

## BÖLÜM 5: NET HESAPLAYICI

### 5.1 client/src/sayfalar/net-hesaplayici.tsx

**Amaç:**
YKS net hesaplama (Doğru - Yanlış/4)

```typescript
function NetHesaplayici() {
  const [dogru, setDogru] = useState('');
  const [yanlis, setYanlis] = useState('');

  const net = useMemo(() => {
    const d = parseInt(dogru) || 0;
    const y = parseInt(yanlis) || 0;
    return (d - y / 4).toFixed(2);
  }, [dogru, yanlis]);

  return (
    <div>
      <Input value={dogru} onChange={e => setDogru(e.target.value)} placeholder="Doğru" />
      <Input value={yanlis} onChange={e => setYanlis(e.target.value)} placeholder="Yanlış" />
      <div className="text-2xl">Net: {net}</div>
    </div>
  );
}
```

---

## BÖLÜM 6: YKS KONULAR

### 6.1 client/src/sayfalar/yks-konular.tsx

**Amaç:**
TYT/AYT tüm konuları göster (checkbox ile işaretleme)

**Konular:**
- TYT: Türkçe, Matematik, Fen, Sosyal
- AYT: Matematik, Fizik, Kimya, Biyoloji, Edebiyat, Tarih, Coğrafya

```typescript
function YKSKonular() {
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);

  const toggleTopic = (topic: string) => {
    setCompletedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  return (
    <div>
      {konular.map(konu => (
        <div key={konu.id}>
          <Checkbox
            checked={completedTopics.includes(konu.id)}
            onCheckedChange={() => toggleTopic(konu.id)}
          />
          <span>{konu.name}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## BÖLÜM 7: BİLEŞENLER (COMPONENTS)

### 7.1 UI Components (shadcn/ui)

**Kullanılan shadcn Bileşenleri:**
- Button
- Card
- Dialog
- Form
- Input
- Select
- Checkbox
- Tabs
- Toast
- Tooltip

**Örnek Kullanım:**
```typescript
import { Button } from '@/bilesenler/arayuz/button';

<Button variant="default" size="lg" onClick={handleClick}>
  Kaydet
</Button>
```

### 7.2 Custom Components

**1. Header (Başlık)**
```typescript
export function Header() {
  return (
    <header className="bg-background border-b">
      <nav>
        <Link href="/">Ana Sayfa</Link>
        <Link href="/anasayfa">Görevler</Link>
        <Link href="/panel">Panel</Link>
      </nav>
      <ThemeToggle />
    </header>
  );
}
```

**2. AddTaskModal**
```typescript
export function AddTaskModal({ open, onOpenChange }: Props) {
  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: '',
      priority: 'medium',
      category: 'genel'
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Form {...form}>
          {/* Form fields */}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## BÖLÜM 8: KUTUPHANE (LIBRARY)

### 8.1 sorguIstemcisi.ts (Query Client)

```typescript
import { QueryClient } from '@tanstack/react-query';

export const sorguIstemcisi = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(queryKey[0] as string);
        if (!res.ok) throw new Error('Network error');
        return res.json();
      },
      staleTime: 5 * 60 * 1000, // 5 dakika
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest(url: string, method: string, data?: any) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) throw new Error('API error');
  return res.json();
}
```

---

## BÖLÜM 9: STYLING (index.css)

### 9.1 CSS Variables

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  /* ... */
}
```

### 9.2 Dark Mode Toggle

```typescript
export function ThemeProvider({ children }: Props) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

## ÖZET

**Client Sayfaları:**
1. ✅ `/` - Homepage
2. ✅ `/anasayfa` - Tasks (görevler)
3. ✅ `/panel` - Dashboard (raporlar, 8 sekme)
4. ✅ `/net-hesaplayici` - Net calculator
5. ✅ `/sayac` - Timer (kronometre, pomodoro, alarmlar)
6. ✅ `/yks-konular` - YKS konuları

**State Management:**
- TanStack Query (server state)
- useState (local state)
- useForm (form state)

**Styling:**
- Tailwind CSS
- shadcn/ui components
- Dark mode support

**Form Validation:**
- Zod schemas
- react-hook-form

**Optimistic Updates:**
- useMutation + queryClient.invalidateQueries

