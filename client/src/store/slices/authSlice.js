// Simple auth functions without Redux Toolkit
import { authAPI } from '../../services/api';

// Simple async functions for auth operations
export const loginUser = async (credentials) => {
  try {
    const response = await authAPI.login(credentials);
    const token = response.data.token;
    localStorage.setItem('barbershop_token', token);
    return {
      user: response.data.user,
      token: token,
      userType: response.data.user.userType || response.data.user.role
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await authAPI.register(userData);
    const token = response.data.token;
    localStorage.setItem('barbershop_token', token);
    return {
      user: response.data.user,
      token: token,
      userType: response.data.user.userType || response.data.user.role
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const logoutUser = () => {
  localStorage.removeItem('barbershop_token');
  localStorage.removeItem('barbershop_remember');
  return null;
};

export const checkAuthStatus = () => {
  const token = localStorage.getItem('barbershop_token');
  return !!token;
};

// Selectors (simple functions)
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserType = (state) => state.auth.userType;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;
export const selectEmailVerified = (state) => state.auth.emailVerified;
export const selectTwoFactorEnabled = (state) => state.auth.twoFactorEnabled;
export const selectIsLocked = (state) => state.auth.isLocked;
export const selectLockUntil = (state) => state.auth.lockUntil;

// Action creators (for compatibility)
export const clearError = () => ({ type: 'auth/clearError' });
export const updateLastActivity = () => ({ type: 'auth/updateLastActivity' });
export const setSessionExpiry = (payload) => ({ type: 'auth/setSessionExpiry', payload });
export const incrementLoginAttempts = () => ({ type: 'auth/incrementLoginAttempts' });
export const resetLoginAttempts = () => ({ type: 'auth/resetLoginAttempts' });
export const checkLockStatus = () => ({ type: 'auth/checkLockStatus' });
export const updateUserProfile = (payload) => ({ type: 'auth/updateUserProfile', payload });
export const enableTwoFactor = () => ({ type: 'auth/enableTwoFactor' });
export const disableTwoFactor = () => ({ type: 'auth/disableTwoFactor' });

// Simple reducer export (not used in current implementation)
export default () => ({});
