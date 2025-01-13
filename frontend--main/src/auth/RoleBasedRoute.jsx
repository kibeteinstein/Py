import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const RoleBasedRoute = ({ role, children }) => {
  const { role: userRole } = useAuth();

  return userRole === role ? children : <Navigate to="/" replace />;
};

export default RoleBasedRoute;

