import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'guest' | 'user' | 'admin';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  role: UserRole;
}

interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  role: UserRole;
  reputation: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextProps {
  user: User | null;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        await fetchProfile(data.user.id);
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;
      
      if (data.user && !data.user.email_confirmed_at) {
        // Email confirmation required
        return;
      }
      
      if (data.user) {
        await fetchProfile(data.user.id);
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      
      // Force redirect to landing page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      window.location.href = '/';
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data) {
        setProfile({
          ...data,
          role: data.role as UserRole,
          reputation: data.reputation || 0,
        });
        setUser({
          id: data.user_id,
          email: '', // Will be updated from auth user
          username: data.username,
          avatar_url: data.avatar_url,
          role: data.role as UserRole,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          username: '',
          avatar_url: null,
          role: 'user',
        });
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          username: '',
          avatar_url: null,
          role: 'user',
        });
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update user email when profile is fetched
  useEffect(() => {
    if (profile && user) {
      setUser(prev => prev ? {
        ...prev,
        username: profile.username,
        avatar_url: profile.avatar_url,
        role: profile.role,
      } : null);
    }
  }, [profile]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      login, 
      signup, 
      loginWithGoogle, 
      logout, 
      isLoading 
    }}>
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