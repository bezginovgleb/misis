# EGE Task Management System - Technical Specification

## Project Overview

**Name:** EGE Task Database & Practice Platform  
**Type:** Full-stack web application  
**Tech Stack:** MERN (MongoDB, Express.js, React.js, Node.js)  
**Purpose:** Comprehensive EGE task management system with automated parsing, filtering, and exam simulation

## 1. System Architecture

### 1.1 High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express API    │    │    MongoDB      │
│                 │◄──►│                 │◄──►│                 │
│  - Task Display │    │ - CRUD Ops      │    │ - Tasks         │
│  - Filters      │    │ - Auth          │    │ - Users         │
│  - Exam Mode    │    │ - Scraper       │    │ - Results       │
│  - Offline DB   │    │ - Aggregation   │    │ - Categories    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         │              │ FIPI Scraper    │
         │              │                 │
         │              │ - Puppeteer     │
         │              │ - Schedule Jobs │
         │              │ - Parse Tasks   │
         │              └─────────────────┘
         │
┌─────────────────┐
│ Service Worker  │
│                 │
│ - Offline Cache │
│ - DB Download   │
│ - Sync Manager  │
└─────────────────┘
```

### 1.2 Technology Stack

**Frontend:**
- React 18.x with Hooks
- Redux Toolkit for state management
- React Router v6 for navigation
- Material-UI or Tailwind CSS for styling
- Service Worker for offline functionality
- Axios for API communication

**Backend:**
- Node.js 18+
- Express.js 4.x
- Mongoose ODM for MongoDB
- JWT for authentication
- Puppeteer for web scraping
- Node-cron for scheduled tasks
- Multer for file uploads

**Database:**
- MongoDB 6.x
- Redis for caching (optional)

**DevOps & Tools:**
- Docker for containerization
- PM2 for process management
- ESLint + Prettier for code quality
- Jest for testing

## 2. Database Schema Design

### 2.1 Core Collections

**Tasks Collection:**
```javascript
{
  _id: ObjectId,
  fipiId: String, // Unique ID from FIPI
  title: String,
  description: String,
  content: {
    html: String,
    images: [String], // URLs
    attachments: [String]
  },
  category: {
    subject: String, // "mathematics", "russian", "physics", etc.
    type: String, // "task_type_1", "task_type_2", etc.
    difficulty: Number, // 1-5
    topic: String
  },
  answers: {
    correct: [String],
    options: [String], // for multiple choice
    explanation: String
  },
  metadata: {
    year: Number,
    source: String, // "fipi"
    scraped_at: Date,
    updated_at: Date,
    view_count: Number
  },
  tags: [String]
}
```

**Users Collection:**
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password_hash: String,
  role: String, // "student", "teacher", "admin"
  profile: {
    full_name: String,
    grade: String,
    school: String,
    target_subjects: [String]
  },
  settings: {
    theme: String,
    language: String,
    notifications: Boolean
  },
  created_at: Date,
  last_login: Date
}
```

**UserResults Collection:**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  task_id: ObjectId,
  attempt: {
    user_answer: [String],
    is_correct: Boolean,
    score: Number,
    time_spent: Number, // seconds
    attempted_at: Date
  },
  attempts_count: Number,
  best_score: Number,
  first_completed: Date,
  last_attempted: Date
}
```

**ExamSessions Collection:**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  session_type: String, // "practice", "mock_exam", "timed"
  config: {
    subject: String,
    task_count: Number,
    time_limit: Number, // minutes
    difficulty_range: [Number, Number]
  },
  tasks: [{
    task_id: ObjectId,
    user_answer: [String],
    is_correct: Boolean,
    time_spent: Number,
    score: Number
  }],
  results: {
    total_score: Number,
    max_score: Number,
    percentage: Number,
    time_used: Number,
    completed_at: Date
  },
  started_at: Date,
  status: String // "in_progress", "completed", "abandoned"
}
```

