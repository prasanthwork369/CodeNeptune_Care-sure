import { orderApi } from '../api/order.api';
import { CreateOrderRequest, Order } from '../types/order';

export const orderService = {
    createOrder: (data: CreateOrderRequest): Promise<Order> => orderApi.createOrder(data),
    getOrderById: (id: string): Promise<Order> => orderApi.getOrderById(id),
    listOrders: (params?: Record<string, any>): Promise<Order[]> => orderApi.listOrders(params),
    listCustomerOrders: (params?: Record<string, any>): Promise<Order[]> => orderApi.listOrders(params),
    getFrequentlyOrdered: (params?: { page?: number; limit?: number }) => orderApi.getFrequentlyOrdered(params),
};
