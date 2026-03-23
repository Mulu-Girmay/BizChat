import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'owner' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessName: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, businessName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('bizchat_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockUser: User = {
      id: '1',
      email,
      name: 'Alex Thompson',
      role: 'owner',
      businessName: 'TechStore Pro'
    };

    setUser(mockUser);
    localStorage.setItem('bizchat_user', JSON.stringify(mockUser));
    localStorage.setItem('bizchat_token', 'mock-jwt-token');
  };

  const register = async (email: string, password: string, name: string, businessName: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockUser: User = {
      id: '1',
      email,
      name,
      role: 'owner',
      businessName
    };

    setUser(mockUser);
    localStorage.setItem('bizchat_user', JSON.stringify(mockUser));
    localStorage.setItem('bizchat_token', 'mock-jwt-token');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bizchat_user');
    localStorage.removeItem('bizchat_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
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
