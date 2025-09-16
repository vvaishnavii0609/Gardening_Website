@echo off
echo 🌱 Starting Plant Identification System Locally...
echo.

echo 📋 Step 1: Checking Prerequisites...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install from https://nodejs.org/
    pause
    exit /b 1
)

where python >nul 2>nul
if %errorlevel% neq 0 (
    where python3 >nul 2>nul
    if %errorlevel% neq 0 (
        echo ❌ Python not found! Please install from https://python.org/
        pause
        exit /b 1
    )
)

echo ✅ Prerequisites check passed!
echo.

echo 📋 Step 2: Starting MongoDB...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo Starting MongoDB service...
    net start MongoDB
    if %errorlevel% neq 0 (
        echo ❌ Failed to start MongoDB. Please install and configure MongoDB.
        echo Download from: https://www.mongodb.com/try/download/community
        pause
        exit /b 1
    )
)
echo ✅ MongoDB is running!
echo.

echo 📋 Step 3: Setting up Backend...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    npm install
)

if not exist .env (
    echo Creating environment file...
    echo GEMINI_API_KEY=test_key > .env
    echo PORT=3000 >> .env
)

echo Seeding database...
node seedPlants.js

echo Starting backend server...
start /b node server.js
echo ✅ Backend server started on http://localhost:3000
echo.

echo 📋 Step 4: Setting up Frontend...
cd ../mpr_sem5
if not exist node_modules (
    echo Installing frontend dependencies...
    npm install
)

echo Starting frontend development server...
start /b npm run dev
echo ✅ Frontend server starting on http://localhost:5173
echo.

echo 📋 Step 5: Running tests...
timeout /t 5 /nobreak > nul
cd ..
node test_local_setup.js

echo.
echo 🎉 Setup complete!
echo.
echo 🚀 Access your application:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3000
echo.
echo 🔧 To stop servers, close this window or press Ctrl+C
echo.
pause