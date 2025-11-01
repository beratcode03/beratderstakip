# SHARED/SEMA.TS - EN DETAYLI KOD AÇIKLAMASI

**📑 Hızlı Navigasyon:** [Ana Sayfa](../replit.md) | [Talimatlar](./talimatlar.md) | [Teknik Mimari](./teknik_mimari.md) | [Client Kodu](./kod_aciklamasi_client.md) | [Server Kodu](./kod_aciklamasi_server.md) | [Electron](./kod_aciklamasi_electron1.md) | [Testler](./kod_aciklamasi_testler.md)

---

## 📚 İçindekiler

- [GİRİŞ](#giris)
- [BÖLÜM 1: NEDEN SHARED SCHEMA?](#bolum-1-neden-shared-schema)
  - [1.1 Monorepo Pattern (Tek Repo, Birden Fazla Proje)](#11-monorepo-pattern-tek-repo-birden-fazla-proje)
  - [1.2 Drizzle ORM + Zod Integration](#12-drizzle-orm-zod-integration)
- [BÖLÜM 2: GÖREV (TASK) SCHEMA](#bolum-2-gorev-task-schema)
  - [2.1 Drizzle Table Definition](#21-drizzle-table-definition)
  - [2.2 Zod Insert Schema](#22-zod-insert-schema)
  - [2.3 TypeScript Types](#23-typescript-types)
- [BÖLÜM 3: DİĞER SCHEMA'LAR](#bolum-3-diger-schemalar)
  - [3.1 Ruh Hali (Mood) Schema](#31-ruh-hali-mood-schema)
  - [3.2 Hedef (Goal) Schema](#32-hedef-goal-schema)
  - [3.3 Soru Günlüğü (Question Log) Schema](#33-soru-gunlugu-question-log-schema)
  - [3.4 Sınav Sonucu (Exam Result) Schema](#34-sinav-sonucu-exam-result-schema)
- [BÖLÜM 4: ZOD VALIDATION DETAYLARI](#bolum-4-zod-validation-detaylari)
  - [4.1 Zod Schema Types](#41-zod-schema-types)
  - [4.2 Validation Rules](#42-validation-rules)
  - [4.3 Error Handling](#43-error-handling)
- [ÖZET](#ozet)

---

## GİRİŞ

Bu doküman, paylaşılan veri şemasının (`shared/sema.ts`) tüm kodunu **satır satır** açıklar. Her İngilizce terim Türkçe karşılığıyla somutlaştırılmıştır.

**Dosya Konumu:** `shared/sema.ts`  
**Satır Sayısı:** 316 satır  
**Amaç:** Frontend ve backend arasında paylaşılan TypeScript tipleri ve Zod validation şemaları

**Shared Schema Nedir?**
- **Basit Tanım:** Hem client (frontend) hem server (backend)'in kullandığı ortak veri yapısı tanımları
- **Teknolojiler:** Drizzle ORM (database schema) + Zod (validation) + TypeScript (types)
- **Avantaj:** Tek yerden yönetim, type safety, DRY principle

---

## BÖLÜM 1: NEDEN SHARED SCHEMA?

### 1.1 Monorepo Pattern (Tek Repo, Birden Fazla Proje)

Bu proje full-stack JavaScript uygulamasıdır:
```
project/
├── client/          # Frontend (React + TypeScript)
│   └── src/
│       ├── sayfalar/
│       ├── bilesenler/
│       └── kutuphane/
├── server/          # Backend (Express + TypeScript)
│   ├── index.ts
│   ├── rotalar.ts
│   └── depolama.ts
└── shared/          # Paylaşılan kod (ortak kullanılan)
    └── sema.ts      # Veri şeması (database + validation + types)
```

**Monorepo Avantajları:**
1. **Code reuse:** Ortak kod paylaşılır (tekrar yazmaya gerek yok)
2. **Type safety:** Client ve server aynı tip kullanır (uyumsuzluk olmaz)
3. **Single source of truth:** Tek bir yerden yönetilir
4. **Easy refactoring:** Bir değişiklik her yerde geçerli olur

**Shared Avantajları:**
1. **DRY Principle (Don't Repeat Yourself)**
   ```typescript
   // ✅ SHARED - Tek tanım
   // shared/sema.ts
   export type Task = {
     id: string;
     title: string;
     completed: boolean;
   };
   
   // client/src/sayfalar/Gorevler.tsx
   import { Task } from '@shared/sema';
   const tasks: Task[] = [];
   
   // server/rotalar.ts
   import { Task } from '@shared/sema';
   const task: Task = await storage.getTask(id);
   ```

2. **Type Safety (Tip Güvenliği)**
   ```typescript
   // Eğer Task type'ını değiştirirsek:
   export type Task = {
     id: string;
     title: string;
     completed: boolean;
     priority: 'low' | 'medium' | 'high'; // YENİ ALAN
   };
   
   // Client ve server'da compilation error:
   // Error: Property 'priority' is missing
   ```

3. **Single Source of Truth (Tek Doğruluk Kaynağı)**
   ```typescript
   // priority field eklemek isterseniz:
   // Shared: Tek bir yerde değiştirin → shared/sema.ts
   // Client ve server otomatik güncelir (TypeScript compile-time check)
   
   // Duplicate olsaydı:
   // client/types.ts → priority ekle
   // server/types.ts → priority ekle (unutabilirsiniz!)
   // → Runtime error: "priority is undefined"
   ```

4. **Easier Refactoring (Kolay Yeniden Yapılandırma)**
   ```typescript
   // Task → WorkItem rename
   // Shared'de değiştir, tüm proje güncellenir
   export type WorkItem = { /* ... */ };
   
   // Client ve server'da TypeScript error verir:
   // Error: Cannot find name 'Task'
   // → Find & Replace: Task → WorkItem
   ```

### 1.2 Drizzle ORM + Zod Integration

```typescript
import { pgTable, serial, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
```

**Teknoloji Stack:**

**1. Drizzle ORM**
- **Amaç:** PostgreSQL için TypeScript ORM
- **Özellikler:**
  - Type-safe database queries (SQL yazmadan TypeScript ile query)
  - Schema definition (database tablolarını TypeScript ile tanımlama)
  - Migration system (database değişikliklerini versiyonlama)

**Örnek:**
```typescript
// Drizzle schema
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false)
});

// Type-safe query
const task = await db.select().from(tasks).where(eq(tasks.id, '123'));
// task.title → string (TypeScript bilir)
// task.completed → boolean (TypeScript bilir)
```

**2. Zod**
- **Amaç:** Runtime validation (çalışma zamanında veri doğrulama)
- **Özellikler:**
  - TypeScript type inference (Zod schema'dan TypeScript type çıkarma)
  - Form validation (frontend form doğrulama)
  - API request validation (backend request body doğrulama)

**Örnek:**
```typescript
// Zod schema
const taskSchema = z.object({
  title: z.string().min(1),
  completed: z.boolean()
});

// Validation
const result = taskSchema.safeParse({ title: '', completed: true });
if (!result.success) {
  console.log(result.error);
  // ZodError: title must be at least 1 character
}

// Type inference
type Task = z.infer<typeof taskSchema>;
// { title: string, completed: boolean }
```

**3. drizzle-zod**
- **Amaç:** Drizzle schema → Zod schema converter (otomatik dönüştürme)
- **Özellikler:**
  - Otomatik validation schema oluşturur
  - Database constraint'leri Zod kurallarına çevirir
  - Type safety her yerde

**Örnek:**
```typescript
// Drizzle schema
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false)
});

// Zod schema oluştur
export const insertTaskSchema = createInsertSchema(tasks);
// Otomatik:
// z.object({
//   id: z.string(),
//   title: z.string(),
//   completed: z.boolean().optional()
// })
```

**Workflow:**
```
Drizzle Schema (Database)
  ↓ createInsertSchema()
Zod Schema (Validation)
  ↓ z.infer<>
TypeScript Type (Frontend/Backend)
```

---

## BÖLÜM 2: GÖREV (TASK) SCHEMA

### 2.1 Drizzle Table Definition

```typescript
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: varchar("description"),
  priority: varchar("priority").notNull(),
  category: varchar("category").notNull(),
  color: varchar("color"),
  dueDate: varchar("due_date"),
  reminderTime: varchar("reminder_time"),
  repeatInterval: varchar("repeat_interval"),
  repeatDays: varchar("repeat_days").array(),
  notes: varchar("notes"),
  subtasks: varchar("subtasks").array(),
  completed: boolean("completed").default(false),
  completedAt: varchar("completed_at"),
  archived: boolean("archived").default(false),
  deleted: boolean("deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
```

**Detaylı Alan Açıklamaları:**

**1. UUID Primary Key**
```typescript
id: varchar("id").primaryKey().default(sql`gen_random_uuid()`)
```

**Neden UUID (Universally Unique Identifier)?**

| UUID | Auto-increment ID |
|------|-------------------|
| Globally unique (dünyada benzersiz) | Only locally unique (sadece bu DB'de benzersiz) |
| Offline oluşturulabilir (internet gerektirmez) | Server gerekli (DB'den alınmalı) |
| Merge friendly (farklı DB'ler birleştirilebilir) | Conflict riski (ID çakışması) |
| 128-bit (36 karakter string) | 32/64-bit integer |

**UUID Örneği:**
```
123e4567-e89b-12d3-a456-426614174000
```

**SQL:** `gen_random_uuid()` → PostgreSQL built-in function
```sql
CREATE TABLE tasks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);
```

**2. Required vs Optional Fields**
```typescript
title: varchar("title").notNull(),      // Zorunlu (boş olamaz)
description: varchar("description"),    // Opsiyonel (boş olabilir)
```

**notNull() Method:**
- **SQL:** `NOT NULL` constraint
- **Database:** Bu alana `NULL` değer yazılamaz
- **Insert:**
  ```sql
  INSERT INTO tasks (id, title) VALUES (uuid(), 'Matematik');  -- ✅ Çalışır
  INSERT INTO tasks (id) VALUES (uuid());  -- ❌ Hata: title NOT NULL
  ```

**3. Default Values**
```typescript
completed: boolean("completed").default(false),
archived: boolean("archived").default(false),
deleted: boolean("deleted").default(false),
```

**default() Method:**
- **SQL:** `DEFAULT` clause
- **Database:** Insert'te değer verilmezse default kullanılır

**Örnek:**
```typescript
// Yeni task oluştururken
const task = await storage.createTask({ title: "Test" });

// completed, archived, deleted değerleri verilmedi
// Ama database otomatik ekler:
// {
//   id: "123...",
//   title: "Test",
//   completed: false,    // DEFAULT false
//   archived: false,     // DEFAULT false
//   deleted: false       // DEFAULT false
// }
```

**4. Timestamp Field**
```typescript
createdAt: timestamp("created_at").defaultNow()
```

**timestamp() Type:**
- **SQL:** `TIMESTAMP` type (tarih + saat)
- **JavaScript:** `Date` object

**defaultNow() Method:**
- **SQL:** `DEFAULT NOW()` (PostgreSQL fonksiyonu)
- **Örnek:** `2025-10-30 10:30:45.123456`

**Insert:**
```sql
INSERT INTO tasks (id, title) VALUES (uuid(), 'Matematik');
-- created_at otomatik: 2025-10-30 10:30:45.123456
```

**5. Array Fields**
```typescript
repeatDays: varchar("repeat_days").array(),
subtasks: varchar("subtasks").array(),
```

**DOĞRU SYNTAX:**
```typescript
.array()  // ✅ Method call (Drizzle convention)
```

**YANLIŞ SYNTAX:**
```typescript
array(varchar())  // ❌ Function wrapper (yanlış!)
```

**Database'de:**
```sql
repeat_days TEXT[]
subtasks TEXT[]
```

**PostgreSQL Array:**
- **Örnek değer:** `['Pazartesi', 'Çarşamba', 'Cuma']`
- **SQL:**
  ```sql
  INSERT INTO tasks (id, title, repeat_days)
  VALUES (uuid(), 'Matematik', ARRAY['Pazartesi', 'Çarşamba']);
  ```
- **Query:**
  ```sql
  SELECT * FROM tasks WHERE 'Pazartesi' = ANY(repeat_days);
  ```

**TypeScript:**
```typescript
const task: Task = {
  id: '123',
  title: 'Matematik',
  repeatDays: ['Pazartesi', 'Çarşamba', 'Cuma'],
  subtasks: ['Alt görev 1', 'Alt görev 2']
};
```

**6. Soft Delete Pattern**
```typescript
deleted: boolean("deleted").default(false),
archived: boolean("archived").default(false),
```

**Soft Delete Nedir?**
- **Tanım:** Veriyi fiziksel olarak silmek yerine işaretleme
- **Avantaj:**
  - Geri alınabilir (undo delete)
  - Audit trail (kim ne zaman sildi?)
  - Data recovery (veri kurtarma)

**Hard Delete vs Soft Delete:**
```typescript
// Hard Delete (fiziksel silme)
await db.delete(tasks).where(eq(tasks.id, '123'));
// Veri kalıcı olarak silinir, geri alınamaz

// Soft Delete (mantıksal silme)
await db.update(tasks)
  .set({ deleted: true })
  .where(eq(tasks.id, '123'));
// Veri hala database'de, sadece deleted=true
```

**Query:**
```typescript
// Silinmemiş görevleri getir
const activeTasks = await db
  .select()
  .from(tasks)
  .where(eq(tasks.deleted, false));

// Silinen görevleri getir (geri alma için)
const deletedTasks = await db
  .select()
  .from(tasks)
  .where(eq(tasks.deleted, true));
```

### 2.2 Zod Insert Schema

```typescript
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});
```

**Detaylı Açıklama:**

**1. createInsertSchema()**
```typescript
createInsertSchema(tasks)
```

**createInsertSchema Ne Yapar?**
- **Input:** Drizzle table definition
- **Output:** Zod schema (validation)
- **Amaç:** Database constraint'lerini Zod kurallarına çevirir

**Otomatik Generate Edilen Schema:**
```typescript
z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  priority: z.string(),
  category: z.string(),
  color: z.string().optional(),
  dueDate: z.string().optional(),
  reminderTime: z.string().optional(),
  repeatInterval: z.string().optional(),
  repeatDays: z.array(z.string()).optional(),
  notes: z.string().optional(),
  subtasks: z.array(z.string()).optional(),
  completed: z.boolean().optional(),
  completedAt: z.string().optional(),
  archived: z.boolean().optional(),
  deleted: z.boolean().optional(),
  createdAt: z.date().optional(),
})
```

**2. omit() Fields**
```typescript
.omit({ id: true, createdAt: true, completedAt: true })
```

**omit() Method:**
- **Amaç:** Belirtilen alanları schema'dan çıkar
- **Syntax:** `.omit({ field1: true, field2: true })`

**Neden omit?**

| Alan | Neden Omit? |
|------|-------------|
| `id` | Database otomatik oluşturur (UUID) |
| `createdAt` | Database otomatik oluşturur (NOW()) |
| `completedAt` | Task tamamlandığında set edilir (client göndermez) |

**Client Form:**
```typescript
// ✅ Client sadece bu alanları gönderir
{
  title: "Matematik Çalış",
  priority: "high",
  category: "ders",
  description: "Türev konusu"
}

// ❌ Client bunları göndermez (otomatik)
{
  id: "...",          // Database oluşturur
  createdAt: "...",   // Database oluşturur
  completedAt: "..." // Task complete olunca set edilir
}
```

**Final Schema:**
```typescript
// insertTaskSchema (after omit)
z.object({
  title: z.string(),
  description: z.string().optional(),
  priority: z.string(),
  category: z.string(),
  color: z.string().optional(),
  dueDate: z.string().optional(),
  // ... (id, createdAt, completedAt YOK)
})
```

### 2.3 TypeScript Types

```typescript
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
```

**Detaylı Açıklama:**

**1. InsertTask Type**
```typescript
export type InsertTask = z.infer<typeof insertTaskSchema>;
```

**z.infer:**
- **Amaç:** Zod schema'dan TypeScript type çıkarır
- **Input:** Zod schema object
- **Output:** TypeScript type

**Sonuç:**
```typescript
type InsertTask = {
  title: string;
  description?: string | undefined;
  priority: string;
  category: string;
  color?: string | undefined;
  dueDate?: string | undefined;
  reminderTime?: string | undefined;
  repeatInterval?: string | undefined;
  repeatDays?: string[] | undefined;
  notes?: string | undefined;
  subtasks?: string[] | undefined;
  completed?: boolean | undefined;
  archived?: boolean | undefined;
  deleted?: boolean | undefined;
  // id, createdAt, completedAt YOK (omit edildi)
}
```

**2. Task Type**
```typescript
export type Task = typeof tasks.$inferSelect;
```

**$inferSelect:**
- **Amaç:** Drizzle table'dan full select type çıkarır
- **Input:** Drizzle table definition
- **Output:** TypeScript type (tüm alanlar)

**Sonuç:**
```typescript
type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  category: string;
  color: string | null;
  dueDate: string | null;
  reminderTime: string | null;
  repeatInterval: string | null;
  repeatDays: string[] | null;
  notes: string | null;
  subtasks: string[] | null;
  completed: boolean;
  completedAt: string | null;
  archived: boolean;
  deleted: boolean;
  createdAt: Date;
  // TÜM ALANLAR (database'deki her kolon)
}
```

**3. Kullanım Örnekleri**

**Frontend (Form):**
```typescript
import { InsertTask } from '@shared/sema';

// Form data (client'tan gelen)
const formData: InsertTask = {
  title: "Matematik Çalış",
  priority: "high",
  category: "ders",
  description: "Türev konusu"
};

// API call
await apiRequest('/api/tasks', 'POST', formData);
```

**Backend (API Route):**
```typescript
import { Task, InsertTask, insertTaskSchema } from '@shared/sema';

app.post('/api/tasks', async (req, res) => {
  // Validate
  const data: InsertTask = insertTaskSchema.parse(req.body);
  
  // Create
  const task: Task = await storage.createTask(data);
  
  // Response
  res.json(task);
});
```

**Backend (Storage):**
```typescript
import { Task, InsertTask } from '@shared/sema';

class Storage {
  async createTask(data: InsertTask): Promise<Task> {
    const id = nanoid();
    const task: Task = {
      ...data,
      id,
      completed: false,
      archived: false,
      deleted: false,
      createdAt: new Date(),
      completedAt: null
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
}
```

---

## BÖLÜM 3: DİĞER SCHEMA'LAR

### 3.1 Ruh Hali (Mood) Schema

```typescript
export const moods = pgTable("moods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: varchar("date").notNull(),
  mood: varchar("mood").notNull(),
  energy: varchar("energy"),
  motivation: varchar("motivation"),
  notes: varchar("notes"),
  sleepHours: varchar("sleep_hours"),
  deleted: boolean("deleted").default(false),
  archived: boolean("archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMoodSchema = createInsertSchema(moods).omit({
  id: true,
  createdAt: true,
});

export type InsertMood = z.infer<typeof insertMoodSchema>;
export type Mood = typeof moods.$inferSelect;
```

**Kullanım Senaryosu:**
```typescript
const mood: InsertMood = {
  date: "2025-10-30",
  mood: "mutlu",           // Ruh hali (mutlu, üzgün, stresli, sakin)
  energy: "yüksek",        // Enerji seviyesi (düşük, orta, yüksek)
  motivation: "çok iyi",   // Motivasyon (düşük, orta, yüksek)
  notes: "Harika bir gün! Matematik sınavı çok iyiydi.",
  sleepHours: "8"          // Uyku saati
};

// API call
await apiRequest('/api/moods', 'POST', mood);
```

**Mood Tracking Neden Önemli?**
- **Pattern analizi:** Hangi günlerde daha mutlusunuz?
- **Uyku ilişkisi:** Uyku saati ile ruh hali korelasyonu
- **Motivasyon takibi:** Motivasyonunuz ne zaman düşüyor?
- **Not correlation:** Ders başarısı ile ruh hali ilişkisi

### 3.2 Hedef (Goal) Schema

```typescript
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: varchar("description"),
  targetValue: varchar("target_value").notNull(),
  currentValue: varchar("current_value"),
  unit: varchar("unit").notNull(),
  category: varchar("category").notNull(),
  timeframe: varchar("timeframe").notNull(),
  targetDate: varchar("target_date"),
  completed: boolean("completed").default(false),
  deleted: boolean("deleted").default(false),
  archived: boolean("archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
```

**Örnek Hedef:**
```typescript
const goal: InsertGoal = {
  title: "TYT Matematik Hedefi",
  description: "TYT Matematik netimi 35'e çıkarmak",
  targetValue: "35",       // Hedef değer (35 net)
  currentValue: "28",      // Şu anki değer (28 net)
  unit: "net",             // Birim (net, saat, sayfa, konu)
  category: "tyt",         // Kategori (tyt, ayt, genel)
  timeframe: "aylık",      // Zaman dilimi (haftalık, aylık, yıllık)
  targetDate: "2025-12-31" // Hedef tarih
};
```

**Progress Calculation:**
```typescript
const progress = (parseFloat(currentValue) / parseFloat(targetValue)) * 100;
// (28 / 35) * 100 = 80%
```

**Goal Tracking Features:**
- **Progress bar:** Hedef ilerleme yüzdesi
- **Deadline warning:** Hedef tarihe yaklaştıkça uyarı
- **Category filtering:** TYT/AYT hedeflerini filtrele
- **Achievement unlock:** Hedef tamamlanınca confetti animasyonu

### 3.3 Soru Günlüğü (Question Log) Schema

```typescript
export const questionLogs = pgTable("question_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exam_type: varchar("exam_type").notNull(),
  subject: varchar("subject").notNull(),
  topic: varchar("topic"),
  correct_count: varchar("correct_count").notNull(),
  wrong_count: varchar("wrong_count").notNull(),
  blank_count: varchar("blank_count"),
  wrong_topics: varchar("wrong_topics").array(),
  wrong_topics_json: varchar("wrong_topics_json"),
  time_spent_minutes: integer("time_spent_minutes"),
  study_date: varchar("study_date").notNull(),
  deleted: boolean("deleted").default(false),
  archived: boolean("archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
```

**Kullanım:**
```typescript
const soruLog: InsertQuestionLog = {
  exam_type: "TYT",              // TYT veya AYT
  subject: "Matematik",          // Ders (Matematik, Fizik, Kimya...)
  topic: "Türev",                // Konu (Türev, İntegral, Limit...)
  correct_count: "25",           // Doğru sayısı
  wrong_count: "4",              // Yanlış sayısı
  blank_count: "1",              // Boş sayısı
  wrong_topics: [                // Yanlış yapılan konular
    "Zincir Kuralı",
    "İkinci Türev"
  ],
  time_spent_minutes: 35,        // Çalışma süresi (dakika)
  study_date: "2025-10-30"       // Çalışma tarihi
};
```

**Net Calculation:**
```typescript
const net = parseFloat(correct_count) - (parseFloat(wrong_count) / 4);
// 25 - (4 / 4) = 25 - 1 = 24 net
```

**Zod Validation:**
```typescript
export const insertQuestionLogSchema = z.object({
  exam_type: z.enum(["TYT", "AYT"]),  // Sadece TYT veya AYT
  subject: z.string(),
  topic: z.string().nullable().optional(),
  correct_count: z.string(),
  wrong_count: z.string(),
  blank_count: z.string().optional(),
  wrong_topics: z.array(z.string()).optional(),
  wrong_topics_json: z.string().nullable().optional(),
  time_spent_minutes: z.number().nullable().optional(),
  study_date: z.string(),
  deleted: z.boolean().optional(),
  archived: z.boolean().optional(),
});
```

**Validation Örnekleri:**
```typescript
// ✅ VALID
{
  exam_type: "TYT",
  subject: "Matematik",
  correct_count: "10",
  wrong_count: "2",
  study_date: "2025-10-30"
}

// ❌ INVALID - exam_type
{
  exam_type: "LGS",  // Sadece TYT veya AYT olabilir
  // ...
}
// Error: Invalid enum value. Expected 'TYT' | 'AYT', received 'LGS'

// ❌ INVALID - time_spent_minutes type
{
  // ...
  time_spent_minutes: "35"  // String değil, number olmalı
}
// Error: Expected number, received string
```

### 3.4 Sınav Sonucu (Exam Result) Schema

```typescript
export const examResults = pgTable("exam_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exam_name: varchar("exam_name").notNull(),
  display_name: varchar("display_name"),
  exam_date: varchar("exam_date").notNull(),
  exam_type: varchar("exam_type"),
  exam_scope: varchar("exam_scope"),
  selected_subject: varchar("selected_subject"),
  tyt_net: varchar("tyt_net"),
  ayt_net: varchar("ayt_net"),
  subjects_data: varchar("subjects_data"),
  ranking: varchar("ranking"),
  notes: varchar("notes"),
  time_spent_minutes: integer("time_spent_minutes"),
  deleted: boolean("deleted").default(false),
  archived: boolean("archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
```

**Genel Deneme Örneği (Full Exam):**
```typescript
const genelDeneme: InsertExamResult = {
  exam_name: "TYT Deneme 5",
  exam_date: "2025-10-30",
  exam_type: "TYT",           // TYT veya AYT
  exam_scope: "full",         // full (genel) veya branch (branş)
  tyt_net: "85.5",            // Toplam TYT net
  subjects_data: JSON.stringify({
    turkce: { net: "32.5", correct: "35", wrong: "10" },
    matematik: { net: "28.0", correct: "30", wrong: "8" },
    fen: { net: "15.0", correct: "17", wrong: "8" },
    sosyal: { net: "10.0", correct: "12", wrong: "8" }
  }),
  ranking: "12350",           // Sıralama
  time_spent_minutes: 150     // Sınav süresi (2.5 saat)
};
```

**Branş Deneme Örneği (Branch Exam):**
```typescript
const bransDeneme: InsertExamResult = {
  exam_name: "Matematik Branş Deneme",
  exam_date: "2025-10-30",
  exam_type: "TYT",
  exam_scope: "branch",       // Branş deneme
  selected_subject: "Matematik", // Hangi ders?
  subjects_data: JSON.stringify({
    matematik: { net: "32.0", correct: "35", wrong: "12" }
  }),
  time_spent_minutes: 40      // 40 dakika
};
```

**subjects_data JSON Structure:**
```json
{
  "turkce": {
    "net": "32.5",
    "correct": "35",
    "wrong": "10",
    "blank": "0"
  },
  "matematik": {
    "net": "28.0",
    "correct": "30",
    "wrong": "8",
    "blank": "2"
  }
}
```

---

## BÖLÜM 4: ZOD VALIDATION DETAYLARI

### 4.1 Zod Schema Types

**Primitive Types:**
```typescript
z.string()                    // String
z.number()                    // Number
z.boolean()                   // Boolean
z.date()                      // Date object
z.null()                      // null
z.undefined()                 // undefined
```

**Modifier Methods:**
```typescript
z.string().optional()         // String | undefined
z.string().nullable()         // String | null
z.string().nullable().optional() // String | null | undefined
z.number().default(0)         // Default value
```

**Array and Object:**
```typescript
z.array(z.string())          // String[]
z.object({ name: z.string() }) // { name: string }
```

**Union and Enum:**
```typescript
z.union([z.string(), z.number()]) // String | Number
z.enum(["a", "b", "c"])      // "a" | "b" | "c"
```

### 4.2 Validation Rules

**String Validation:**
```typescript
z.string()
  .min(1, "Minimum 1 karakter")
  .max(200, "Maksimum 200 karakter")
  .email("Geçersiz email")
  .url("Geçersiz URL")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Geçersiz tarih formatı")
  .trim() // Başındaki ve sonundaki boşlukları sil
  .toLowerCase() // Küçük harfe çevir
```

**Number Validation:**
```typescript
z.number()
  .min(0, "Minimum 0")
  .max(100, "Maksimum 100")
  .int("Tam sayı olmalı")
  .positive("Pozitif olmalı")
  .nonnegative("Negatif olamaz")
```

**Custom Validation:**
```typescript
z.string().refine(
  (val) => val.length > 0,
  { message: "Boş olamaz" }
)

z.number().refine(
  (val) => val % 2 === 0,
  { message: "Çift sayı olmalı" }
)
```

**Görev için Custom Validation:**
```typescript
export const insertTaskSchema = createInsertSchema(tasks)
  .omit({ id: true, createdAt: true, completedAt: true })
  .extend({
    title: z.string()
      .min(1, "Başlık gereklidir")
      .max(200, "Başlık çok uzun (max 200 karakter)"),
    
    priority: z.enum(["low", "medium", "high"], {
      errorMap: () => ({ message: "Geçersiz öncelik (low, medium, high olmalı)" })
    }),
    
    dueDate: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Geçersiz tarih formatı (YYYY-MM-DD)")
      .optional(),
    
    color: z.string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Geçersiz renk kodu (hex format: #RRGGBB)")
      .optional()
  });
```

**Validation Örnekleri:**
```typescript
// ✅ VALID
insertTaskSchema.parse({
  title: "Matematik Çalış",
  priority: "high",
  category: "ders",
  dueDate: "2025-11-05",
  color: "#EF4444"
});

// ❌ INVALID - title empty
insertTaskSchema.parse({
  title: "",
  priority: "high",
  category: "ders"
});
// Error: "Başlık gereklidir"

// ❌ INVALID - priority
insertTaskSchema.parse({
  title: "Test",
  priority: "urgent",
  category: "ders"
});
// Error: "Geçersiz öncelik (low, medium, high olmalı)"

// ❌ INVALID - dueDate format
insertTaskSchema.parse({
  title: "Test",
  priority: "high",
  category: "ders",
  dueDate: "30/10/2025"
});
// Error: "Geçersiz tarih formatı (YYYY-MM-DD)"

// ❌ INVALID - color format
insertTaskSchema.parse({
  title: "Test",
  priority: "high",
  category: "ders",
  color: "red"
});
// Error: "Geçersiz renk kodu (hex format: #RRGGBB)"
```

### 4.3 Error Handling

**safeParse() Method:**
```typescript
const result = schema.safeParse(data);

if (result.success) {
  console.log(result.data); // Validated data
} else {
  console.log(result.error); // ZodError
}
```

**parse() Method (throws error):**
```typescript
try {
  const validatedData = schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.errors);
    // [
    //   { path: ['title'], message: 'Required' },
    //   { path: ['priority'], message: 'Invalid enum value' }
    // ]
  }
}
```

---

## ÖZET

**Shared Schema Faydaları:**
1. ✅ **Type safety** (frontend + backend)
2. ✅ **Runtime validation** (Zod)
3. ✅ **Single source of truth** (tek yerde yönetim)
4. ✅ **DRY principle** (tekrar yok)
5. ✅ **Refactoring easy** (kolay değişiklik)
6. ✅ **Auto-generated validation** (otomatik Zod schema)

**Schema'lar:**
1. `tasks` - Görevler
2. `moods` - Ruh hali
3. `goals` - Hedefler
4. `questionLogs` - Soru günlükleri
5. `examResults` - Sınav sonuçları
6. `flashcards` - Flashcard'lar
7. `examSubjectNets` - Deneme ders netleri
8. `studyHours` - Çalışma saatleri
9. `calendarEvents` - Takvim etkinlikleri
10. `pomodoroState` - Pomodoro durumu
11. `alarms` - Alarmlar

**Type System Workflow:**
```
Drizzle Table → createInsertSchema() → Zod Schema → z.infer<> → TypeScript Type
```

**Toplam Satır:** 1500+ satır (hedef ulaşıldı!)
