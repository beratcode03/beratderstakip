# BERAT CANKIR YKS ANALİZ TAKİP SİSTEMİ - TEKNİK MİMARİ VE DOKÜMANTASYON

## GİRİŞ

Bu doküman, Berat Cankır YKS Analiz Takip Sistemi'nin teknik mimarisini, teknoloji seçimlerini ve proje yapısını detaylı olarak açıklar.

**Proje Özeti:**
- **Tür:** Hybrid Desktop + Web Application
- **Platform:** Electron (Desktop) + Web (Browser)
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Node.js + Express + Drizzle ORM
- **Database:** PostgreSQL (Production) / JSON File (Development/Offline)
- **UI Framework:** Tailwind CSS + shadcn/ui
- **State Management:** TanStack React Query v5

---

## MİMARİ GENEL BAKIŞ

### Katmanlı Mimari (Layered Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  React Components + shadcn/ui + Tailwind CSS                │
│  (client/src/sayfalar/, client/src/bilesenler/)            │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ HTTP REST API (fetch/axios)
               │
┌──────────────▼──────────────────────────────────────────────┐
│                    API LAYER                                 │
│  Express.js Routes + Middleware                              │
│  (server/rotalar.ts)                                        │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ Storage Interface (IStorage)
               │
┌──────────────▼──────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│  Storage Implementation (MemStorage / PgStorage)             │
│  (server/depolama.ts)                                       │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ Drizzle ORM / File System
               │
┌──────────────▼──────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  PostgreSQL Database / JSON File (kayitlar.json)            │
│  (shared/sema.ts for schema)                                │
└─────────────────────────────────────────────────────────────┘
```

**Katmanlar Arası İletişim:**
1. **Presentation → API:** HTTP REST calls via React Query
2. **API → Business Logic:** Direct function calls to storage interface
3. **Business Logic → Data:** Drizzle ORM queries or File I/O
4. **Data → Business Logic:** Query results or JSON data
5. **Business Logic → API:** Return values (Promise-based)
6. **API → Presentation:** JSON responses

---

## TEKNOLOJ İ SEÇİMLERİ VE GEREKÇELERİ

### 1. Electron - Desktop Application Framework

**Seçim Gerekçesi:**
- ✅ Cross-platform (Windows, macOS, Linux)
- ✅ Web teknolojileri ile native app yapmayı sağlar
- ✅ System tray, notifications, file system access
- ✅ Offline çalışabilme (internet gerektirmez)
- ✅ Güvenli local storage (JSON dosyaları)

**Alternatifler ve Neden Seçilmediler:**
- **Tauri:** Rust tabanlı, daha hafif ama ecosystem küçük
- **NW.js:** Daha eski, Electron kadar popüler değil
- **Qt/WPF/JavaFX:** Web teknolojisi bilgisi transfer edilemez

**Electron Versiyonu:**
```json
"electron": "latest"
```
- Chromium ve Node.js'in en güncel versiyonlarını kullanır

### 2. React 18 - UI Library

**Seçim Gerekçesi:**
- ✅ Component-based architecture (yeniden kullanılabilir bileşenler)
- ✅ Virtual DOM (performanslı rendering)
- ✅ Hooks API (state management ve side effects)
- ✅ Concurrent rendering (React 18 özelliği)
- ✅ Büyük ecosystem (npm paketi bolluğu)

**Alternatifler:**
- **Vue.js:** Daha basit ama ecosystem küçük
- **Svelte:** Derleme zamanında optimize eder ama yeni
- **Angular:** Enterprise için ağır, bu proje için overkill

**React Özellikleri:**
```typescript
// Functional components + hooks
import { useState, useEffect } from 'react';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => {
    fetchTasks().then(setTasks);
  }, []);
  
  return <div>{tasks.map(t => <TaskCard key={t.id} {...t} />)}</div>;
}
```

### 3. TypeScript - Typed JavaScript

**Seçim Gerekçesi:**
- ✅ Type safety (runtime hataları compile-time'da yakalar)
- ✅ Better IDE support (autocomplete, refactoring)
- ✅ Self-documenting code (types = documentation)
- ✅ Easier refactoring (type errors anında görünür)

**TypeScript Konfigürasyonu:**
```json
{
  "compilerOptions": {
    "strict": false,
    "module": "ESNext",
    "target": "ES2022",
    "jsx": "preserve"
  }
}
```

**Neden `strict: false`?**
- Development hızını artırır
- Bazı library type definitions eksik olabilir
- Production'da type safety still var (partial types bile yardımcı)

### 4. Vite - Build Tool

**Seçim Gerekçesi:**
- ✅ Çok hızlı HMR (Hot Module Replacement)
- ✅ ES modules native support
- ✅ Out-of-the-box TypeScript support
- ✅ Production build optimization

**Vite vs Webpack:**
| Özellik | Vite | Webpack |
|---------|------|---------|
| Dev server start | <1s | 5-10s |
| HMR | Instant | 1-2s |
| Build speed | Fast | Slower |
| Config | Simple | Complex |

**Vite Konfigürasyonu:**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true
  }
});
```

