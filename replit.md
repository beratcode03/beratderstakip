# Berat Cankır - YKS Analiz Takip Sistemi

## Overview
This is a comprehensive YKS (Turkish University Entrance Exam) study tracking and analytics application built for students preparing for the exam. The application provides tools for task management, study hour tracking, exam result analysis, question logging, goal setting, and mood tracking.

**Current State**: Successfully imported and running in Replit environment
**Last Updated**: October 31, 2025

## Project Architecture

### Technology Stack
- **Frontend**: React 18.3.1 + Vite 7.1.9
- **Backend**: Express 4.21.2 + TypeScript
- **UI Components**: Radix UI + Tailwind CSS
- **Database**: File-based JSON storage (`data/kayitlar.json`) with optional PostgreSQL support via Drizzle ORM
- **Desktop**: Electron 38.2.0 (optional, for desktop app builds)

### Project Structure
```
├── client/               # React frontend application
│   ├── src/
│   │   ├── bilesenler/  # Components (UI, widgets, modals)
│   │   ├── sayfalar/    # Pages (homepage, dashboard, calculator, etc.)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── kutuphane/   # Library utilities
│   │   └── stiller/     # Styles
│   ├── public/          # Static assets
│   └── index.html
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── depolama.ts      # Storage layer (MemStorage/DbStorage)
│   ├── rotalar.ts       # API routes
│   └── env-validation.ts # Environment validation
├── shared/              # Shared types and schemas
│   └── sema.ts          # Database schema definitions
├── electron/            # Electron desktop app files
├── data/                # JSON data storage directory
└── testler/             # Tests (Vitest, Playwright)
```

## Development Setup

### Port Configuration
- **Development**: Port 5000 (both frontend Vite server and backend)
- **Host**: 0.0.0.0 (allows Replit proxy to work correctly)
- **HMR**: Enabled on port 5000

### Environment Variables
The application uses these environment variables (stored in Replit Secrets):

**Optional Features** (warnings if not set):
- `OPENWEATHER_API_KEY` - For weather widget functionality
- `EMAIL_USER` - Gmail address for email features
- `EMAIL_PASS` - Gmail app password
- `EMAIL_FROM` - Sender email address

**System Variables** (auto-configured):
- `NODE_ENV` - Set to "development" in dev, "production" in deployment
- `PORT` - Server port (5000)
- `HOST` - Server host (0.0.0.0)
- `DATABASE_URL` - PostgreSQL connection (if using database)

### Database
Currently configured to use **file-based JSON storage** (`data/kayitlar.json`):
- Simpler for development and offline usage
- Data persists in the `data/` directory
- Automatic backup system for corrupted files

The app has **PostgreSQL support** via Drizzle ORM (currently disabled):
- Schema defined in `shared/sema.ts`
- Can be enabled by configuring `DATABASE_URL` and uncommenting database initialization in `server/depolama.ts`

## Running the Application

### Development
```bash
npm run dev
```
This starts the Express server with Vite integration on port 5000.

### Production Build
```bash
npm run build      # Builds frontend and backend
npm run start      # Starts production server
```

### Testing
```bash
npm test           # Run all tests
npm run test:ui    # Vitest UI
npm run test:coverage  # Coverage report
```

## Key Features

1. **Task Management** (Yapılacaklar)
   - Create, edit, delete tasks with due dates
   - Task completion tracking
   - Archive old tasks
   - Daily summary views

2. **Study Hour Tracking** (Çalışma Saati Takibi)
   - Log study sessions by subject
   - Track time spent on each topic
   - Visual analytics and graphs

3. **Exam Results** (Sınav Sonuçları)
   - Record exam scores and net counts
   - Track performance over time
   - Subject-wise net analysis

4. **Question Logging** (Soru Günlüğü)
   - Log solved questions with correct/wrong counts
   - Track problematic topics
   - Priority topic identification

5. **Net Calculator** (Net Hesaplayıcı)
   - Calculate YKS exam scores
   - Subject-wise net entry
   - Score projections

6. **YKS Topics** (YKS Konular)
   - Comprehensive topic checklist
   - Track progress on each subject area

7. **Widgets**
   - Weather widget (requires API key)
   - Countdown timer to exam
   - Mood tracking
   - Daily motivational quotes

## Deployment (Replit)

The application is configured for **autoscale deployment**:
- Build: `npm run build` (compiles both frontend and backend)
- Run: `npm run start` (production Express server)
- Port: 5000 (automatically exposed by Replit)

The production server serves:
- Static frontend files from `dist/public/`
- API routes at `/api/*`
- WebSocket support for real-time features

## Desktop Application (Electron)

The project includes Electron support for a standalone desktop app:

```bash
npm run electron:dev     # Run in Electron dev mode
npm run electron:build   # Build Windows installer
```

Note: Electron is primarily for offline desktop usage. The web version is recommended for Replit deployment.

## Automatic Data Archiving

The system includes automatic weekly archiving:
- Runs every Sunday at 23:59 (Turkey Time, GMT+3)
- Archives old completed tasks and study logs
- Keeps data organized and performant

## User Preferences

### Coding Style
- Turkish variable/function names (matching the Turkish UI)
- Detailed comments in Turkish
- Author attribution at top/bottom of files
- Clean, modular component structure

### Notable Patterns
- Extensive use of Radix UI components
- Custom hooks for reusable logic
- Separation of concerns (client/server/shared)
- Type safety with TypeScript + Zod schemas

## Recent Changes
- **October 31, 2025**: Successfully imported from GitHub and configured for Replit
  - Installed all npm dependencies
  - Configured environment variables
  - Set up development workflow on port 5000
  - Verified frontend and backend are working correctly
  - Configured autoscale deployment
