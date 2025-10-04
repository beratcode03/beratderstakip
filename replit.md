# Berat Cankır - YKS Exam Analysis & Tracking System

## Overview
This is a Turkish education application designed to help students prepare for YKS (Yükseköğretim Kurumları Sınavı - Higher Education Institutions Exam). The application provides comprehensive tools for tracking study progress, managing tasks, analyzing exam results, and monitoring goals.

## Project Structure
- **client/**: React frontend application with Vite
  - **src/bilesenler/**: UI components (Turkish: "components")
  - **src/sayfalar/**: Pages (Turkish: "pages")
  - **src/hooks/**: React hooks
  - **src/kutuphane/**: Utility libraries
  - **src/stiller/**: CSS styles
- **server/**: Express backend server
- **shared/**: Shared schemas and types (Drizzle ORM + Zod validation)
- **electron/**: Electron app configuration (for desktop version)
- **data/**: JSON data storage (when using MemStorage)

## Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS, Radix UI, Wouter (routing)
- **Backend**: Express, TypeScript
- **Database**: Currently using MemStorage (JSON file-based), supports PostgreSQL via Drizzle ORM
- **Validation**: Zod schemas
- **Charts**: Recharts
- **PDF Generation**: jsPDF, PDFKit, pdf-lib

## Current Setup (Replit Environment)
The application is currently running with:
- **Port**: 5000 (frontend via Vite dev server)
- **Storage**: MemStorage (file-based JSON storage in `data/kayitlar.json`)
- **Host**: 0.0.0.0 (allows Replit proxy access)
- **Environment**: Development mode

## Data Storage

### Current: File-Based Storage (MemStorage)
The application currently uses a JSON file (`data/kayitlar.json`) to persist data. This approach:
- ✅ Works immediately without additional setup
- ✅ Suitable for single-user or small-scale usage
- ⚠️ Limited scalability
- ⚠️ No transaction support

### Optional: PostgreSQL Database Migration
To migrate to PostgreSQL for better data persistence and scalability:

1. **Create a PostgreSQL database** in Replit:
   - Click on "Tools" in the left sidebar
   - Select "Database"
   - Click "Create a database"
   - Replit will automatically set environment variables:
     - `DATABASE_URL`
     - `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`

2. **Update storage configuration** in `server/depolama.ts`:
   - Uncomment the `DbStorage` instantiation (around line 1154)
   - Comment out the `MemStorage` instantiation
   - Example:
     ```typescript
     // export const storage = new MemStorage();  // Comment this out
     export const storage = new DbStorage();      // Uncomment this
     ```

3. **Run database migrations**:
   ```bash
   npm run db:push
   ```

4. **Restart the application** - the workflow will auto-restart

## Features
- 📝 **Task Management**: Create, edit, and track daily tasks with priorities
- 📊 **Exam Analysis**: Track TYT/AYT exam results and subject-level performance
- 🎯 **Goal Tracking**: Set and monitor study goals
- 📈 **Progress Charts**: Visualize study progress over time
- 🧮 **Net Calculator**: Calculate exam net scores
- ⏱️ **Study Timer**: Track study hours
- 📚 **Question Log**: Log solved questions by topic
- 🌤️ **Weather Widget**: Display weather information (requires API key)
- 📧 **Email Features**: Send reports via email (requires email credentials)

## Environment Variables (Optional)
These environment variables are optional and enable specific features:
- `OPENWEATHER_API_KEY`: For weather widget functionality
- `GMAIL_USER` / `EMAIL_USER`: For email report features
- `GMAIL_PASS` / `EMAIL_PASS`: For email authentication
- `DATABASE_URL`: For PostgreSQL connection (auto-set by Replit Database)

## Development
- **Start development server**: `npm run dev` (already configured as workflow)
- **Build for production**: `npm run build`
- **Type checking**: `npm run check`

## Deployment
The application can be deployed on Replit using:
- **Autoscale**: For serverless deployment (recommended for web apps)
- **VM**: For always-on deployment (if using persistent connections)

## License
This project is licensed under MIT License. See LICENSE file for details.

## Recent Changes
- **2025-10-04**: Imported from GitHub and configured for Replit environment
  - Set up development workflow on port 5000
  - Verified MemStorage (file-based) functionality
  - Configured vite.config.ts with `allowedHosts: true` for Replit proxy
  - Application running successfully with Turkish YKS exam tracking features
