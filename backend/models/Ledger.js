/**
 * Ledger Model - Mongoose Schema
 * 
 * Defines the ledger schema for accounting entries
 * Tracks who created each ledger
 */

const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ledger name is required'],
    trim: true,
    maxlength: [200, 'Ledger name cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Ledger type is required'],
    enum: {
      values: ['asset', 'liability', 'income', 'expense', 'equity'],
      message: 'Ledger type must be asset, liability, income, expense, or equity'
    }
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
ledgerSchema.index({ name: 1 });
ledgerSchema.index({ type: 1 });
ledgerSchema.index({ createdBy: 1 });
ledgerSchema.index({ isActive: 1 });

module.exports = mongoose.model('Ledger', ledgerSchema);
