#!/bin/bash

# EGE Task Platform Setup Script
# This script sets up the complete development environment

set -e  # Exit on any error

echo "🚀 Setting up EGE Task Platform..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed locally. You can:"
    echo "   1. Install MongoDB Community Edition"
    echo "   2. Use MongoDB Atlas (cloud)"
    echo "   3. Use Docker: docker run -d -p 27017:27017 --name mongodb mongo:6.0"
fi

# Create project structure
echo "📁 Creating project structure..."
mkdir -p ege-task-platform
cd ege-task-platform

# Initialize root package.json
echo "📦 Initializing root package.json..."
cat > package.json << 'EOF'
{
  "name": "ege-task-platform",
  "version": "1.0.0",
  "description": "EGE Task Database & Practice Platform",
  "main": "index.js",
  "scripts": {
    "dev": "concurrently \"npm run server:dev\" \"npm run client:dev\"",
    "server:dev": "cd server && npm run dev",
    "client:dev": "cd client && npm run dev",
    "server:start": "cd server && npm start",
    "client:build": "cd client && npm run build",
    "install:all": "npm install && cd server && npm install && cd ../client && npm install",
    "setup": "npm run install:all && npm run copy:env",
    "copy:env": "cp server/.env.example server/.env && cp client/.env.example client/.env"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-username/ege-task-platform.git"
  },
  "keywords": [
    "ege",
    "education",
    "mern",
    "react",
    "nodejs",
    "mongodb",
    "exam"
  ],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
EOF

# Create directory structure
echo "📂 Creating directory structure..."
mkdir -p client/src/{components,pages,store,services,hooks,utils} 
mkdir -p client/src/components/{common,tasks,exam,user,offline}
mkdir -p client/public
mkdir -p server/src/{routes,models,middleware,controllers,utils,config}
mkdir -p server/uploads
mkdir -p shared/{types,utils}

# Setup Backend
echo "🔧 Setting up backend..."
cd server

# Create server package.json
cat > package.json << 'EOF'
{
  "name": "ege-task-platform-server",
  "version": "1.0.0",
  "description": "Backend for EGE Task Platform",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5",
    "puppeteer": "^21.5.2",
    "node-cron": "^3.0.3",
    "nodemailer": "^6.9.7",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "concurrently": "^8.2.2",
    "eslint": "^8.55.0",
    "prettier": "^3.1.1",
    "jest": "^29.7.0"
  }
}
EOF

# Create environment file template
cat > .env.example << 'EOF'
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGO_URI=mongodb://localhost:27017/ege_tasks
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_change_this_in_production

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10000000

# Scraping Configuration
SCRAPE_INTERVAL=0 2 * * *
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Setup Frontend
echo "🎨 Setting up frontend..."
cd ../client

# Create React app with Vite
npm create vite@latest . -- --template react --yes

# Update package.json with additional dependencies
npm install @reduxjs/toolkit react-redux react-router-dom
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/x-date-pickers
npm install axios react-hook-form yup @hookform/resolvers
npm install react-query workbox-webpack-plugin

# Create environment file template
cat > .env.example << 'EOF'
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=EGE Task Platform
VITE_APP_VERSION=1.0.0
EOF

# Setup Frontend Structure
echo "🏗️  Creating frontend components structure..."

