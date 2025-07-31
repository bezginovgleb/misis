import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Volume2, Plus, Minus } from 'lucide-react';
import { TaskCreate } from '../types';
import { tasksAPI } from '../services/api';
import toast from 'react-hot-toast';

interface TaskForm {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  text_content: string;
  explanation?: string;
}

const CreateTask: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<string[]>(['']);
  const [images, setImages] = useState<File[]>([]);
  const [audio, setAudio] = useState<File | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskForm>();

  // Image dropzone
  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      setImages(prev => [...prev, ...acceptedFiles].slice(0, 5));
    },
  });

  // Audio dropzone
  const {
    getRootProps: getAudioRootProps,
    getInputProps: getAudioInputProps,
    isDragActive: isAudioDragActive,
  } = useDropzone({
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setAudio(acceptedFiles[0] || null);
    },
  });

  const addAnswer = () => {
    setAnswers([...answers, '']);
  };

  const removeAnswer = (index: number) => {
    if (answers.length > 1) {
      setAnswers(answers.filter((_, i) => i !== index));
    }
  };

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeAudio = () => {
    setAudio(null);
  };

  const onSubmit = async (data: TaskForm) => {
    // Validate answers
    const validAnswers = answers.filter(answer => answer.trim());
    if (validAnswers.length === 0) {
      toast.error('Please provide at least one answer');
      return;
    }

    try {
      setSubmitting(true);
      
      const taskData: TaskCreate = {
        ...data,
        answers: validAnswers,
        images: images.length > 0 ? images : undefined,
        audio: audio || undefined,
      };

      const createdTask = await tasksAPI.createTask(taskData);
      toast.success('Task created successfully!');
      navigate(`/tasks/${createdTask.id}`);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to create task';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    'Grammar',
    'Vocabulary',
    'Reading Comprehension',
    'Listening',
    'Writing',
    'Speaking',
    'Pronunciation',
    'Business English',
    'Academic English',
    'General English',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
        <p className="mt-2 text-gray-600">
          Create an engaging English language learning task with multimedia content
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="input-field"
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="input-field"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level *
              </label>
              <select
                {...register('difficulty', { required: 'Difficulty is required' })}
                className="input-field"
              >
                <option value="">Select difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              {errors.difficulty && (
                <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={3}
              className="input-field"
              placeholder="Brief description of the task"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Task Content */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Task Content</h2>
          
          <div>
            <label htmlFor="text_content" className="block text-sm font-medium text-gray-700 mb-2">
              Task Text *
            </label>
            <textarea
              {...register('text_content', { required: 'Task content is required' })}
              rows={8}
              className="input-field"
              placeholder="Enter the main task content here. This can include instructions, reading passages, questions, etc."
            />
            {errors.text_content && (
              <p className="mt-1 text-sm text-red-600">{errors.text_content.message}</p>
            )}
          </div>
        </div>

        {/* Media Upload */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Media Content</h2>
          
          {/* Images */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images (Optional) - Max 5 images
            </label>
            
            <div
              {...getImageRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
                isImageDragActive
                  ? 'border-primary-400 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getImageInputProps()} />
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isImageDragActive ? (
                <p className="text-primary-600">Drop the images here...</p>
              ) : (
                <div>
                  <p className="text-gray-600">Drag & drop images here, or click to select</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                </div>
              )}
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {images.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio (Optional)
            </label>
            
            <div
              {...getAudioRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
                isAudioDragActive
                  ? 'border-primary-400 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getAudioInputProps()} />
              <Volume2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isAudioDragActive ? (
                <p className="text-primary-600">Drop the audio file here...</p>
              ) : (
                <div>
                  <p className="text-gray-600">Drag & drop audio file here, or click to select</p>
                  <p className="text-xs text-gray-500 mt-1">MP3, WAV, OGG up to 10MB</p>
                </div>
              )}
            </div>

            {/* Audio Preview */}
            {audio && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Volume2 className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{audio.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeAudio}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Answers */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Answers</h2>
          
          <div className="space-y-4">
            {answers.map((answer, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 w-8">
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => updateAnswer(index, e.target.value)}
                  className="flex-1 input-field"
                  placeholder={`Answer ${index + 1}`}
                />
                {answers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAnswer(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addAnswer}
            className="mt-4 flex items-center text-primary-600 hover:text-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Answer
          </button>

          {/* Explanation */}
          <div className="mt-6">
            <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-2">
              Explanation (Optional)
            </label>
            <textarea
              {...register('explanation')}
              rows={3}
              className="input-field"
              placeholder="Provide an explanation for the answers (optional)"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Task...
              </div>
            ) : (
              'Create Task'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;