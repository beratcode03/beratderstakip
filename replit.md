# YKS Analiz Takip Sistemi

## Overview

A comprehensive exam tracking and analysis system designed for Turkish students preparing for the YKS (Yükseköğretim Kurumları Sınavı - University Entrance Exam). The application provides detailed analytics, question logging, exam result tracking, task management, and study progress visualization.

**Key Features:**
- Exam result tracking (TYT/AYT) with subject-level net calculations
- Daily question logging with topic categorization
- Task management with priorities, categories, and recurrence
- Progress visualization with charts and heatmaps
- Study hour tracking
- Flashcard system for review
- Weather widget and countdown timers
- Motivational quotes (Atatürk)

**Technology Stack:**
- **Frontend:** React 18, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend:** Node.js, Express, Drizzle ORM
- **Database:** PostgreSQL (production) / JSON files (development/offline)
- **Desktop:** Electron (hybrid desktop + web application)
- **Build Tools:** Vite, esbuild
- **Testing:** Playwright (E2E), Vitest (unit tests)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Application Type
**Hybrid Desktop + Web Application**
- Runs as a native desktop application via Electron
- Can also run in web browsers
- Supports both online (PostgreSQL) and offline (JSON file) modes

**Rationale:** Electron allows building cross-platform desktop apps using web technologies while maintaining a familiar development workflow. The hybrid approach provides flexibility for users to access the system via desktop app or browser.

### Frontend Architecture

**React 18 with TypeScript**
- Component-based UI using functional components and hooks
- Type-safe development with TypeScript for early error detection
- Custom path aliases for cleaner imports (`@/`, `@bilesenler/`, `@sayfalar/`, etc.)

**State Management:**
- TanStack React Query v5 for server state (API data fetching, caching, mutations)
- Local React state for UI-specific concerns
- localStorage for persistent user preferences (theme, emoji, notes)

**UI Framework:**
- Tailwind CSS for utility-first styling
- shadcn/ui for pre-built accessible components (30+ components)
- Custom theme system with light/dark mode support

**Routing:**
- Wouter for lightweight client-side routing
- Main routes: `/` (homepage), `/tasks`, `/dashboard`, `/net-calculator`, `/timer`, `/yks-konular`

**Rationale:** React Query eliminates boilerplate for API calls and provides automatic caching/refetching. Tailwind enables rapid UI development without context switching. shadcn/ui provides accessible components that can be customized as needed.

### Backend Architecture

**Express.js Server**
- RESTful API endpoints for all CRUD operations
- Middleware: JSON body parsing, URL-encoded parsing, request logging
- Environment-based configuration (production vs development)

**Data Layer Abstraction (IStorage Interface):**
- Dual storage implementation:
  - **PgStorage:** PostgreSQL via Drizzle ORM (production)
  - **MemStorage:** JSON file-based storage (development/offline)
- Strategy pattern allows switching between storage backends without code changes

**API Endpoints:**
- Tasks: CRUD operations, completion toggling, archiving
- Exam Results: Create/read/update/delete with subject-level nets
- Question Logs: Daily question tracking with topic categorization
- Moods: Emoji-based mood logging
- Goals: Target setting and tracking
- Study Hours: Time tracking per date
- Flashcards: Spaced repetition system

**Activity Logging:**
- All user actions logged via stdout for Electron to capture
- Activity window displays timestamped user actions

**Rationale:** The IStorage abstraction provides flexibility to run the app with or without a database connection. Express is minimalist and well-understood for Node.js APIs. The dual storage approach supports both cloud-deployed and fully offline usage.

### Data Storage

**Production (PostgreSQL):**
- Hosted on Neon (serverless Postgres)
- Drizzle ORM for type-safe database queries
- Schema defined in `shared/sema.ts` using Drizzle's pgTable

**Development/Offline (JSON Files):**
- Stored in `data/kayitlar.json`
- In-memory cache with periodic file writes
- Automatic backup creation before writes

