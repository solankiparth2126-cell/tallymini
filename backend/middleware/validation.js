/**
 * Validation Middleware
 * 
 * Validates request inputs for security
 */

const { body, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * User registration validation rules
 */
const validateUserRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  handleValidationErrors
];

/**
 * User login validation rules
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Transaction creation validation rules
 */
const validateTransaction = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('debitLedger')
    .notEmpty()
    .withMessage('Debit ledger is required')
    .isMongoId()
    .withMessage('Invalid debit ledger ID'),
  
  body('creditLedger')
    .notEmpty()
    .withMessage('Credit ledger is required')
    .isMongoId()
    .withMessage('Invalid credit ledger ID'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('narration')
    .trim()
    .notEmpty()
    .withMessage('Narration is required')
    .isLength({ max: 1000 })
    .withMessage('Narration cannot exceed 1000 characters'),
  
  body('type')
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn(['payment', 'receipt', 'journal', 'contra', 'sales', 'purchase'])
    .withMessage('Invalid transaction type'),
  
  handleValidationErrors
];

/**
 * Ledger creation validation rules
 */
const validateLedger = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Ledger name is required')
    .isLength({ max: 200 })
    .withMessage('Ledger name cannot exceed 200 characters'),
  
  body('type')
    .notEmpty()
    .withMessage('Ledger type is required')
    .isIn(['asset', 'liability', 'income', 'expense', 'equity'])
    .withMessage('Invalid ledger type'),
  
  body('balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Balance cannot be negative'),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateLogin,
  validateTransaction,
  validateLedger,
  handleValidationErrors
};
