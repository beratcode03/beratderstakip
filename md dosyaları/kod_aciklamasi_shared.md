# SHARED/SEMA.TS - DETAYLI KOD AÇIKLAMASI

## GİRİŞ

Bu doküman, paylaşılan veri şemasının (`shared/sema.ts`) tüm kodunu detaylı açıklar.

**Dosya Konumu:** `shared/sema.ts`  
**Satır Sayısı:** 316 satır  
**Amaç:** Frontend ve backend arasında paylaşılan TypeScript tipleri ve Zod validation şemaları

---

## BÖLÜM 1: NEDEN SHARED SCHEMA?

### 1.1 Monorepo Pattern

Bu proje full-stack JavaScript uygulamasıdır:
```
project/
├── client/          # Frontend (React + TypeScript)
├── server/          # Backend (Express + TypeScript)
└── shared/          # Paylaşılan kod
    └── sema.ts      # Veri şeması
```

**Shared Avantajları:**
1. **DRY Principle** - Don't Repeat Yourself
2. **Type Safety** - Client ve server aynı tip kullanır
3. **Single Source of Truth** - Tek yerden yönetilir
4. **Refactoring Easy** - Bir değişiklik her yerde geçerli

**Örnek:**
```typescript
// ✅ SHARED - Tek tanım
// shared/sema.ts
export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

// ❌ DUPLICATE - İki ayrı tanım
// client/types.ts
type Task = { id: string; title: string; completed: boolean; };

// server/types.ts
type Task = { id: string; title: string; completed: boolean; };
```

Eğer `priority` field eklemek isterseniz:
- Shared: Tek bir yerde değiştirin
- Duplicate: İki yerde değiştirin (hata riski)

### 1.2 Drizzle ORM + Zod

```typescript
import { pgTable, serial, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
```

**Teknoloji Stack:**

**1. Drizzle ORM**
- PostgreSQL için TypeScript ORM
- Type-safe database queries
- Schema definition

**2. Zod**
- Runtime validation
- TypeScript type inference
- Form validation

**3. drizzle-zod**
- Drizzle schema → Zod schema converter
- Otomatik validation schema oluşturur

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

**Detaylı Açıklama:**

**1. UUID Primary Key**
```typescript
id: varchar("id").primaryKey().default(sql`gen_random_uuid()`)
```

**Neden UUID?**
| UUID | Auto-increment ID |
|------|-------------------|
| Globally unique | Only locally unique |
| Offline oluşturulabilir | Server gerekli |
| Merge friendly | Conflict riski |

**SQL:** `gen_random_uuid()` → PostgreSQL built-in function

**2. Required vs Optional Fields**
```typescript
title: varchar("title").notNull(),      // Zorunlu
description: varchar("description"),    // Opsiyonel
```

**3. Default Values**
```typescript
completed: boolean("completed").default(false),
archived: boolean("archived").default(false),
deleted: boolean("deleted").default(false),
```

**Yeni task oluştururken:**
```typescript
const task = await storage.createTask({ title: "Test" });
// completed: false (otomatik)
// archived: false (otomatik)
// deleted: false (otomatik)
```

**4. Timestamp Field**
```typescript
createdAt: timestamp("created_at").defaultNow()
```
PostgreSQL `NOW()` fonksiyonu kullanılır.

**5. Array Fields**
```typescript
repeatDays: varchar("repeat_days").array(),
subtasks: varchar("subtasks").array(),
```

**DOĞRU SYNTAX:**
```typescript
.array()  // ✅ Method call
```

**YANLIŞ SYNTAX:**
```typescript
array(varchar())  // ❌ Function wrapper
```

**Database'de:**
```sql
repeat_days TEXT[]
subtasks TEXT[]
```

**Örnek değer:**
```typescript
repeatDays: ["Pazartesi", "Çarşamba", "Cuma"]
subtasks: ["Alt görev 1", "Alt görev 2"]
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
Drizzle table → Zod schema conversion

**Otomatik generate:**
```typescript
z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  priority: z.string(),
  // ...
})
```

**2. omit() Fields**
```typescript
.omit({ id: true, createdAt: true, completedAt: true })
```

**Neden omit?**
- `id` → Database otomatik oluşturur (UUID)
- `createdAt` → Database otomatik oluşturur (NOW())
- `completedAt` → Task tamamlandığında set edilir

**Client form:**
```typescript
// ✅ Client sadece bu alanları gönderir
{
  title: "Matematik Çalış",
  priority: "high",
  category: "ders"
}

// ❌ Client bunları göndermez (otomatik)
{
  id: "...",          // Database oluşturur
  createdAt: "...",   // Database oluşturur
}
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

**z.infer:** Zod schema'dan TypeScript type çıkarır.

**Sonuç:**
```typescript
type InsertTask = {
  title: string;
  description?: string | undefined;
  priority: string;
  category: string;
  color?: string | undefined;
  // ... (id, createdAt, completedAt YOK)
}
```

