  // contexts/AuthContext.tsx
  import React, { createContext, useContext, useState, useEffect } from 'react';
  import { User } from '../types';
  
  interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isLoading: boolean;
  }
  
  const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => {},
    logout: () => {},
    isLoading: true,
  });
  
  export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    }, []);
  
    const login = (token: string, userData: User) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    };
  
    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    };
  
    return (
      <AuthContext.Provider value={{ user, login, logout, isLoading }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = () => useContext(AuthContext);
