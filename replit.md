# Berat Cankır - YKS Analiz Takip Sistemi

## Overview
This is a comprehensive YKS (Turkish University Entrance Exam) study tracking and analysis system built by Berat Cankır. The application helps students track their study progress, manage tasks, analyze exam performance, and monitor their preparation journey.

**Primary Language:** Turkish  
**Tech Stack:** React + Vite + Express + TypeScript  
**Database:** JSON file-based storage (in-memory with persistence)

## Project Status
- ✅ Fully functional web application
- ✅ Running on port 5000
- ✅ Development environment configured
- ⚠️ Optional environment variables not set (weather API, email features)

## Recent Changes
- **2025-10-31**: Imported from GitHub and configured for Replit environment
  - Installed all dependencies
  - Created .env file from template
  - Configured development workflow on port 5000
  - Verified application loads correctly with dark theme UI

## Project Architecture

### Frontend (React + Vite)
- **Location:** `client/src/`
- **Entry Point:** `client/src/main.tsx`
- **Key Features:**
  - Task management (Yapılacaklar)
  - Reports and analytics (Raporlarım)
  - Net calculator (Net Hesapla)
  - Counter/timer (Sayaç)
  - YKS topics tracking (YKS Konular)
  - Dark/light theme support
  - Turkish language interface

### Backend (Express)
- **Location:** `server/`
- **Entry Point:** `server/index.ts`
- **Key Components:**
  - `server/depolama.ts` - Data storage layer using in-memory Maps with JSON file persistence
  - `server/rotalar.ts` - API routes
  - `server/vite.ts` - Vite dev server integration
  - `server/static.ts` - Static file serving for production
  - **Port:** 5000 (both dev and production)
  - **Host:** 0.0.0.0 (allows proxy access in Replit)

### Shared Code
- **Location:** `shared/`
- **Contents:** 
  - `shared/sema.ts` - Database schema definitions using Drizzle ORM types
  - Shared types and utilities

### Data Storage
- **Type:** JSON file-based (not using PostgreSQL/SQLite)
- **File:** `data/kayitlar.json`
- **Implementation:** In-memory Maps with periodic file saves for performance
- **Rationale:** Single-user application, moderate data size, simple CRUD operations

## Environment Variables

### Required (None - app works without them)
None. The application runs without any required environment variables.

### Optional
```
OPENWEATHER_API_KEY=    # For weather widget feature
EMAIL_USER=             # For email notifications
EMAIL_PASS=             # For email notifications
EMAIL_FROM=             # For email sender address
```

## Development Commands

### Start Development Server
```bash
npm run dev
```
Runs on http://0.0.0.0:5000 with hot module replacement

### Build for Production
```bash
npm run build
```
Builds both client and server

### Run Production
```bash
npm start
```

### Run Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:ui       # UI for tests
npm run test:coverage # Coverage report
```

### Type Checking
```bash
npm run check
```

## Electron Build (Desktop App)
This project also supports building as an Electron desktop application:
```bash
npm run electron:build    # Build Windows installer
npm run electron:dev      # Run in Electron development mode
```

## Key Features
1. **Task Management** - Create, track, and complete daily tasks
2. **Exam Tracking** - Log exam results and track progress over time
3. **Question Logs** - Record solved questions and identify weak topics
4. **Study Hours** - Track time spent studying different subjects
5. **Analytics** - Comprehensive charts and statistics
6. **Goal Setting** - Set and monitor study goals
7. **Net Calculator** - Calculate university entrance exam scores
8. **Countdown Timer** - Track time until exam date
9. **Weekly Auto-Archive** - Automatic data archiving every Sunday at 23:59 (Turkey time)

## Directory Structure
```
├── client/              # React frontend
│   ├── public/          # Static assets
│   └── src/
│       ├── bilesenler/  # Components (Turkish: "components")
│       ├── sayfalar/    # Pages (Turkish: "pages")
│       ├── hooks/       # Custom React hooks
│       └── kutuphane/   # Utilities library
├── server/              # Express backend
├── shared/              # Shared types and schemas
├── data/                # JSON data files
└── electron/            # Electron app files
```

## Notes
- Application is designed for Turkish students preparing for YKS exam
- Uses Turkish language throughout the UI
- Supports both web and desktop (Electron) deployment
- Data persists in JSON files, not a traditional database
- The workflow is already configured to run on port 5000
