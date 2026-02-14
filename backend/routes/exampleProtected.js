/**
 * Example Protected API Route
 * 
 * This file demonstrates how to create a protected route
 * with role-based access control.
 */

const express = require('express');
const router = express.Router();

// Import middleware
const { verifyToken } = require('../middleware/verifyToken');
const { requireRole, requireMasterAdmin, requireUser } = require('../middleware/roleMiddleware');
const { logAction } = require('../middleware/auditLog');

// ============================================
// EXAMPLE 1: Basic Protected Route
// Any authenticated user can access
// ============================================
router.get('/public-example', verifyToken, requireUser, (req, res) => {
  res.json({
    success: true,
    message: 'This route is accessible to any authenticated user',
    user: req.user
  });
});

// ============================================
// EXAMPLE 2: Master Admin Only Route
// Only master_admin role can access
// ============================================
router.get('/admin-only', verifyToken, requireMasterAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'This route is only accessible to Master Admin',
    user: req.user
  });
});

// ============================================
// EXAMPLE 3: Multiple Roles Route
// Both master_admin and user can access
// ============================================
router.get('/multi-role', verifyToken, requireRole('master_admin', 'user'), (req, res) => {
  res.json({
    success: true,
    message: 'This route is accessible to Master Admin and Users',
    user: req.user
  });
});

// ============================================
// EXAMPLE 4: Protected Route with Audit Logging
// Automatically logs the action
// ============================================
router.post('/create-something', 
  verifyToken, 
  requireUser,
  logAction('CREATE_SOMETHING', { 
    targetModel: 'Something',
    details: { action: 'create' }
  }),
  (req, res) => {
    // Your logic here
    res.json({
      success: true,
      message: 'Action performed and logged',
      data: req.body
    });
  }
);

// ============================================
// EXAMPLE 5: Route with Transaction Edit Check
// Users can only edit their own transactions
// ============================================
const { canEditTransaction } = require('../middleware/roleMiddleware');

router.put('/transactions/:id', 
  verifyToken,
  canEditTransaction,  // Checks if user owns the transaction
  async (req, res) => {
    try {
      // Update transaction logic here
      res.json({
        success: true,
        message: 'Transaction updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating transaction'
      });
    }
  }
);

// ============================================
// EXAMPLE 6: Route that checks user limit
// Before creating a new user
// ============================================
const User = require('../models/User');

router.post('/check-user-limit', verifyToken, requireMasterAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments({ role: 'user' });
    const maxUsers = 3;
    
    res.json({
      success: true,
      data: {
        currentUsers: userCount,
        maxUsers: maxUsers,
        canCreateUser: userCount < maxUsers,
        remainingSlots: Math.max(0, maxUsers - userCount)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking user limit'
    });
  }
});

module.exports = router;
