import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, CheckCircle, Clock, Volume2, Image } from 'lucide-react';
import { Task, TaskFilter } from '../types';
import { tasksAPI } from '../services/api';
import toast from 'react-hot-toast';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<TaskFilter>({
    limit: 20,
    skip: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await tasksAPI.getTasks(filters);
      setTasks(fetchedTasks);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await tasksAPI.getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchTerm, skip: 0 });
  };

  const handleFilterChange = (key: keyof TaskFilter, value: any) => {
    setFilters({ ...filters, [key]: value, skip: 0 });
  };

  const clearFilters = () => {
    setFilters({ limit: 20, skip: 0 });
    setSearchTerm('');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-2 text-gray-600">
            Practice your English skills with interactive tasks
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline inline-flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary py-1 px-3 text-sm"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="input-field"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => handleFilterChange('difficulty', e.target.value || undefined)}
                className="input-field"
              >
                <option value="">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Completion Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={
                  filters.completed_only
                    ? 'completed'
                    : filters.not_completed_only
                    ? 'not_completed'
                    : ''
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'completed') {
                    handleFilterChange('completed_only', true);
                    handleFilterChange('not_completed_only', undefined);
                  } else if (value === 'not_completed') {
                    handleFilterChange('not_completed_only', true);
                    handleFilterChange('completed_only', undefined);
                  } else {
                    handleFilterChange('completed_only', undefined);
                    handleFilterChange('not_completed_only', undefined);
                  }
                }}
                className="input-field"
              >
                <option value="">All Tasks</option>
                <option value="completed">Completed</option>
                <option value="not_completed">Not Completed</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <Link
              key={task.id}
              to={`/tasks/${task.id}`}
              className="card hover:shadow-md transition-shadow duration-200 group"
            >
              {/* Task Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{task.category}</p>
                </div>
                {task.is_completed && (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                )}
              </div>

              {/* Task Description */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                {task.description}
              </p>

              {/* Media Indicators */}
              <div className="flex items-center space-x-2 mb-4">
                {task.content.images.length > 0 && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Image className="h-3 w-3 mr-1" />
                    {task.content.images.length}
                  </div>
                )}
                {task.content.audio && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Volume2 className="h-3 w-3 mr-1" />
                    Audio
                  </div>
                )}
              </div>

              {/* Task Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`badge ${getDifficultyColor(task.difficulty)}`}>
                    {task.difficulty}
                  </span>
                  {task.is_completed && (
                    <span className="badge badge-success">
                      Completed
                    </span>
                  )}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(task.created_at)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load More */}
      {tasks.length >= (filters.limit || 20) && (
        <div className="text-center">
          <button
            onClick={() => setFilters({ ...filters, skip: (filters.skip || 0) + (filters.limit || 20) })}
            className="btn-outline"
            disabled={loading}
          >
            Load More Tasks
          </button>
        </div>
      )}
    </div>
  );
};

export default Tasks;