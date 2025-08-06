#!/bin/bash

echo "🌱 Starting Plant Identification System Locally..."
echo

echo "📋 Step 1: Checking Prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install from https://nodejs.org/"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Python not found! Please install from https://python.org/"
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo

echo "📋 Step 2: Starting MongoDB..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    
    # Try different ways to start MongoDB
    if command -v brew &> /dev/null; then
        # macOS with Homebrew
        brew services start mongodb/brew/mongodb-community
    elif command -v systemctl &> /dev/null; then
        # Linux with systemd
        sudo systemctl start mongod
    else
        echo "⚠️  Please start MongoDB manually"
        echo "   macOS: brew services start mongodb/brew/mongodb-community"
        echo "   Linux: sudo systemctl start mongod"
    fi
    
    # Wait for MongoDB to start
    sleep 3
fi

echo "✅ MongoDB should be running!"
echo

echo "📋 Step 3: Setting up Backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "Creating environment file..."
    echo "GEMINI_API_KEY=test_key" > .env
    echo "PORT=3000" >> .env
fi

echo "Seeding database..."
node seedPlants.js

echo "Starting backend server..."
node server.js &
BACKEND_PID=$!
echo "✅ Backend server started on http://localhost:3000 (PID: $BACKEND_PID)"
echo

echo "📋 Step 4: Setting up Frontend..."
cd ../mpr_sem5

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend server starting on http://localhost:5173 (PID: $FRONTEND_PID)"
echo

echo "📋 Step 5: Running tests..."
sleep 5
cd ..
node test_local_setup.js

echo
echo "🎉 Setup complete!"
echo
echo "🚀 Access your application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo
echo "🔧 To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   or press Ctrl+C"
echo

# Keep script running
echo "Press Ctrl+C to stop all servers..."
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait