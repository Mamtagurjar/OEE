import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StoredUser } from '../../auth/auth';

export interface AuthState {
  user: StoredUser | null;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticatedUser(state, action: PayloadAction<StoredUser | null>) {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<StoredUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const {
  setAuthenticatedUser,
  loginSuccess,
  loginFailure,
  clearAuthError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
