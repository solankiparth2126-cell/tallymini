/**
 * Audit Log Controller
 * 
 * Handles system audit log operations (Master Admin only)
 */

const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

/**
 * Get all audit logs
 * GET /api/admin/audit-logs
 * Master Admin only
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      action, 
      userId, 
      startDate, 
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // Fetch logs with user details
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .populate('targetId')
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching audit logs'
    });
  }
};

/**
 * Get audit log statistics
 * GET /api/admin/audit-logs/stats
 * Master Admin only
 */
exports.getAuditLogStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get action counts
    const actionCounts = await AuditLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get user activity counts
    const userActivity = await AuditLog.aggregate([
      { $match: dateFilter },
      { $group: { 
        _id: '$userId', 
        count: { $sum: 1 },
        lastActivity: { $max: '$createdAt' }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Populate user details for activity
    const userIds = userActivity.map(u => u._id);
    const users = await User.find({ _id: { $in: userIds } }).select('name email role');
    
    const userActivityWithDetails = userActivity.map(activity => {
      const user = users.find(u => u._id.toString() === activity._id.toString());
      return {
        ...activity,
        user: user || null
      };
    });

    // Get total actions count
    const totalActions = await AuditLog.countDocuments(dateFilter);

    res.status(200).json({
      success: true,
      data: {
        totalActions,
        actionCounts,
        topUsers: userActivityWithDetails
      }
    });
  } catch (error) {
    console.error('Get audit log stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching audit statistics'
    });
  }
};

/**
 * Get recent activity
 * GET /api/admin/audit-logs/recent
 * Master Admin only
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const logs = await AuditLog.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent activity'
    });
  }
};
