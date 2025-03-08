import { UserProfile, UserStats, UserActivity, Skill } from '@/types/user';
import { authService } from './auth';

class UserService {
  private readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  }

  async getProfile(userId?: string): Promise<UserProfile> {
    const endpoint = userId ? `/users/${userId}` : '/users/me';
    return this.fetchWithAuth(endpoint);
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return this.fetchWithAuth('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.API_URL}/users/me/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload avatar');
    }

    return response.json();
  }

  async getStats(userId?: string): Promise<UserStats> {
    const endpoint = userId ? `/users/${userId}/stats` : '/users/me/stats';
    return this.fetchWithAuth(endpoint);
  }

  async getActivity(userId?: string, page = 1, limit = 10): Promise<{
    activities: UserActivity[];
    total: number;
    hasMore: boolean;
  }> {
    const endpoint = userId
      ? `/users/${userId}/activity?page=${page}&limit=${limit}`
      : `/users/me/activity?page=${page}&limit=${limit}`;
    return this.fetchWithAuth(endpoint);
  }

  async addSkill(skillName: string): Promise<Skill> {
    return this.fetchWithAuth('/users/me/skills', {
      method: 'POST',
      body: JSON.stringify({ skillName }),
    });
  }

  async removeSkill(skillId: string): Promise<void> {
    await this.fetchWithAuth(`/users/me/skills/${skillId}`, {
      method: 'DELETE',
    });
  }

  async endorseSkill(userId: string, skillId: string): Promise<Skill> {
    return this.fetchWithAuth(`/users/${userId}/skills/${skillId}/endorse`, {
      method: 'POST',
    });
  }

  async updateSocialLinks(links: UserProfile['socialLinks']): Promise<UserProfile> {
    return this.fetchWithAuth('/users/me/social-links', {
      method: 'PATCH',
      body: JSON.stringify(links),
    });
  }

  async searchUsers(query: string, page = 1, limit = 10): Promise<{
    users: UserProfile[];
    total: number;
    hasMore: boolean;
  }> {
    return this.fetchWithAuth(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  async getRecommendedTasks(limit = 10): Promise<{
    tasks: any[]; // Replace with proper Task type when available
    total: number;
  }> {
    return this.fetchWithAuth(`/users/me/recommended-tasks?limit=${limit}`);
  }
}

export const userService = new UserService();