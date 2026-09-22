import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../../types/user';

interface UserState {
  profile: UserProfile | null;
}

const initialState: UserState = {
  profile: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
    clearUserProfile: () => initialState,
  },
});

export const { setUserProfile, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
