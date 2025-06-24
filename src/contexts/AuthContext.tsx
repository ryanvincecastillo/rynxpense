// src/contexts/AuthContext.tsx - Fixed infinite loop issue
import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthTokens } from '../types';
import { authAPI } from '../services/api';

// ENHANCED: Auth state interface with email verification
interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requiresVerification: boolean; // NEW: Email verification required
}

// ENHANCED: Auth actions with email verification states
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'VERIFICATION_REQUIRED'; payload: { user: User } } // NEW
  | { type: 'EMAIL_VERIFIED'; payload: { user: User; tokens: AuthTokens } } // NEW
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

// ENHANCED: Initial state with email verification
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  requiresVerification: false, // NEW
};

// ENHANCED: Auth reducer with email verification cases
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        requiresVerification: false, // NEW
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        requiresVerification: false, // NEW
      };
    case 'VERIFICATION_REQUIRED': // NEW
      return {
        ...state,
        user: action.payload.user,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        requiresVerification: true,
      };
    case 'EMAIL_VERIFIED': // NEW
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        requiresVerification: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        requiresVerification: false, // NEW
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// ENHANCED: Auth context interface with new methods
interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>; // ENHANCED
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    currency?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>; // NEW
  resendVerificationEmail: (email: string) => Promise<void>; // NEW
  updateUser: (user: User) => void;
  clearError: () => void;
  checkRememberMe: () => Promise<void>; // NEW
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ENHANCED: Auth provider with email verification and remember me
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ENHANCED: Check for existing session or remember me on mount
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'AUTH_START' });

      // First, try to get tokens from localStorage
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (accessToken && refreshToken) {
        try {
          // Verify token by fetching user profile
          const response = await authAPI.getProfile();
          const user = response.data.data;

          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user,
              tokens: { accessToken, refreshToken },
            },
          });
          return;
        } catch (error) {
          // Token is invalid, clear storage and try remember me
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }

      // NEW: Try remember me if no valid tokens
      try {
        const response = await authAPI.loginWithRememberMe();
        const { user, tokens } = response.data.data;

        // Store tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, tokens },
        });
      } catch (error) {
        // No remember me or invalid, user needs to login
        dispatch({ type: 'LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  // ENHANCED: Login function with remember me support
  const login = async (email: string, password: string, rememberMe?: boolean) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authAPI.login({ email, password, rememberMe });
      const { user, tokens, requiresVerification } = response.data.data;

      if (requiresVerification) {
        // NEW: Handle email verification required
        dispatch({
          type: 'VERIFICATION_REQUIRED',
          payload: { user },
        });
      } else {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, tokens },
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please try again.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // ENHANCED: Register function with email verification support
  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    currency?: string;
  }) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authAPI.register(data);
      const { user, tokens, requiresVerification } = response.data.data;

      if (requiresVerification) {
        // NEW: Handle email verification required
        dispatch({
          type: 'VERIFICATION_REQUIRED',
          payload: { user },
        });
      } else {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', tokens!.accessToken);
        localStorage.setItem('refreshToken', tokens!.refreshToken);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, tokens: tokens! },
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Registration failed. Please try again.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // NEW: Email verification function
  const verifyEmail = async (token: string) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authAPI.verifyEmail(token);
      const { user, tokens } = response.data.data;

      // Store tokens in localStorage
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      dispatch({
        type: 'EMAIL_VERIFIED',
        payload: { user, tokens },
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Email verification failed.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // NEW: Resend verification email
  const resendVerificationEmail = async (email: string) => {
    try {
      await authAPI.resendVerificationEmail(email);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to resend verification email.';
      throw new Error(errorMessage);
    }
  };

  // NEW: Check remember me function
  const checkRememberMe = async () => {
    try {
      const response = await authAPI.loginWithRememberMe();
      const { user, tokens } = response.data.data;

      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, tokens },
      });
    } catch (error) {
      // Remember me failed, do nothing
    }
  };

  // EXISTING: Logout function (unchanged)
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage regardless of API call success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // 🔧 FIX: Wrap functions in useCallback to prevent infinite loops
  const updateUser = useCallback((user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    verifyEmail, // NEW
    resendVerificationEmail, // NEW
    updateUser,
    clearError,
    checkRememberMe, // NEW
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;