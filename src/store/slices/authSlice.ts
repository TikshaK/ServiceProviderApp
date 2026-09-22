import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserRole } from '../../types/user';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrating: boolean;
  emailVerified: boolean;
  uid: string | null;
  email: string | null;
  role: UserRole | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  isHydrating: false,
  emailVerified: false,
  uid: null,
  email: null,
  role: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setHydrating: (state, action: PayloadAction<boolean>) => {
      state.isHydrating = action.payload;
    },
    setAuthUser: (
      state,
      action: PayloadAction<{
        uid: string;
        email: string | null;
        emailVerified: boolean;
      }>,
    ) => {
      state.isAuthenticated = true;
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.emailVerified = action.payload.emailVerified;
    },
    setRole: (state, action: PayloadAction<UserRole | null>) => {
      state.role = action.payload;
    },
    clearAuth: state => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isHydrating = false;
      state.emailVerified = false;
      state.uid = null;
      state.email = null;
      state.role = null;
    },
  },
});

export const { setAuthLoading, setHydrating, setAuthUser, setRole, clearAuth } = authSlice.actions;
export default authSlice.reducer;