# Create basic layout component
mkdir -p src/components/Layout
cat > src/components/Layout/Layout.jsx << 'EOF'
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const Layout = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EGE Task Platform
          </Typography>
          {isAuthenticated ? (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Welcome, {user?.username}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" href="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
EOF

# Create ProtectedRoute component
cat > src/components/ProtectedRoute.jsx << 'EOF'
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
EOF

# Create basic pages
mkdir -p src/pages

cat > src/pages/HomePage.jsx << 'EOF'
import React from 'react';
import { Typography, Container, Box, Button, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);

  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          EGE Task Platform
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Comprehensive platform for EGE exam preparation
        </Typography>
        
        {!isAuthenticated && (
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/register')}
              sx={{ mr: 2 }}
            >
              Get Started
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </Box>
        )}

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Task Database
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access thousands of EGE tasks across all subjects, automatically parsed from FIPI.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Exam Mode
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Practice with timed exams that simulate real EGE conditions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Progress Tracking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor your performance and identify areas for improvement.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;
EOF

cat > src/pages/LoginPage.jsx << 'EOF'
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { loginUser } from '../store/authSlice';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(formData)).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="login"
              label="Email or Username"
              name="login"
              autoComplete="email"
              autoFocus
              value={formData.login}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
            <Box textAlign="center">
              <Link to="/register">
                Don't have an account? Sign Up
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
EOF

# Setup basic store slices
echo "🗃️  Creating Redux store..."

cat > src/store/uiSlice.js << 'EOF'
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  error: null,
  theme: 'light',
  sidebarOpen: false,
  notifications: []
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    }
  }
});

export const {
  setLoading,
  setError,
  clearError,
  toggleTheme,
  toggleSidebar,
  addNotification,
  removeNotification
} = uiSlice.actions;

export default uiSlice.reducer;
EOF

cat > src/store/tasksSlice.js << 'EOF'
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  categories: [],
  subjects: [],
  currentTask: null,
  filters: {
    subject: '',
    difficulty: '',
    completed: null,
    search: ''
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  loading: false,
  error: null
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setSubjects: (state, action) => {
      state.subjects = action.payload;
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const {
  setTasks,
  setCategories,
  setSubjects,
  setCurrentTask,
  setFilters,
  clearFilters,
  setPagination,
  setLoading,
  setError
} = tasksSlice.actions;

export default tasksSlice.reducer;
EOF

cat > src/store/examSlice.js << 'EOF'
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSession: null,
  sessions: [],
  currentTaskIndex: 0,
  answers: {},
  timeRemaining: 0,
  isActive: false,
  results: null,
  loading: false,
  error: null
};

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    startExam: (state, action) => {
      state.currentSession = action.payload;
      state.currentTaskIndex = 0;
      state.answers = {};
      state.timeRemaining = action.payload.config.timeLimit * 60;
      state.isActive = true;
      state.results = null;
    },
    setCurrentTaskIndex: (state, action) => {
      state.currentTaskIndex = action.payload;
    },
    submitAnswer: (state, action) => {
      const { taskId, answer } = action.payload;
      state.answers[taskId] = answer;
    },
    decrementTime: (state) => {
      if (state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
    },
    finishExam: (state, action) => {
      state.isActive = false;
      state.results = action.payload;
    },
    resetExam: (state) => {
      state.currentSession = null;
      state.currentTaskIndex = 0;
      state.answers = {};
      state.timeRemaining = 0;
      state.isActive = false;
      state.results = null;
    },
    setSessions: (state, action) => {
      state.sessions = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const {
  startExam,
  setCurrentTaskIndex,
  submitAnswer,
  decrementTime,
  finishExam,
  resetExam,
  setSessions,
  setLoading,
  setError
} = examSlice.actions;

export default examSlice.reducer;
EOF

cd ..

# Create git repository
echo "📝 Initializing Git repository..."
git init
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
build/
dist/
*/build/
*/dist/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Uploads
server/uploads/*
!server/uploads/.gitkeep

# Database
*.db
*.sqlite

# Cache
.npm
.eslintcache
EOF

# Create uploads directory with gitkeep
touch server/uploads/.gitkeep

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. cd ege-task-platform"
echo "2. npm run setup          # Install all dependencies and copy env files"
echo "3. Edit server/.env       # Configure your database and other settings"
echo "4. npm run dev           # Start both frontend and backend"
echo ""
echo "📚 Documentation:"
echo "- See PROJECT_SPECIFICATION.md for full technical specs"
echo "- See IMPLEMENTATION_GUIDE.md for detailed implementation steps"
echo ""
echo "🗃️  Database setup:"
echo "Make sure MongoDB is running on mongodb://localhost:27017"
echo "Or update MONGO_URI in server/.env"
echo ""
echo "Happy coding! 🚀"