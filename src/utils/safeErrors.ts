/**
 * Safe error handling
 * Generic error messages for users (no sensitive details)
 * Detailed errors logged only to backend
 */

import { logAPIError } from '@/src/services/securityLogging';

/**
 * User-friendly error messages (safe to show to users)
 */
export const USER_ERRORS = {
  NETWORK: 'Network error. Please check your connection.',
  LOADING: 'Failed to load data. Please try again.',
  SAVING: 'Failed to save. Please try again.',
  PAYMENT: 'Payment failed. Please try again or use a different method.',
  AUTH: 'Authentication failed. Please login again.',
  PERMISSION: 'You do not have permission to do this.',
  NOT_FOUND: 'Item not found.',
  TIMEOUT: 'Request timed out. Please try again.',
  GENERIC: 'Something went wrong. Please try again.',
} as const;

/**
 * Get safe error message for user
 * Never shows sensitive details
 */
export function getSafeErrorMessage(error: any): string {
  if (!error) return USER_ERRORS.GENERIC;

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return USER_ERRORS.NETWORK;
  }

  // Timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return USER_ERRORS.TIMEOUT;
  }

  // HTTP errors
  if (error.response?.status) {
    const status = error.response.status;

    if (status === 401 || status === 403) {
      return USER_ERRORS.AUTH;
    }

    if (status === 404) {
      return USER_ERRORS.NOT_FOUND;
    }

    if (status >= 500) {
      return USER_ERRORS.LOADING;
    }
  }

  // Default to generic message
  return USER_ERRORS.GENERIC;
}

/**
 * Handle API error safely
 * Shows generic message to user
 * Logs details to backend for debugging
 */
export function handleAPIError(
  error: any,
  context: {
    endpoint?: string;
    action?: string;
    userId?: string;
  } = {},
): string {
  const userMessage = getSafeErrorMessage(error);

  // Log detailed error to backend (backend only)
  logAPIError(
    context.endpoint || 'unknown',
    error.response?.status,
    error.message,
  );

  // Log to console in dev (not production)
  if (__DEV__) {
    console.error('[API Error]', {
      action: context.action,
      endpoint: context.endpoint,
      status: error.response?.status,
      message: error.message,
      // Don't log full error response (might contain sensitive data)
      hasResponse: !!error.response,
    });
  }

  return userMessage;
}

/**
 * Safe console logging (no sensitive data)
 */
export const safeLog = {
  // ✅ Safe to use
  info: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[INFO] ${message}`, data);
    }
  },

  warn: (message: string, data?: any) => {
    if (__DEV__) {
      console.warn(`[WARN] ${message}`, data);
    }
  },

  // ❌ Never use for sensitive data
  error: (message: string) => {
    if (__DEV__) {
      console.error(`[ERROR] ${message}`);
      // Don't log error details
    }
  },

  // 🔒 Security events
  security: (event: string, details?: any) => {
    if (__DEV__) {
      console.log(`[SECURITY] ${event}`, details);
    }
  },
};

/**
 * Validate error is safe to show user
 * Returns true if no sensitive data in error
 */
export function isSafeError(error: any): boolean {
  if (!error) return true;

  const errorString = JSON.stringify(error).toLowerCase();

  // Check for sensitive keywords
  const sensitiveKeywords = [
    'password',
    'token',
    'secret',
    'key',
    'sql',
    'database',
    'query',
    'table',
    'user_id',
    'credit_card',
    'cvv',
  ];

  return !sensitiveKeywords.some((keyword) => errorString.includes(keyword));
}
