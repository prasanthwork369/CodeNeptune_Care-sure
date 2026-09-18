/**
 * Security event logging
 * Logs security-related events for monitoring and compliance
 */

import { apiClient } from '@/src/api/client';
import { useAuthStore } from '@/src/store/authStore';

export enum SecurityEvent {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PAYMENT_ATTEMPTED = 'payment_attempted',
  PAYMENT_FAILED = 'payment_failed',
  DATA_ACCESSED = 'data_accessed',
  PERMISSION_DENIED = 'permission_denied',
  INVALID_TOKEN = 'invalid_token',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  API_ERROR = 'api_error',
}

interface SecurityLogEntry {
  event: SecurityEvent | string;
  details?: Record<string, any>;
  timestamp?: string;
  userId?: string;
}

/**
 * Log security event to backend
 * Non-blocking - won't affect app performance
 */
export async function logSecurityEvent(
  event: SecurityEvent | string,
  details?: Record<string, any>,
): Promise<void> {
  try {
    const userId = useAuthStore.getState().user?.id;

    // Don't log sensitive details
    const safeDetails = {
      ...details,
      token: undefined, // Remove any tokens
      password: undefined, // Remove passwords
      pin: undefined, // Remove PINs
    };

    const logEntry: SecurityLogEntry = {
      event,
      details: safeDetails,
      timestamp: new Date().toISOString(),
      userId,
    };

    // Send to backend (non-blocking)
    apiClient
      .post('/api/v1/security-logs', logEntry)
      .catch((error) => {
        // Silently fail - don't disrupt user experience
        if (__DEV__) {
          console.warn('[SecurityLog] Failed to log event:', error);
        }
      });
  } catch (error) {
    // Prevent logging errors from crashing app
    if (__DEV__) {
      console.warn('[SecurityLog] Error:', error);
    }
  }
}

/**
 * Log login attempt
 */
export function logLoginAttempt(success: boolean, reason?: string): void {
  logSecurityEvent(
    success ? SecurityEvent.LOGIN_SUCCESS : SecurityEvent.LOGIN_FAILED,
    {
      reason,
      timestamp: new Date().toISOString(),
    },
  );
}

/**
 * Log logout
 */
export function logLogout(): void {
  logSecurityEvent(SecurityEvent.LOGOUT, {
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log payment attempt
 */
export function logPayment(
  success: boolean,
  amount?: number,
  reason?: string,
): void {
  logSecurityEvent(
    success ? SecurityEvent.PAYMENT_ATTEMPTED : SecurityEvent.PAYMENT_FAILED,
    {
      amount,
      reason,
      timestamp: new Date().toISOString(),
    },
  );
}

/**
 * Log API errors
 */
export function logAPIError(
  endpoint: string,
  statusCode?: number,
  errorMessage?: string,
): void {
  logSecurityEvent(SecurityEvent.API_ERROR, {
    endpoint,
    statusCode,
    // Don't log full error message (might contain sensitive data)
    hasError: !!errorMessage,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log suspicious activity
 */
export function logSuspiciousActivity(reason: string, context?: any): void {
  logSecurityEvent(SecurityEvent.SUSPICIOUS_ACTIVITY, {
    reason,
    context,
    timestamp: new Date().toISOString(),
  });
}
