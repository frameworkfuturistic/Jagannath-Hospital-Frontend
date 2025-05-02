'use client';
import axiosInstance from '@/lib/axiosInstance';
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';

interface User {
  username: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (formData: { username: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  login: async () => Promise.reject(new Error('Not implemented')),
  logout: async () => {},
  loading: true,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user?.token;

  // Initialize auth state from session storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('token');

        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
          // Set the token in axios instance headers
          axiosInstance.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid session data
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (formData: { username: string; password: string }): Promise<User> => {
      const { username, password } = formData;

      if (!username || !password) {
        return Promise.reject(new Error('Username and password are required'));
      }

      try {
        setLoading(true);
        const response = await axiosInstance.post('/auth/login', {
          username,
          password,
        });

        if (!response.data?.token) {
          throw new Error('Authentication token missing in response');
        }

        const userData: User = {
          username,
          token: response.data.token,
          ...response.data.user, // Include any additional user data
        };

        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('token', response.data.token);
        axiosInstance.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${response.data.token}`;

        return userData;
      } catch (error: any) {
        console.error('Login failed:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Login failed. Please try again.';
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      // Attempt to call logout endpoint if available
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
      setLoading(false);
      router.push('/'); // Redirect to auth page after logout
    }
  }, [router]);

  // Add response interceptor to handle 401 errors
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Auto-logout if we receive 401 Unauthorized
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
