# Berat Cankır YKS Analysis & Tracking System

## Overview
A comprehensive Turkish university entrance exam (YKS) study tracking and analysis system. The application helps students track their study hours, solve questions, monitor exam results, set goals, and analyze their performance across TYT (Temel Yeterlilik Testi) and AYT (Alan Yeterlilik Testi) subjects.

## Recent Changes (November 1, 2025)
- Successfully imported from GitHub and configured for Replit environment
- Installed all npm dependencies
- Configured development workflow on port 5000
- Verified frontend and backend are working correctly with JSON file storage

## Project Architecture

### Technology Stack
- **Frontend**: React 18.3 + Vite 7.1 + TypeScript
- **Backend**: Express 4.21 + TypeScript
- **Styling**: TailwindCSS 3.4 with Radix UI components
- **Database**: 
  - Development: JSON file storage (`data/kayitlar.json`)
  - Production ready: PostgreSQL with Drizzle ORM
- **Build Tools**: Vite for frontend, esbuild for backend bundling
- **Also includes**: Electron app capability for desktop deployment

### Key Features
1. **Task Management**: Create, track, and archive study tasks by subject
2. **Question Logs**: Track solved questions with correct/wrong/blank counts
3. **Exam Results**: Record and analyze full exam results (TYT/AYT)
4. **Study Hours**: Daily study time tracking
5. **Goals**: Set and monitor study goals
6. **Analytics**: Visualize progress with charts and statistics
7. **Topic Analysis**: Identify weak topics based on wrong answers
8. **Mood Tracking**: Track daily mood and motivation
9. **Countdown Timer**: YKS exam countdown
10. **Weather Widget**: Optional weather integration

### Project Structure
```
├── client/               # React frontend
│   ├── src/
│   │   ├── bilesenler/  # Components (Turkish: bileşenler)
│   │   ├── sayfalar/    # Pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── kutuphane/   # Library utilities
│   └── public/          # Static assets
├── server/              # Express backend
│   ├── index.ts         # Main server file
│   ├── rotalar.ts       # Routes (Turkish: rotalar)
│   ├── depolama.ts      # Storage layer (Turkish: depolama)
│   └── vite.ts          # Vite dev server integration
├── shared/              # Shared code between client/server
│   └── sema.ts          # Database schema (Turkish: şema)
└── electron/            # Electron app files (for desktop)
```

### Configuration
- **Port**: 5000 (frontend and backend unified)
- **Host**: 0.0.0.0 (configured for Replit proxy)
- **Dev Command**: `npm run dev`
- **Build Command**: `npm run build`
- **Production Command**: `npm start`

### Optional Features (Require Environment Variables)
- `OPENWEATHER_API_KEY`: For weather widget functionality
- `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`: For email features
- `DATABASE_URL`: For PostgreSQL connection (currently using JSON storage)

## Development Notes
- The app uses Turkish variable names and comments throughout
- Currently running with in-memory storage backed by JSON file persistence
- PostgreSQL support is available but not currently active
- Vite dev server is configured with `allowedHosts: true` for Replit compatibility
- Auto-archives old data every Sunday at 23:59 (Turkey time)

## User Preferences
None recorded yet.
