import { PRESCRIPTION_CATEGORY } from "@/src/constants/prescription-category";
import { PRESCRIPTION_STATUS } from "@/src/constants/prescription-status";
import { usePrescriptions } from "@/src/hooks/queries/usePrescriptions";
import { useAuthStore } from "@/src/store/authStore";
import { usePrescriptionBannerStore } from "@/src/store/prescriptionBannerStore";
import { useUIStore } from "@/src/store/uiStore";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

export const usePrescriptionBanner = () => {
  const { isAuthenticated } = useAuthStore();
  const [isFocusRefetching, setIsFocusRefetching] = useState(false);
  const {
    hasJustUploadedPrescription,
    setHasJustUploadedPrescription,
    isRxFromCartFlow,
  } = useUIStore();
  const {
    markRejectedBannerSeen,
    isRejectedBannerSeen,
    isVerifiedBannerCompleted,
  } = usePrescriptionBannerStore();

  // Ref so the callback can read the latest value without being a dep
  const hasJustUploadedRef = useRef(hasJustUploadedPrescription);
  hasJustUploadedRef.current = hasJustUploadedPrescription;

  const { prescriptions, loading, refetch } = usePrescriptions(
    isAuthenticated
      ? {
          limit: 1,
          sortOrder: "desc",
          refetchInterval: 3000,
          category: PRESCRIPTION_CATEGORY.ORDER,
        }
      : {},
  );
  const latestPrescription = prescriptions[0] ?? null;
  const prescriptionId: string | null = latestPrescription?.id ?? null;
  const status: number | null = latestPrescription?.status ?? null;

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        setIsFocusRefetching(true);
        refetch().finally(() => {
          setIsFocusRefetching(false);
          if (hasJustUploadedRef.current) {
            setHasJustUploadedPrescription(false);
          }
        });
      }
    }, [isAuthenticated]),
  );

  const isRejected = status === PRESCRIPTION_STATUS.CANCELLED;
  const isVerified = status === PRESCRIPTION_STATUS.APPROVED;
  const isUnderReview = status === PRESCRIPTION_STATUS.NEW;

  const rejectedBannerSeen =
    !!prescriptionId && status !== null && isRejectedBannerSeen(prescriptionId, status);
  const verifiedBannerCompleted =
    !!prescriptionId && isVerifiedBannerCompleted(prescriptionId);

  const baseVisible =
    isAuthenticated &&
    !!latestPrescription &&
    !isFocusRefetching &&
    !hasJustUploadedPrescription &&
    !isRxFromCartFlow;

  // Rejected: stays visible until the user taps it (marks it viewed)
  const showRejectedBanner = baseVisible && isRejected && !rejectedBannerSeen;

  // Verified: stays visible across the whole app — browsing, adding items
  // from Home/Search/PDP/etc. NEVER hides it. It is hidden ONLY via
  // `markVerifiedBannerCompleted`, fired exclusively from the first
  // successful "Add to Cart" on the MedicineComparisonLayout screen.
  const showVerifiedBanner = baseVisible && isVerified && !verifiedBannerCompleted;

  // Under Review: stays visible while the prescription is being reviewed
  const showUnderReviewBanner = baseVisible && isUnderReview;

  const hasPendingPrescription =
    showRejectedBanner || showVerifiedBanner || showUnderReviewBanner;

  const acknowledgeRejectedBanner = () => {
    if (prescriptionId && status !== null) {
      markRejectedBannerSeen(prescriptionId, status);
    }
  };

  return {
    latestPrescription,
    hasPendingPrescription,
    showRejectedBanner,
    showVerifiedBanner,
    showUnderReviewBanner,
    acknowledgeRejectedBanner,
    isLoading: isAuthenticated && loading,
    isRefetching: isAuthenticated && isFocusRefetching,
  };
};
