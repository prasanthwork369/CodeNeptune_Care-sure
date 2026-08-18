import { orderApi } from "../features/orders/api/order.api";
import type { OrderListParams } from "../features/orders/types";
import { CreateOrderRequest, Order } from "@/src/features/orders/types";

export const orderService = {
  createOrder: (
    data: CreateOrderRequest,
    idempotencyKey?: string,
  ): Promise<Order> => orderApi.createOrder(data, idempotencyKey),
  getOrderById: (id: string): Promise<Order> => orderApi.getOrderById(id),
  listOrders: (params?: OrderListParams): Promise<Order[]> =>
    orderApi.listOrders(params),
  getFrequentlyOrdered: (params?: { page?: number; limit?: number }) =>
    orderApi.getFrequentlyOrdered(params),
};
