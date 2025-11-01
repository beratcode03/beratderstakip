# YKS Analiz Takip Sistemi

## Overview

A comprehensive exam tracking and analysis system designed for Turkish students preparing for YKS (Yükseköğretim Kurumları Sınavı - Higher Education Institutions Exam). The application provides detailed analytics for practice exams, question logging, task management, study hour tracking, and performance visualization.

**Key Features:**
- Exam result tracking and analysis (TYT/AYT)
- Daily question logs with wrong topic tracking
- Task management with priorities and categories
- Study hours monitoring
- Performance graphs and charts
- Weather widget integration
- Countdown timers to exam dates
- Activity heatmaps
- Email reporting system
- Flashcard study system
- Desktop application (Electron)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Monorepo Structure

**Technology Stack:**
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (via Neon serverless) with Drizzle ORM
- **Desktop:** Electron (Windows application)
- **UI Components:** shadcn/ui + Tailwind CSS
- **State Management:** TanStack Query (React Query)
- **Validation:** Zod schemas

**Architectural Decisions:**

1. **Monorepo Pattern**
   - Single repository containing client, server, and shared code
   - Shared TypeScript types and Zod schemas between frontend/backend
   - Eliminates code duplication and ensures type safety across the stack

2. **Dual Storage Strategy**
   - **Development:** In-memory storage with JSON file persistence (`data/kayitlar.json`)
   - **Production:** PostgreSQL database via Drizzle ORM
   - Automatic fallback mechanism based on DATABASE_URL environment variable
   - Enables local development without database dependency

3. **Desktop-First Design**
   - Electron wrapper provides native Windows application experience
   - Embedded Express server runs internally
   - IPC (Inter-Process Communication) for activity logging
   - System tray integration with notifications

4. **Modular Component Architecture**
   - UI components in `client/src/bilesenler/arayuz/` (shadcn/ui)
   - Custom widgets in `client/src/bilesenler/`
   - Pages in `client/src/sayfalar/`
   - Reusable hooks in `client/src/hooks/`

5. **Type-Safe API Communication**
   - Shared Zod schemas validate both client and server data
   - Custom `apiRequest` utility handles HTTP requests
   - React Query manages caching and optimistic updates

6. **Turkish Language Codebase**
   - All variable names, comments, and UI text in Turkish
   - Aligns with target user base (Turkish students)
   - Path aliases use Turkish names (`@bilesenler`, `@sayfalar`, `@kutuphane`)

### Core Data Models

**Database Schema (shared/sema.ts):**
- `tasks` - Task management with priorities, categories, recurrence
- `moods` - Daily mood tracking with notes
- `goals` - Long-term goals with progress tracking
- `questionLogs` - Daily question solving records
- `examResults` - Exam results (TYT/AYT) with detailed scoring
- `examSubjectNets` - Per-subject net scores for each exam
- `studyHours` - Daily study time tracking
- `flashcards` - Spaced repetition flashcard system
- `setupCompleted` - First-time setup status

**Subject Limits:**
- Predefined maximum question counts for TYT/AYT subjects
- Enforced in validation schemas
- Used for net score calculations

### Key Features Implementation

1. **Exam Analysis System**
   - Full exam tracking (TYT/AYT general exams)
   - Branch-specific exam tracking (per subject)
   - Automatic net score calculation
   - Wrong topic categorization and tracking
   - Historical performance comparison

2. **Task Management**
   - Priority levels (low/medium/high)
   - Subject-based categories
   - Due dates and recurrence patterns
   - Drag-and-drop reordering (dnd-kit)
   - Archive and soft-delete functionality

3. **Activity Tracking**
   - Automatic activity logging via IPC (Electron)
   - Daily activity heatmap visualization
   - Weekly/monthly summaries
   - Streak tracking

4. **Email Reporting**
   - Monthly automated reports (SendGrid integration planned)
   - Manual report generation
   - HTML email templates with detailed analytics
   - Performance charts and statistics

5. **Weather Integration**
   - OpenWeather API integration
   - Hourly and daily forecasts
   - Study recommendations based on weather

## External Dependencies

### Third-Party Services

1. **Neon Database (PostgreSQL)**
   - Serverless PostgreSQL hosting
   - Connection via `@neondatabase/serverless` driver
   - DATABASE_URL environment variable configuration

2. **OpenWeather API**
   - Weather data for study planning
   - OPENWEATHER_API_KEY environment variable
   - Optional - application works without it

3. **SendGrid (Planned)**
   - Email delivery service for monthly reports
   - EMAIL_USER, EMAIL_PASS, EMAIL_FROM configuration
   - Currently uses nodemailer (can be configured with any SMTP)

### Key NPM Dependencies

**Frontend:**
- `react` + `react-dom` - UI framework
- `@tanstack/react-query` - Server state management
- `wouter` - Lightweight routing
- `@radix-ui/*` - Headless UI components (25+ components)
- `@dnd-kit/*` - Drag and drop functionality
- `tailwindcss` - Utility-first CSS framework
- `recharts` - Chart visualization library
- `zod` - Schema validation
- `lucide-react` - Icon library

**Backend:**
- `express` - Web server framework
- `drizzle-orm` - TypeScript ORM
- `@neondatabase/serverless` - Neon database driver
- `nodemailer` - Email sending
- `dotenv` - Environment variable management

**Desktop:**
- `electron` - Desktop application framework
- `electron-builder` - Application packaging
- `electron-store` - Persistent storage

**Development:**
- `vite` - Build tool and dev server
- `typescript` - Type checking
- `@playwright/test` - E2E testing
- `vitest` - Unit testing
- `esbuild` - Fast bundling for server code

### Database Schema Management

- **Drizzle Kit** for schema migrations
- Migration files in `migrations/` directory
- Schema defined in TypeScript (`shared/sema.ts`)
- Push-based deployment (`npm run db:push`)

### Build and Deployment

**Development Mode:**
- Vite dev server with HMR
- Express server with nodemon-like reload
- In-memory or JSON file storage

**Production Build:**
- Client: Vite bundle to `dist/public`
- Server: esbuild bundle to `server/dist`
- Static file serving from Express

**Electron Packaging:**
- Windows x64 installer
- Embedded Node.js server
- Portable executable option
- Auto-update capability (electron-builder)