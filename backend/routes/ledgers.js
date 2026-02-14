/**
 * Ledger Routes
 * 
 * Routes for managing accounting ledgers
 */

const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledgerController');
const { verifyToken } = require('../middleware/verifyToken');
const { requireUser, requireMasterAdmin } = require('../middleware/roleMiddleware');
const { validateLedger } = require('../middleware/validation');

// All routes require authentication
router.use(verifyToken);
router.use(requireUser);

/**
 * @route   GET /api/ledgers
 * @desc    Get all ledgers
 * @access  Private
 */
router.get('/', ledgerController.getAllLedgers);

/**
 * @route   GET /api/ledgers/summary
 * @desc    Get ledger balance summary
 * @access  Private
 */
router.get('/summary', ledgerController.getLedgerSummary);

/**
 * @route   GET /api/ledgers/:id
 * @desc    Get single ledger by ID
 * @access  Private
 */
router.get('/:id', ledgerController.getLedgerById);

/**
 * @route   POST /api/ledgers
 * @desc    Create new ledger
 * @access  Private
 */
router.post('/', validateLedger, ledgerController.createLedger);

/**
 * @route   PUT /api/ledgers/:id
 * @desc    Update ledger
 * @access  Private
 */
router.put('/:id', validateLedger, ledgerController.updateLedger);

/**
 * @route   DELETE /api/ledgers/:id
 * @desc    Delete ledger (Master Admin only)
 * @access  Private (Master Admin)
 */
router.delete('/:id', requireMasterAdmin, ledgerController.deleteLedger);

module.exports = router;
