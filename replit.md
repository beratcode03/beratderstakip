# YKS Analiz Takip Sistemi

## Overview

This is a comprehensive YKS (Turkish University Entrance Exam) analysis and tracking system designed for students preparing for TYT and AYT exams. The application helps students track their practice exam results, analyze weak topics, manage study tasks, and monitor their progress over time.

**Key Features:**
- Practice exam result tracking and analysis (TYT/AYT)
- Question solving logs with topic-level error tracking
- Task management with priorities, categories, and recurrence
- Study time tracking
- Performance visualization with charts and graphs
- Topic weakness identification and completion tracking
- Activity heatmap and progress monitoring
- Timer/Pomodoro functionality
- Net score calculator

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack

**Frontend:**
- React 18 with TypeScript for UI components
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management
- Radix UI components for accessible UI primitives
- Tailwind CSS for styling
- Recharts for data visualization
- DnD Kit for drag-and-drop task management

**Backend:**
- Node.js with Express server
- TypeScript for type safety across the stack
- Drizzle ORM for database operations
- PostgreSQL as the primary database (via Neon serverless)

**Desktop Application:**
- Electron for cross-platform desktop packaging
- Custom window controls and native integration

**Development & Testing:**
- Vite for fast development builds and HMR
- Vitest for unit testing
- Playwright for end-to-end testing

### Data Model

The application uses PostgreSQL with the following core tables:

- **tasks** - User tasks with priority, category, recurrence, and archiving support
- **exam_results** - Full and branch exam results (TYT/AYT)
- **exam_subject_nets** - Individual subject net scores per exam
- **question_logs** - Daily question solving records with topic tracking
- **study_hours** - Time tracking for study sessions
- **goals** - User-defined goals with progress tracking
- **moods** - Daily mood and note entries

### Key Architectural Decisions

**1. Monorepo Structure**
- `client/` - React frontend application
- `server/` - Express backend API
- `shared/` - Shared TypeScript schemas and utilities
- Single codebase for easier maintenance and type sharing

**Rationale:** Shared types between frontend and backend prevent API contract mismatches and improve developer experience.

**2. Drizzle ORM with Zod Validation**
- Database schema defined in `shared/sema.ts`
- Zod schemas derived from Drizzle tables for runtime validation
- Type-safe database queries with Drizzle's query builder

**Rationale:** Drizzle provides excellent TypeScript integration while remaining lightweight. Zod ensures runtime type safety for API inputs.

**3. React Query for State Management**
- Server state managed exclusively through TanStack Query
- Optimistic updates for better UX
- Automatic cache invalidation on mutations

**Rationale:** React Query eliminates the need for global state management libraries for server data, reducing complexity and improving performance.

**4. File-based Fallback Storage**
- JSON file storage in `data/kayitlar.json` as fallback
- Database-first approach with graceful degradation

**Rationale:** Provides offline capability and ensures data persistence even if database connection fails.

**5. Turkish Language Codebase**
- Variable names, file paths, and UI in Turkish
- Path aliases use Turkish names (e.g., `@bilesenler`, `@kutuphane`)

**Rationale:** Application is specifically designed for Turkish students, making the codebase more accessible to the target user.

**6. Dual Deployment Modes**
- Web application mode (Vite dev server)
- Electron desktop application mode

**Rationale:** Flexibility to run as web app or standalone desktop application based on user preference.

## External Dependencies

### Database
- **Neon PostgreSQL** - Serverless Postgres database
- Connection managed via `@neondatabase/serverless`
- Database URL configured through `DATABASE_URL` environment variable

### Third-Party Services
- **OpenWeather API** - Weather widget functionality (optional)
  - Configured via `OPENWEATHER_API_KEY`
- **SendGrid** - Email functionality (optional)
  - Configured via `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`

### UI Component Libraries
- **Radix UI** - Headless accessible component primitives
  - Accordion, Dialog, Select, Checkbox, Popover, etc.
- **Recharts** - Chart rendering library
- **Lucide React** - Icon library

### Build & Development Tools
- **Vite** - Build tool and dev server
- **esbuild** - Server-side bundling
- **Electron Builder** - Desktop application packaging
- **Drizzle Kit** - Database migrations

### Testing
- **Vitest** - Unit test runner
- **Playwright** - E2E testing framework
- **Testing Library** - React component testing utilities

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing with autoprefixer

**Note:** Weather and email features are optional. The application functions fully without these API keys configured.