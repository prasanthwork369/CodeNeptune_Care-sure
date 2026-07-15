import { Skeleton } from "@/src/components/ui/Skeleton";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { View } from "react-native";

// Placeholder shown while coupons load and their availability is pre-validated,
// so cards never appear active and then flip to faded.
export const CouponCardSkeleton: React.FC = () => (
  <View style={{ marginBottom: exactScale(16) }}>
    <Skeleton width="100%" height={exactScale(150)} borderRadius={exactScale(16)} />
  </View>
);
