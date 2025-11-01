# Berat Cankır YKS Analiz Takip Sistemi

## Overview
A comprehensive YKS (Turkish University Entrance Exam) study tracking and analysis system. This is a full-stack web application built with React (Vite) frontend and Express backend. The application helps students track their study progress, manage tasks, analyze performance, and prepare for the YKS exam.

## Project Architecture

### Frontend (React + Vite)
- **Location**: `client/` directory
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Port**: 5000 (configured for Replit)
- **UI Components**: Radix UI, Tailwind CSS
- **Key Features**:
  - Countdown timer to exam date
  - Study calendar and task management
  - Performance reports and net calculator
  - YKS topics tracker
  - Dark/light theme support

### Backend (Express)
- **Location**: `server/` directory
- **Framework**: Express.js with TypeScript
- **Development**: Uses Vite dev server middleware
- **Production**: Serves static build files
- **Storage**: File-based JSON storage (`kayitlar.json`) with optional PostgreSQL support via Drizzle ORM

### Key Technologies
- **TypeScript**: Type-safe development across frontend and backend
- **Shared Schema**: Common data structures in `shared/` directory
- **Testing**: Vitest for unit tests, Playwright for E2E tests
- **Styling**: Tailwind CSS with custom animations

## Replit Setup

### Workflow Configuration
- **Development Server**: `npm run dev`
  - Runs Express server with Vite dev middleware on port 5000
  - Hot module replacement (HMR) enabled
  - Configured with `allowedHosts: true` for Replit proxy

### Deployment Configuration
- **Type**: Autoscale (stateless web application)
- **Build**: `npm run build` (builds both frontend and backend)
- **Run**: `npm run start` (production server)

### Environment Variables (Optional)
The following environment variables are optional and enable additional features:
- `OPENWEATHER_API_KEY` - For weather widget functionality
- `EMAIL_USER` - For email notification features
- `EMAIL_PASS` - Email account password
- `EMAIL_FROM` - Email sender address

The application runs fine without these variables; features simply show warnings that they're unavailable.

## File Structure
```
├── client/              # Frontend React application
│   ├── src/
│   │   ├── bilesenler/  # Components (Turkish: components)
│   │   ├── sayfalar/    # Pages (Turkish: pages)
│   │   ├── hooks/       # Custom React hooks
│   │   └── App.tsx      # Main app component
├── server/              # Backend Express server
│   ├── index.ts         # Server entry point
│   ├── rotalar.ts       # API routes
│   ├── depolama.ts      # Storage implementation
│   └── vite.ts          # Vite dev server setup
├── shared/              # Shared types and schemas
├── data/                # JSON data storage
└── electron/            # Desktop app wrapper (not used in Replit)
```

## Development Notes
- The application was originally designed as an Electron desktop app but works perfectly as a web application
- Turkish language is used throughout the UI and code comments
- File-based storage is used by default, but the architecture supports PostgreSQL
- Auto-archiving scheduled for Sundays at 23:59 (Turkey timezone)

## Recent Changes
- **2025-11-01**: Configured for Replit environment
  - Set up development workflow on port 5000
  - Configured deployment for autoscale
  - Verified Vite config has `allowedHosts: true` for Replit proxy
  - Installed npm dependencies
  - Application successfully running
