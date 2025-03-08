import { useState } from 'react';
import { useRouter } from 'next/router';
import { Task, TaskDifficulty, TaskPriority } from '@/types/task';
import { taskService } from '@/services/task';
import {
  PlusIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TagIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface CreateTaskFormProps {
  onSuccess?: (task: Task) => void;
  onCancel?: () => void;
}

export default function CreateTaskForm({ onSuccess, onCancel }: CreateTaskFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'intermediate' as TaskDifficulty,
    priority: 'medium' as TaskPriority,
    reward: {
      amount: '',
      token: 'ETH',
      currency: 'USD',
    },
    estimatedDuration: '',
    tags: [] as string[],
    requirements: [] as { type: string; value: string }[],
    milestones: [] as { title: string; description: string; reward: string }[],
    hasInsurance: false,
    dueDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Validate form data
      const validation = await taskService.validateTask(formData);
      if (!validation.isValid) {
        setError(Object.values(validation.errors || {}).flat().join(', '));
        return;
      }

      // Create task
      const task = await taskService.createTask(formData);
      onSuccess?.(task);
      router.push(`/tasks/${task.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, { type: 'skill', value: '' }],
    }));
  };

  const updateRequirement = (index: number, updates: Partial<{ type: string; value: string }>) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) =>
        i === index ? { ...req, ...updates } : req
      ),
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', description: '', reward: '' }],
    }));
  };

  const updateMilestone = (index: number, updates: Partial<{ title: string; description: string; reward: string }>) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) =>
        i === index ? { ...milestone, ...updates } : milestone
      ),
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              required
            >
              <option value="">Select a category</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="writing">Writing</option>
              <option value="translation">Translation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as TaskDifficulty }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reward and Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Reward and Timeline</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="reward-amount" className="block text-sm font-medium text-gray-700">
              Reward Amount
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="reward-amount"
                value={formData.reward.amount}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  reward: { ...prev.reward, amount: e.target.value },
                }))}
                className="block w-full pl-10 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                placeholder="0.00"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <select
                  value={formData.reward.token}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    reward: { ...prev.reward, token: e.target.value },
                  }))}
                  className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                  <option value="DAI">DAI</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="estimated-duration" className="block text-sm font-medium text-gray-700">
              Estimated Duration
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ClockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="estimated-duration"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                className="block w-full pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                placeholder="e.g., 2 weeks"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="due-date" className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="due-date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="block w-full pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Tags</h3>

        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-pink-100 text-pink-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-pink-400 hover:text-pink-600"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add a tag"
            className="inline-flex items-center px-3 py-1 rounded-full text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Requirements</h3>
          <button
            type="button"
            onClick={addRequirement}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-pink-600 bg-pink-100 hover:bg-pink-200"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Requirement
          </button>
        </div>

        <div className="space-y-4">
          {formData.requirements.map((req, index) => (
            <div key={index} className="flex items-start gap-4">
              <select
                value={req.type}
                onChange={(e) => updateRequirement(index, { type: e.target.value })}
                className="block w-1/4 border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="skill">Skill</option>
                <option value="experience">Experience</option>
                <option value="certification">Certification</option>
                <option value="reputation">Reputation</option>
              </select>
              <input
                type="text"
                value={req.value}
                onChange={(e) => updateRequirement(index, { value: e.target.value })}
                className="block flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                placeholder="Requirement value"
              />
              <button
                type="button"
                onClick={() => removeRequirement(index)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Milestones</h3>
          <button
            type="button"
            onClick={addMilestone}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-pink-600 bg-pink-100 hover:bg-pink-200"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Milestone
          </button>
        </div>

        <div className="space-y-4">
          {formData.milestones.map((milestone, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <input
                    type="text"
                    value={milestone.title}
                    onChange={(e) => updateMilestone(index, { title: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Milestone title"
                  />
                  <textarea
                    value={milestone.description}
                    onChange={(e) => updateMilestone(index, { description: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Milestone description"
                    rows={2}
                  />
                  <div className="relative rounded-md shadow-sm w-1/3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={milestone.reward}
                      onChange={(e) => updateMilestone(index, { reward: e.target.value })}
                      className="block w-full pl-10 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Reward amount"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{formData.reward.token}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeMilestone(index)}
                  className="ml-4 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insurance */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="insurance"
            checked={formData.hasInsurance}
            onChange={(e) => setFormData(prev => ({ ...prev, hasInsurance: e.target.checked }))}
            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
          />
          <label htmlFor="insurance" className="text-sm font-medium text-gray-700">
            Add Task Insurance
          </label>
        </div>
        {formData.hasInsurance && (
          <div className="pl-6">
            <p className="text-sm text-gray-500">
              Task insurance protects both parties and ensures quality delivery.
              Additional fees may apply.
            </p>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </form>
  );
} 