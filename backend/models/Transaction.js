/**
 * Transaction Model - Mongoose Schema
 * 
 * Defines the transaction/voucher schema
 * Tracks all financial transactions with debit and credit ledgers
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now
  },
  voucherNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  debitLedger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ledger',
    required: [true, 'Debit ledger is required']
  },
  creditLedger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ledger',
    required: [true, 'Credit ledger is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'Amount must be positive'
    }
  },
  narration: {
    type: String,
    required: [true, 'Narration is required'],
    trim: true,
    maxlength: [1000, 'Narration cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['payment', 'receipt', 'journal', 'contra', 'sales', 'purchase'],
      message: 'Invalid transaction type'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Generate voucher number before saving
transactionSchema.pre('save', async function(next) {
  if (!this.voucherNumber) {
    const date = new Date();
    const prefix = 'VCH';
    const timestamp = date.getFullYear().toString().substr(-2) +
                     String(date.getMonth() + 1).padStart(2, '0') +
                     String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.voucherNumber = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Index for faster queries
transactionSchema.index({ date: -1 });
transactionSchema.index({ createdBy: 1 });
transactionSchema.index({ debitLedger: 1 });
transactionSchema.index({ creditLedger: 1 });
transactionSchema.index({ voucherNumber: 1 });
transactionSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
