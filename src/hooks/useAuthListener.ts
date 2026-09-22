import { useEffect } from 'react';
import { onAuthStateChanged, signOut, type User } from '@react-native-firebase/auth';
import {
  clearAuth,
  clearUserProfile,
  setAuthLoading,
  setAuthUser,
  setHydrating,
  setRole,
  setUserProfile,
  useAppDispatch,
} from '../store';
import { firebaseAuth, getUserProfile } from '../services/firebase';
import { storage } from '../services/storage';
import storageKeys from '../constants/storageKeys';
import { UserProfile } from '../types/user';

let interactiveLoginInProgress = false;
let completedInteractiveLoginUid: string | null = null;

export function setInteractiveLoginInProgress(value: boolean) {
  interactiveLoginInProgress = value;
  if (!value) {
    completedInteractiveLoginUid = firebaseAuth.currentUser?.uid ?? null;
  }
}

export async function syncAuthenticatedUser(
  dispatch: ReturnType<typeof useAppDispatch>,
  firebaseUser: User,
) {
  await firebaseUser.reload();

  if (!firebaseUser.emailVerified) {
    console.log('[AuthListener] user is unverified; keeping the app signed out | uid:', firebaseUser.uid);
    dispatch(clearAuth());
    dispatch(clearUserProfile());
    return;
  }

  dispatch(setAuthUser({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    emailVerified: true,
  }));

  dispatch(setHydrating(true));

  try {
    const profile = await getUserProfile(firebaseUser.uid);
    if (profile) {
      dispatch(setUserProfile(profile));
      dispatch(setRole(profile.role));
      storage.set(storageKeys.USER_DATA, JSON.stringify(profile));
    } else {
      dispatch(clearUserProfile());
      dispatch(setRole(null));
      storage.remove(storageKeys.USER_DATA);
    }
  } catch (error: any) {
    console.error('[AuthListener] profile load failed:', error?.message ?? error);
    dispatch(clearUserProfile());
    dispatch(setRole(null));
    storage.remove(storageKeys.USER_DATA);
  } finally {
    dispatch(setHydrating(false));
    dispatch(setAuthLoading(false));
  }
}

export function useAuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    let isInitialAuthEvent = true;

    const initializeAuth = async () => {
      if (!storage.getBoolean(storageKeys.INSTALLATION_INITIALIZED)) {
        if (firebaseAuth.currentUser) {
          try {
            await signOut(firebaseAuth);
          } catch {
            // Already signed out.
          }
        }
        storage.remove(storageKeys.USER_DATA);
        storage.set(storageKeys.INSTALLATION_INITIALIZED, true);
      }

      if (cancelled) {
        return;
      }

      const cachedProfile = storage.getString(storageKeys.USER_DATA);
      if (cachedProfile) {
        try {
          const profile = JSON.parse(cachedProfile) as UserProfile;
          dispatch(setUserProfile(profile));
          dispatch(setRole(profile.role));
        } catch {
          storage.remove(storageKeys.USER_DATA);
        }
      }

      unsubscribe = onAuthStateChanged(firebaseAuth, async firebaseUser => {
        if (interactiveLoginInProgress) {
          return;
        }

        if (firebaseUser && firebaseUser.uid === completedInteractiveLoginUid) {
          completedInteractiveLoginUid = null;
          return;
        }

        if (!firebaseUser) {
          completedInteractiveLoginUid = null;
          isInitialAuthEvent = false;
          dispatch(clearAuth());
          dispatch(clearUserProfile());
          storage.remove(storageKeys.USER_DATA);
          dispatch(setAuthLoading(false));
          dispatch(setHydrating(false));
          return;
        }

        if (isInitialAuthEvent) {
          isInitialAuthEvent = false;
          await firebaseUser.reload();
          if (!firebaseUser.emailVerified) {
            console.log('[AuthListener] unverified session restored on cold start; signing out');
            try {
              await signOut(firebaseAuth);
              dispatch(clearAuth());
              dispatch(clearUserProfile());
              storage.remove(storageKeys.USER_DATA);
            } catch {
              dispatch(clearAuth());
              dispatch(clearUserProfile());
              storage.remove(storageKeys.USER_DATA);
              dispatch(setAuthLoading(false));
              dispatch(setHydrating(false));
            }
            return;
          }
        }

        await syncAuthenticatedUser(dispatch, firebaseUser);
      });
    };

    initializeAuth();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [dispatch]);
}
