import React from 'react';
import { User, Mail, Calendar, Award, BookOpen, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">User not found</h2>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-center space-x-6">
          <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-3xl font-bold text-primary-600">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span>{user.email}</span>
              </div>
              <span className={`badge ${getRoleColor(user.role)}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
            <div className="flex items-center text-gray-500 mt-2">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Member since {formatDate(user.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Tasks Completed</p>
              <p className="text-3xl font-bold text-green-900">
                {user.progress.completed_tasks.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-200 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Total Score</p>
              <p className="text-3xl font-bold text-orange-900">
                {user.progress.total_score}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-200 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Categories</p>
              <p className="text-3xl font-bold text-purple-900">
                {Object.keys(user.progress.categories_completed).length}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-200 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Progress */}
      {Object.keys(user.progress.categories_completed).length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Category Progress</h2>
          <div className="space-y-4">
            {Object.entries(user.progress.categories_completed).map(([category, completed]) => (
              <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{category}</h3>
                  <p className="text-sm text-gray-600">
                    {completed} task{completed !== 1 ? 's' : ''} completed
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary-600">{completed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Information */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div className="input-field bg-gray-50" aria-readonly>
              {user.username}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="input-field bg-gray-50" aria-readonly>
              {user.email}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <div className="input-field bg-gray-50" aria-readonly>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
            <div className="input-field bg-gray-50" aria-readonly>
              {formatDate(user.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.progress.completed_tasks.length >= 1 && (
            <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="h-10 w-10 bg-green-200 rounded-full flex items-center justify-center mr-3">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-900">First Steps</h3>
                <p className="text-xs text-green-700">Completed your first task</p>
              </div>
            </div>
          )}
          
          {user.progress.completed_tasks.length >= 10 && (
            <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Getting Started</h3>
                <p className="text-xs text-blue-700">Completed 10 tasks</p>
              </div>
            </div>
          )}
          
          {user.progress.total_score >= 100 && (
            <div className="flex items-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="h-10 w-10 bg-purple-200 rounded-full flex items-center justify-center mr-3">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-purple-900">Century Club</h3>
                <p className="text-xs text-purple-700">Reached 100 points</p>
              </div>
            </div>
          )}
          
          {Object.keys(user.progress.categories_completed).length >= 3 && (
            <div className="flex items-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="h-10 w-10 bg-orange-200 rounded-full flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium text-orange-900">Explorer</h3>
                <p className="text-xs text-orange-700">Tried 3+ categories</p>
              </div>
            </div>
          )}
        </div>
        
        {user.progress.completed_tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Complete tasks to unlock achievements!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;