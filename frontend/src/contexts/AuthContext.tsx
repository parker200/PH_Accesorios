import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

interface User {
  id: string;
  username: string;
  email?: string;
  role: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ph_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('ph_token');
    if (token) {
      api
        .getMe()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('ph_user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('ph_token');
          localStorage.removeItem('ph_user');
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    const response = await api.login(credentials);
    const { token, user: userData } = response.data;
    localStorage.setItem('ph_token', token);
    localStorage.setItem('ph_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('ph_token');
    localStorage.removeItem('ph_user');
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await api.getMe();
    setUser(res.data);
    localStorage.setItem('ph_user', JSON.stringify(res.data));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser
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
