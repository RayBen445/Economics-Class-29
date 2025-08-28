import { useState } from 'react';
import { updateUserProfile, UserProfile } from '../utils/firebase';

export const useProfile = (currentProfile: UserProfile | null) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentProfile) {
      setError('No profile to update');
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      // If name fields are being updated, update fullName too
      if (updates.firstName || updates.otherName || updates.surname) {
        const firstName = updates.firstName || currentProfile.firstName;
        const otherName = updates.otherName || currentProfile.otherName;
        const surname = updates.surname || currentProfile.surname;
        updates.fullName = `${firstName} ${otherName} ${surname}`.replace(/\s+/g, ' ').trim();
      }

      await updateUserProfile(currentProfile.uid, updates);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateProfile,
    updating,
    error
  };
};