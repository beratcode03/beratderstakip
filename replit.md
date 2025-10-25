# Overview

This is a comprehensive YKS (Turkish University Entrance Exam) Analysis and Tracking System designed for personal use. The application helps students preparing for the YKS exam track their study progress, analyze their performance, and manage their preparation schedule. It features both web and Electron desktop versions, with a modern React-based frontend and Express backend.

The system tracks multiple aspects of exam preparation including:
- Question logs with subject/topic analysis
- Mock exam results (TYT and AYT)
- Daily task management with recurrence support
- Study hour tracking per subject
- Goals and progress monitoring
- Mood tracking
- Flashcard system for review
- Net score calculator
- Weather integration for study planning

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript
- Vite as build tool and dev server
- Wouter for client-side routing
- TanStack Query (React Query) for server state management
- Tailwind CSS for styling with shadcn/ui component library
- Recharts for data visualization
- DND Kit for drag-and-drop functionality

**Design Patterns:**
- Component-based architecture with clear separation of concerns
- Custom hooks for reusable logic (e.g., `use-toast`, `use-mobile`)
- Theme provider for dark/light mode switching
- Context API for theme management
- Memoization patterns for performance optimization

**Key Components:**
- `baslik.tsx` (Header): Navigation and global controls
- `gorevler-bolumu.tsx`: Task management with drag-and-drop
- `gelismis-grafikler.tsx`: Advanced analytics charts
- `panel-ozet-kartlar.tsx`: Dashboard summary cards

**Routing Structure:**
- `/` - Homepage with weather, countdown, and daily summary
- `/tasks` - Task management interface
- `/dashboard` - Analytics and performance tracking
- `/net-calculator` - YKS net score calculator
- `/timer` - Study timer with Pomodoro support
- `/yks-konular` - YKS topic distribution by year

## Backend Architecture

**Technology Stack:**
- Node.js with Express
- TypeScript for type safety
- Drizzle ORM for database operations
- Neon serverless PostgreSQL
- Dual storage system (JSON file fallback + PostgreSQL)

**Design Patterns:**
- Repository pattern via `IStorage` interface
- Environment-based configuration with validation
- RESTful API design
- Middleware for logging and error handling

**API Structure:**
- `/api/tasks` - CRUD operations for tasks
- `/api/question-logs` - Question tracking and analytics
- `/api/exam-results` - Mock exam result management
- `/api/goals` - Goal tracking
- `/api/moods` - Daily mood logging
- `/api/flashcards` - Spaced repetition flashcard system
- `/api/study-hours` - Study time tracking
- `/api/weather` - Weather data integration

**Storage Layer:**
The application implements a dual-storage strategy:
1. **PostgreSQL (Primary)**: Using Neon serverless with Drizzle ORM
2. **JSON File (Fallback)**: Local `data/kayitlar.json` for development/offline use

The storage abstraction (`depolama.ts`) provides a unified interface supporting both backends.

## Data Models

**Core Entities (defined in `shared/sema.ts`):**
- **Tasks**: Recurring/one-time tasks with priority, category, and archiving
- **Question Logs**: Subject-wise question tracking with correct/wrong counts
- **Exam Results**: TYT/AYT mock exam scores with detailed subject nets
- **Goals**: Measurable objectives with target values and progress
- **Study Hours**: Time tracking per subject/date
- **Flashcards**: Spaced repetition cards with difficulty levels
- **Moods**: Daily mood tracking with notes

**Subject Limits**: Enforced via `SUBJECT_LIMITS` constant mapping exam types to maximum questions per subject.

**Archiving System**: Soft-delete pattern with `archived` and `deleted` flags, allowing data recovery and historical analysis.

## Authentication & Authorization

Currently operates as a single-user system with no authentication layer. The license indicates this is for personal use by the developer only. Future iterations may add authentication if multi-user support is desired.

## Electron Desktop Integration

**Architecture:**
- Main process (`electron/main.cjs`) manages window lifecycle
- Preload script exposes safe IPC methods via `electronAPI`
- Loading screen (`electron/loading.html`) during app initialization
- Express server runs embedded within Electron process

**Window Controls:**
- Frameless window with custom title bar controls
- Minimize, maximize, close, fullscreen toggle
- Navigation controls (back, forward, reload)
- IPC communication for window state changes

## Development vs Production

**Development Mode:**
- Vite dev server with HMR
- JSON file storage as default
- Hot module replacement for rapid iteration
- Verbose logging

**Production Mode:**
- Static file serving from `dist/public`
- PostgreSQL database required
- Optimized bundles with code splitting
- Electron packaging for desktop distribution

# External Dependencies

## Database
- **Neon Serverless PostgreSQL**: Primary database with connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and migrations
- Connection pooling handled by `@neondatabase/serverless` driver

## Third-Party APIs
- **OpenWeather API**: Weather data integration
  - Requires `OPENWEATHER_API_KEY` environment variable
  - Used in `gelismis-hava-durumu-widget.tsx` for study planning context

## Email Services
- **Nodemailer**: Email functionality for reports
  - Requires `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_FROM` environment variables
  - SendGrid support via `@sendgrid/mail`

## UI Component Libraries
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, etc.)
- **shadcn/ui**: Pre-built component collection
- **Lucide React**: Icon library
- **Recharts**: Chart visualization library

## Build & Development Tools
- **Vite**: Frontend build tool and dev server
- **esbuild**: Server-side bundling for production
- **Electron Builder**: Desktop app packaging
- **TypeScript**: Type checking and compilation
- **Tailwind CSS**: Utility-first CSS framework

## Utility Libraries
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing
- **date-fns**: Date manipulation (implicit from code patterns)
- **Zod**: Runtime type validation via `drizzle-zod`
- **DND Kit**: Drag-and-drop functionality for task ordering
- **react-day-picker**: Calendar component
- **pdf-lib & pdfkit**: PDF generation for reports

## Environment Variables
Required for full functionality:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENWEATHER_API_KEY`: Weather API access
- `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`: Email service credentials
- `NODE_ENV`: Environment mode (development/production)

Missing variables trigger warnings but don't prevent startup, allowing graceful degradation of features.