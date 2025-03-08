export interface UserProfile {
  id: string;
  email: string;
  walletAddress?: string;
  isEmailVerified: boolean;
  username?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  skills: string[];
  reputation: number;
  completedTasks: number;
  createdAt: string;
  updatedAt: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface UserStats {
  totalEarnings: string;
  averageRating: number;
  tasksCompleted: number;
  tasksCreated: number;
  successRate: number;
  responseTime: number; // in hours
  activeStreak: number; // in days
  reputation: number;
}

export interface UserActivity {
  id: string;
  type: 'task_created' | 'task_completed' | 'review_received' | 'review_given' | 'reward_earned';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    taskId?: string;
    taskTitle?: string;
    reward?: string;
    rating?: number;
  };
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  endorsements: number;
} 