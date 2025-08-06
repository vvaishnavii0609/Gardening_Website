# Local Setup Guide for Plant Identification System

## Prerequisites

### 1. Install Node.js & npm
- Download from: https://nodejs.org/
- Version: 16.x or higher recommended
- Verify installation:
```bash
node --version
npm --version
```

### 2. Install Python 3
- Download from: https://python.org/
- Version: 3.8 or higher
- **Important**: Add Python to PATH during installation
- Verify installation:
```bash
python3 --version
# or on Windows:
python --version
```

### 3. Install MongoDB
- Download from: https://www.mongodb.com/try/download/community
- Follow installation guide for your OS
- Start MongoDB service:
```bash
# On Windows (run as administrator):
net start MongoDB

# On macOS:
brew services start mongodb/brew/mongodb-community

# On Linux:
sudo systemctl start mongod
```

### 4. Install Git
- Download from: https://git-scm.com/
- Verify installation:
```bash
git --version
```

## Project Setup

### Step 1: Clone the Repository
```bash
# Clone your repository
git clone https://github.com/vvaishnavii0609/Gardening_Website.git
cd Gardening_Website
```

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Node.js dependencies
npm install

# Create environment file
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
echo "PORT=3000" >> .env

# Start MongoDB (if not already running)
# Windows: net start MongoDB
# macOS: brew services start mongodb/brew/mongodb-community
# Linux: sudo systemctl start mongod

# Seed the database with plant data
node seedPlants.js

# Start the backend server
node server.js
```

### Step 3: Frontend Setup
```bash
# Open new terminal/command prompt
# Navigate to frontend directory
cd mpr_sem5

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Testing the Application

### 1. Test Backend APIs
Open a new terminal and test the endpoints:

```bash
# Test plant identification
curl -X POST http://localhost:3000/api/identify-plant \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,test_image_data"}'

# Test health analysis
curl -X POST http://localhost:3000/api/analyze-health \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,test_image_data"}'

# Test plant database
curl http://localhost:3000/api/plants
```

### 2. Test Frontend
- Open browser and go to: `http://localhost:5173` (or the URL shown in terminal)
- Navigate through different pages:
  - Home page
  - Plant Identification page
  - Chatbot page
  - Services page

### 3. Test Plant Identification Feature
1. Go to Plant Identification page
2. Upload an image or use camera
3. Click "Identify Plant"
4. Check if you get results without errors

## Troubleshooting

### Common Issues:

#### MongoDB Connection Error
```bash
# Check if MongoDB is running
# Windows:
sc query MongoDB

# macOS/Linux:
ps aux | grep mongod
```

#### Port Already in Use
```bash
# Find process using port 3000
# Windows:
netstat -ano | findstr :3000

# macOS/Linux:
lsof -i :3000

# Kill the process if needed
# Windows:
taskkill /PID <process_id> /F

# macOS/Linux:
kill -9 <process_id>
```

#### Python Command Issues
- On Windows, you might need to use `python` instead of `python3`
- Update the server.js file if needed:
```javascript
// Change line 206 and 240 in server.js
const pythonProcess = spawn('python', ['ml/plantIdentification.py']);
```

#### Node.js Dependencies Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Project Structure
```
Gardening_Website/
├── backend/                 # Node.js backend
│   ├── server.js           # Main server file
│   ├── ml/                 # ML components
│   ├── models/             # Database models
│   └── package.json        # Backend dependencies
├── mpr_sem5/               # React frontend
│   ├── src/                # Source code
│   ├── public/             # Static files
│   └── package.json        # Frontend dependencies
└── README.md
```

## Next Steps
1. Test all features work correctly
2. Check browser console for any errors
3. Verify database operations
4. Test with real images for plant identification
5. Customize and enhance features as needed