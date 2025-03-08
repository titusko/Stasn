import { useState, useEffect } from 'react';
import { Task, TaskFilter } from '@/types/task';
import { taskService } from '@/services/task';
import TaskCard from './TaskCard';
import {
  FunnelIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface TaskListProps {
  initialTasks?: Task[];
  initialFilter?: TaskFilter;
}

export default function TaskList({ initialTasks = [], initialFilter = {} }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<TaskFilter>(initialFilter);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchTasks = async (pageNum: number, newFilter?: TaskFilter) => {
    try {
      setIsLoading(true);
      setError(null);
      const { tasks: newTasks, hasMore: more } = await taskService.getTasks(
        newFilter || filter,
        pageNum
      );
      
      if (pageNum === 1) {
        setTasks(newTasks);
      } else {
        setTasks(prev => [...prev, ...newTasks]);
      }
      
      setHasMore(more);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(initialFilter).length > 0) {
      fetchTasks(1, initialFilter);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilter = { ...filter, searchQuery };
    setFilter(newFilter);
    fetchTasks(1, newFilter);
  };

  const handleFilterChange = (updates: Partial<TaskFilter>) => {
    const newFilter = { ...filter, ...updates };
    setFilter(newFilter);
    fetchTasks(1, newFilter);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchTasks(page + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange({ sortBy: filter.sortBy === 'createdAt' ? 'reward' : 'createdAt' })}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowsUpDownIcon className="h-5 w-5" />
            <span>Sort</span>
          </button>
        </form>

        {showFilters && (
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filter.status?.[0] || ''}
                  onChange={(e) => handleFilterChange({ status: e.target.value ? [e.target.value as Task['status']] : undefined })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="">All</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Difficulty filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={filter.difficulty?.[0] || ''}
                  onChange={(e) => handleFilterChange({ difficulty: e.target.value ? [e.target.value as Task['difficulty']] : undefined })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="">All</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Insurance filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance
                </label>
                <select
                  value={filter.hasInsurance?.toString() || ''}
                  onChange={(e) => handleFilterChange({ hasInsurance: e.target.value === '' ? undefined : e.target.value === 'true' })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="">All</option>
                  <option value="true">Insured Only</option>
                  <option value="false">No Insurance</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Task list */}
      <div className="grid grid-cols-1 gap-6">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No tasks found</p>
        </div>
      )}
    </div>
  );
} 