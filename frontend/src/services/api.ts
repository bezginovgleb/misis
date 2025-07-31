import axios, { AxiosResponse } from 'axios';
import { Task, User, TaskCreate, TaskFilter, TaskStats } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<{ access_token: string; token_type: string }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<User> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/auth/users');
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getTasks: async (filters?: TaskFilter): Promise<Task[]> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  getTask: async (taskId: string): Promise<Task> => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (taskData: TaskCreate): Promise<Task> => {
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', taskData.title);
    formData.append('description', taskData.description);
    formData.append('category', taskData.category);
    formData.append('difficulty', taskData.difficulty);
    formData.append('text_content', taskData.text_content);
    formData.append('answers', JSON.stringify(taskData.answers));
    
    if (taskData.explanation) {
      formData.append('explanation', taskData.explanation);
    }
    
    // Add files
    if (taskData.images && taskData.images.length > 0) {
      taskData.images.forEach((image) => {
        formData.append('images', image);
      });
    }
    
    if (taskData.audio) {
      formData.append('audio', taskData.audio);
    }

    const response = await api.post('/tasks/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  completeTask: async (taskId: string, userAnswers: string[]): Promise<Task> => {
    const response = await api.post(`/tasks/${taskId}/complete`, {
      task_id: taskId,
      user_answers: userAnswers,
    });
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },

  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/tasks/categories/list');
    return response.data.categories;
  },

  getStats: async (): Promise<TaskStats> => {
    const response = await api.get('/tasks/stats/overview');
    return response.data;
  },
};

// File upload helper
export const uploadFile = async (file: File, type: 'image' | 'audio'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const endpoint = type === 'image' ? '/upload/image' : '/upload/audio';
  const response = await api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.file_url;
};

export default api;