**Categories Collection:**
```javascript
{
  _id: ObjectId,
  subject: String,
  type: String,
  name: String,
  description: String,
  task_count: Number,
  difficulty_distribution: {
    easy: Number,
    medium: Number,
    hard: Number
  }
}
```

## 3. API Design

### 3.1 Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### 3.2 Task Management Endpoints
```
GET    /api/tasks                 # Get filtered tasks
GET    /api/tasks/:id             # Get specific task
GET    /api/tasks/random          # Get random tasks for practice
GET    /api/tasks/categories      # Get all categories
GET    /api/tasks/subjects        # Get all subjects
POST   /api/tasks/search          # Advanced search
```

### 3.3 User Progress Endpoints
```
GET    /api/users/:id/progress    # Get user progress
POST   /api/users/:id/attempt     # Submit task attempt
GET    /api/users/:id/results     # Get user results
GET    /api/users/:id/statistics  # Get detailed statistics
```

### 3.4 Exam Session Endpoints
```
POST   /api/exam/start            # Start exam session
GET    /api/exam/:sessionId       # Get session details
PUT    /api/exam/:sessionId/submit # Submit answers
POST   /api/exam/:sessionId/finish # Finish session
GET    /api/exam/:sessionId/results # Get session results
```

### 3.5 System Endpoints
```
GET    /api/system/health         # Health check
POST   /api/system/sync           # Trigger data sync
GET    /api/system/export         # Export database
POST   /api/admin/scrape          # Manual scraping trigger
```

## 4. Frontend Architecture

### 4.1 Component Structure
```
src/
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorBoundary.jsx
│   ├── tasks/
│   │   ├── TaskCard.jsx
│   │   ├── TaskList.jsx
│   │   ├── TaskDetail.jsx
│   │   ├── TaskFilters.jsx
│   │   └── TaskSearchBar.jsx
│   ├── exam/
│   │   ├── ExamSetup.jsx
│   │   ├── ExamInterface.jsx
│   │   ├── Timer.jsx
│   │   ├── ProgressBar.jsx
│   │   └── ResultsDisplay.jsx
│   ├── user/
│   │   ├── Profile.jsx
│   │   ├── Statistics.jsx
│   │   ├── Settings.jsx
│   │   └── Progress.jsx
│   └── offline/
│       ├── DatabaseDownload.jsx
│       ├── SyncStatus.jsx
│       └── OfflineIndicator.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── TasksPage.jsx
│   ├── ExamPage.jsx
│   ├── ProfilePage.jsx
│   ├── StatisticsPage.jsx
│   └── OfflinePage.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useTasks.js
│   ├── useExam.js
│   ├── useOffline.js
│   └── useTimer.js
├── store/
│   ├── index.js
│   ├── authSlice.js
│   ├── tasksSlice.js
│   ├── examSlice.js
│   └── offlineSlice.js
├── services/
│   ├── api.js
│   ├── offline.js
│   ├── indexedDB.js
│   └── serviceWorker.js
└── utils/
    ├── constants.js
    ├── helpers.js
    └── validators.js
```

### 4.2 State Management (Redux Toolkit)

**Auth Slice:**
```javascript
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
    loginStart: (state) => { state.loading = true; },
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    }
  }
});
```

**Tasks Slice:**
```javascript
const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    categories: [],
    filters: {
      subject: '',
      difficulty: '',
      completed: null,
      search: ''
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0
    },
    loading: false
  },
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    }
  }
});
```

## 5. FIPI Website Scraper Implementation

