# YKS Study Tracker - Turkish University Entrance Exam Study Analytics

## Overview
A comprehensive Turkish YKS (Yükseköğretim Kurumları Sınavı) study tracking application that helps students monitor their exam preparation progress with detailed analytics, question logs, exam results tracking, and task management.

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Express.js + TypeScript
- **Styling**: Tailwind CSS with custom purple/black theme
- **Database**: In-memory storage with JSON file persistence
- **Charts**: Recharts for data visualization

## Key Features

### 📊 Study Analytics
- Comprehensive dashboard with real-time study statistics
- Heat map visualization of daily study activity
- Subject-wise performance tracking (TYT/AYT)
- Wrong topic analysis from both question logs and exam results
- Study hours tracking with detailed breakdown

### 📝 Question Logs
- Track daily question solving sessions by subject
- Record correct/wrong/blank answers
- Categorize wrong topics with difficulty levels
- Time tracking for study sessions
- Wrong topic categories: Concept, Calculation, Analysis, Carelessness

### 🎯 Exam Results
- Full mock exam tracking (TYT/AYT)
- Subject-wise net calculations
- Detailed breakdown for 8 subjects
- Exam name customization (display name support)
- Historical performance comparison

### ✅ Task Management
- Daily task tracking with completion status
- Task categories and priorities
- Progress visualization

### 📁 Archive System
- **Auto-archive functionality**: Runs at midnight (00:00) daily
- Archives old questions, exams, and tasks automatically
- "Arşivlenen Veriler" button in Reports section to view archived data
- Separate tabs for archived questions, exams, and tasks
- API endpoints: `/api/question-logs/archived`, `/api/exam-results/archived`, `/api/tasks/archived`

### 📈 Advanced Charts & Reports
- Monthly report generation with email/SMS delivery
- Trend analysis and performance metrics
- Subject-wise progress tracking
- Activity heat map with sliding window (year-to-date from January)

## Recent Changes (October 2025)

### Fixed Issues
1. **Heat Map Display Bug**: Fixed "Ekim" (October) label cutoff by adding maxWidth constraints (line 2890-2893 in gelismis-grafikler.tsx)
2. **Analytics Data Source**: Enhanced "Eksik Olduğum Konular" section to pull from both question logs AND exam results (lines 2776-2789 in gelismis-grafikler.tsx)

### Added Features
1. **Archive Button**: Added "Arşivlenen Veriler" button in Reports section (line 2920 in gelismis-grafikler.tsx)
2. **Archive Modal**: Created comprehensive modal with tabs to view archived questions, exams, and tasks (lines 3284-3416 in panel.tsx)
3. **Archive Queries**: Added React Query hooks to fetch archived data on-demand

## Configuration

### Environment Variables
- `OPENWEATHER_API_KEY`: For weather integration (optional)
- `GMAIL_USER` / `EMAIL_USER`: Email service configuration (optional)
- `GMAIL_PASS` / `EMAIL_PASS`: Email service authentication (optional)

### Data Storage
- Data is stored in JSON file at `/home/runner/workspace/data/kayitlar.json`
- Auto-save on every data modification
- Automatic backup and archive at midnight

## Development

### Running the App
```bash
npm run dev
```
Server runs on port 5000: http://localhost:5000

### Project Structure
```
client/
  src/
    sayfalar/         # Pages (panel.tsx - main dashboard)
    bilesenler/       # Components
      gelismis-grafikler.tsx  # Advanced charts & reports
      soru-analiz-grafikleri.tsx  # Question analysis charts
      panel-ozet-kartlar.tsx  # Dashboard summary cards
      arayuz/         # UI components
server/
  depolama.ts       # Data storage and auto-archive logic
  rotalar.ts        # API routes
  index.ts          # Express server setup
shared/
  sema.ts          # TypeScript schemas and types
```

## Future Enhancements (Pending)

### Electron Desktop Application
The following Electron-specific features are planned but require extensive work:

1. **Installer Design**: Purple/black themed installer with custom branding
2. **License Agreement**: EULA/license acceptance screen during installation
3. **Telemetry Collection**: (Note: This raises privacy concerns)
   - Computer specifications
   - IP address and location
   - MAC address
   - Download count tracking
4. **Code Obfuscation**: Protect source code in compiled builds

**Note**: These Electron features are beyond the scope of the current web application and would require:
- Converting the app to Electron framework
- Setting up electron-builder with custom installer configuration
- Implementing telemetry backend infrastructure
- Legal review for data collection compliance
- Code obfuscation tooling (e.g., javascript-obfuscator, bytenode)

## User Preferences
- **Language**: Turkish (TR)
- **Theme**: Purple/Black gradient with modern glassmorphism effects
- **Date Format**: Turkish locale (tr-TR)
- **Exam Types**: TYT (Temel Yeterlilik Testi), AYT (Alan Yeterlilik Testi)

## Important Notes
- The auto-archive scheduler runs daily at midnight (00:00)
- All data modifications are automatically saved to JSON file
- The app uses Turkish language for all UI elements
- Current deployment is web-based on Replit (port 5000)
