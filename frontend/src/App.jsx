/**
 * Main App Component
 * 
 * Configures routing with role-based access control
 * Wraps all routes with AuthProvider
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

// Layout Components
import Sidebar from './components/common/Sidebar.jsx';
import Header from './components/common/Header.jsx';

// Route Guards
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import AdminRoute from './components/common/AdminRoute.jsx';

// Pages
import Login from './components/pages/Login.jsx';
import Dashboard from './components/pages/Dashboard.jsx';
import UserManagement from './components/pages/UserManagement.jsx';

// Layout wrapper for authenticated pages
const AuthenticatedLayout = ({ children }) => (
  <div className="flex h-screen bg-gray-100">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes - Any authenticated user */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <div className="text-center text-gray-500 mt-20">
                    <h2 className="text-2xl font-semibold mb-4">Transactions</h2>
                    <p>Transaction management page (to be implemented)</p>
                  </div>
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/ledgers"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <div className="text-center text-gray-500 mt-20">
                    <h2 className="text-2xl font-semibold mb-4">Ledgers</h2>
                    <p>Ledger management page (to be implemented)</p>
                  </div>
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <div className="text-center text-gray-500 mt-20">
                    <h2 className="text-2xl font-semibold mb-4">Reports</h2>
                    <p>Reports and analytics page (to be implemented)</p>
                  </div>
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes - Master Admin only */}
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AuthenticatedLayout>
                  <UserManagement />
                </AuthenticatedLayout>
              </AdminRoute>
            }
          />
          
          <Route
            path="/admin/audit-logs"
            element={
              <AdminRoute>
                <AuthenticatedLayout>
                  <div className="text-center text-gray-500 mt-20">
                    <h2 className="text-2xl font-semibold mb-4">Audit Logs</h2>
                    <p>System audit logs (to be implemented)</p>
                  </div>
                </AuthenticatedLayout>
              </AdminRoute>
            }
          />
          
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AuthenticatedLayout>
                  <div className="text-center text-gray-500 mt-20">
                    <h2 className="text-2xl font-semibold mb-4">System Settings</h2>
                    <p>System configuration (to be implemented)</p>
                  </div>
                </AuthenticatedLayout>
              </AdminRoute>
            }
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 - Catch all */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-6">Page not found</p>
                  <a href="/dashboard" className="text-blue-600 hover:text-blue-800">
                    Go to Dashboard →
                  </a>
                </div>
              </div>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
