#!/bin/bash

# English Language Exam Platform - Development Setup Script

echo "🚀 Starting English Language Exam Platform..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   You can install and start MongoDB, or use Docker:"
    echo "   docker run -d -p 27017:27017 --name mongodb mongo:7.0"
fi

# Create virtual environment for backend if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install backend dependencies
echo "📚 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Install frontend dependencies
echo "📚 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create uploads directory
mkdir -p backend/uploads/images
mkdir -p backend/uploads/audio

echo "✅ Setup complete!"
echo ""
echo "🏃 To start the application:"
echo "1. Backend: cd backend && uvicorn app.main:app --reload"
echo "2. Frontend: cd frontend && npm start"
echo ""
echo "🌐 Application will be available at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API Documentation: http://localhost:8000/docs"
echo ""
echo "👤 Demo accounts for testing:"
echo "   - teacher@demo.com / password: demo123 (Teacher)"
echo "   - admin@demo.com / password: demo123 (Admin)"