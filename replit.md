# Berat Cankır - YKS Ders Analiz/Takip Sistemi

## Overview
This is a Turkish educational application designed to help students prepare for the YKS (Yükseköğretim Kurumları Sınavı - Higher Education Institutions Exam). The app provides comprehensive tools for tracking study progress, analyzing exam results, and managing study tasks.

## Project Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: File-based storage (data/kayitlar.json) with optional PostgreSQL support via Neon
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: TanStack React Query
- **Routing**: Wouter

### Project Structure
```
├── client/               # Frontend application
│   ├── src/
│   │   ├── bilesenler/  # Components
│   │   │   └── arayuz/  # UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── kutuphane/   # Utility libraries
│   │   ├── sayfalar/    # Pages
│   │   └── stiller/     # Styles
│   └── index.html
├── server/              # Backend application
│   ├── index.ts        # Main server file
│   ├── depolama.ts     # Storage layer
│   ├── rotalar.ts      # API routes
│   └── vite.ts         # Vite dev server integration
├── shared/              # Shared code
│   └── sema.ts         # Database schema & types
├── data/               # Data storage
│   └── kayitlar.json   # File-based database
└── electron/           # Electron wrapper (for desktop)
```

### Key Features
1. **Task Management**: Create, track, and manage study tasks with priorities and categories
2. **Question Logging**: Track solved questions by subject and topic
3. **Exam Results**: Record and analyze TYT/AYT exam results
4. **Study Hours Tracking**: Monitor daily study time
5. **Goal Setting**: Set and track academic goals
6. **Statistics & Analytics**: View progress through charts and reports
7. **Weather Widget**: Display local weather information
8. **Calendar Integration**: View tasks and study schedule
9. **Mood Tracking**: Log daily mood and notes
10. **Net Calculator**: Calculate net scores for exam results

## Configuration

### Environment Variables (Optional)
All environment variables are optional. The app works with default/static data if not configured:

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)
- `OPENWEATHER_API_KEY`: OpenWeather API key for weather feature
- `GMAIL_USER` / `EMAIL_USER`: Email for notifications
- `GMAIL_PASS` / `EMAIL_PASS`: Email password for notifications
- `DATABASE_URL`: PostgreSQL connection string (uses file storage if not set)

### Running the Application

**Development:**
```bash
npm run dev
```
This starts the server on `http://0.0.0.0:5000` with hot module reloading.

**Production Build:**
```bash
npm run build
npm start
```

### Database
The application uses a dual storage system:
1. **File-based (Default)**: Stores data in `data/kayitlar.json` - no database setup required
2. **PostgreSQL (Optional)**: Can use Neon PostgreSQL via DATABASE_URL environment variable

The file-based storage is sufficient for single-user deployments and is automatically initialized with sample data on first run.

### Data Backup
- The app automatically creates backups of corrupt data files (`.bak` extension)
- Auto-archive feature runs daily at midnight to archive old data

## Development Notes

### Recent Changes
- Initial setup for Replit environment (October 4, 2025)
- Configured to work with file-based storage by default
- All dependencies installed and workflow configured
- Frontend properly configured with allowedHosts for Replit proxy

### Deployment
The app is configured for Replit Autoscale deployment:
- Build command: `npm run build`
- Run command: `npm start`
- Serves frontend on port 5000

## License
This project is proprietary and protected under copyright. See LICENSE and README.md for details.

## Author
Berat Cankır
