// Exponential backoff with jitter for retryable transient errors
// Used for API retries and offline queue replay

interface BackoffConfig {
  initialDelayMs?: number;
  maxDelayMs?: number;
  maxRetries?: number;
}

export function getBackoffDelay(
  attemptNumber: number,
  config: BackoffConfig = {},
): number {
  const {
    initialDelayMs = 100,
    maxDelayMs = 4000,
    maxRetries = 3,
  } = config;

  if (attemptNumber > maxRetries) {
    return -1; // Signal to stop retrying
  }

  // Exponential: 100ms, 200ms, 400ms, capped at maxDelayMs
  const exponential = initialDelayMs * Math.pow(2, attemptNumber - 1);
  const capped = Math.min(exponential, maxDelayMs);

  // Add jitter (±20%) to prevent thundering herd
  const jitter = capped * (0.8 + Math.random() * 0.4);

  return Math.round(jitter);
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Classify error as retryable or permanent
export function isRetryableError(error: any): boolean {
  // Network timeouts
  if (error.code === "ECONNABORTED") return true;
  if (error.code === "ENOTFOUND") return true;
  if (error.code === "ETIMEDOUT") return true;

  // Server errors: 5xx (but not 501 Not Implemented, which might be permanent)
  if (error.response?.status) {
    const status = error.response.status;
    if (status >= 500 && status !== 501) return true;
    if (status === 429) return true; // Rate limit
  }

  // Network errors without response
  if (!error.response && error.message?.includes("Network")) return true;

  return false;
}
