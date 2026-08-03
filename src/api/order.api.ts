import { CreateOrderRequest, Order, OrderItem } from "../types/order";
import { API_ENDPOINTS } from "../utils/urls";
import { apiClient } from "./client";
import { logger } from "@/src/utils/logger";

/** One mapped row from getFrequentlyOrdered — the shape the UI consumes. */
export type FrequentOrderItem = Awaited<
  ReturnType<typeof orderApi.getFrequentlyOrdered>
>[number];

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  sortOrder?: "asc" | "desc";
}

/** Raw frequently-ordered row. The backend spells several fields more than one
 * way, so every field is optional and read defensively below. */
interface ApiFrequentlyOrderedItem {
  id: string;
  medicineId?: string;
  productId?: string;
  name: string;
  slug?: string;
  description?: string;
  price?: number | string;
  mrp?: number | string;
  discountPercent?: number | string;
  discountPercentage?: number | string;
  thumbnailUrl?: string;
  requiresPrescription?: boolean;
  brand?: { name?: string };
  category?: { name?: string } | string;
  orderedTimes?: number;
  orderCount?: number;
  frequency?: number;
  lastOrdered?: string;
  lastOrderedAt?: string;
  lastQty?: number;
  lastQuantity?: number;
  quantity?: number;
  packSize?: string | number;
  unit?: string;
}

export const orderApi = {
  createOrder: async (
    data: CreateOrderRequest,
    idempotencyKey?: string,
  ): Promise<Order> => {
    // Idempotency-Key lets the backend dedupe a retried order instead of
    // creating a duplicate; sent as a standard header when provided.
    const response = await apiClient.post(
      API_ENDPOINTS.ORDERS,
      data,
      idempotencyKey
        ? { headers: { "Idempotency-Key": idempotencyKey } }
        : undefined,
    );
    return response.data.data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(API_ENDPOINTS.ORDER_BY_ID(id));
    const data = response.data.data;
    if (__DEV__)
      logger.debug("[getOrderById] raw:", JSON.stringify(data, null, 2));
    // Normalize items — API may return orderItems or lineItems instead of items
    if (!data.items?.length) {
      data.items = data.orderItems ?? data.lineItems ?? data.items ?? [];
    }
    if (__DEV__) {
      logger.debug(
        "[getOrderById] item pricing:",
        data.items?.map((item: OrderItem) => ({
          name: item.medicineSnapshot?.name,
          unitPrice: item.unitPrice,
          sellingPrice: item.sellingPrice,
          mrp: item.mrp,
          discountPercent: item.discountPercent,
          discountPercentage: item.discountPercentage,
          snapshotMrp: item.medicineSnapshot?.mrp,
          snapshotDiscountPercent: item.medicineSnapshot?.discountPercent,
          snapshotDiscountPercentage: item.medicineSnapshot?.discountPercentage,
        })),
      );
    }
    return data;
  },

  listOrders: async (params?: OrderListParams): Promise<Order[]> => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS, { params });
    if (__DEV__)
      logger.debug(
        "[listOrders] first order items:",
        JSON.stringify(response.data.data?.[0]?.items, null, 2),
      );
    return response.data.data;
  },

  getFrequentlyOrdered: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(
      "/api/v1/orders/customer/frequently-ordered",
      { params },
    );
    const raw: ApiFrequentlyOrderedItem[] = response.data.data ?? [];
    return raw.map((item) => {
      const rawPrice = parseFloat(String(item.price || 0));
      const rawMrp = item.mrp ? parseFloat(String(item.mrp)) : undefined;
      const discountPct = parseFloat(
        String(item.discountPercent ?? item.discountPercentage ?? 0),
      );

      let finalPrice = rawPrice;
      let finalOriginalPrice = rawMrp;

      if (discountPct > 0) {
        if (!rawMrp || Math.abs(rawMrp - rawPrice) < 0.01) {
          const original = rawMrp || rawPrice;
          finalPrice = original * (1 - discountPct / 100);
          finalOriginalPrice = original;
        }
      }

      return {
        id: item.id,
        medicineId: item.medicineId ?? item.id,
        productId: item.productId,
        name: item.name,
        description: item.description ?? "",
        price: finalPrice,
        originalPrice:
          finalOriginalPrice && finalOriginalPrice > finalPrice
            ? finalOriginalPrice
            : undefined,
        image: { uri: item.thumbnailUrl },
        discount: discountPct > 0 ? `${discountPct}% OFF` : undefined,
        requiresPrescription: item.requiresPrescription ?? false,
        brand: item.brand?.name,
        slug: item.slug,
        category:
          typeof item.category === "string"
            ? item.category
            : (item.category?.name ?? ""),
        orderedTimes:
          item.orderedTimes ?? item.orderCount ?? item.frequency ?? 0,
        lastOrdered: item.lastOrdered ?? item.lastOrderedAt ?? undefined,
        lastQty:
          item.lastQty ?? item.lastQuantity ?? item.quantity ?? undefined,
        packSize: String(item.packSize ?? ""),
        unit: item.unit ?? "",
      };
    });
  },

  cancelOrder: async (id: string, reason: string) => {
    const response = await apiClient.post(API_ENDPOINTS.ORDER_CANCEL(id), {
      reason,
    });
    return response.data.data;
  },
};
