# Overview

This is a comprehensive YKS (Turkish University Entrance Exam) Analysis and Tracking System designed for a single user (Berat Cankır). The application helps students prepare for YKS exams by tracking study sessions, analyzing performance, managing tasks, and providing detailed insights into exam preparation progress.

The system is built as a full-stack application that can run both as a web application and as an Electron desktop application. It features extensive data tracking for questions solved, exam results, study hours, flashcards, and daily tasks with rich visualization and analytics.

# Recent Changes

**October 25, 2025**
- Enhanced task drag-and-drop functionality with free-form dragging (all directions) while maintaining list layout
- Added viewport boundary constraints using restrictToWindowEdges modifier to prevent tasks from flying off-screen
- Implemented horizontal overflow prevention across main page and task container to eliminate page expansion during drag
- Added activation constraint (8px) to PointerSensor to prevent accidental drag initiation
- Applied global overflow-x-hidden to html/body for consistent scroll prevention

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool

**Routing**: Wouter (lightweight routing library)

**State Management**: TanStack Query (React Query) for server state management

**UI Components**: Radix UI primitives with custom styling via Tailwind CSS and shadcn/ui patterns

**Key Design Patterns**:
- Component-based architecture with functional components and hooks
- Memoization patterns for performance optimization (React.memo, useMemo, useCallback)
- Custom theme provider for dark/light mode support
- Responsive design with mobile-first approach

**Major Pages**:
- Homepage with dashboard overview
- Task management page
- Analytics dashboard with charts
- Net calculator for exam score estimation
- Timer/stopwatch for study sessions
- YKS topics reference page

## Backend Architecture

**Runtime**: Node.js with Express.js

**Database ORM**: Drizzle ORM configured for PostgreSQL (via Neon serverless)

**API Design**: RESTful API with route handlers organized in `server/rotalar.ts`

**Data Layer**: Abstracted storage interface (`IStorage`) supporting both PostgreSQL and JSON file fallback

**Key Features**:
- Activity logging system for Electron integration
- Environment validation for optional features (weather, email)
- Development mode with Vite integration and HMR
- Production mode with pre-built static assets

**Database Schema** (defined in `shared/sema.ts`):
- Tasks (with recurrence, archiving, deletion tracking)
- Moods (daily mood/motivation tracking)
- Goals (user-defined objectives)
- Question logs (subject-wise question tracking)
- Exam results (TYT/AYT exam performance)
- Exam subject nets (detailed per-subject scoring)
- Study hours (time tracking per subject)
- Flashcards (spaced repetition system)

## External Dependencies

**Database**: 
- Neon Serverless PostgreSQL (@neondatabase/serverless)
- Drizzle ORM for type-safe database queries
- Fallback to local JSON file storage when database unavailable

**UI Libraries**:
- Radix UI components for accessible primitives
- Recharts for data visualization
- DND Kit for drag-and-drop functionality
- Lucide React for icons

**Optional Services**:
- OpenWeather API (for weather widget, optional)
- Email service via Nodemailer (for reports, optional)
- SendGrid (alternative email provider, optional)

**Desktop Application**:
- Electron for desktop packaging
- Window management with custom title bar controls
- Activity logging integration between renderer and main process

**Build & Development**:
- Vite for fast development and optimized production builds
- TypeScript for type safety
- Tailwind CSS for styling
- ESBuild for server-side bundling

**Additional Integrations**:
- PDF generation (PDFKit, pdf-lib) for report exports
- Confetti effects for celebrations (react-confetti)
- Date manipulation utilities (react-day-picker)

## Architecture Notes

The application uses a hybrid storage approach: it primarily targets PostgreSQL via Neon serverless, but includes fallback logic to JSON file storage for offline/local usage. The codebase is bilingual (Turkish variable names, Turkish UI text) as it's a personal project for a Turkish user.

The system emphasizes data persistence and recovery - deleted items are soft-deleted, archived items maintain history, and the application tracks comprehensive analytics across multiple time periods for trend analysis.

Performance optimizations include memoized components, efficient query invalidation patterns, and conditional rendering to minimize unnecessary re-renders in data-heavy dashboard views.