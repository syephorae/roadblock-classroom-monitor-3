
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect, useCallback } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import { setDocumentNonBlocking, addDocumentNonBlocking } from './non-blocking-updates';
import { collection } from 'firebase/firestore';

interface NewUserDetails {
  displayName: string;
  school: string;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener,
  setNewUserDetails: (details: NewUserDetails) => void;
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  setNewUserDetails: (details: NewUserDetails) => void;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { // Renamed from UserAuthHookResult for consistency if desired, or keep as UserAuthHookResult
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  setNewUserDetails: (details: NewUserDetails) => void;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

// Define a type for props to make it clear
interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp?: FirebaseApp;
  firestore?: Firestore;
  auth?: Auth;
}


/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<React.PropsWithChildren<FirebaseProviderProps>> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });
  
  const [newUserDetails, setNewUserDetails] = useState<NewUserDetails | null>(null);

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!auth || !firestore) { // If no Auth service instance, cannot determine user state
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth and Firestore services not provided.") });
      return;
    }

    setUserAuthState({ user: null, isUserLoading: true, userError: null }); // Reset on auth instance change

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => { // Auth state determined
        if (firebaseUser && newUserDetails) {
            // Check if this is a genuinely new user in our DB
            const teacherDoc = await getDoc(doc(firestore, 'teachers', firebaseUser.uid));
            const isNewUser = !teacherDoc.exists();

            if (isNewUser) {
                // Update Firebase Auth profile
                await updateProfile(firebaseUser, { displayName: newUserDetails.displayName });
                
                // Save additional details to Firestore
                const teacherRef = doc(firestore, 'teachers', firebaseUser.uid);
                setDocumentNonBlocking(teacherRef, {
                    id: firebaseUser.uid,
                    name: newUserDetails.displayName,
                    email: firebaseUser.email,
                    school: newUserDetails.school
                }, { merge: true });

                // Add school to schools collection if it's new
                if (newUserDetails.school) {
                    const schoolsRef = collection(firestore, 'schools');
                    const schoolDocRef = doc(schoolsRef, newUserDetails.school.toLowerCase().replace(/\s+/g, '-'));
                    setDocumentNonBlocking(schoolDocRef, {
                        id: schoolDocRef.id,
                        name: newUserDetails.school
                    }, { merge: true });
                }
            }
             setNewUserDetails(null); // Clear details after use
             // We need to update the local user state to reflect the displayName change
             setUserAuthState({ user: auth.currentUser, isUserLoading: false, userError: null });
        } else {
          setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
        }
      },
      (error) => { // Auth listener error
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe(); // Cleanup
  }, [auth, firestore, newUserDetails]); // Depends on the auth instance

  const handleSetNewUserDetails = useCallback((details: NewUserDetails) => {
    setNewUserDetails(details);
  }, []);

  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
      setNewUserDetails: handleSetNewUserDetails,
    };
  }, [firebaseApp, firestore, auth, userAuthState, handleSetNewUserDetails]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
    setNewUserDetails: context.setNewUserDetails,
  };
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => { // Renamed from useAuthUser
  const { user, isUserLoading, userError, setNewUserDetails } = useFirebase(); // Leverages the main hook
  return { user, isUserLoading, userError, setNewUserDetails };
};
