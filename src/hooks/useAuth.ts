import { useCallback } from 'react';
import { signOut } from '@react-native-firebase/auth';
import { clearAuth, clearUserProfile, setLoggingOut, useAppDispatch, useAppSelector } from '../store';
import { firebaseAuth } from '../services/firebase';
import { removeFCMToken } from '../services/notifications';
import { clearAllNotifications } from '../services/localNotifications';
import { storage } from '../services/storage';
import storageKeys from '../constants/storageKeys';
import { syncAuthenticatedUser } from './useAuthListener';

export function useAuth() {
  const dispatch = useAppDispatch();
  const authState = useAppSelector(state => state.auth);

  const refreshSession = useCallback(async () => {
    const firebaseUser = firebaseAuth.currentUser;
    if (!firebaseUser) {
      return;
    }

    await syncAuthenticatedUser(dispatch, firebaseUser);
  }, [dispatch]);

  const handleSignOut = useCallback(async () => {
    dispatch(setLoggingOut(true));
    try {
      const uid = firebaseAuth.currentUser?.uid;
      if (uid) {
        await removeFCMToken(uid);
      }
      await clearAllNotifications();
      await signOut(firebaseAuth);
    } finally {
      dispatch(clearAuth());
      dispatch(clearUserProfile());
      storage.remove(storageKeys.USER_DATA);
      dispatch(setLoggingOut(false));
    }
  }, [dispatch]);

  return {
    ...authState,
    signOut: handleSignOut,
    refreshSession,
  };
}
