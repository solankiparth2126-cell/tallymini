/**
 * User Controller
 * 
 * Handles user management operations (Master Admin only)
 */

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

/**
 * Get all users
 * GET /api/users
 * Master Admin only
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    // Get user counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });

    res.status(200).json({
      success: true,
      data: {
        users,
        stats: {
          totalUsers,
          activeUsers,
          maxUsers: 3,
          remainingSlots: Math.max(0, 3 - totalUsers)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 * Master Admin only
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
};

/**
 * Update user
 * PUT /api/users/:id
 * Master Admin only
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, isActive } = req.body;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent modification of master admin's role
    if (user.role === 'master_admin' && req.body.role && req.body.role !== 'master_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot change Master Admin role'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    // Log the action
    await AuditLog.create({
      action: 'UPDATE_USER',
      userId: req.user.id,
      userRole: req.user.role,
      targetId: user._id,
      targetModel: 'User',
      details: { updates: { name, email, isActive } }
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
};

/**
 * Activate user
 * PUT /api/users/:id/activate
 * Master Admin only
 */
exports.activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save();

    // Log the action
    await AuditLog.create({
      action: 'ACTIVATE_USER',
      userId: req.user.id,
      userRole: req.user.role,
      targetId: user._id,
      targetModel: 'User'
    });

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while activating user'
    });
  }
};

/**
 * Deactivate user
 * PUT /api/users/:id/deactivate
 * Master Admin only
 */
exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deactivation of master admin
    if (user.role === 'master_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate Master Admin account'
      });
    }

    user.isActive = false;
    await user.save();

    // Log the action
    await AuditLog.create({
      action: 'DEACTIVATE_USER',
      userId: req.user.id,
      userRole: req.user.role,
      targetId: user._id,
      targetModel: 'User'
    });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deactivating user'
    });
  }
};

/**
 * Delete user
 * DELETE /api/users/:id
 * Master Admin only
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deletion of master admin
    if (user.role === 'master_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete Master Admin account'
      });
    }

    await User.findByIdAndDelete(id);

    // Log the action
    await AuditLog.create({
      action: 'DELETE_USER',
      userId: req.user.id,
      userRole: req.user.role,
      targetId: user._id,
      targetModel: 'User',
      details: { deletedUser: { name: user.name, email: user.email } }
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
};

/**
 * Reset user password
 * PUT /api/users/:id/reset-password
 * Master Admin only
 */
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log the action
    await AuditLog.create({
      action: 'RESET_PASSWORD',
      userId: req.user.id,
      userRole: req.user.role,
      targetId: user._id,
      targetModel: 'User'
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resetting password'
    });
  }
};
