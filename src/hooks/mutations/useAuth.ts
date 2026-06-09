import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/auth.service';

export const useAuth = () => {
    const queryClient = useQueryClient();

    const requestOtpMutation = useMutation({
        mutationFn: (phone: string) => authService.requestOtp(phone),
    });

    const verifyOtpMutation = useMutation({
        mutationFn: ({ phone, otp }: { phone: string; otp: string }) => authService.verifyOtp(phone, otp),
    });

    const logoutMutation = useMutation({
        mutationFn: authService.logout,
        onSuccess: () => queryClient.clear(),
    });

    const loading = requestOtpMutation.isPending || verifyOtpMutation.isPending || logoutMutation.isPending;
    const error = (requestOtpMutation.error ?? verifyOtpMutation.error)?.message ?? null;

    return {
        requestOtp: (phone: string) => requestOtpMutation.mutateAsync(phone),
        verifyOtp: (phone: string, otp: string) => verifyOtpMutation.mutateAsync({ phone, otp }),
        logout: () => logoutMutation.mutateAsync(),
        loading,
        error,
    };
};
