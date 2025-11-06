'use strict';

const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: { code: 'AUTH_001', message: 'Invalid email or password' },
  TOKEN_EXPIRED: { code: 'AUTH_002', message: 'Token has expired' },
  INVALID_TOKEN: { code: 'AUTH_003', message: 'Invalid token' },
  UNAUTHORIZED: { code: 'AUTH_004', message: 'Unauthorized access' },
  
  // User errors
  USER_NOT_FOUND: { code: 'USER_001', message: 'User not found' },
  USER_ALREADY_EXISTS: { code: 'USER_002', message: 'User already exists with this email' },
  
  // Library errors
  LIBRARY_NOT_FOUND: { code: 'LIB_001', message: 'Library not found' },
  LIBRARY_INACTIVE: { code: 'LIB_002', message: 'Library is inactive' },
  LIBRARY_ALREADY_EXISTS: { code: 'LIB_003', message: 'Library already exists with this contact email' },
  
  // Student errors
  STUDENT_NOT_FOUND: { code: 'STU_001', message: 'Student not found' },
  
  // Payment errors
  PAYMENT_FAILED: { code: 'PAY_001', message: 'Payment failed' },
  PAYMENT_NOT_FOUND: { code: 'PAY_002', message: 'Payment not found' },
  
  // Reminder errors
  REMINDER_FAILED: { code: 'REM_001', message: 'Failed to send reminder' },
  
  // Server errors
  SERVER_ERROR: { code: 'SRV_001', message: 'Internal server error' },
  VALIDATION_ERROR: { code: 'SRV_002', message: 'Validation error' }
};

module.exports = ERROR_CODES;