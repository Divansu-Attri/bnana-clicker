import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import {AuthPage} from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import PlayerDashboard from './pages/PlayerDashboard';
import RankPage from './pages/RankPage';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';

const App = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <SocketProvider>
          <AuthProvider>
            <Layout />
          </AuthProvider>
        </SocketProvider>
      ),
      children: [
        { path: '/', element: <AuthPage /> },
        { path: '/auth', element: <AuthPage /> },
        {
          path: '/admin',
          element: (
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: '/player',
          element: (
            <ProtectedRoute allowedRoles={['player']}>
              <PlayerDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: '/rank',
          element: (
            <ProtectedRoute allowedRoles={['player', 'admin']}>
              <RankPage />
            </ProtectedRoute>
          ),
        },
        // Fallback for unknown routes
        { path: '*', element: <h2 className="text-center text-danger mt-5">404 - Page Not Found</h2> },
      ],
    },
  ]);

  return (
    <RouterProvider router={router} />
  );
};

export default App;