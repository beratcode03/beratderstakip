# KÖK DİZİN DOSYALARI - DETAYLI AÇIKLAMA

**📑 Hızlı Navigasyon:** [Ana Sayfa](../replit.md) | [Talimatlar](./talimatlar.md) | [Teknik Mimari](./teknik_mimari.md) | [Client Kodu](./kod_aciklamasi_client.md) | [Server Kodu](./kod_aciklamasi_server.md) | [Shared Kodu](./kod_aciklamasi_shared.md) | [Electron](./kod_aciklamasi_electron1.md) | [Testler](./kod_aciklamasi_testler.md)

---

## 📚 İçindekiler

- [GİRİŞ](#giris)
- [BÖLÜM 1: package.json](#bolum-1-packagejson)
  - [1.1 Metadata](#11-metadata)
  - [1.2 Scripts](#12-scripts)
  - [1.3 Dependencies](#13-dependencies)
  - [1.4 DevDependencies](#14-devdependencies)
- [BÖLÜM 2: tsconfig.json](#bolum-2-tsconfigjson)
- [BÖLÜM 3: vite.config.ts](#bolum-3-viteconfigts)
- [BÖLÜM 4: tailwind.config.ts](#bolum-4-tailwindconfigts)
- [BÖLÜM 5: playwright.config.ts](#bolum-5-playwrightconfigts)
- [BÖLÜM 6: drizzle.config.ts](#bolum-6-drizzleconfigts)
- [BÖLÜM 7: .gitignore](#bolum-7-gitignore)
- [ÖZET](#ozet)

---

## GİRİŞ

Bu doküman, projenin kök dizinindeki tüm konfigürasyon dosyalarını detaylı açıklar.

**Kök Dizin Dosyaları:**
- `package.json` - Dependencies, scripts, metadata
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite bundler configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `playwright.config.ts` - Playwright test configuration
- `.gitignore` - Git ignore rules
- `drizzle.config.ts` - Drizzle ORM configuration

---

## BÖLÜM 1: package.json

### 1.1 Metadata

```json
{
  "name": "berat-yks-analiz",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Berat Cankır YKS Analiz Takip Sistemi",
  "author": "Berat Cankır"
}
```

**Detaylı Açıklama:**

**1. name**
```json
"name": "berat-yks-analiz"
```
NPM package adı (lowercase, dash-separated).

**2. version**
```json
"version": "1.0.0"
```
Semantic versioning: MAJOR.MINOR.PATCH

**3. private**
```json
"private": true
```
NPM registry'ye publish edilmesini engeller (güvenlik).

**4. type: module**
```json
"type": "module"
```
ESM (ES Modules) kullan, CommonJS değil.

```javascript
// ✅ ESM
import express from 'express';

// ❌ CommonJS
const express = require('express');
```

### 1.2 Scripts

```json
{
  "scripts": {
    "dev": "tsx watch server/index.ts",
    "build": "vite build",
    "start": "NODE_ENV=production tsx server/index.ts",
    "test": "playwright test",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

**Detaylı Açıklama:**

**1. dev - Development Server**
```json
"dev": "tsx watch server/index.ts"
```

**tsx:** TypeScript executor (ts-node alternative, daha hızlı)  
**watch:** Dosya değişikliklerinde otomatik restart

**Çalıştırma:**
```bash
npm run dev
```

**2. build - Production Build**
```json
"build": "vite build"
```

Frontend kodunu build eder:
- TypeScript → JavaScript
- Minification
- Bundling
- Tree shaking

**Output:** `dist/` klasörü

**3. start - Production Server**
```json
"start": "NODE_ENV=production tsx server/index.ts"
```

Production mode'da server başlatır:
- Static file serving (`dist/`)
- No HMR
- Optimized

**4. test - Playwright Tests**
```json
"test": "playwright test"
```

E2E testleri çalıştırır.

**5. db:push - Database Schema Sync**
```json
"db:push": "drizzle-kit push"
```

Drizzle schema'yı database'e push eder (migration olmadan).

**6. db:studio - Database GUI**
```json
"db:studio": "drizzle-kit studio"
```

Web-based database viewer açar.

### 1.3 Dependencies

```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "@radix-ui/react-*": "...",
    "drizzle-orm": "^0.36.4",
    "express": "^4.21.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^3.4.15",
    "vite": "^5.4.11",
    "zod": "^3.23.8"
  }
}
```

**Ana Dependencies:**

**1. @neondatabase/serverless**
PostgreSQL client for Neon (serverless database).

**2. @radix-ui/react-***
Headless UI components (accessible, unstyled).

**3. drizzle-orm**
TypeScript ORM for PostgreSQL.

**4. express**
Backend server framework.

**5. react + react-dom**
Frontend library.

**6. tailwindcss**
Utility-first CSS framework.

**7. vite**
Frontend build tool (fast, modern).

**8. zod**
Schema validation library.

### 1.4 DevDependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "@types/express": "^5.0.0",
    "@types/node": "^22.9.0",
    "@types/react": "^18.3.12",
    "@vitejs/plugin-react": "^4.3.3",
    "drizzle-kit": "^0.29.1",
    "tsx": "^4.19.2",
    "typescript": "^5.6.3"
  }
}
```

**Ana DevDependencies:**

**1. @playwright/test**
E2E testing framework.

**2. @types/***
TypeScript type definitions.

**3. @vitejs/plugin-react**
Vite React plugin (JSX transform, HMR).

**4. drizzle-kit**
Drizzle CLI tools (migration, studio).

**5. tsx**
TypeScript executor (development).

**6. typescript**
TypeScript compiler.

---

## BÖLÜM 2: tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"],
      "@assets/*": ["./attached_assets/*"]
    }
  },
  "include": ["client", "server", "shared"],
  "exclude": ["node_modules", "dist"]
}
```

**Detaylı Açıklama:**

**1. target: ES2020**
```json
"target": "ES2020"
```
Output JavaScript version (ES2020 features).

**2. module: ESNext**
```json
"module": "ESNext"
```
Module system (ES modules).

**3. lib**
```json
"lib": ["ES2020", "DOM", "DOM.Iterable"]
```
Type definitions to include:
- ES2020 → Standard library
- DOM → Browser APIs
- DOM.Iterable → Array, Map iteration

**4. jsx: react-jsx**
```json
"jsx": "react-jsx"
```
Modern JSX transform (no React import needed).

```typescript
// ✅ NEW (react-jsx)
export default function App() {
  return <div>Hello</div>;
}

// ❌ OLD (react)
import React from 'react';
export default function App() {
  return <div>Hello</div>;
}
```

**5. moduleResolution: bundler**
```json
"moduleResolution": "bundler"
```
Vite/bundler-aware module resolution.

**6. strict: true**
```json
"strict": true
```
All strict type-checking options enabled:
- strictNullChecks
- strictFunctionTypes
- strictBindCallApply
- etc.

**7. paths (Aliases)**
```json
"paths": {
  "@/*": ["./client/src/*"],
  "@shared/*": ["./shared/*"],
  "@assets/*": ["./attached_assets/*"]
}
```

**Kullanım:**
```typescript
// ✅ Alias ile
import { Button } from '@/components/ui/button';
import { Task } from '@shared/sema';
import logo from '@assets/logo.png';

// ❌ Relative path (uzun)
import { Button } from '../../../components/ui/button';
```

**8. include/exclude**
```json
"include": ["client", "server", "shared"],
"exclude": ["node_modules", "dist"]
```

TypeScript hangi dosyaları compile etsin?

---

## BÖLÜM 3: vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@assets": path.resolve(__dirname, "./attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false,
    host: "0.0.0.0",
  },
});
```

**Detaylı Açıklama:**

**1. plugins**
```typescript
plugins: [react()]
```
React plugin ekler (JSX transform, HMR, Fast Refresh).

**2. resolve.alias**
```typescript
alias: {
  "@": path.resolve(__dirname, "./client/src"),
  "@shared": path.resolve(__dirname, "./shared"),
  "@assets": path.resolve(__dirname, "./attached_assets"),
}
```
Import alias'ları tanımlar (tsconfig.json ile sync).

**3. root**
```typescript
root: path.resolve(__dirname, "client")
```
Vite dev server'ın root klasörü (HTML entry point).

**4. build.outDir**
```typescript
build: {
  outDir: path.resolve(__dirname, "dist"),
  emptyOutDir: true,
}
```
Build çıktısı `dist/` klasörüne (önce temizlenir).

**5. server.host: "0.0.0.0"**
```typescript
server: {
  host: "0.0.0.0",
}
```
Tüm network interface'lerden erişim (LAN, Electron).

---

## BÖLÜM 4: tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./client/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... daha fazla renk
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

**Detaylı Açıklama:**

**1. darkMode: ["class"]**
```typescript
darkMode: ["class"]
```
Dark mode CSS class ile kontrol edilir.

```html
<!-- Light mode -->
<html>

<!-- Dark mode -->
<html class="dark">
```

**2. content**
```typescript
content: ["./client/src/**/*.{ts,tsx}"]
```
Tailwind hangi dosyalarda class kullanılıyor kontrol eder (tree shaking).

**3. theme.extend.colors**
```typescript
colors: {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
}
```

CSS variables kullanır (dynamic theming).

**CSS:**
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

**4. plugins**
```typescript
plugins: [require("tailwindcss-animate")]
```
Tailwind animation utilities ekler.

---

## BÖLÜM 5: playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './testler',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Detaylı Açıklama:**

**1. testDir**
```typescript
testDir: './testler'
```
Test dosyalarının konumu.

**2. fullyParallel: false**
```typescript
fullyParallel: false
```
Testler sıralı çalışır (database state shared).

**3. workers: 1**
```typescript
workers: 1
```
Tek worker (parallel test yok).

**4. reporter: 'html'**
```typescript
reporter: 'html'
```
HTML test raporu oluşturur (`playwright-report/`).

**5. use.baseURL**
```typescript
use: {
  baseURL: 'http://localhost:5000',
}
```
Tüm testlerde default base URL.

```typescript
// ✅ Kısa
await page.goto('/anasayfa');

// ❌ Uzun
await page.goto('http://localhost:5000/anasayfa');
```

**6. webServer**
```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:5000',
  reuseExistingServer: !process.env.CI,
}
```

Testler çalışmadan önce dev server otomatik başlatılır.

---

## BÖLÜM 6: drizzle.config.ts

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/sema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Detaylı Açıklama:**

**1. out: "./migrations"**
```typescript
out: "./migrations"
```
Migration dosyalarının konumu.

**2. schema: "./shared/sema.ts"**
```typescript
schema: "./shared/sema.ts"
```
Drizzle schema definition dosyası.

**3. dialect: "postgresql"**
```typescript
dialect: "postgresql"
```
Database type (PostgreSQL).

**4. dbCredentials**
```typescript
dbCredentials: {
  url: process.env.DATABASE_URL!,
}
```
Database connection string (environment variable).

---

## BÖLÜM 7: .gitignore

```
node_modules/
dist/
.env
*.log
playwright-report/
test-results/
.DS_Store
```

**Detaylı Açıklama:**

**1. node_modules/**
Dependencies (npm install ile tekrar indirilir).

**2. dist/**
Build çıktısı (build ile tekrar oluşturulur).

**3. .env**
Environment variables (SECRET, güvenlik).

**4. *.log**
Log dosyaları (debug, error logs).

**5. playwright-report/**
Test report çıktısı.

**6. test-results/**
Test screenshots, videos.

**7. .DS_Store**
macOS system file (gereksiz).

---

## ÖZET

**Kök Dizin Dosyaları:**

| Dosya | Amaç |
|-------|------|
| package.json | Dependencies, scripts, metadata |
| tsconfig.json | TypeScript configuration |
| vite.config.ts | Vite bundler configuration |
| tailwind.config.ts | Tailwind CSS configuration |
| playwright.config.ts | Playwright test configuration |
| drizzle.config.ts | Drizzle ORM configuration |
| .gitignore | Git ignore rules |

**Teknoloji Stack:**
- **Build Tool:** Vite
- **Language:** TypeScript
- **Frontend:** React + Tailwind CSS
- **Backend:** Express
- **Database:** PostgreSQL (Neon)
- **ORM:** Drizzle
- **Testing:** Playwright
- **Validation:** Zod

