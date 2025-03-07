import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';

export function CreateTask() {
  const { createTask } = useTasks();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await createTask(
        formData.get('title') as string,
        formData.get('description') as string,
        formData.get('reward') as string,
        Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 1 week deadline
        formData.get('category') as string,
        (formData.get('tags') as string).split(',').map(tag => tag.trim())
      );

      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          required
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="reward" className="block text-sm font-medium text-gray-700">
          Reward (MONNI)
        </label>
        <input
          type="number"
          name="reward"
          id="reward"
          required
          min="0"
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          name="category"
          id="category"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="Development">Development</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
          <option value="Content">Content</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          name="tags"
          id="tags"
          required
          placeholder="e.g. frontend, react, ui"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Quest'}
      </button>
    </form>
  );
} 