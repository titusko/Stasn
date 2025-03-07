import { useState, useEffect } from 'react';
import { UserActivity } from '@/types/user';
import { userService } from '@/services/user';
import { format } from 'date-fns';

interface ActivitySectionProps {
  userId?: string;
}

export default function ActivitySection({ userId }: ActivitySectionProps) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async (pageNum: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const { activities: newActivities, hasMore: more } = await userService.getActivity(userId, pageNum);
      
      if (pageNum === 1) {
        setActivities(newActivities);
      } else {
        setActivities(prev => [...prev, ...newActivities]);
      }
      
      setHasMore(more);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(1);
  }, [userId]);

  const getActivityIcon = (type: UserActivity['type']) => {
    switch (type) {
      case 'task_created':
        return '📝';
      case 'task_completed':
        return '✅';
      case 'review_received':
        return '⭐';
      case 'review_given':
        return '📊';
      case 'reward_earned':
        return '💰';
      default:
        return '📌';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity</h3>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm">No activity yet.</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors"
            >
              <div className="text-2xl">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.description}</p>
                {activity.metadata?.taskTitle && (
                  <p className="text-sm text-gray-600 mt-1">
                    Task: {activity.metadata.taskTitle}
                  </p>
                )}
                {activity.metadata?.reward && (
                  <p className="text-sm text-green-600 mt-1">
                    Reward: {activity.metadata.reward}
                  </p>
                )}
                {activity.metadata?.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm text-gray-600">Rating:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < activity.metadata!.rating!
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          ))
        )}

        {hasMore && (
          <div className="text-center pt-4">
            <button
              onClick={() => fetchActivities(page + 1)}
              disabled={isLoading}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}