### 5. Express.js - Web Framework

**Seçim Gerekçesi:**
- ✅ Minimalist ve esnek
- ✅ Middleware ecosystem
- ✅ RESTful API için ideal
- ✅ Kolay öğrenme eğrisi

**Express vs Alternatifler:**
- **Fastify:** Daha hızlı ama ecosystem küçük
- **Koa:** Moderndir ama daha az popüler
- **NestJS:** Enterprise için ağır

**Express Middleware Stack:**
```typescript
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: false })); // URL-encoded parser
app.use((req, res, next) => { /* Logging */ });
app.use((err, req, res, next) => { /* Error handling */ });
```

### 6. Drizzle ORM - Type-Safe ORM

**Seçim Gerekçesi:**
- ✅ Full TypeScript support
- ✅ SQL-like syntax (kolay öğrenme)
- ✅ Migration system
- ✅ Lightweight (Prisma'dan daha hafif)

**Drizzle vs Alternatifler:**
- **Prisma:** Daha popüler ama binary dependency (Electron'da sorunlu)
- **TypeORM:** Decorator-based, daha ağır
- **Kysely:** Type-safe ama query builder, ORM değil

**Drizzle Şema Örneği:**
```typescript
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
```

### 7. TanStack React Query v5 - Data Fetching

**Seçim Gerekçesi:**
- ✅ Server state management (cache, refetch, invalidation)
- ✅ Automatic background refetching
- ✅ Optimistic updates
- ✅ Loading/error states otomatik

**React Query vs Alternatifler:**
- **SWR:** Benzer ama ecosystem küçük
- **Redux:** Global state için ağır
- **Zustand:** Local state için, server state için değil

**Query Örneği:**
```typescript
const { data: tasks, isLoading } = useQuery({
  queryKey: ['/api/tasks'],
  // queryFn otomatik fetch yapar (global config)
});
```

### 8. Tailwind CSS - Utility-First CSS

**Seçim Gerekçesi:**
- ✅ Rapid UI development
- ✅ No naming headaches (no BEM, no CSS modules)
- ✅ Production optimization (PurgeCSS)
- ✅ Responsive design kolaylığı

**Tailwind vs Alternatifler:**
- **Bootstrap:** Component-based, daha az flexible
- **Material-UI:** React-specific, daha ağır
- **Styled Components:** CSS-in-JS, runtime overhead

**Tailwind Örneği:**
```tsx
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Görev Ekle
</button>
```

### 9. shadcn/ui - Component Library

**Seçim Gerekçesi:**
- ✅ Copy-paste components (no npm dependency!)
- ✅ Full customization (Tailwind based)
- ✅ Accessible (Radix UI primitives)
- ✅ Modern design

**shadcn/ui vs Alternatifler:**
- **Chakra UI:** npm dependency, bundle size
- **Ant Design:** Opinionated design, hard to customize
- **Material-UI:** Heavy, React-specific

**Component Kullanımı:**
```tsx
import { Button } from "@/bilesenler/arayuz/button";
import { Dialog } from "@/bilesenler/arayuz/dialog";

<Button variant="destructive" onClick={deleteTask}>Sil</Button>
```

---

## PACKAGE.JSON DETAYLI AÇIKLAMA

### Dependencies (Production)

#### Core Dependencies

**1. express (^4.21.2)**
```json
"express": "^4.21.2"
```
- **Amaç:** HTTP server ve routing
- **Kullanım:** REST API endpoints (`/api/tasks`, `/api/exam-results`)
- **Alternatifsiz:** Express.js standard for Node.js web apps

**2. dotenv (^17.2.2)**
```json
"dotenv": "^17.2.2"
```
- **Amaç:** Environment variables yükleme (`.env` dosyasından)
- **Kullanım:** `DATABASE_URL`, `EMAIL_USER`, `OPENWEATHER_API_KEY`
- **Güvenlik:** Secrets git'e commit edilmez

**3. @neondatabase/serverless (^0.10.4)**
```json
"@neondatabase/serverless": "^0.10.4"
```
- **Amaç:** Neon PostgreSQL cloud database bağlantısı
- **Özellik:** Serverless, auto-scaling, connection pooling
- **Kullanım:** Production database (Replit environment)

#### React Ecosystem

**4. react + react-dom (^18.3.1)**
```json
"react": "^18.3.1",
"react-dom": "^18.3.1"
```
- **Amaç:** UI rendering
- **React 18 Özellikleri:**
  - Concurrent rendering
  - Automatic batching
  - Transitions API
  - Suspense improvements

**5. @tanstack/react-query (^5.60.5)**
```json
"@tanstack/react-query": "^5.60.5"
```
- **Amaç:** Server state management
- **Özellikler:**
  - Automatic caching
  - Background refetching
  - Optimistic updates
  - Dev tools

**v5 Değişiklikleri:**
- Object syntax zorunlu: `useQuery({ queryKey, queryFn })`
- `onSuccess`/`onError` deprecated, `useMutation` içinde kullan

**6. wouter (^3.3.5)**
```json
"wouter": "^3.3.5"
```
- **Amaç:** Client-side routing
- **Neden React Router değil?**
  - Çok daha hafif (2KB vs 20KB)
  - Hooks-based API
  - SSR desteği (gerekirse)
  
**Kullanım:**
```tsx
import { Route, Switch, Link } from 'wouter';

<Switch>
  <Route path="/" component={Homepage} />
  <Route path="/tasks" component={Tasks} />
</Switch>
```

#### UI & Styling

**7. tailwindcss + autoprefixer + postcss**
```json
"tailwindcss": "latest",
"autoprefixer": "latest",
"postcss": "latest"
```
- **Amaç:** Utility-first CSS framework
- **PostCSS:** CSS processing pipeline
- **Autoprefixer:** Browser compatibility (vendor prefixes)

**8. @radix-ui/* (Çoklu paket)**
```json
"@radix-ui/react-dialog": "^1.1.7",
"@radix-ui/react-select": "^2.1.7",
"@radix-ui/react-checkbox": "^1.1.5"
// ... 25+ Radix UI paketi
```
- **Amaç:** Accessible UI primitives
- **Özellikler:**
  - WAI-ARIA compliant
  - Keyboard navigation
  - Screen reader support
  - Unstyled (Tailwind ile style'lanır)

**9. lucide-react (^0.453.0)**
```json
"lucide-react": "^0.453.0"
```
- **Amaç:** Icon library
- **Özellikler:**
  - 1000+ icons
  - Tree-shakeable (sadece kullanılanlar bundle'a girer)
  - Customizable (size, color, stroke)

**Kullanım:**
```tsx
import { Check, X, Plus, Trash2 } from 'lucide-react';

<Button><Plus className="w-4 h-4 mr-2" /> Yeni Görev</Button>
```

#### Form & Validation

**10. react-hook-form (^7.55.0)**
```json
"react-hook-form": "^7.55.0"
```
- **Amaç:** Form state management
- **Özellikler:**
  - Minimal re-renders
  - Built-in validation
  - Easy integration with Zod

**11. zod + zod-validation-error**
```json
"zod": "^3.24.2",
"zod-validation-error": "^3.4.0"
```
- **Amaç:** Runtime type validation
- **Kullanım:**
  - Form validation (frontend)
  - API request validation (backend)
  - Type inference (TypeScript)

**Örnek:**
```typescript
const schema = z.object({
  title: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high'])
});

type Task = z.infer<typeof schema>; // TypeScript type
```

**12. @hookform/resolvers (^3.10.0)**
```json
"@hookform/resolvers": "^3.10.0"
```
- **Amaç:** react-hook-form + Zod entegrasyonu
- **Kullanım:** `zodResolver(schema)`

#### Database & ORM

**13. drizzle-orm + drizzle-zod**
```json
"drizzle-orm": "^0.39.1",
"drizzle-zod": "^0.7.0"
```
- **Amaç:** Type-safe ORM
- **drizzle-orm:** SQL query builder
- **drizzle-zod:** Drizzle → Zod schema converter

**Kullanım:**
```typescript
import { createInsertSchema } from 'drizzle-zod';

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true
});
```

**14. drizzle-kit**
```json
"drizzle-kit": "dev-dependency"
```
- **Amaç:** Database migrations
- **Komutlar:**
  - `npm run db:push` - Schema değişikliklerini DB'ye uygula
  - `drizzle-kit generate` - Migration dosyaları oluştur

#### Utilities

**15. date-fns (^3.6.0)**
```json
"date-fns": "^3.6.0"
```
- **Amaç:** Date manipulation
- **Neden moment.js değil?**
  - Moment.js deprecated
  - date-fns daha hafif (tree-shakeable)
  - Immutable (date'leri mutate etmez)

**Kullanım:**
```typescript
import { format, addDays, isBefore } from 'date-fns';

const tomorrow = addDays(new Date(), 1);
const formatted = format(tomorrow, 'dd/MM/yyyy');
```

**16. nanoid (^5.1.6)**
```json
"nanoid": "^5.1.6"
```
- **Amaç:** Unique ID generation
- **Özellikler:**
  - 21 karakter (URL-safe)
  - Collision-free
  - Daha güvenli than UUID

**Kullanım:**
```typescript
import { nanoid } from 'nanoid';

const taskId = nanoid(); // "V1StGXR8_Z5jdHi6B-myT"
```

**17. clsx + tailwind-merge**
```json
"clsx": "^2.1.1",
"tailwind-merge": "^2.6.0"
```
- **Amaç:** Conditional className'ler
- **clsx:** Conditional class names
- **tailwind-merge:** Conflicting Tailwind classes'ı merge eder

**Kullanım:**
```tsx
import { cn } from '@/kutuphane/utils'; // clsx + tailwind-merge

<Button className={cn(
  "bg-blue-500",
  isDisabled && "opacity-50 cursor-not-allowed"
)} />
```

#### Email & Communication

**18. nodemailer + @sendgrid/mail**
```json
"nodemailer": "^7.0.6",
"@sendgrid/mail": "^8.1.6"
```
- **Amaç:** Email gönderme
- **nodemailer:** Generic SMTP
- **SendGrid:** Cloud email service (production)

**Kullanım Senaryosu:**
- Öğrenciye hatırlatma maili gönder
- Deneme sonuçlarını email ile paylaş
- Backup verilerini mail at

#### Charts & Visualization

**19. recharts (^2.15.4)**
```json
"recharts": "^2.15.4"
```
- **Amaç:** React charts library
- **Chart Tipleri:**
  - Line charts (performans grafiği)
  - Bar charts (ders bazlı soru sayısı)
  - Pie charts (doğru/yanlış/boş dağılımı)

#### Testing

**20. @playwright/test + playwright**
```json
"@playwright/test": "^1.56.1",
"playwright": "^1.56.1"
```
- **Amaç:** E2E testing
- **Özellikler:**
  - Multi-browser testing (Chrome, Firefox, Safari)
  - Auto-wait (flakiness yok)
  - Screenshot & video recording
  - Network mocking

**21. vitest + @vitest/ui**
```json
"vitest": "^4.0.5",
"@vitest/ui": "^4.0.5"
```
- **Amaç:** Unit testing
- **Neden Jest değil?**
  - Vite entegrasyonu native
  - Daha hızlı
  - Modern API (Vite-compatible)

**22. @testing-library/react + @testing-library/jest-dom**
```json
"@testing-library/react": "^16.3.0",
"@testing-library/jest-dom": "^6.9.1"
```
- **Amaç:** React component testing
- **Felsefe:** Test user behavior, not implementation

#### Electron-Specific

**23. electron + electron-builder**
```json
"electron": "latest",
"electron-builder": "latest"
```
- **electron:** Desktop app framework
- **electron-builder:** Package & distribute app (.exe, .dmg, .AppImage)

**Build Özellikleri:**
- Code signing (Windows, macOS)
- Auto-update
- Installer generation
- Multiple platforms

**24. electron-updater**
```json
"electron-updater": "^6.6.2"
```
- **Amaç:** Auto-update mechanism
- **Özellikler:**
  - Automatic update check
  - Download & install updates
  - Staging/beta channels

---

## DEVAM EDECEK...

Bu dosya teknik mimari ve package.json açıklamalarının ilk bölümünü içeriyor.

**Toplam Satır:** 600+ satır
**Kalan Konular:**
- DevDependencies açıklama
- Scripts açıklama
- Proje klasör yapısı
- Environment variables
- Deployment stratejisi

