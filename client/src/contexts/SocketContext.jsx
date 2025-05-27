import React, { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {
  const SOCKET_SERVER_URL = import.meta.env.VITE_BACKEND_URL;
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const newSocket = io(SOCKET_SERVER_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      auth: {
        token: token || '',
      }
    });

    if (token) newSocket.connect();

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };