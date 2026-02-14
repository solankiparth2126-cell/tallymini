/**
 * AuditLog Model - Mongoose Schema
 * 
 * Tracks all system actions for security and compliance
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: {
      values: [
        'LOGIN',
        'LOGOUT',
        'CREATE_USER',
        'UPDATE_USER',
        'DELETE_USER',
        'ACTIVATE_USER',
        'DEACTIVATE_USER',
        'RESET_PASSWORD',
        'CREATE_LEDGER',
        'UPDATE_LEDGER',
        'DELETE_LEDGER',
        'CREATE_TRANSACTION',
        'UPDATE_TRANSACTION',
        'DELETE_TRANSACTION',
        'VIEW_REPORT',
        'EXPORT_DATA',
        'SYSTEM_SETTINGS_CHANGE'
      ],
      message: 'Invalid action type'
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  userRole: {
    type: String,
    required: [true, 'User role is required'],
    enum: ['master_admin', 'user']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel',
    default: null
  },
  targetModel: {
    type: String,
    enum: ['User', 'Ledger', 'Transaction', null],
    default: null
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userRole: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
