import { orderApi } from '../api/order.api';
import { CreateOrderRequest, Order } from '../types/order';

interface OrderListParams {
    page?: number;
    limit?: number;
    status?: string;
    sortOrder?: 'asc' | 'desc';
}

export const orderService = {
    createOrder: (data: CreateOrderRequest, idempotencyKey?: string): Promise<Order> => orderApi.createOrder(data, idempotencyKey),
    getOrderById: (id: string): Promise<Order> => orderApi.getOrderById(id),
    listOrders: (params?: OrderListParams): Promise<Order[]> => orderApi.listOrders(params),
    getFrequentlyOrdered: (params?: { page?: number; limit?: number }) => orderApi.getFrequentlyOrdered(params),
};
