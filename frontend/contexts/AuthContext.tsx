import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthResponse } from '../services/auth';

interface User {
  id: string;
  email: string;
  walletAddress?: string;
  isEmailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signup: (email: string, password: string) => Promise<AuthResponse>;
  signin: (email: string, password: string) => Promise<AuthResponse>;
  signout: () => void;
  verifyEmail: (email: string, code: string) => Promise<AuthResponse>;
  requestPasswordReset: (email: string) => Promise<AuthResponse>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResponse>;
  connectWallet: () => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing auth token and validate it
    const checkAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          // TODO: Implement token validation with backend
          // const response = await authService.validateToken(token);
          // setUser(response.data.user);
        }
      } catch (err) {
        console.error('Auth validation error:', err);
        authService.signout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signup = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authService.signup(email, password);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred during signup';
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signin = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authService.signin(email, password);
      if (response.data?.user) {
        setUser(response.data.user);
      }
      return response;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred during signin';
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signout = () => {
    authService.signout();
    setUser(null);
  };

  const verifyEmail = async (email: string, code: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authService.verifyEmail(email, code);
      if (response.data?.user) {
        setUser(response.data.user);
      }
      return response;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred during email verification';
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authService.requestPasswordReset(email);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred during password reset request';
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, newPassword);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred during password reset';
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authService.connectWallet();
      if (response.data?.user) {
        setUser(response.data.user);
      }
      return response;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred during wallet connection';
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signup,
    signin,
    signout,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    connectWallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 