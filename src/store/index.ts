import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export {
  setAuthLoading,
  setHydrating,
  setAuthUser,
  setRole,
  clearAuth,
} from './slices/authSlice';
export { setUserProfile, clearUserProfile } from './slices/userSlice';
export { useAuth } from '../hooks/useAuth';
export { setInteractiveLoginInProgress, useAuthListener, syncAuthenticatedUser } from '../hooks/useAuthListener';
