#!/bin/bash

echo "Building React frontend..."
npm run build

echo "Building Tauri (Desktop)..."
npx tauri build

echo "Syncing Capacitor (Mobile)..."
npx cap sync

echo "Build complete!"
echo "To build Android APK, open Android Studio:"
echo "  npx cap open android"
echo "To build iOS App, open Xcode:"
echo "  npx cap open ios"
