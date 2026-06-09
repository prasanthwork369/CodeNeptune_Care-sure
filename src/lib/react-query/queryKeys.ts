export const QUERY_KEYS = {
    CUSTOMER: {
        PROFILE:       ['customer', 'profile'] as const,
        ADDRESSES:     ['customer', 'addresses'] as const,
        MEMBERS:       ['customer', 'members'] as const,
        CART:          ['customer', 'cart'] as const,
        COUPONS:       ['customer', 'coupons', 'active'] as const,
        PRESCRIPTIONS: {
            LIST:   (params?: any) => ['customer', 'prescriptions', 'list', params] as const,
            BY_ID:  (id: string)   => ['customer', 'prescriptions', 'detail', id] as const,
        },
        ORDERS: {
            LIST:   (params?: any) => ['customer', 'orders', 'list', params] as const,
            BY_ID:  (id: string)   => ['customer', 'orders', 'detail', id] as const,
        },
        NOTIFICATION_PREFERENCES: ['customer', 'notification-preferences'] as const,
        WALLET: {
            BALANCE: ['customer', 'wallet', 'balance'] as const,
            LOGS:    (params?: { limit?: number; offset?: number }) => ['customer', 'wallet', 'logs', params] as const,
        },
    },
    CATALOG: {
        CATEGORY_MAP:               ['catalog', 'category-map'] as const,
        CATEGORY_PRODUCTS:          (subCategoryId: string) => ['catalog', 'category-products', subCategoryId] as const,
        PRODUCT_BY_ID:              (id: string)            => ['catalog', 'product', id] as const,
        FEATURED_MEDICINES:         ['catalog', 'featured-medicines'] as const,
        FEATURED_SUBCATEGORIES:     ['catalog', 'featured-subcategories'] as const,
    },
    APP: {
        CONTENTS: ['app', 'contents'] as const,
    },
    SEARCH: {
        MEDICINES:    (query: string)                                    => ['search', 'medicines', query] as const,
        SUGGESTIONS:  (query: string)                                    => ['search', 'suggestions', query] as const,
        HISTORY:      (params?: { limit?: number; offset?: number })     => ['search', 'history', params] as const,
        TRENDING:     (limit?: number)                                   => ['search', 'trending', limit] as const,
    },
} as const;
