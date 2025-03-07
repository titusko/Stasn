import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import TaskList from '@/components/tasks/TaskList';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function TasksPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          {isAuthenticated && (
            <button
              onClick={() => router.push('/tasks/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Task
            </button>
          )}
        </div>

        <TaskList
          initialFilter={{
            status: router.query.status ? [router.query.status as string] : undefined,
            category: router.query.category ? [router.query.category as string] : undefined,
            difficulty: router.query.difficulty ? [router.query.difficulty as string] : undefined,
            sortBy: router.query.sortBy as 'reward' | 'createdAt' | undefined,
            sortOrder: router.query.sortOrder as 'asc' | 'desc' | undefined,
          }}
        />
      </div>
    </div>
  );
}