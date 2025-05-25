import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { apiService } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  updateUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('AuthProvider initial state:', { user, token, loading });

  useEffect(() => {
    console.log('AuthProvider useEffect running');
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');
    
    console.log('useEffect saved data:', { savedToken, savedUser });

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        console.log('useEffect: Auth state loaded');
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      } finally {
        setLoading(false);
        console.log('useEffect: setLoading(false)');
      }
    } else {
      setLoading(false);
      console.log('useEffect: No saved auth state, setLoading(false)');
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    console.log('Login function called');
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));
  };

  const logout = () => {
    console.log('Logout function called');
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const isAuthenticated = !!token && !!user;
  console.log('AuthProvider render:', { user, token, isAuthenticated, loading });

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated,
      isAdmin: user?.role === 'ADMIN',
      loading,
      updateUser: async () => {
        console.log('updateUser function called');
        if (!token) {
          console.warn('updateUser called without token');
          return; // Cannot fetch user if no token
        }
        try {
          const response = await apiService.getUserProfile();
          if (response.data.success && response.data.data) {
            setUser(response.data.data);
            localStorage.setItem('authUser', JSON.stringify(response.data.data));
            console.log('User data updated successfully', response.data.data);
          } else {
            console.error('Failed to fetch updated user data:', response.data.message);
            // Optionally handle cases where user data fetch fails after a successful action
            // e.g., force logout if the user no longer exists or token is invalid
          }
        } catch (error) {
          console.error('Error fetching updated user data:', error);
          // Handle network errors or other unexpected issues
        }
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
