/**
 * Admin Routes
 * 
 * Routes accessible only to Master Admin
 * Includes user management and system administration
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auditLogController = require('../controllers/auditLogController');
const { verifyToken } = require('../middleware/verifyToken');
const { requireMasterAdmin, preventMasterAdminDeletion } = require('../middleware/roleMiddleware');

// All routes in this file require Master Admin access
router.use(verifyToken);
router.use(requireMasterAdmin);

/**
 * ==================== USER MANAGEMENT ====================
 */

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with statistics
 * @access  Private (Master Admin)
 */
router.get('/users', userController.getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Master Admin)
 */
router.get('/users/:id', userController.getUserById);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user details
 * @access  Private (Master Admin)
 */
router.put('/users/:id', userController.updateUser);

/**
 * @route   PUT /api/admin/users/:id/activate
 * @desc    Activate a user account
 * @access  Private (Master Admin)
 */
router.put('/users/:id/activate', userController.activateUser);

/**
 * @route   PUT /api/admin/users/:id/deactivate
 * @desc    Deactivate a user account
 * @access  Private (Master Admin)
 */
router.put('/users/:id/deactivate', userController.deactivateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user (cannot delete Master Admin)
 * @access  Private (Master Admin)
 */
router.delete('/users/:id', preventMasterAdminDeletion, userController.deleteUser);

/**
 * @route   PUT /api/admin/users/:id/reset-password
 * @desc    Reset user password
 * @access  Private (Master Admin)
 */
router.put('/users/:id/reset-password', userController.resetPassword);

/**
 * ==================== AUDIT LOGS ====================
 */

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get all audit logs with filtering and pagination
 * @access  Private (Master Admin)
 */
router.get('/audit-logs', auditLogController.getAuditLogs);

/**
 * @route   GET /api/admin/audit-logs/stats
 * @desc    Get audit log statistics
 * @access  Private (Master Admin)
 */
router.get('/audit-logs/stats', auditLogController.getAuditLogStats);

/**
 * @route   GET /api/admin/audit-logs/recent
 * @desc    Get recent audit log activity
 * @access  Private (Master Admin)
 */
router.get('/audit-logs/recent', auditLogController.getRecentActivity);

module.exports = router;
