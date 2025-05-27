import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext'; // Import AuthContext

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, role } = useContext(AuthContext);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;