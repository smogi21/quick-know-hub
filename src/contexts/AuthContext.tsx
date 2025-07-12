import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'guest' | 'user' | 'admin';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  role: UserRole;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement Supabase authentication
      // For now, mock login
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({
        id: '1',
        username: email.split('@')[0],
        email,
        role: 'user'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}