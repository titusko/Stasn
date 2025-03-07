import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/user';
import { UserProfile, UserStats, Skill } from '@/types/user';
import ProfileHeader from '@/components/profile/ProfileHeader';
import SkillsSection from '@/components/profile/SkillsSection';
import ActivitySection from '@/components/profile/ActivitySection';

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = user?.id === id || !id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const userId = isOwnProfile ? undefined : id as string;
        const [profileData, statsData] = await Promise.all([
          userService.getProfile(userId),
          userService.getStats(userId),
        ]);

        setProfile(profileData);
        setStats(statsData);
        setSkills(profileData.skills);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        if (err instanceof Error && err.message === 'Not authenticated') {
          router.push('/');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (router.isReady) {
      fetchProfileData();
    }
  }, [router.isReady, id, isOwnProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="bg-white shadow rounded-lg h-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg h-96" />
              </div>
              <div className="bg-white shadow rounded-lg h-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile || !stats) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-red-600">
              {error || 'Failed to load profile'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <ProfileHeader
            profile={profile}
            stats={stats}
            isOwnProfile={isOwnProfile}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ActivitySection userId={isOwnProfile ? undefined : id as string} />
            </div>
            <div>
              <SkillsSection
                skills={skills}
                isOwnProfile={isOwnProfile}
                onSkillsUpdate={setSkills}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}