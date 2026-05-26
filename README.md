# Offline Billing App

A cross-platform offline billing application built with React, Tauri, and Capacitor. It uses a single shared codebase and local SQLite database for completely offline functionality on Windows, macOS, Linux, Android, and iOS.

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
   Run the included build script:
   ```bash
   chmod +x build.sh
   ./build.sh
   ```

## Stack
- React + TypeScript + Vite
- TailwindCSS for styling
- Tauri v2 (Desktop wrapper)
- Capacitor v6 (Mobile wrapper)
- SQLite (`@tauri-apps/plugin-sql` and `@capacitor-community/sqlite`)
# BillBoy
