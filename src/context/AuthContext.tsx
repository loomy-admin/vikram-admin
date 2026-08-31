import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminUser } from '../types';
import { authApi, AdminLoginPayload, ChangePasswordPayload } from '../api/authApi';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: AdminLoginPayload) => Promise<void>;
  logout: () => void;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const cached = localStorage.getItem('admin_profile');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
      localStorage.setItem('admin_profile', JSON.stringify(profile));
    } catch {
      // If profile fails and unauthorized, token will be cleared by axios interceptor
    }
  }, [token]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('admin_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const profile = await authApi.getProfile();
          setUser(profile);
          localStorage.setItem('admin_profile', JSON.stringify(profile));
        } catch {
          // If backend unreachable or invalid token
          const cachedUser = localStorage.getItem('admin_profile');
          if (!cachedUser) {
            localStorage.removeItem('admin_token');
            setToken(null);
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (payload: AdminLoginPayload) => {
    const result = await authApi.login(payload);
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem('admin_token', result.token);
    localStorage.setItem('admin_profile', JSON.stringify(result.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_profile');
  };

  const changePassword = async (payload: ChangePasswordPayload) => {
    await authApi.changePassword(payload);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        changePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