### 5.1 Scraper Architecture
```javascript
class FIPIScraper {
  constructor() {
    this.browser = null;
    this.baseUrl = 'https://fipi.ru/ege/otkrytyy-bank-zadaniy-ege';
    this.subjects = [
      'matematik', 'russkiy-yazyk', 'fizika', 'khimiya',
      'informatika', 'biologiya', 'istoriya', 'geografiya',
      'obshchestvoznanie', 'literatura', 'inostrannyy-yazyk'
    ];
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async scrapeSubject(subject) {
    const page = await this.browser.newPage();
    await page.goto(`${this.baseUrl}/${subject}`);
    
    // Navigate through pagination and extract tasks
    const tasks = [];
    let currentPage = 1;
    
    while (await this.hasNextPage(page)) {
      const pageTasks = await this.extractTasksFromPage(page);
      tasks.push(...pageTasks);
      
      if (await this.hasNextPage(page)) {
        await this.goToNextPage(page);
        currentPage++;
      }
    }
    
    await page.close();
    return tasks;
  }

  async extractTasksFromPage(page) {
    return await page.evaluate(() => {
      const taskElements = document.querySelectorAll('.task-item');
      return Array.from(taskElements).map(element => ({
        fipiId: element.dataset.id,
        title: element.querySelector('.task-title')?.textContent,
        content: element.querySelector('.task-content')?.innerHTML,
        category: element.querySelector('.task-category')?.textContent,
        difficulty: parseInt(element.dataset.difficulty) || 1
      }));
    });
  }
}
```

### 5.2 Scheduled Scraping
```javascript
const cron = require('node-cron');

// Run scraper daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Starting scheduled FIPI scraping...');
  
  const scraper = new FIPIScraper();
  await scraper.initialize();
  
  for (const subject of scraper.subjects) {
    try {
      const tasks = await scraper.scrapeSubject(subject);
      await saveTasks(tasks, subject);
      console.log(`Scraped ${tasks.length} tasks for ${subject}`);
    } catch (error) {
      console.error(`Error scraping ${subject}:`, error);
    }
  }
  
  await scraper.close();
  console.log('Scraping completed');
});
```

## 6. Key Features Implementation

### 6.1 Task Filtering System
```javascript
// Backend filter logic
const getFilteredTasks = async (filters) => {
  const query = {};
  
  if (filters.subject) {
    query['category.subject'] = filters.subject;
  }
  
  if (filters.difficulty) {
    query['category.difficulty'] = filters.difficulty;
  }
  
  if (filters.completed !== null) {
    // Join with UserResults to filter completed tasks
    const completedTaskIds = await UserResult.distinct('task_id', {
      user_id: filters.userId,
      'attempt.is_correct': filters.completed
    });
    
    if (filters.completed) {
      query._id = { $in: completedTaskIds };
    } else {
      query._id = { $nin: completedTaskIds };
    }
  }
  
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  return await Task.find(query)
    .sort({ 'metadata.updated_at': -1 })
    .limit(filters.limit)
    .skip((filters.page - 1) * filters.limit);
};
```

### 6.2 Exam Mode Implementation
```javascript
// Frontend exam component
const ExamMode = () => {
  const [session, setSession] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answers, setAnswers] = useState({});

  const startExam = async (config) => {
    const response = await api.post('/api/exam/start', config);
    setSession(response.data);
    setTimeRemaining(config.timeLimit * 60); // Convert to seconds
  };

  const submitAnswer = (taskId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [taskId]: answer
    }));
  };

  const finishExam = async () => {
    await api.post(`/api/exam/${session.id}/finish`, {
      answers,
      timeUsed: session.config.timeLimit * 60 - timeRemaining
    });
  };

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (session && timeRemaining === 0) {
      finishExam();
    }
  }, [timeRemaining, session]);

  return (
    <div className="exam-interface">
      <Timer timeRemaining={timeRemaining} />
      <ProgressBar 
        current={currentTaskIndex + 1} 
        total={session?.tasks.length || 0} 
      />
      <TaskDisplay 
        task={session?.tasks[currentTaskIndex]}
        onAnswerSubmit={submitAnswer}
      />
      <NavigationControls 
        onNext={() => setCurrentTaskIndex(prev => prev + 1)}
        onPrevious={() => setCurrentTaskIndex(prev => prev - 1)}
        onFinish={finishExam}
      />
    </div>
  );
};
```

