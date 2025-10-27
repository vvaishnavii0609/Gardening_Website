# SmartPlant🌱

SmartPlant is a modern gardening application that helps users manage their plants, get gardening advice, and learn about various plants. The application features an intelligent chatbot powered by a custom neural network implementation using LSTM with attention mechanisms to provide gardening guidance.

## ✨ Features

- **🏠 Interactive Homepage**: Beautiful landing page with gardening tips and information
- **💬 Intelligent Chatbot**: AI-powered chatbot trained on gardening knowledge to answer user queries
- **📚 Plant Database**: Browse and search information about various plants
- **📤 Plant Upload**: Upload and store custom plant information in the database
- **🎨 Modern UI**: Built with Material-UI and Tailwind CSS for a responsive and aesthetic design
- **🧠 Custom Neural Networks**: From-scratch implementation of Attention, LSTM, Dense, and Embedding layers

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database for plant storage
- **Mongoose** - MongoDB object modeling
- **CORS** - Cross-origin resource sharing

### Machine Learning
- **Python** - ML backend
- **TensorFlow/Keras** - Deep learning framework
- **NumPy** - Numerical computing
- **GloVe Embeddings** - Pre-trained word embeddings

### Database
- **MongoDB** - NoSQL database
- **Firebase Data Connect** - Backend-as-a-Service integration


## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Python** (v3.8 or higher)
- **MongoDB** (locally or cloud instance)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vvaishnavii0609/Gardening_Website.git

   ```

2. **Install Frontend Dependencies**
   ```bash
   cd Mpr_sem5/mpr_sem5
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up MongoDB**
   - Make sure MongoDB is running on your local machine or update the connection string in `backend/server.js`
   - Default connection: `mongodb://localhost:27017/Mpr_sem5`

5. **Configure Environment Variables** (if needed)
   - Create a `.env` file in the backend directory if you need to customize settings

## 💻 Usage

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd Mpr_sem5/backend
   npm start
   ```
   The server will run on `http://localhost:3000`

2. **Start the Frontend Development Server**
   ```bash
   cd Mpr_sem5/mpr_sem5
   npm run dev
   ```
   The application will be available at `http://localhost:5173` (or the port shown in the terminal)

3. **Access the Application**
   - Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)




