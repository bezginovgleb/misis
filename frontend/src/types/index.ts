export interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  progress: UserProgress;
  created_at: string;
}

export interface UserProgress {
  completed_tasks: string[];
  total_score: number;
  categories_completed: Record<string, number>;
}

export interface TaskContent {
  text: string;
  images: string[];
  audio?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  content: TaskContent;
  created_at: string;
  is_completed: boolean;
  show_answers: boolean;
  answers?: string[];
  explanation?: string;
}

export interface TaskCreate {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  text_content: string;
  answers: string[];
  explanation?: string;
  images?: File[];
  audio?: File;
}

export interface TaskFilter {
  category?: string;
  difficulty?: string;
  completed_only?: boolean;
  not_completed_only?: boolean;
  search?: string;
  limit?: number;
  skip?: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface TaskStats {
  total_tasks: number;
  completed_tasks: number;
  overall_progress: number;
  total_score: number;
  categories: CategoryStats[];
}

export interface CategoryStats {
  category: string;
  total: number;
  completed: number;
  progress_percentage: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type UserRole = 'student' | 'teacher' | 'admin';