**2. Task Type**
```typescript
export type Task = typeof tasks.$inferSelect;
```

**$inferSelect:** Drizzle table'dan full type çıkarır.

**Sonuç:**
```typescript
type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  category: string;
  completed: boolean;
  createdAt: Date;
  // ... (TÜM ALANLAR)
}
```

**3. Kullanım Örnekleri**

**Frontend (Form):**
```typescript
import { InsertTask } from '@shared/sema';

const formData: InsertTask = {
  title: "Matematik Çalış",
  priority: "high",
  category: "ders"
};
```

**Backend (Database):**
```typescript
import { Task } from '@shared/sema';

async function getTask(id: string): Promise<Task | undefined> {
  return storage.getTask(id);
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
  mood: "mutlu",
  energy: "yüksek",
  motivation: "çok iyi",
  notes: "Harika bir gün!",
  sleepHours: "8"
};
```

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
  description: "TYT Matematik netini 35'e çıkar",
  targetValue: "35",
  currentValue: "28",
  unit: "net",
  category: "tyt",
  timeframe: "aylık",
  targetDate: "2025-12-31"
};
```

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
  exam_type: "TYT",
  subject: "Matematik",
  topic: "Türev",
  correct_count: "25",
  wrong_count: "4",
  blank_count: "1",
  wrong_topics: ["Zincir Kuralı", "İkinci Türev"],
  time_spent_minutes: 35,
  study_date: "2025-10-30"
};
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
{ exam_type: "TYT", subject: "Matematik", correct_count: "10", wrong_count: "2", study_date: "2025-10-30" }

// ❌ INVALID - exam_type
{ exam_type: "LGS", ... }  // Sadece TYT veya AYT olabilir

// ❌ INVALID - time_spent_minutes type
{ ..., time_spent_minutes: "35" }  // String değil, number olmalı
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

**Genel Deneme Örneği:**
```typescript
const genelDeneme: InsertExamResult = {
  exam_name: "TYT Deneme 5",
  exam_date: "2025-10-30",
  exam_type: "TYT",
  exam_scope: "full",
  tyt_net: "85.5",
  subjects_data: JSON.stringify({
    turkce: { net: "32.5", correct: "35", wrong: "10" },
    matematik: { net: "28.0", correct: "30", wrong: "8" }
  }),
  ranking: "12350",
  time_spent_minutes: 150
};
```

**Branş Deneme Örneği:**
```typescript
const bransDeneme: InsertExamResult = {
  exam_name: "Matematik Branş Deneme",
  exam_date: "2025-10-30",
  exam_type: "TYT",
  exam_scope: "branch",
  selected_subject: "Matematik",
  subjects_data: JSON.stringify({
    matematik: { net: "32.0", correct: "35", wrong: "12" }
  }),
  time_spent_minutes: 40
};
```

---

## BÖLÜM 4: ZOD VALIDATION DETAYLARI

### 4.1 Zod Schema Types

```typescript
z.string()                    // String
z.number()                    // Number
z.boolean()                   // Boolean
z.enum(["a", "b"])           // Enum (literal values)
z.array(z.string())          // Array of strings
z.string().optional()        // String | undefined
z.string().nullable()        // String | null
z.string().nullable().optional()  // String | null | undefined
```

### 4.2 Validation Rules

```typescript
// Görev için custom validation
export const insertTaskSchema = createInsertSchema(tasks)
  .omit({ id: true, createdAt: true, completedAt: true })
  .extend({
    title: z.string().min(1, "Başlık gereklidir").max(200, "Başlık çok uzun"),
    priority: z.enum(["low", "medium", "high"], {
      errorMap: () => ({ message: "Geçersiz öncelik" })
    }),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Geçersiz tarih formatı").optional()
  });
```

**Validation Örnekleri:**
```typescript
// ✅ VALID
insertTaskSchema.parse({
  title: "Matematik Çalış",
  priority: "high",
  category: "ders"
});

// ❌ INVALID - title empty
insertTaskSchema.parse({ title: "", priority: "high", category: "ders" });
// Error: "Başlık gereklidir"

// ❌ INVALID - priority
insertTaskSchema.parse({ title: "Test", priority: "urgent", category: "ders" });
// Error: "Geçersiz öncelik"
```

---

## ÖZET

**Shared Schema Faydaları:**
1. ✅ Type safety (frontend + backend)
2. ✅ Runtime validation (Zod)
3. ✅ Single source of truth
4. ✅ DRY principle
5. ✅ Refactoring easy

**Schema'lar:**
1. `tasks` - Görevler
2. `moods` - Ruh hali
3. `goals` - Hedefler
4. `questionLogs` - Soru günlükleri
5. `examResults` - Sınav sonuçları
6. `flashcards` - Flashcard'lar
7. `examSubjectNets` - Deneme ders netleri
8. `studyHours` - Çalışma saatleri

**Type System:**
```
Drizzle Table → createInsertSchema() → Zod Schema → z.infer<> → TypeScript Type
```

