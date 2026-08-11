import { AppButton } from "@/src/components/ui/AppButton";
import { StickyFooter } from "@/src/components/ui/StickyFooter";
import ArrowForwardIosWhite from "@/assets/icons/arrow_forward_ios_white.svg";
import { PaymentFooterProps } from "@/src/types/payment";
import React from "react";

export const PaymentFooter: React.FC<PaymentFooterProps> = ({
  onPress,
  loading,
  hasAddress,
  safeAreaBottom,
}) => {
  return (
    <StickyFooter
      safeAreaBottom={safeAreaBottom}
      style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
    >
      <AppButton
        title={hasAddress ? "Confirm Order" : "Set Delivery Address"}
        onPress={onPress}
        loading={loading}
        disabled={loading}
        rightIcon={<ArrowForwardIosWhite width={14} height={14} />}
      />
    </StickyFooter>
  );
};
