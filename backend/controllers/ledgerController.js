/**
 * Ledger Controller
 * 
 * Handles ledger management operations
 */

const Ledger = require('../models/Ledger');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');

/**
 * Get all ledgers
 * GET /api/ledgers
 */
exports.getAllLedgers = async (req, res) => {
  try {
    const { type, search, sortBy = 'name', sortOrder = 'asc' } = req.query;

    // Build query
    const query = { isActive: true };
    
    // Master admin can see all ledgers, users can see all active ledgers
    if (type) query.type = type;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    const ledgers = await Ledger.find(query)
      .populate('createdBy', 'name email')
      .sort({ [sortBy]: sortDirection });

    res.status(200).json({
      success: true,
      count: ledgers.length,
      data: { ledgers }
    });
  } catch (error) {
    console.error('Get ledgers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching ledgers'
    });
  }
};

/**
 * Get ledger by ID
 * GET /api/ledgers/:id
 */
exports.getLedgerById = async (req, res) => {
  try {
    const { id } = req.params;

    const ledger = await Ledger.findById(id)
      .populate('createdBy', 'name email');

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: 'Ledger not found'
      });
    }

    // Get recent transactions for this ledger
    const recentTransactions = await Transaction.find({
      $or: [{ debitLedger: id }, { creditLedger: id }],
      isDeleted: false
    })
      .populate('debitLedger creditLedger', 'name')
      .populate('createdBy', 'name')
      .sort({ date: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: { 
        ledger,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching ledger'
    });
  }
};

/**
 * Create new ledger
 * POST /api/ledgers
 */
exports.createLedger = async (req, res) => {
  try {
    const { name, type, balance = 0, description } = req.body;

    // Check if ledger with same name exists
    const existingLedger = await Ledger.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      isActive: true
    });

    if (existingLedger) {
      return res.status(409).json({
        success: false,
        message: 'Ledger with this name already exists'
      });
    }

    const ledger = await Ledger.create({
      name,
      type,
      balance,
      description,
      createdBy: req.user.id
    });

    // Log the action
    await AuditLog.create({
      action: 'CREATE_LEDGER',
      userId: req.user.id,
      userRole: req.user.role,
      targetId: ledger._id,
      targetModel: 'Ledger',
      details: { name, type, balance }
    });

    const populatedLedger = await Ledger.findById(ledger._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Ledger created successfully',
      data: { ledger: populatedLedger }
    });
  } catch (error) {
    console.error('Create ledger error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating ledger'
    });
  }
};

/**
 * Update ledger
 * PUT /api/ledgers/:id
 */
exports.updateLedger = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, balance, description } = req.body;

    const ledger = await Ledger.findById(id);

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: 'Ledger not found'
      });
    }

    // Update fields
    if (name) ledger.name = name;
    if (type) ledger.type = type;
    if (typeof balance === 'number') ledger.balance = balance;
    if (description !== undefined) ledger.description = description;

    await ledger.save();

    // Log the action
    await AuditLog.create({
      action: 'UPDATE_LEDGER',
      userId: req.user.id,
      userRole: req.user.role,
      targetId: ledger._id,
      targetModel: 'Ledger'
    });

    const populatedLedger = await Ledger.findById(ledger._id)
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Ledger updated successfully',
      data: { ledger: populatedLedger }
    });
  } catch (error) {
    console.error('Update ledger error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating ledger'
    });
  }
};

/**
 * Delete ledger (soft delete - deactivate)
 * DELETE /api/ledgers/:id
 * Only Master Admin can delete ledgers
 */
exports.deleteLedger = async (req, res) => {
  try {
    const { id } = req.params;

    const ledger = await Ledger.findById(id);

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: 'Ledger not found'
      });
    }

    // Check if ledger has transactions
    const transactionCount = await Transaction.countDocuments({
      $or: [{ debitLedger: id }, { creditLedger: id }],
      isDeleted: false
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete ledger. It has ${transactionCount} transaction(s).`
      });
    }

    // Soft delete (deactivate)
    ledger.isActive = false;
    await ledger.save();

    // Log the action
    await AuditLog.create({
      action: 'DELETE_LEDGER',
      userId: req.user.id,
      userRole: req.user.role,
      targetId: ledger._id,
      targetModel: 'Ledger'
    });

    res.status(200).json({
      success: true,
      message: 'Ledger deleted successfully'
    });
  } catch (error) {
    console.error('Delete ledger error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting ledger'
    });
  }
};

/**
 * Get ledger balance summary
 * GET /api/ledgers/summary
 */
exports.getLedgerSummary = async (req, res) => {
  try {
    const summary = await Ledger.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalBalance: { $sum: '$balance' }
        }
      }
    ]);

    const totalBalance = await Ledger.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: '$balance' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byType: summary,
        totalBalance: totalBalance[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get ledger summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching ledger summary'
    });
  }
};
