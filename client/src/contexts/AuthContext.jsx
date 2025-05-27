import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from './SocketContext';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {
    if (token) {
      const storedUser = {
        username: localStorage.getItem('username'),
        role: localStorage.getItem('role'),
        id: localStorage.getItem('userId')
      };
      setUser(storedUser);
      if (socket && !socket.connected) {
        socket.auth = { token };
        socket.connect();
      }
    } else {
      if (socket && socket.connected) {
        socket.disconnect();
      }
      setUser(null);
    }
  }, [token, socket]);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('userId', data.user._id);
        setToken(data.token);
        setRole(data.user.role);
        setUser(data.user);
        if (socket) {
          socket.auth = { token: data.token };
          socket.connect();
        }
        navigate(data.user.role === 'admin' ? '/admin' : '/player');
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username, password, role = 'player') => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Registration successful:', data);
        return true;
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setToken(null);
    setRole(null);
    setUser(null);
    if (socket && socket.connected) {
      socket.disconnect();
    }
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };