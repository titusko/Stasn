import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import CreateTaskForm from '@/components/tasks/CreateTaskForm';

export default function CreateTaskPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Create a New Task</h1>
          <CreateTaskForm
            onSuccess={(task) => router.push(`/tasks/${task.id}`)}
            onCancel={() => router.back()}
          />
        </div>
      </div>
    </div>
  );
} 