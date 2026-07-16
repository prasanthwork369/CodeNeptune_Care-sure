import { CreateOrderRequest, Order } from '../types/order';
import { API_ENDPOINTS } from '../utils/urls';
import { apiClient } from './client';

export const orderApi = {
    createOrder: async (data: CreateOrderRequest): Promise<Order> => {
        const response = await apiClient.post(API_ENDPOINTS.ORDERS, data);
        return response.data.data;
    },

    getOrderById: async (id: string): Promise<Order> => {
        const response = await apiClient.get(API_ENDPOINTS.ORDER_BY_ID(id));
        const data = response.data.data;
        if (__DEV__) console.log('[getOrderById] raw:', JSON.stringify(data, null, 2));
        // Normalize items — API may return orderItems or lineItems instead of items
        if (!data.items?.length) {
            data.items = data.orderItems ?? data.lineItems ?? data.items ?? [];
        }
        return data;
    },

    listOrders: async (params?: Record<string, any>): Promise<Order[]> => {
        const response = await apiClient.get(API_ENDPOINTS.ORDERS, { params });
        if (__DEV__) console.log('[listOrders] first order items:', JSON.stringify(response.data.data?.[0]?.items, null, 2));
        return response.data.data;
    },

    getFrequentlyOrdered: async (params?: { page?: number; limit?: number }) => {
        const response = await apiClient.get('/api/v1/orders/customer/frequently-ordered', { params });
        const raw: any[] = response.data.data ?? [];
        return raw.map((item) => {
            const rawPrice = parseFloat(String(item.price || 0));
            const rawMrp = item.mrp ? parseFloat(String(item.mrp)) : undefined;
            const discountPct = parseFloat(String(item.discountPercent ?? item.discountPercentage ?? 0));

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
                description: item.description ?? '',
                price: finalPrice,
                originalPrice: finalOriginalPrice && finalOriginalPrice > finalPrice ? finalOriginalPrice : undefined,
                image: { uri: item.thumbnailUrl },
                discount: discountPct > 0 ? `${discountPct}% OFF` : undefined,
                requiresPrescription: item.requiresPrescription ?? false,
                brand: item.brand?.name,
                slug: item.slug,
                category: item.category?.name ?? item.category ?? '',
                orderedTimes: item.orderedTimes ?? item.orderCount ?? item.frequency ?? 0,
                lastOrdered: item.lastOrdered ?? item.lastOrderedAt ?? undefined,
                packSize: String(item.packSize ?? ''),
                unit: item.unit ?? '',
            };
        });
    },

    cancelOrder: async (id: string, reason: string) => {
        const response = await apiClient.post(API_ENDPOINTS.ORDER_CANCEL(id), { reason });
        return response.data.data;
    },
};
