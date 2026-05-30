import { User } from '../types';

/**
 * Firebase Authentication Service (Stubbed for Hackathon Demo)
 * As per Blueprint Phase 6.1: Authentication & Persistensi Data
 * 
 * In a real production environment, this would use:
 * import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
 */

export const loginWithGoogle = async (): Promise<User> => {
  // Simulate network delay for OAuth popup
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        name: 'Enterprise Analyst',
        email: 'analyst@hedgefund.com',
        avatar: 'https://picsum.photos/200',
        role: 'analyst'
      });
    }, 1500);
  });
};

export const logoutUser = async (): Promise<void> => {
  // Simulate network delay for sign out
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};
