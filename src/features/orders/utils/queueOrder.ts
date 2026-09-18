import AsyncStorage from "@react-native-async-storage/async-storage";
import { CreateOrderRequest } from "@/src/features/orders/types";

const OFFLINE_ORDER_KEY = "offline_queued_order";

interface QueuedOrderData {
  payload: CreateOrderRequest;
  idempotencyKey: string;
  queuedAt: number;
  attemptCount: number;
}

export async function queueOrderForRetry(
  payload: CreateOrderRequest,
  idempotencyKey: string,
): Promise<void> {
  try {
    const data: QueuedOrderData = {
      payload,
      idempotencyKey,
      queuedAt: Date.now(),
      attemptCount: 0,
    };
    await AsyncStorage.setItem(OFFLINE_ORDER_KEY, JSON.stringify(data));
    if (__DEV__) {
      console.debug("[queueOrder] Order queued for retry", { idempotencyKey });
    }
  } catch (err) {
    if (__DEV__) console.error("[queueOrder] Failed to queue order", err);
    // Non-fatal: if queue fails, the user just sees the error
  }
}

export async function getQueuedOrder(): Promise<QueuedOrderData | null> {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_ORDER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    if (__DEV__) console.error("[queueOrder] Failed to read queued order", err);
    return null;
  }
}

export async function clearQueuedOrder(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_ORDER_KEY);
  } catch (err) {
    if (__DEV__) console.error("[queueOrder] Failed to clear queued order", err);
  }
}

export async function incrementOrderRetryCount(): Promise<void> {
  try {
    const data = await getQueuedOrder();
    if (data) {
      data.attemptCount += 1;
      await AsyncStorage.setItem(OFFLINE_ORDER_KEY, JSON.stringify(data));
    }
  } catch (err) {
    if (__DEV__) console.error("[queueOrder] Failed to increment retry count", err);
  }
}

// Check if order has been queued for too long (> 24 hours)
export function isOrderQueueExpired(queuedAt: number): boolean {
  const QUEUE_EXPIRY_MS = 24 * 60 * 60 * 1000;
  return Date.now() - queuedAt > QUEUE_EXPIRY_MS;
}
