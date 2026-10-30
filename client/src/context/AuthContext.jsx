import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('chefToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const savedUser = localStorage.getItem('chefUser');
      if (savedUser) setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      response => response,
      error => {
        const isAuthRequest = error.config?.url?.includes('/api/auth/');
        if (error.response?.status === 401 && !isAuthRequest) {
          localStorage.removeItem('chefToken');
          localStorage.removeItem('chefUser');
          delete axios.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
        }
        return Promise.reject(error);
      },
    );

    return () => axios.interceptors.response.eject(interceptorId);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('chefToken', newToken);
    localStorage.setItem('chefUser', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const signup = async (username, email, password) => {
    const res = await axios.post('/api/auth/signup', { username, email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('chefToken', newToken);
    localStorage.setItem('chefUser', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('chefToken');
    localStorage.removeItem('chefUser');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
