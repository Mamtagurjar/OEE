import { configureStore } from '@reduxjs/toolkit';
import { getActiveUser, initializeUsers } from '../auth/auth';
import authReducer, { AuthState } from './slices/authSlice';

const createPreloadedAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      isAuthenticated: false,
      error: null,
    };
  }

  initializeUsers();
  const activeUser = getActiveUser();

  return {
    user: activeUser,
    isAuthenticated: Boolean(activeUser),
    error: null,
  };
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: createPreloadedAuthState(),
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
