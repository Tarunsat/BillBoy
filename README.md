# BillBoy - Offline Billing App

A cross-platform offline billing application built with React, Tauri, and Capacitor. It uses a single shared codebase and local SQLite database for completely offline functionality on Windows, macOS, Linux, Android, and iOS.

## Features
- **Completely Offline**: Uses local SQLite for all data storage.
- **Cross-Platform**: Works natively on Desktop (Tauri) and Mobile (Capacitor).
- **Fast Entry**: Quick input fields with auto-populating defaults for rapid bill generation.
- **Dynamic Math**: Automatically calculates luggage charges, commissions, and labor (coolie) fees.
- **Cumulative (Bulk) Billing**: Generate aggregated bills for specific customers across custom date ranges.
- **Print Ready**: Formatted bill documents ready for direct thermal or standard printing.
- **Configurable**: Easily update shop name, default customers, and commission percentages.

## Setup Instructions

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Initialize Tauri (if not already done)**
   ```bash
   npx tauri init
   ```
   *(Note: The project requires `biller.db` permissions configured in `src-tauri/tauri.conf.json` for SQLite to work correctly.)*

3. **Initialize Capacitor (if not already done)**
   ```bash
   npx cap init
   npx cap add android
   npx cap add ios
   ```

4. **Development**
   - Web: `npm run dev`
   - Desktop (Tauri): `npm run tauri dev`

5. **Build for all platforms**
   - **macOS/Linux**: Run the included bash script:
     ```bash
     chmod +x build.sh
     ./build.sh
     ```
   - **Windows**: Run the included batch file:
     ```cmd
     .\build.bat
     ```

## Stack
- React + TypeScript + Vite
- TailwindCSS for styling
- Tauri v2 (Desktop wrapper)
- Capacitor v6 (Mobile wrapper)
- SQLite (`@tauri-apps/plugin-sql` and `@capacitor-community/sqlite`)
