import { useMutation, useQueryClient } from "@tanstack/react-query";
import { substituteApi } from "../../api/substitute.api";
import { useToastStore } from "../../store/toastStore";
import { useAuthStore } from "../../store/authStore";
import { useNav } from "../useNav";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";

export const useSubstituteRequest = () => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useNav();

  const createRequestMutation = useMutation({
    mutationFn: (medicineId: string) => substituteApi.createRequest(medicineId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.SUBSTITUTE_REQUESTS,
      });
      showToast(
        "Substitute request submitted! We will notify you once available.",
        "success"
      );
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to submit request";
      showToast(msg, "error");
    },
  });

  const requestSubstitute = (medicineId: string) => {
    if (!medicineId) {
      showToast("Invalid medicine reference", "error");
      return;
    }
    if (!isAuthenticated) {
      showToast("Please login to request a substitute", "warning");
      router.push("/(auth)/login");
      return;
    }
    createRequestMutation.mutate(medicineId);
  };

  return {
    requestSubstitute,
    isPending: createRequestMutation.isPending,
    isSuccess: createRequestMutation.isSuccess,
  };
};
