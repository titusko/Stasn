import { useTasks } from '@/hooks/useTasks';
import { TaskStatus } from '@/types/task';

export function TaskList() {
  const { tasks, loading, error, assignTask } = useTasks();

  if (loading) {
    return <div className="animate-pulse">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (tasks.length === 0) {
    return <div className="text-gray-500">No quests available at the moment.</div>;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="p-4 bg-white rounded-lg shadow border border-gray-200"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            <span className="px-2 py-1 text-xs font-medium rounded-full" 
              style={{
                backgroundColor: task.status === TaskStatus.Open ? '#E5F6FD' : '#F3F4F6',
                color: task.status === TaskStatus.Open ? '#0369A1' : '#6B7280'
              }}
            >
              {TaskStatus[task.status]}
            </span>
          </div>
          
          <p className="text-gray-600 mb-4">{task.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-600">
              Reward: <span className="font-medium">{task.reward} MONNI</span>
            </div>
            {task.status === TaskStatus.Open && (
              <button
                onClick={() => assignTask(task.id)}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                Accept Quest
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 