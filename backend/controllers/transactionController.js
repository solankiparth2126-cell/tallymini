/
/**
 * Transaction Controller
 * 
 * Handles transaction/voucher operations
 */

const Transaction = require('../models/Transaction');
const Ledger = require('../models/Ledger');
const AuditLog = require('../models/AuditLog');

/**
 * Get all transactions
 * GET /api/transactions
 */
exports.getAllTransactions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate,
      type,
      search
    } = req.query;

    // Build query
    const query = { isDeleted: false };
    
    // Master admin can see all transactions, users can only see their own
    if (req.user.role !== 'master_admin') {
      query.createdBy = req.user.id;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (type) query.type = type;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch transactions with populated ledger details
    const transactions = await Transaction.find(query)
      .populate('debitLedger', 'name type')
      .populate('creditLedger', 'name type')
      .populate('createdBy', 'name email')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transactions'
    });
  }
};

/**
 * Get transaction by ID
 * GET /api/transactions/:id
 */
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({ 
      _id: id, 
      isDeleted: false 
    })
      .populate('debitLedger', 'name type balance')
      .populate('creditLedger', 'name type balance')
      .populate('createdBy', 'name email role');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user has permission to view this transaction
    if (req.user.role !== 'master_admin' && 
        transaction.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own transactions.'
      });
    }

    res.status(200).json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction'
    });
  }
};

/**
 * Create new transaction
 * POST /api/transactions
 */
exports.createTransaction = async (req, res) => {
  try {
    const { date, debitLedger, creditLedger, amount, narration, type } = req.body;

    // Validate ledgers exist
    const [debitLedgerDoc, creditLedgerDoc] = await Promise.all([
      Ledger.findById(debitLedger),
      Ledger.findById(creditLedger)
    ]);

    if (!debitLedgerDoc) {
      return res.status(404).json({
        success: false,
        message: 'Debit ledger not found'
      });
    }

    if (!creditLedgerDoc) {
      return res.status(404).json({
        success: false,
        message: 'Credit ledger not found'
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      date: date || new Date(),
      debitLedger,
      creditLedger,
      amount,
      narration,
      type,
      createdBy: req.user.id
    });

    // Update ledger balances
    // For simplicity, this example just increments balances
    // In a real system, you'd implement proper double-entry accounting logic
    await Promise.all([
      Ledger.findByIdAndUpdate(debitLedger, { $inc: { balance: amount } }),
      Ledger.findByIdAndUpdate(creditLedger, { $inc: { balance: amount } })
    ]);

    // Log the action
    await AuditLog.create({
      action: 'CREATE_TRANSACTION',
      userId: req.user.id,
      userRole: req.user.role,
      targetId: transaction._id,
      targetModel: 'Transaction',
      details: { amount, type, debitLedger, creditLedger }
    });

    // Populate and return
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('debitLedger', 'name type')
      .populate('creditLedger', 'name type')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction: populatedTransaction }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating transaction'
    });
  }
};

/**
 * Update transaction
 * PUT /api/transactions/:id
 * Users can only edit their own transactions
 */
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, debitLedger, creditLedger, amount, narration, type } = req.body;

    const transaction = await Transaction.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user has permission to edit this transaction
    if (req.user.role !== 'master_admin' && 
        transaction.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own transactions.'
      });
    }

    // Update fields
    if (date) transaction.date = date;
    if (debitLedger) transaction.debitLedger = debitLedger;
    if (creditLedger) transaction.creditLedger = creditLedger;
    if (amount) transaction.amount = amount;
    if (narration) transaction.narration = narration;
    if (type) transaction.type = type;

    await transaction.save();

    // Log the action
    await AuditLog.create({
      action: 'UPDATE_TRANSACTION',
      userId: req.user.id,
      userRole: req.user.role,
      targetId: transaction._id,
      targetModel: 'Transaction'
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('debitLedger', 'name type')
      .populate('creditLedger', 'name type')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction: populatedTransaction }
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating transaction'
    });
  }
};

/**
 * Delete transaction (soft delete)
 * DELETE /api/transactions/:id
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user has permission to delete this transaction
    if (req.user.role !== 'master_admin' && 
        transaction.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own transactions.'
      });
    }

    // Soft delete
    transaction.isDeleted = true;
    transaction.deletedAt = new Date();
    transaction.deletedBy = req.user.id;
    await transaction.save();

    // Log the action
    await AuditLog.create({
      action: 'DELETE_TRANSACTION',
      userId: req.user.id,
      userRole: req.user.role,
      targetId: transaction._id,
      targetModel: 'Transaction'
    });

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting transaction'
    });
  }
};

/**
 * Get transaction statistics
 * GET /api/transactions/stats
 */
exports.getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = { isDeleted: false };
    if (req.user.role !== 'master_admin') {
      dateFilter.createdBy = req.user.id;
    }
    
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Get statistics
    const stats = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          minAmount: { $min: '$amount' },
          maxAmount: { $max: '$amount' }
        }
      }
    ]);

    // Get transactions by type
    const byType = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: stats[0] || {
          totalTransactions: 0,
          totalAmount: 0,
          avgAmount: 0,
          minAmount: 0,
          maxAmount: 0
        },
        byType
      }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};
