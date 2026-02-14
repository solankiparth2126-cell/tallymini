/**
 * Transaction Routes
 * 
 * Routes for managing transactions/vouchers
 */

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyToken } = require('../middleware/verifyToken');
const { requireUser, canEditTransaction } = require('../middleware/roleMiddleware');
const { validateTransaction } = require('../middleware/validation');

// All routes require authentication
router.use(verifyToken);
router.use(requireUser);

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions (with filters)
 * @access  Private
 */
router.get('/', transactionController.getAllTransactions);

/**
 * @route   GET /api/transactions/stats
 * @desc    Get transaction statistics
 * @access  Private
 */
router.get('/stats', transactionController.getTransactionStats);

/**
 * @route   GET /api/transactions/:id
 * @desc    Get single transaction by ID
 * @access  Private
 */
router.get('/:id', transactionController.getTransactionById);

/**
 * @route   POST /api/transactions
 * @desc    Create new transaction
 * @access  Private
 */
router.post('/', validateTransaction, transactionController.createTransaction);

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update transaction
 * @access  Private (Own transactions only, unless Master Admin)
 */
router.put('/:id', canEditTransaction, validateTransaction, transactionController.updateTransaction);

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete transaction (soft delete)
 * @access  Private (Own transactions only, unless Master Admin)
 */
router.delete('/:id', canEditTransaction, transactionController.deleteTransaction);

module.exports = router;
