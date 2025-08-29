import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, getUserProfile, UserProfile } from '../utils/firebase';

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export const useFirebaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Check for demo mode
    const isDemoMode = window.location.search.includes('demo=true') || localStorage.getItem('demoMode') === 'true';
    
    if (isDemoMode) {
      // Simulate a demo user for testing UI
      const demoUser = {
        uid: 'demo-user-123',
        email: 'demo@lautech-econ29.com',
        emailVerified: true
      } as User;
      
      const demoProfile: UserProfile = {
        uid: 'demo-user-123',
        email: 'demo@lautech-econ29.com',
        firstName: 'Demo',
        lastName: 'Student',
        fullName: 'Demo Student',
        username: 'demostudent',
        matricNumber: '2024000001',
        role: 'Student',
        status: 'active',
        createdAt: { toDate: () => new Date() } as any
      };
      
      setTimeout(() => {
        setAuthState({
          user: demoUser,
          profile: demoProfile,
          loading: false,
          error: null
        });
      }, 1000);
      
      return () => {}; // No cleanup needed for demo mode
    }
    
    // Normal Firebase authentication
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setAuthState({
            user,
            profile,
            loading: false,
            error: null
          });
        } catch (error: any) {
          setAuthState({
            user,
            profile: null,
            loading: false,
            error: error.message
          });
        }
      } else {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: null
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return authState;
};