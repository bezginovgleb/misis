import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Target,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { TaskStats, Task } from '../types';
import { tasksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, tasksData] = await Promise.all([
        tasksAPI.getStats(),
        tasksAPI.getTasks({ limit: 6 })
      ]);
      setStats(statsData);
      setRecentTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    return Math.round(value);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.username}!</h1>
            <p className="text-primary-100 mt-1">
              Ready to continue your English learning journey?
            </p>
          </div>
          <div className="hidden md:block">
            <BookOpen className="h-16 w-16 text-primary-200" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Tasks</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total_tasks}</p>
              </div>
              <div className="h-12 w-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Completed</p>
                <p className="text-3xl font-bold text-green-900">{stats.completed_tasks}</p>
              </div>
              <div className="h-12 w-12 bg-green-200 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Progress</p>
                <p className="text-3xl font-bold text-purple-900">
                  {formatPercentage(stats.overall_progress)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-200 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Total Score</p>
                <p className="text-3xl font-bold text-orange-900">{stats.total_score}</p>
              </div>
              <div className="h-12 w-12 bg-orange-200 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Progress */}
      {stats && stats.categories.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Progress by Category</h2>
          <div className="space-y-4">
            {stats.categories.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {category.category}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {category.completed}/{category.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${category.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="ml-4 text-sm font-medium text-gray-900">
                  {formatPercentage(category.progress_percentage)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/tasks"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-primary-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Browse All Tasks</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>
            
            <Link
              to="/tasks?not_completed_only=true"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center">
                <Target className="h-5 w-5 text-orange-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Continue Learning</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>
            
            {user?.role === 'teacher' || user?.role === 'admin' ? (
              <Link
                to="/create-task"
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <Plus className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Create New Task</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
            ) : null}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Tasks</h2>
            <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          
          {recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tasks available yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.slice(0, 4).map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">{task.category}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {task.is_completed && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className={`badge text-xs ${getDifficultyColor(task.difficulty)}`}>
                        {task.difficulty}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;