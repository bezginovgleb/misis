# English Language Exam Platform

A comprehensive platform for creating, managing, and solving English language exam tasks with multimedia support.

## 🏗️ Architecture Overview

### Backend (FastAPI + MongoDB)
- **API Layer**: FastAPI for RESTful APIs
- **Database**: MongoDB for flexible document storage
- **File Storage**: Local storage with options for cloud integration
- **Authentication**: JWT-based user authentication

### Frontend (React + TypeScript)
- **UI Framework**: React with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context + useReducer
- **HTTP Client**: Axios for API communication

## 📁 Project Structure

```
exam-platform/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── models/            # Database models
│   │   ├── routers/           # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   └── main.py            # FastAPI application
│   ├── uploads/               # File storage
│   └── requirements.txt       # Python dependencies
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API services
│   │   └── types/             # TypeScript types
│   ├── public/
│   └── package.json           # Node dependencies
└── docker-compose.yml         # Development setup
```

## 🚀 Features

### Task Management
- ✅ Multimedia task creation (text, images, audio)
- ✅ Category-based organization
- ✅ Hidden answers with reveal functionality
- ✅ Social media-like interface

### User Experience
- ✅ User authentication and profiles
- ✅ Progress tracking
- ✅ Completion status indicators
- ✅ Advanced filtering (category, completion status)

### Technical Features
- ✅ Responsive design
- ✅ File upload handling
- ✅ RESTful API architecture
- ✅ MongoDB document storage

## 🛠️ Setup Instructions

### Quick Start
```bash
# Make setup script executable and run it
chmod +x run.sh
./run.sh
```

### Manual Setup

1. **Prerequisites**
   - Python 3.8+
   - Node.js 16+
   - MongoDB 5.0+

2. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd exam-platform
   ```

3. **Backend Setup**
   ```bash
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   cd backend
   pip install -r requirements.txt
   
   # Start the server
   uvicorn app.main:app --reload
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

5. **Database Setup**
   - Install MongoDB locally or use Docker:
     ```bash
     docker run -d -p 27017:27017 --name mongodb mongo:7.0
     ```
   - The application will automatically create the database and collections

### Using Docker Compose
```bash
docker-compose up -d
```

## 📊 Database Schema

### Tasks Collection
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "category": "string",
  "difficulty": "string",
  "content": {
    "text": "string",
    "images": ["string"],
    "audio": "string"
  },
  "answers": ["string"],
  "created_by": "ObjectId",
  "created_at": "datetime"
}
```

### Users Collection
```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "password_hash": "string",
  "role": "string",
  "progress": {
    "completed_tasks": ["ObjectId"],
    "total_score": "number"
  }
}
```

## 🎯 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Tasks
- `GET /tasks` - Get tasks with filters
- `POST /tasks` - Create new task (admin)
- `GET /tasks/{id}` - Get specific task
- `POST /tasks/{id}/complete` - Mark task as completed

### User Progress
- `GET /users/progress` - Get user progress
- `POST /users/progress` - Update progress

## 🔧 Technology Stack

- **Backend**: FastAPI, MongoDB, PyJWT, Pillow
- **Frontend**: React, TypeScript, Tailwind CSS, Axios
- **Database**: MongoDB
- **Development**: Docker, Uvicorn, Vite

## 📱 User Interface

The platform features a modern, social media-inspired interface with:
- Task cards displaying multimedia content
- Filter sidebar for categories and completion status
- Modal-based task solving interface
- Progress tracking dashboard
- Responsive design for all devices

## 🚀 Getting Started

1. **Run the setup script**: `./run.sh`
2. **Start MongoDB** (if not using Docker)
3. **Start the backend**: `cd backend && uvicorn app.main:app --reload`
4. **Start the frontend**: `cd frontend && npm start`
5. **Access the application**: http://localhost:3000

### Demo Accounts
- **Teacher**: teacher@demo.com / demo123
- **Student**: student@demo.com / demo123
- **Admin**: admin@demo.com / demo123

## 🎯 Key Features Implemented

### ✅ Core Functionality
- **User Authentication**: JWT-based login/register system
- **Task Management**: Create, read, update, delete tasks with multimedia
- **Progress Tracking**: User completion status and scoring
- **Filtering System**: Category, difficulty, and completion filters
- **File Upload**: Images and audio with validation and optimization
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### ✅ Backend Features
- **FastAPI**: Modern Python web framework with automatic API documentation
- **MongoDB**: NoSQL database with flexible schema
- **File Handling**: Secure file upload with size and type validation
- **Authentication**: JWT tokens with role-based access control
- **API Documentation**: Automatic Swagger/OpenAPI documentation

### ✅ Frontend Features
- **React + TypeScript**: Type-safe frontend development
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **State Management**: React Context for global state
- **Form Handling**: React Hook Form with validation
- **File Upload**: Drag-and-drop interface with React Dropzone
- **Toast Notifications**: User feedback with React Hot Toast

## 🔧 Architecture Highlights

- **Separation of Concerns**: Clear separation between frontend and backend
- **Type Safety**: Full TypeScript support across the application
- **Error Handling**: Comprehensive error handling and user feedback
- **Security**: Password hashing, JWT authentication, file validation
- **Performance**: Image optimization, lazy loading, efficient queries
- **Scalability**: Modular architecture ready for production deployment