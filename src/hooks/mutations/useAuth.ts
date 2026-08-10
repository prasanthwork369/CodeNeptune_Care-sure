import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../../services/auth.service";

export const useAuth = () => {
  const queryClient = useQueryClient();

  // silentError: both expose `error` below and the OTP screen renders it inline,
  // so the global toast would say the same thing a second time.
  const requestOtpMutation = useMutation({
    mutationFn: (phone: string) => authService.requestOtp(phone),
    meta: { silentError: true },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      authService.verifyOtp(phone, otp),
    meta: { silentError: true },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => queryClient.clear(),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (reason?: string) => authService.deleteAccount(reason),
    onSuccess: () => queryClient.clear(),
  });

  const loading =
    requestOtpMutation.isPending ||
    verifyOtpMutation.isPending ||
    logoutMutation.isPending;
  const error =
    (requestOtpMutation.error ?? verifyOtpMutation.error)?.message ?? null;

  return {
    requestOtp: (phone: string) => requestOtpMutation.mutateAsync(phone),
    verifyOtp: (phone: string, otp: string) =>
      verifyOtpMutation.mutateAsync({ phone, otp }),
    logout: () => logoutMutation.mutateAsync(),
    deleteAccount: (reason?: string) =>
      deleteAccountMutation.mutateAsync(reason),
    deletingAccount: deleteAccountMutation.isPending,
    // Clears a lingering mutation error so a new attempt starts clean —
    // otherwise the previous "invalid OTP" error persists while the user
    // is already retyping.
    resetError: () => {
      requestOtpMutation.reset();
      verifyOtpMutation.reset();
    },
    loading,
    error,
  };
};
