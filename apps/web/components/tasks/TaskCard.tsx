import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Task, TaskStatus } from '@/types/task';
import { formatDistanceToNow } from 'date-fns';
import {
  BookmarkIcon as BookmarkOutline,
  EyeIcon,
  UserGroupIcon,
  ClockIcon,
  TagIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { taskService } from '@/services/task';

interface TaskCardProps {
  task: Task;
  isBookmarked?: boolean;
}

const statusColors: Record<TaskStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-600' },
  open: { bg: 'bg-green-100', text: 'text-green-600' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-600' },
  under_review: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  completed: { bg: 'bg-purple-100', text: 'text-purple-600' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-600' },
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-600',
  intermediate: 'bg-blue-100 text-blue-600',
  advanced: 'bg-purple-100 text-purple-600',
  expert: 'bg-red-100 text-red-600',
};

export default function TaskCard({ task, isBookmarked: initialIsBookmarked = false }: TaskCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const handleBookmarkClick = async () => {
    if (isBookmarking) return;

    try {
      setIsBookmarking(true);
      if (isBookmarked) {
        await taskService.unbookmarkTask(task.id);
      } else {
        await taskService.bookmarkTask(task.id);
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Failed to bookmark task:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative h-12 w-12 rounded-full overflow-hidden">
              <Image
                src={task.creator.avatarUrl || '/default-avatar.png'}
                alt={task.creator.displayName || 'Creator'}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <Link
                href={`/profile/${task.creator.id}`}
                className="text-sm font-medium text-gray-900 hover:text-pink-600"
              >
                {task.creator.displayName || task.creator.username || 'Anonymous'}
              </Link>
              <p className="text-sm text-gray-500">
                Posted {formatDistanceToNow(new Date(task.createdAt))} ago
              </p>
            </div>
          </div>
          <button
            onClick={handleBookmarkClick}
            disabled={isBookmarking}
            className="text-gray-400 hover:text-pink-500 disabled:opacity-50"
          >
            {isBookmarked ? (
              <BookmarkSolid className="h-6 w-6 text-pink-500" />
            ) : (
              <BookmarkOutline className="h-6 w-6" />
            )}
          </button>
        </div>

        <Link href={`/tasks/${task.id}`} className="block mt-4">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-pink-600">
            {task.title}
          </h3>
        </Link>

        <p className="mt-2 text-gray-600 line-clamp-2">{task.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status].bg} ${statusColors[task.status].text}`}>
            {task.status.replace('_', ' ').toUpperCase()}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColors[task.difficulty]}`}>
            {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
          </span>
          {task.insurance && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-600 flex items-center gap-1">
              <ShieldCheckIcon className="h-3 w-3" />
              Insured
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <CurrencyDollarIcon className="h-4 w-4" />
            <span>{task.reward.amount} {task.reward.token}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            <span>{task.estimatedDuration}</span>
          </div>
          <div className="flex items-center gap-1">
            <UserGroupIcon className="h-4 w-4" />
            <span>{task.applicants?.length || 0} applicants</span>
          </div>
          <div className="flex items-center gap-1">
            <EyeIcon className="h-4 w-4" />
            <span>{task.views} views</span>
          </div>
        </div>

        {task.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
              >
                <TagIcon className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 