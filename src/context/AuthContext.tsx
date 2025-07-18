
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { ActivityLogger } from '../services/activityLogger';

interface User {
  username: string;
  email?: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

// Provide default values instead of null!
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: async () => {},
  hasRole: () => false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  // Restore auth header on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      // Try to get user info from localStorage or set a default
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // If parsing fails, set a default user
          setUser({ username: 'User', role: 'Manager' });
        }
      } else {
        // Set a default user if none is stored
        setUser({ username: 'User', role: 'Manager' });
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const hasRole = (myrole: string) => {
    const { role, email, username: userName } = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : {};
    return role === myrole;
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      // Accept both Token and token for compatibility
      const token = response.data.token || response.data.Token;
      if (!token) throw new Error('No token returned from server');
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);

      const { mytoken, user } = response.data;
      const { role, email, username: userName } = user;

      // Set user info with role from response
      const userInfo = {
        username: userName,
        email: email,
        role: role
      };
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      console.log('Login successful - authentication state updated');
    } catch (error: unknown) {
      console.error('Login error:', error);
      // Only throw authentication errors, not network errors
      const errorMessage = error instanceof Error && 'code' in error && (error as { code: string }).code === 'ERR_NETWORK'
        ? 'Cannot connect to server. Please check if the backend is running.'
        : 'Invalid credentials';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    const currentUser = user?.username || 'Unknown user';
    try {
      await api.post('/api/user/logout');
    } catch (error) {
      // Don't fail logout if backend is unreachable
      console.log('Logout API call failed, but proceeding with local logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setUser(null);
      
      // Log the logout after clearing the state but while we still have the username
      try {
        await ActivityLogger.logLogout(currentUser);
      } catch (error) {
        console.error('Failed to log logout activity:', error);
      }
      
      console.log('Logout completed - authentication state cleared');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
