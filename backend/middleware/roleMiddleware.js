/**
 * Role-Based Access Control Middleware
 * 
 * Restricts access to routes based on user roles
 * Must be used after verifyToken middleware
 */

/**
 * Middleware factory to check if user has required role
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated (verifyToken should run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredRoles: allowedRoles,
        yourRole: req.user.role
      });
    }

    // User has required role, proceed
    next();
  };
};

/**
 * Middleware to restrict access to Master Admin only
 */
const requireMasterAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'master_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Master Admin privileges required.'
    });
  }

  next();
};

/**
 * Middleware to restrict access to normal users and above
 * (Both master_admin and user roles)
 */
const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  // Both master_admin and user are allowed
  if (!['master_admin', 'user'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Invalid role.'
    });
  }

  next();
};

/**
 * Middleware to check if user can edit a specific transaction
 * Users can only edit their own transactions
 * Master admins can edit any transaction
 */
const canEditTransaction = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Master admin can edit any transaction
    if (req.user.role === 'master_admin') {
      return next();
    }

    // Get transaction ID from params
    const { id } = req.params;
    const Transaction = require('../models/Transaction');
    
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    // Check if user created this transaction
    if (transaction.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own transactions.'
      });
    }

    next();
  } catch (error) {
    console.error('Transaction edit permission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while checking permissions.'
    });
  }
};

/**
 * Middleware to prevent deletion of master admin accounts
 */
const preventMasterAdminDeletion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const User = require('../models/User');
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Prevent deletion of master admin
    if (user.role === 'master_admin') {
      return res.status(403).json({
        success: false,
        message: 'Master Admin accounts cannot be deleted.'
      });
    }

    next();
  } catch (error) {
    console.error('Master admin deletion prevention error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
};

module.exports = {
  requireRole,
  requireMasterAdmin,
  requireUser,
  canEditTransaction,
  preventMasterAdminDeletion
};
