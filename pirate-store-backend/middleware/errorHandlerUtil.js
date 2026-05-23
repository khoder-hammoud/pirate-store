// middleware/errorHandlerUtil.js
/**
 * Centralized Error Handling for Controllers
 * يساعد في توحيد معالجة الأخطاء وتجنب التكرار
 */

const handleOrderError = (error) => {
  const errorResponses = {
    'Not authorized': { status: 403, message: error.message },
    'Order not found': { status: 404, message: error.message },
    'Order already paid': { status: 400, message: error.message },
    'Order not paid yet': { status: 400, message: error.message },
    'Order already delivered': { status: 400, message: error.message },
    'Order already cancelled': { status: 400, message: error.message },
    'Insufficient stock': { status: 400, message: error.message },
    'Cancel window expired': { status: 400, message: error.message },
  };

  // Check for exact match first
  if (errorResponses[error.message]) {
    return errorResponses[error.message];
  }

  // Check for partial matches (includes)
  for (const [key, value] of Object.entries(errorResponses)) {
    if (error.message.includes(key)) {
      return value;
    }
  }

  // Check for transition errors
  if (error.message.includes('Invalid status')) {
    return { status: 400, message: error.message };
  }

  // Default error
  return { status: 500, message: 'Internal Server Error' };
};

const handleRefundError = (error) => {
  const refundErrors = {
    'Order not found': { status: 404, message: error.message },
    'Not authorized': { status: 403, message: error.message },
    'No refund found for this order': { status: 404, message: error.message },
    'Amount must be a positive number': { status: 400, message: error.message },
    'already exists': { status: 400, message: error.message },
  };

  if (refundErrors[error.message]) {
    return refundErrors[error.message];
  }

  for (const [key, value] of Object.entries(refundErrors)) {
    if (error.message.includes(key)) {
      return value;
    }
  }

  return { status: 500, message: 'Internal Server Error' };
};

module.exports = {
  handleOrderError,
  handleRefundError
};
