import { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Skill } from '@/types/user';
import { userService } from '@/services/user';

interface SkillsSectionProps {
  skills: Skill[];
  isOwnProfile: boolean;
  onSkillsUpdate?: (skills: Skill[]) => void;
}

export default function SkillsSection({ skills, isOwnProfile, onSkillsUpdate }: SkillsSectionProps) {
  const [newSkill, setNewSkill] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    try {
      setError(null);
      const skill = await userService.addSkill(newSkill.trim());
      onSkillsUpdate?.([...skills, skill]);
      setNewSkill('');
      setIsAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      setError(null);
      await userService.removeSkill(skillId);
      onSkillsUpdate?.(skills.filter(skill => skill.id !== skillId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove skill');
    }
  };

  const handleEndorseSkill = async (userId: string, skillId: string) => {
    try {
      setError(null);
      const updatedSkill = await userService.endorseSkill(userId, skillId);
      onSkillsUpdate?.(
        skills.map(skill => (skill.id === skillId ? updatedSkill : skill))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to endorse skill');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
        {isOwnProfile && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Skill</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddSkill} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Enter a skill..."
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {skills.length === 0 ? (
          <p className="text-gray-500 text-sm">No skills added yet.</p>
        ) : (
          skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div>
                <span className="font-medium text-gray-900">{skill.name}</span>
                <div className="text-sm text-gray-500">
                  {skill.endorsements} endorsement{skill.endorsements !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isOwnProfile && (
                  <button
                    onClick={() => handleEndorseSkill(skill.id, skill.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Endorse
                  </button>
                )}
                {isOwnProfile && (
                  <button
                    onClick={() => handleRemoveSkill(skill.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}