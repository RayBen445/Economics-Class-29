import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  addDoc,
  query,
  getDocs,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import toast from 'react-hot-toast';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Types for user profile
export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  otherName: string;
  surname: string;
  username: string;
  matricNumber: string;
  fullName: string;
  role: 'Student' | 'Admin' | 'Class President';
  status: 'active' | 'suspended' | 'banned';
  profilePicture?: string;
  emailVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Auth helper functions
export const signUp = async (
  email: string, 
  password: string, 
  profileData: Omit<UserProfile, 'uid' | 'email' | 'emailVerified' | 'createdAt' | 'updatedAt'>
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    await updateProfile(user, {
      displayName: profileData.fullName
    });
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Create user profile in Firestore
    const userProfile: UserProfile = {
      ...profileData,
      uid: user.uid,
      email,
      emailVerified: user.emailVerified,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    toast.success('Account created! Please check your email for verification.');
    return user;
  } catch (error: any) {
    console.error('Sign up error:', error);
    toast.error(error.message);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (!user.emailVerified) {
      toast.error('Please verify your email before signing in.');
      throw new Error('Email not verified');
    }
    
    toast.success('Successfully signed in!');
    return user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    toast.error(error.message);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    toast.success('Successfully signed out!');
  } catch (error: any) {
    console.error('Sign out error:', error);
    toast.error(error.message);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    toast.success('Password reset email sent! Check your inbox.');
  } catch (error: any) {
    console.error('Password reset error:', error);
    toast.error(error.message);
    throw error;
  }
};

export const resendVerificationEmail = async (user: User) => {
  try {
    await sendEmailVerification(user);
    toast.success('Verification email sent! Check your inbox.');
  } catch (error: any) {
    console.error('Resend verification error:', error);
    toast.error(error.message);
    throw error;
  }
};

// Firestore helper functions
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      console.log('No user profile found!');
      return null;
    }
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    toast.success('Profile updated successfully!');
  } catch (error: any) {
    console.error('Update profile error:', error);
    toast.error(error.message);
    throw error;
  }
};

// Check if user has admin role
export const checkAdminRole = async (uid: string): Promise<boolean> => {
  try {
    const profile = await getUserProfile(uid);
    return profile?.role === 'Admin';
  } catch (error) {
    console.error('Check admin role error:', error);
    return false;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};