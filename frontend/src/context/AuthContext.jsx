/**
 * Authentication Context
 * 
 * Provides global authentication state and methods
 * Manages user session, roles, and permissions
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

// Create context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Wraps the app to provide authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          // Verify token is still valid by fetching user profile
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const response = await api.get('/auth/me');
          
          if (response.data.success) {
            setUser(response.data.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
          }
        } catch (error) {
          // Token invalid or expired
          logout();
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        
        // Save to state and localStorage
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set default authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        return { success: true, user: userData };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      // Call logout endpoint to log the action
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      // Ignore error
    } finally {
      // Clear state and storage
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Remove authorization header
      delete api.defaults.headers.common['Authorization'];
      
      navigate('/login');
    }
  };

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   */
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  /**
   * Check if user is Master Admin
   */
  const isMasterAdmin = () => {
    return user?.role === 'master_admin';
  };

  /**
   * Check if user is normal user
   */
  const isUser = () => {
    return user?.role === 'user';
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    hasRole,
    isMasterAdmin,
    isUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
