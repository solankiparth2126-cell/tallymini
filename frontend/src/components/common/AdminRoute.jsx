/**
 * Admin Route Component
 * 
 * Shortcut for Master Admin only routes
 */

import React from 'react';
import RoleRoute from './RoleRoute.jsx';

const AdminRoute = ({ children }) => {
  return (
    <RoleRoute allowedRoles={['master_admin']}>
      {children}
    </RoleRoute>
  );
};

export default AdminRoute;
