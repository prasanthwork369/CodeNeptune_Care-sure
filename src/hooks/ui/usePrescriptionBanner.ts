import { PRESCRIPTION_CATEGORY } from "@/src/constants/prescription-category";
import { PRESCRIPTION_STATUS } from "@/src/constants/prescription-status";
import { useDismissPrescription } from "@/src/hooks/mutations/usePrescriptionMutations";
import { usePrescriptions } from "@/src/hooks/queries/usePrescriptions";
import { ApiPrescription } from "@/src/types/prescription";
import { useAuthStore } from "@/src/store/authStore";
import { useUIStore } from "@/src/store/uiStore";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

const RECENT_PRESCRIPTIONS_LIMIT = 1;

/**
 * A prescription still has something to show the user:
 * - NEW: always actionable while under review.
 * - CANCELLED (rejected): actionable until the server marks it dismissed.
 * - APPROVED (verified): actionable until the server marks it purchased.
 * Both `isDismissed` and `isPurchased` are read-only, server-computed
 * fields — there is no client mutation for them. The banner is a pure
 * reflection of API state, refreshed via polling/focus-refetch.
 */
const isActionable = (p: ApiPrescription): boolean => {
  if (p.status === PRESCRIPTION_STATUS.NEW) return true;
  if (p.status === PRESCRIPTION_STATUS.CANCELLED) return !p.isDismissed;
  if (p.status === PRESCRIPTION_STATUS.APPROVED) return !p.isPurchased;
  return false;
};

export const usePrescriptionBanner = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isFocusRefetching, setIsFocusRefetching] = useState(false);
  const {
    hasJustUploadedPrescription,
    setHasJustUploadedPrescription,
    isRxFromCartFlow,
  } = useUIStore();

  // Ref so the callback can read the latest value without being a dep
  const hasJustUploadedRef = useRef(hasJustUploadedPrescription);
  hasJustUploadedRef.current = hasJustUploadedPrescription;

  const { mutate: dismissPrescription } = useDismissPrescription();

  const { prescriptions, loading, refetch } = usePrescriptions(
    isAuthenticated
      ? {
          limit: RECENT_PRESCRIPTIONS_LIMIT,
          sortOrder: "desc",
          refetchInterval: 3000,
          category: PRESCRIPTION_CATEGORY.ORDER,
        }
      : {},
  );

  // Most recent prescription that still has a pending banner to show —
  // not necessarily prescriptions[0], since the latest one may already be
  // dismissed/purchased while an older one still needs attention.
  const latestPrescription = prescriptions.find(isActionable) ?? null;
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

  const baseVisible =
    isAuthenticated &&
    !!latestPrescription &&
    !isFocusRefetching &&
    !hasJustUploadedPrescription &&
    !isRxFromCartFlow;

  const isDismissed = !!latestPrescription?.isDismissed;

  // Rejected: visible only while isDismissed === false (server-controlled).
  const showRejectedBanner = baseVisible && isRejected && !isDismissed;

  // Verified: visible only while isPurchased === false (server-controlled).
  // Browsing, adding items from Home/Search/PDP/etc. never hides it locally
  // — only the backend flipping isPurchased (on order placement) does.
  const showVerifiedBanner = baseVisible && isVerified && !latestPrescription?.isPurchased;

  // Under Review: stays visible while the prescription is being reviewed.
  const showUnderReviewBanner = baseVisible && isUnderReview;

  const hasPendingPrescription =
    showRejectedBanner || showVerifiedBanner || showUnderReviewBanner;

  // Closing the banner (X icon) sets isDismissed=true server-side. This is
  // the only client-triggered mutation for prescription banner state —
  // isPurchased is still set exclusively by the backend on order placement.
  const dismissBanner = () => {
    if (latestPrescription) {
      if (__DEV__) console.log("Dismissing prescription banner for", latestPrescription.id);
      dismissPrescription(latestPrescription.id);
    }
  };

  return {
    latestPrescription,
    hasPendingPrescription,
    showRejectedBanner,
    showVerifiedBanner,
    showUnderReviewBanner,
    dismissBanner,
    isLoading: isAuthenticated && loading,
    isRefetching: isAuthenticated && isFocusRefetching,
  };
};
