import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../../services/cart.service';
import { AddToCartInput, UpdateCartItemInput, CheckoutInput } from '../../types/cart';
import { useAuthStore } from '../../store/authStore';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';
import { useCartPendingStore } from '@/src/store/cartStore';

export const useCart = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const guestCart = useCartPendingStore((s) => s.guestCart);
    const addGuestItem = useCartPendingStore((s) => s.addGuestItem);
    const updateGuestItem = useCartPendingStore((s) => s.updateGuestItem);
    const removeGuestItem = useCartPendingStore((s) => s.removeGuestItem);
    const clearGuestCart = useCartPendingStore((s) => s.clearGuestCart);

    const { data: cart, isLoading } = useQuery({
        queryKey: QUERY_KEYS.CUSTOMER.CART,
        queryFn: cartService.getCart,
        enabled: isAuthenticated,
        staleTime: 0,
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

    const activeCart = isAuthenticated ? cart : guestCart;
    const items = activeCart?.items ?? [];
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => {
        const mrp = parseFloat(String(item.unitPrice));
        const discountPct = item.discountPercent ?? item.metadata?.discountPercent ?? 0;
        const price = discountPct > 0 ? mrp * (1 - discountPct / 100) : mrp;
        return sum + price * item.quantity;
    }, 0);

    return {
        cart: activeCart,
        items,
        totalItems,
        totalPrice,
        isLoading: isAuthenticated ? isLoading : false,

        addItem: (input: AddToCartInput) =>
            isAuthenticated ? addItemMutation.mutateAsync(input) : Promise.resolve(addGuestItem(input)),
        updateItem: (itemId: string, input: UpdateCartItemInput) =>
            isAuthenticated
                ? updateItemMutation.mutateAsync({ itemId, input })
                : Promise.resolve(updateGuestItem(itemId, input)),
        removeItem: (itemId: string) =>
            isAuthenticated ? removeItemMutation.mutateAsync(itemId) : Promise.resolve(removeGuestItem(itemId)),
        clearCart: () => (isAuthenticated ? clearCartMutation.mutateAsync() : Promise.resolve(clearGuestCart())),
        checkout: (input: CheckoutInput) => checkoutMutation.mutateAsync(input),

        isAdding: addItemMutation.isPending,
        isUpdating: updateItemMutation.isPending,
        isRemoving: removeItemMutation.isPending,
        isCheckingOut: checkoutMutation.isPending,
    };
};
