import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Volume2, Image as ImageIcon, Eye } from 'lucide-react';
import { Task } from '../types';
import { tasksAPI } from '../services/api';
import toast from 'react-hot-toast';

const TaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      if (taskId) {
        const fetchedTask = await tasksAPI.getTask(taskId);
        setTask(fetchedTask);
        
        // Initialize user answers array
        if (fetchedTask.answers) {
          setUserAnswers(new Array(fetchedTask.answers.length).fill(''));
        }
      }
    } catch (error) {
      toast.error('Failed to fetch task');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const handleComplete = async () => {
    if (!task) return;
    
    try {
      setCompleting(true);
      const completedTask = await tasksAPI.completeTask(task.id, userAnswers);
      setTask(completedTask);
      toast.success('Task completed! Answers revealed.');
    } catch (error) {
      toast.error('Failed to complete task');
    } finally {
      setCompleting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Task not found</h2>
        <button
          onClick={() => navigate('/tasks')}
          className="mt-4 btn-primary"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Tasks
        </button>
      </div>

      {/* Task Card */}
      <div className="card">
        {/* Task Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
              {task.is_completed && (
                <CheckCircle className="h-8 w-8 text-green-500" />
              )}
            </div>
            <p className="text-gray-600 mb-4">{task.description}</p>
            
            <div className="flex items-center space-x-4 text-sm">
              <span className={`badge ${getDifficultyColor(task.difficulty)}`}>
                {task.difficulty}
              </span>
              <span className="badge badge-primary">{task.category}</span>
              <span className="text-gray-500">
                Created on {formatDate(task.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Task Content */}
        <div className="space-y-6">
          {/* Text Content */}
          <div className="prose max-w-none">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Task Content</h3>
              <div className="whitespace-pre-wrap text-gray-700">
                {task.content.text}
              </div>
            </div>
          </div>

          {/* Images */}
          {task.content.images.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <ImageIcon className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Images</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {task.content.images.map((image, index) => (
                  <div key={index} className="rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={`http://localhost:8000${image}`}
                      alt={`Task image ${index + 1}`}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio */}
          {task.content.audio && (
            <div>
              <div className="flex items-center mb-3">
                <Volume2 className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Audio</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <audio
                  controls
                  className="w-full"
                  src={`http://localhost:8000${task.content.audio}`}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          )}

          {/* Answer Section */}
          <div className="border-t border-gray-200 pt-6">
            {task.show_answers ? (
              // Show correct answers
              <div className="space-y-4">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Correct Answers</h3>
                  <span className="ml-2 badge badge-success">Completed</span>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <div className="space-y-3">
                    {task.answers?.map((answer, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-sm font-medium text-green-700 w-8">
                          {index + 1}.
                        </span>
                        <span className="text-green-800">{answer}</span>
                      </div>
                    ))}
                  </div>
                  
                  {task.explanation && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">Explanation:</h4>
                      <p className="text-green-700">{task.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Answer input section
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Answers</h3>
                
                <div className="space-y-3">
                  {userAnswers.map((answer, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700 w-8">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="flex-1 input-field"
                        placeholder={`Answer ${index + 1}`}
                        disabled={task.is_completed}
                      />
                    </div>
                  ))}
                </div>

                {!task.is_completed && (
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleComplete}
                      disabled={completing || userAnswers.some(answer => !answer.trim())}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {completing ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        'Submit Answers'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;