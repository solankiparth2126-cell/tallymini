/**
 * Authentication Routes
 * 
 * Public routes for login/register
 * Protected routes for user profile management
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/verifyToken');
const { requireMasterAdmin, requireUser } = require('../middleware/roleMiddleware');
const { validateUserRegistration, validateLogin } = require('../middleware/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (Master Admin only)
 * @access  Private (Master Admin)
 */
router.post(
  '/register',
  verifyToken,
  requireMasterAdmin,
  validateUserRegistration,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (Any authenticated user)
 */
router.get('/me', verifyToken, requireUser, authController.getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private (Any authenticated user)
 */
router.post('/logout', verifyToken, requireUser, authController.logout);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private (Any authenticated user)
 */
router.put('/change-password', verifyToken, requireUser, authController.changePassword);

module.exports = router;
