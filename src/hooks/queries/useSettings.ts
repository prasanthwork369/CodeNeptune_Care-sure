import { useQuery } from '@tanstack/react-query';
import { settingsService } from '../../services/settings.service';

export function useMobileAppLinks() {
    return useQuery({
        queryKey: ['mobile-app-links'],
        queryFn: () => settingsService.getMobileAppLinks(),
        staleTime: 24 * 60 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
    });
}

export function useCartWalletSettings() {
    return useQuery({
        queryKey: ['cart-wallet-settings'],
        queryFn: () => settingsService.getCartWalletSettings(),
        staleTime: 5 * 60 * 1000, // Caches for 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

export function useSettings() {
    return useQuery({
        queryKey: ['platform-settings'],
        queryFn: () => settingsService.getSettings(),
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        retry: 2,
        refetchOnWindowFocus: false,
    });
}
