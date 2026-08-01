@echo off
setlocal EnableDelayedExpansion
title BillBoy Setup

:: ============================================================
::  BillBoy - Windows Setup Script
::  Installs prerequisites, builds the app, creates desktop icon
:: ============================================================

set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
set "DESKTOP=%USERPROFILE%\Desktop"
set "APP_NAME=BillBoy"

echo.
echo  ==============================================
echo    BillBoy - Setup and Installer
echo  ==============================================
echo.

:: -- 1. Check for Administrator rights ------------------------
net session >nul 2>&1
if %errorlevel% NEQ 0 (
    echo  [INFO] Running in user mode.
)

:: -- 2. Check / Install Node.js --------------------------------
echo  [STEP 1/5] Checking Node.js...
where node >nul 2>&1
if %errorlevel% NEQ 0 (
    echo  [INFO] Node.js not found. Downloading installer...
    powershell -NoProfile -Command "& { $url='https://nodejs.org/dist/v22.16.0/node-v22.16.0-x64.msi'; $out='%TEMP%\node_installer.msi'; Invoke-WebRequest -Uri $url -OutFile $out; Start-Process msiexec.exe -ArgumentList '/i',$out,'/qn','/norestart' -Wait; }"
    for /f "delims=" %%i in ('powershell -NoProfile -Command "[System.Environment]::GetEnvironmentVariable('PATH','Machine')"') do set "PATH=%%i;%PATH%"
    where node >nul 2>&1
    if !errorlevel! NEQ 0 (
        echo  [ERROR] Node.js installation failed. Please install Node.js from https://nodejs.org and re-run.
        pause
        exit /b 1
    )
    echo  [OK] Node.js installed successfully.
) else (
    for /f "delims=" %%v in ('node --version') do echo  [OK] Node.js %%v already installed.
)

:: -- 3. Check / Install Rust -----------------------------------
echo.
echo  [STEP 2/5] Checking Rust ^(required for Tauri^)...
where cargo >nul 2>&1
if %errorlevel% NEQ 0 (
    echo  [INFO] Rust not found. Downloading rustup...
    powershell -NoProfile -Command "& { $url='https://win.rustup.rs/x86_64'; $out='%TEMP%\rustup-init.exe'; Invoke-WebRequest -Uri $url -OutFile $out; Start-Process -FilePath $out -ArgumentList '-y','--default-toolchain','stable' -Wait; }"
    set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"
    where cargo >nul 2>&1
    if !errorlevel! NEQ 0 (
        echo  [ERROR] Rust installation failed. Please install Rust from https://rustup.rs and re-run.
        pause
        exit /b 1
    )
    echo  [OK] Rust installed successfully.
) else (
    for /f "delims=" %%v in ('cargo --version') do echo  [OK] Rust %%v already installed.
)
set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"

:: -- 4. Check / Install Microsoft WebView2 --------------------
echo.
echo  [STEP 3/5] Checking Microsoft WebView2 Runtime...
reg query "HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" >nul 2>&1
if %errorlevel% NEQ 0 (
    reg query "HKLM\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" >nul 2>&1
)
if %errorlevel% NEQ 0 (
    echo  [INFO] WebView2 not found. Downloading...
    powershell -NoProfile -Command "& { $url='https://go.microsoft.com/fwlink/p/?LinkId=2124703'; $out='%TEMP%\MicrosoftEdgeWebview2Setup.exe'; Invoke-WebRequest -Uri $url -OutFile $out; Start-Process -FilePath $out -ArgumentList '/silent /install' -Wait; }"
    echo  [OK] WebView2 installed.
) else (
    echo  [OK] WebView2 Runtime already installed.
)

:: -- 5. Install npm dependencies -------------------------------
echo.
echo  [STEP 4/5] Installing npm dependencies...
cd /d "%SCRIPT_DIR%"
call npm install
if %errorlevel% NEQ 0 (
    echo  [ERROR] npm install failed.
    pause
    exit /b 1
)
echo  [OK] npm dependencies installed.

:: -- 6. Build Tauri desktop app --------------------------------
echo.
echo  [STEP 5/5] Building BillBoy desktop app...
if not exist "%SCRIPT_DIR%\src-tauri" (
    echo  [INFO] Initializing Tauri configuration...
    call npx tauri init --app-name BillBoy --window-title BillBoy --dist-dir ../dist --dev-url http://localhost:5173 --before-dev-command "npm run dev" --before-build-command "npm run build" --ci
)
call npx tauri build
if %errorlevel% NEQ 0 (
    echo  [ERROR] Tauri build failed. See output above.
    pause
    exit /b 1
)
echo  [OK] Build complete!

:: -- 7. Locate the built .exe ---------------------------------
echo.
echo  [INFO] Locating built executable...
set "EXE_PATH="

for /r "%SCRIPT_DIR%\src-tauri\target\release\bundle" %%f in (*.exe) do (
    set "EXE_PATH=%%f"
)

if "%EXE_PATH%"=="" (
    for /f "delims=" %%f in ('dir /b /s "%SCRIPT_DIR%\src-tauri\target\release\*.exe" 2^>nul ^| findstr /v /i "deps build"') do (
        set "EXE_PATH=%%f"
    )
)

if "%EXE_PATH%"=="" (
    echo  [WARNING] Could not locate built executable automatically.
    pause
    exit /b 0
)

echo  [OK] Executable found: %EXE_PATH%

:: -- 8. Create desktop shortcut -------------------------------
echo.
echo  [INFO] Creating desktop shortcut...
set "SHORTCUT=%DESKTOP%\%APP_NAME%.lnk"

powershell -NoProfile -Command "& { $ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT%'); $s.TargetPath = '%EXE_PATH%'; $s.WorkingDirectory = Split-Path '%EXE_PATH%'; $s.Description = 'BillBoy Billing App'; $s.Save(); }"

if exist "%SHORTCUT%" (
    echo  [OK] Desktop shortcut created: %DESKTOP%\%APP_NAME%.lnk
) else (
    echo  [WARNING] Could not create shortcut automatically.
)

:: -- Done ------------------------------------------------------
echo.
echo  ==============================================
echo    Setup Complete!
echo    BillBoy is ready to use.
echo    Launch it from your Desktop icon.
echo  ==============================================
echo.
pause
endlocal
