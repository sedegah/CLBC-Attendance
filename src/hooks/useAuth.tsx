import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { fetchApi } from '@/lib/apiClient';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'pastor' | 'member';
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    fetchApi('/auth/me')
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
          if (data.token) {
            localStorage.setItem('auth_token', data.token);
          }
        } else {
          setUser(null);
          localStorage.removeItem('auth_token');
        }
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('auth_token');
        setLoading(false);
      });
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setUser(data.user);
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const data = await fetchApi('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      setUser(data.user);
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
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
