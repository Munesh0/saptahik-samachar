@echo off
echo ==========================================
echo   साप्ताहिक समाचार - Setup Script
echo ==========================================
echo.

node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

echo 📦 Installing dependencies...
call npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

if not exist ".env.local" (
    echo ⚠️  .env.local not found!
    echo    Please create .env.local with your Supabase credentials.
    echo    Copy from .env.local.example and fill in your values.
    echo.
)

echo 🚀 Starting development server...
echo    Open http://localhost:3000 in your browser
echo.
call npm run dev
