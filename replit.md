# Berat Cankır YKS Analiz/Takip Sistemi

## Overview
This is a Turkish education tracking and analytics application designed for YKS (Yükseköğretim Kurumları Sınavı - Turkish university entrance exam) preparation. The application helps students track their study progress, manage tasks, analyze exam results, and monitor their preparation journey.

## Project Architecture

### Technology Stack
- **Frontend**: React 18 with Vite, TypeScript
- **Backend**: Express.js with TypeScript (tsx runtime)
- **UI Library**: Radix UI components with Tailwind CSS
- **Database**: JSON file-based storage (fallback from PostgreSQL/Drizzle ORM)
- **Build System**: Vite for frontend, esbuild for backend

### Key Features
- **Dashboard**: Welcome screen with motivational quotes, weather widget, calendar
- **Task Management**: Create, track, and manage study tasks with categories
- **Question Logs**: Track questions solved by subject and topic
- **Exam Results**: Record and analyze TYT/AYT exam performance
- **Study Hours**: Monitor daily study time
- **Net Calculator**: Calculate exam net scores
- **Report Generation**: PDF report generation with email support
- **Flashcards**: Study aid system
- **Goals**: Set and track study goals
- **Mood Tracking**: Monitor emotional state during preparation

### Project Structure
```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── bilesenler/  # Components (UI components, widgets)
│   │   ├── sayfalar/    # Pages (routes)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── kutuphane/   # Library utilities
│   │   └── stiller/     # Styles
│   └── index.html
├── server/              # Backend Express server
│   ├── index.ts        # Main server entry
│   ├── rotalar.ts      # API routes
│   ├── depolama.ts     # Storage layer (JSON file-based)
│   ├── vite.ts         # Vite dev server integration
│   └── env-validation.ts
├── shared/              # Shared schemas and types
│   └── sema.ts         # Database schema and Zod validators
├── data/               # JSON data storage
│   └── kayitlar.json   # All application data
└── electron/           # Electron wrapper (desktop app)
```

## Development Setup

### Environment Variables (Optional)
The application works without environment variables, but these enable additional features:
- `OPENWEATHER_API_KEY`: For live weather data (falls back to static data)
- `GMAIL_USER` / `EMAIL_USER`: For email report functionality
- `GMAIL_PASS` / `EMAIL_PASS`: Email password for sending reports

### Port Configuration
- **Frontend Dev Server**: Port 5000 (configured in vite.config.ts)
- **Backend**: Integrated with Vite dev middleware in development
- Vite config already has `allowedHosts: true` for Replit proxy support

### Data Storage
The application uses JSON file storage at `/data/kayitlar.json`:
- No database setup required
- Data persists across restarts
- Includes all tasks, moods, goals, question logs, exam results, etc.

### Running the Application
```bash
npm run dev  # Starts development server on port 5000
npm run build  # Builds for production
npm start  # Runs production build
```

## Deployment Configuration
- **Type**: VM (always running)
- **Build**: `npm run build`
- **Run**: `npm start`
- Suitable for full-stack application with persistent data

## Recent Changes
- **2025-10-04**: Initial Replit environment setup
  - Configured development workflow
  - Verified frontend and backend integration
  - Set up deployment configuration for VM hosting
  - Confirmed JSON file storage is working correctly

## Notes
- The application is in Turkish language for the Turkish education system
- Originally designed as an Electron desktop app (can still be packaged)
- Uses a comprehensive Drizzle ORM schema but falls back to MemStorage
- Includes PDF generation capabilities for reports
- Has optional weather and email integration features
