import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../../services/cart.service';
import { AddToCartInput, UpdateCartItemInput, CheckoutInput } from '../../types/cart';
import { useAuthStore } from '../../store/authStore';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';

export const useCart = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { data: cart, isLoading } = useQuery({
        queryKey: QUERY_KEYS.CUSTOMER.CART,
        queryFn: cartService.getCart,
        enabled: isAuthenticated,
        staleTime: 0,
        refetchInterval: 15_000,
        refetchIntervalInBackground: false,
    });

    const addItemMutation = useMutation({
        mutationFn: (input: AddToCartInput) => cartService.addItem(input),
        onSuccess: (updatedCart) => queryClient.setQueryData(QUERY_KEYS.CUSTOMER.CART, updatedCart),
    });

    const updateItemMutation = useMutation({
        mutationFn: ({ itemId, input }: { itemId: string; input: UpdateCartItemInput }) =>
            cartService.updateItem(itemId, input),
        onSuccess: (updatedCart) => queryClient.setQueryData(QUERY_KEYS.CUSTOMER.CART, updatedCart),
    });

    const removeItemMutation = useMutation({
        mutationFn: (itemId: string) => cartService.removeItem(itemId),
        onSuccess: (updatedCart) => queryClient.setQueryData(QUERY_KEYS.CUSTOMER.CART, updatedCart),
    });

    const clearCartMutation = useMutation({
        mutationFn: cartService.clearCart,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.CART }),
    });

    const checkoutMutation = useMutation({
        mutationFn: (input: CheckoutInput) => cartService.checkout(input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.CART }),
    });

    const items = cart?.items ?? [];
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => {
        const mrp = parseFloat(String(item.unitPrice));
        const discountPct = item.discountPercent ?? item.metadata?.discountPercent ?? 0;
        const price = discountPct > 0 ? mrp * (1 - discountPct / 100) : mrp;
        return sum + price * item.quantity;
    }, 0);

    return {
        cart,
        items,
        totalItems,
        totalPrice,
        isLoading,

        addItem: (input: AddToCartInput) => addItemMutation.mutateAsync(input),
        updateItem: (itemId: string, input: UpdateCartItemInput) => updateItemMutation.mutateAsync({ itemId, input }),
        removeItem: (itemId: string) => removeItemMutation.mutateAsync(itemId),
        clearCart: () => clearCartMutation.mutateAsync(),
        checkout: (input: CheckoutInput) => checkoutMutation.mutateAsync(input),

        isAdding: addItemMutation.isPending,
        isUpdating: updateItemMutation.isPending,
        isRemoving: removeItemMutation.isPending,
        isCheckingOut: checkoutMutation.isPending,
    };
};
