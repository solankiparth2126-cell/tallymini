/**
 * Sidebar Component
 * 
 * Role-based navigation menu
 * Shows different menu items based on user role
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const Sidebar = () => {
  const { isMasterAdmin } = useAuth();
  const location = useLocation();

  // Navigation items for all users
  const userNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/transactions', label: 'Transactions', icon: '📄' },
    { path: '/ledgers', label: 'Ledgers', icon: '📚' },
    { path: '/reports', label: 'Reports', icon: '📈' },
  ];

  // Navigation items for Master Admin only
  const adminNavItems = [
    { path: '/admin/users', label: 'User Management', icon: '👥' },
    { path: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
    { path: '/admin/settings', label: 'System Settings', icon: '⚙️' },
  ];

  const NavItem = ({ path, label, icon }) => {
    const isActive = location.pathname === path;
    
    return (
      <NavLink
        to={path}
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
        }`}
      >
        <span className="mr-3 text-lg">{icon}</span>
        {label}
      </NavLink>
    );
  };

  return (
    <aside className="w-64 bg-white shadow-md h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">💰 Accounting</h1>
        <p className="text-xs text-gray-500 mt-1">Personal Finance</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {/* User Menu Section */}
        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          <div className="space-y-1">
            {userNavItems.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>
        </div>

        {/* Admin Menu Section - Only for Master Admin */}
        {isMasterAdmin() && (
          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Administration
            </p>
            <div className="space-y-1">
              {adminNavItems.map((item) => (
                <NavItem key={item.path} {...item} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          System Online
        </div>
        <p className="text-xs text-gray-400 mt-2">
          v1.0.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
