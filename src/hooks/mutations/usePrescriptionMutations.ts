import { useMutation, useQueryClient } from "@tanstack/react-query";
import { prescriptionService } from "@/src/features/prescription/services/prescription.service";

type PrescriptionsListResult =
  | { success: true; data: { id: string; isDismissed: boolean }[] }
  | { success: false; error: string };

const PRESCRIPTIONS_LIST_KEY = ["customer", "prescriptions", "list"];

export const useDismissPrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await prescriptionService.dismiss(id);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },

    // Optimistic update — flips isDismissed in every cached prescriptions
    // list immediately, so the banner disappears the instant the user
    // taps close instead of waiting on the network round-trip.
    onMutate: async (id: string) => {
      const previous = queryClient.getQueriesData<PrescriptionsListResult>({
        queryKey: PRESCRIPTIONS_LIST_KEY,
      });

      queryClient.setQueriesData<PrescriptionsListResult>(
        { queryKey: PRESCRIPTIONS_LIST_KEY },
        (old) => {
          if (!old?.success) return old;
          return {
            ...old,
            data: old.data.map((p) =>
              p.id === id ? { ...p, isDismissed: true } : p,
            ),
          };
        },
      );

      return { previous };
    },

    // Roll back to the pre-dismiss snapshot if the API call fails.
    onError: (_err, _id, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },

    // Reconcile with server truth either way.
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["customer", "prescriptions"],
      });
    },
  });
};
