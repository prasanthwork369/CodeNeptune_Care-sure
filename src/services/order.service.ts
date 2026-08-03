import { orderApi, type OrderListParams } from "../api/order.api";
import { CreateOrderRequest, Order } from "../types/order";

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
