/**
 * Example Protected React Page
 * 
 * This component demonstrates:
 * 1. How to use ProtectedRoute for authentication
 * 2. How to check user roles
 * 3. How to make authenticated API calls
 * 4. How to handle permissions in the UI
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ExampleProtectedPage = () => {
  // Get auth context - provides user info and role checks
  const { user, isMasterAdmin, isUser, isAuthenticated } = useAuth();
  
  // Local state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch protected data on component mount
  useEffect(() => {
    fetchProtectedData();
  }, []);

  const fetchProtectedData = async () => {
    try {
      setLoading(true);
      
      // This API call automatically includes the JWT token
      // thanks to the axios interceptor in api.js
      const response = await api.get('/example-protected/public-example');
      
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Master Admin only action
  const handleAdminAction = async () => {
    if (!isMasterAdmin()) {
      alert('You do not have permission to perform this action');
      return;
    }

    try {
      const response = await api.post('/example-protected/admin-only');
      alert('Admin action successful: ' + response.data.message);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  // Any user can perform this action
  const handleUserAction = async () => {
    try {
      const response = await api.get('/example-protected/multi-role');
      alert('Action successful: ' + response.data.message);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Example Protected Page
        </h1>
        <p className="text-gray-600">
          This page demonstrates role-based access control in action.
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-3">
          Your Authentication Status
        </h2>
        <div className="space-y-2 text-sm">
          <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes ✓' : 'No ✗'}</p>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
              isMasterAdmin() ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
            }`}>
              {user?.role}
            </span>
          </p>
        </div>
      </div>

      {/* Role-Based Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Any User Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Available to All Users
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            This section is visible to all authenticated users.
          </p>
          <button
            onClick={handleUserAction}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Perform User Action
          </button>
        </div>

        {/* Master Admin Only Content */}
        <div className={`rounded-lg shadow p-6 ${
          isMasterAdmin() ? 'bg-white' : 'bg-gray-100'
        }`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Master Admin Only
            {!isMasterAdmin() && (
              <span className="ml-2 text-sm text-red-600 font-normal">(Locked)</span>
            )}
          </h3>
          
          {isMasterAdmin() ? (
            <>
              <p className="text-gray-600 text-sm mb-4">
                This section is only visible to Master Admin.
              </p>
              <button
                onClick={handleAdminAction}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
              >
                Perform Admin Action
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-4">
                You need Master Admin privileges to access this section.
              </p>
              <button
                disabled
                className="bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed"
              >
                Restricted
              </button>
            </>
          )}
        </div>
      </div>

      {/* API Response Display */}
      {data && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            API Response
          </h3>
          <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Permission Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Your Permissions
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            View Dashboard
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Create Transactions
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            View Reports
          </li>
          <li className="flex items-center">
            <span className={isMasterAdmin() ? 'text-green-500 mr-2' : 'text-red-500 mr-2'}>
              {isMasterAdmin() ? '✓' : '✗'}
            </span>
            Manage Users
            {!isMasterAdmin() && <span className="text-gray-500 ml-2">(Master Admin only)</span>}
          </li>
          <li className="flex items-center">
            <span className={isMasterAdmin() ? 'text-green-500 mr-2' : 'text-red-500 mr-2'}>
              {isMasterAdmin() ? '✓' : '✗'}
            </span>
            View Audit Logs
            {!isMasterAdmin() && <span className="text-gray-500 ml-2">(Master Admin only)</span>}
          </li>
          <li className="flex items-center">
            <span className={isMasterAdmin() ? 'text-green-500 mr-2' : 'text-red-500 mr-2'}>
              {isMasterAdmin() ? '✓' : '✗'}
            </span>
            Delete Ledgers
            {!isMasterAdmin() && <span className="text-gray-500 ml-2">(Master Admin only)</span>}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ExampleProtectedPage;
