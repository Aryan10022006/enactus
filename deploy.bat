@echo off
REM Enactus Bidding App - Production Deployment Script (Windows)
REM Run this script to deploy to Firebase Hosting

echo.
echo ========================================
echo Enactus Bidding App - Deployment
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [OK] Node.js version:
node --version
echo [OK] npm version:
npm --version
echo.

REM Install dependencies
echo [STEP 1/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Build the app
echo [STEP 2/4] Building production bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)
echo [OK] Build completed successfully
echo.

REM Check if Firebase CLI is installed
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Firebase CLI not found. Installing...
    call npm install -g firebase-tools
)

echo [OK] Firebase CLI ready
echo.

REM Deploy to Firebase
echo [STEP 3/4] Deploying to Firebase Hosting...
call firebase deploy --only hosting
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Deployment failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Deployment successful!
echo ========================================
echo.
echo Your app is now live!
echo Check your Firebase Console for the URL
echo.
echo Next steps:
echo 1. Visit your app URL
echo 2. Test admin login at /#/admin
echo 3. Share URLs with your team
echo.
echo Happy bidding!
echo.
pause