**Schema Design:**
- Tasks: title, description, priority, category, due date, recurrence, completion status
- ExamResults: exam name/date/type, TYT/AYT nets, subject-specific nets, wrong topics
- QuestionLogs: subject, topic, correct/wrong/blank counts, duration
- Moods: emoji, note, timestamp
- Goals: target description, current progress, deadline
- StudyHours: date, subject, hours
- Flashcards: question, answer, subject, difficulty, spaced repetition metadata

**Rationale:** PostgreSQL provides reliable data persistence for cloud deployments. JSON file storage enables fully offline operation without database setup. Drizzle provides TypeScript types from the schema, ensuring type safety across the stack.

### Electron Desktop Integration

**Main Process (electron/main.cjs):**
- Creates application window with system tray icon
- Starts Express server on port 5000
- IPC handlers for renderer communication
- Activity logging to separate window
- File system operations for data persistence
- Auto-archiving scheduler (Sundays at 23:59 Turkey time)

**Preload Script (electron/preload.cjs):**
- Secure bridge between renderer and main process
- Exposes limited APIs to renderer via `window.electronAPI`

**Loading Screen:**
- Displays while Express server starts
- Turkish welcome message and branding

**Rationale:** Electron provides native desktop experience with web technologies. The main process handles Node.js operations (file I/O, server management) while renderer process runs React app. IPC ensures secure communication between isolated processes.

### Build and Development

**Development Mode:**
- Vite dev server with HMR (Hot Module Replacement)
- Express server runs in Node.js
- Both servers run concurrently

**Production Build:**
- Vite bundles frontend to `dist/public`
- esbuild bundles server to `server/dist`
- Electron-builder packages as Windows `.exe`

**Rationale:** Vite provides extremely fast dev server startup and HMR. esbuild ensures fast server bundling. Electron-builder creates distributable desktop apps.

### Testing Strategy

**End-to-End Tests (Playwright):**
- Full user flow testing across all features
- Browser automation (Chromium, Firefox, WebKit)
- Screenshot/video capture on failure

**Unit Tests (Vitest):**
- Component testing with React Testing Library
- API endpoint testing
- Schema validation testing

**Rationale:** Playwright tests ensure real-world user scenarios work correctly. Vitest provides fast unit tests with minimal configuration.

## External Dependencies

### Core Dependencies

**Frontend:**
- `react` & `react-dom`: UI library
- `@tanstack/react-query`: Server state management
- `wouter`: Lightweight routing
- `tailwindcss`: Utility-first CSS
- `@radix-ui/*`: Accessible component primitives (30+ components)
- `recharts`: Chart visualization library
- `@dnd-kit/*`: Drag-and-drop for sortable tasks

**Backend:**
- `express`: Web framework
- `drizzle-orm`: TypeScript ORM
- `@neondatabase/serverless`: Neon Postgres driver
- `zod`: Schema validation
- `dotenv`: Environment variable management
- `nodemailer`: Email sending (optional feature)

**Desktop:**
- `electron`: Desktop app framework
- `electron-builder`: App packaging
- `electron-store`: Persistent settings storage

**Development:**
- `vite`: Build tool
- `typescript`: Type system
- `esbuild`: Server bundling
- `playwright`: E2E testing
- `vitest`: Unit testing

### Third-Party Services

**Database (Production):**
- Neon Postgres (serverless)
- Connection via `DATABASE_URL` environment variable

**Weather API (Optional):**
- OpenWeather API
- Requires `OPENWEATHER_API_KEY` environment variable
- Provides weather widget functionality

**Email (Optional):**
- SendGrid or SMTP
- Requires `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` environment variables
- Used for notifications (feature can work without email configured)

**Rationale:** 
- Neon provides serverless Postgres with generous free tier
- OpenWeather offers free tier for basic weather data
- Email integration is optional and app functions without it
- All external services have fallback behavior when not configured