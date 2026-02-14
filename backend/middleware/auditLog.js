/**
 * Audit Log Middleware
 * 
 * Automatically logs actions for audit trail
 */

const AuditLog = require('../models/AuditLog');

/**
 * Create audit log entry
 * @param {string} action - The action being performed
 * @param {Object} options - Additional options
 */
const logAction = (action, options = {}) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to capture response
    res.json = function(body) {
      // Restore original method
      res.json = originalJson;
      
      // Log the action asynchronously (don't wait for it)
      if (req.user) {
        AuditLog.create({
          action,
          userId: req.user.id,
          userRole: req.user.role,
          targetId: req.params.id || options.targetId || null,
          targetModel: options.targetModel || null,
          details: {
            ...options.details,
            body: req.body,
            params: req.params,
            query: req.query,
            success: body.success !== false,
            responseMessage: body.message || null
          },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        }).catch(err => console.error('Audit log error:', err));
      }
      
      // Call original json method
      return res.json(body);
    };
    
    next();
  };
};

module.exports = {
  logAction
};