### 6.3 Offline Functionality
```javascript
// Service Worker for offline support
const CACHE_NAME = 'ege-tasks-v1';
const OFFLINE_DB_NAME = 'ege-offline-db';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css',
        '/offline.html'
      ]);
    })
  );
});

// Database download functionality
const downloadDatabase = async () => {
  try {
    const response = await fetch('/api/system/export');
    const data = await response.json();
    
    // Store in IndexedDB
    const db = await openDB(OFFLINE_DB_NAME, 1, {
      upgrade(db) {
        const store = db.createObjectStore('tasks', { keyPath: '_id' });
        store.createIndex('subject', 'category.subject');
        store.createIndex('difficulty', 'category.difficulty');
      }
    });
    
    const tx = db.transaction('tasks', 'readwrite');
    for (const task of data.tasks) {
      await tx.store.put(task);
    }
    await tx.done;
    
    return { success: true, count: data.tasks.length };
  } catch (error) {
    console.error('Database download failed:', error);
    return { success: false, error: error.message };
  }
};
```

## 7. Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up project structure
- [ ] Initialize MERN stack
- [ ] Create basic database schemas
- [ ] Implement authentication system
- [ ] Set up development environment

### Phase 2: Core Features (Weeks 3-4)
- [ ] Build FIPI scraper
- [ ] Implement task management API
- [ ] Create task display components
- [ ] Add filtering system
- [ ] Basic user interface

### Phase 3: Advanced Features (Weeks 5-6)
- [ ] Implement exam mode
- [ ] Add progress tracking
- [ ] Create statistics dashboard
- [ ] Implement offline functionality
- [ ] Add database download feature

### Phase 4: Testing & Optimization (Weeks 7-8)
- [ ] Unit and integration testing
- [ ] Performance optimization
- [ ] UI/UX improvements
- [ ] Security audit
- [ ] Documentation

## 8. Deployment Strategy

### 8.1 Development Environment
```bash
# Clone repository
git clone <repository-url>
cd ege-task-platform

# Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# Set up environment variables
cp .env.example .env

# Start development servers
npm run dev
```

### 8.2 Production Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:6.0
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}

  backend:
    build: ./server
    environment:
      NODE_ENV: production
      MONGO_URI: mongodb://mongodb:27017/ege_tasks
    depends_on:
      - mongodb

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo_data:
```

## 9. Success Metrics

### 9.1 Technical Metrics
- **Performance:** Page load time < 2 seconds
- **Availability:** 99.9% uptime
- **Scalability:** Support 10,000+ concurrent users
- **Data Accuracy:** 99.9% task parsing accuracy

### 9.2 User Metrics
- **Task Database:** 10,000+ EGE tasks across all subjects
- **User Engagement:** Average session duration > 15 minutes
- **Completion Rate:** 80% of started exams completed
- **Offline Usage:** 40% of users use offline features

## 10. Security Considerations

- **Authentication:** JWT tokens with refresh mechanism
- **Data Validation:** Input sanitization and validation
- **Rate Limiting:** API rate limiting to prevent abuse
- **HTTPS:** SSL/TLS encryption for all communications
- **Database Security:** MongoDB authentication and encryption
- **Content Security:** CSP headers and XSS protection

## 11. Future Enhancements

- **Mobile Apps:** Native iOS/Android applications
- **AI Features:** Adaptive learning and task recommendations
- **Analytics:** Advanced learning analytics
- **Collaboration:** Study groups and peer learning
- **Gamification:** Points, badges, and leaderboards
- **Integration:** Integration with school management systems

This technical specification provides a comprehensive roadmap for building a robust EGE task management system that meets all your requirements while leveraging modern web technologies and best practices.