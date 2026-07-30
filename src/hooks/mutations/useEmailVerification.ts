import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../../api/profile.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";

/**
 * Drives the two-step email verification flow:
 *   1. requestVerify(email) — backend emails a 6-digit OTP.
 *   2. verify(otp)          — confirms it; on success the profile is refreshed
 *                             so the verified email/status shows immediately.
 *
 * UI (OTP boxes, modal) lives in EmailVerifyModal; this hook only talks to the API.
 */
export const useEmailVerification = () => {
  const queryClient = useQueryClient();

  const requestMutation = useMutation({
    mutationFn: (email: string) => profileApi.requestEmailVerify(email),
  });

  const verifyMutation = useMutation({
    mutationFn: (otp: string) => profileApi.verifyEmail(otp),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.PROFILE }),
  });

  return {
    requestVerify: (email: string) => requestMutation.mutateAsync(email),
    verify: (otp: string) => verifyMutation.mutateAsync(otp),
    requesting: requestMutation.isPending,
    verifying: verifyMutation.isPending,
    verifyError: verifyMutation.error?.message ?? null,
    resetVerifyError: verifyMutation.reset,
  };
};
