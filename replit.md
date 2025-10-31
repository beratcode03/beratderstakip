# YKS Study Tracking & Analytics System

## Overview
A comprehensive study tracking and analytics application designed for students preparing for the YKS (Turkish University Entrance Exam). The application helps students manage exam preparation by tracking progress, analyzing performance, and identifying areas for improvement.

## Project Type
Full-stack web application with hybrid architecture supporting both web and desktop (Electron) deployment.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Wouter (routing)
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (via Drizzle ORM) or MemStorage (JSON files)
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: TanStack React Query
- **Desktop**: Electron (optional)

## Core Features
- Exam result analysis and tracking
- Progress visualization with charts
- Topic weakness identification
- Question logging and study hour tracking
- Task management with prioritization
- Mood tracking and goal setting
- Net score calculator
- Study timer

## Project Structure
```
├── client/          # Frontend React application
│   ├── src/
│   │   ├── sayfalar/      # Pages/routes
│   │   ├── bilesenler/    # Reusable components
│   │   ├── hooks/         # Custom React hooks
│   │   └── kutuphane/     # Utilities
├── server/          # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── rotalar.ts         # API routes
│   └── depolama.ts        # Storage implementation
├── shared/          # Shared types and schemas
└── electron/        # Electron desktop app files

## Development Setup
The application runs on port 5000 with the frontend and backend integrated via Vite dev server in development mode.

### Environment Variables (Optional)
- `OPENWEATHER_API_KEY` - For weather features
- `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` - For email features
- `DATABASE_URL` - For PostgreSQL (defaults to MemStorage if not provided)

## Replit Configuration
- **Port**: 5000 (frontend)
- **Workflow**: `dev` runs `npm run dev`
- **Deployment**: Configured for autoscale with `npm run build` and `npm start`
- **Storage**: Uses MemStorage (JSON files) by default, can optionally use PostgreSQL with DATABASE_URL

## Recent Changes
- October 31, 2025: Imported from GitHub (https://github.com/beratcode03/beratders)
- Configured for Replit environment with proper port settings
- Dependencies installed and verified working
- Development server running successfully on port 5000
- Deployment configuration set up for production use
