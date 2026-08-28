import { AppButton } from "@/src/components/ui/AppButton";
import { StickyFooter } from "@/src/components/ui/StickyFooter";
import ArrowForwardIosWhite from "@/assets/icons/arrow_forward_ios_white.svg";
import type { PaymentFooterProps } from "../types";
import React from "react";
import { styles as s } from "./PaymentFooter.styles";

export const PaymentFooter: React.FC<PaymentFooterProps> = ({
  onPress,
  loading,
  hasAddress,
  safeAreaBottom,
}) => {
  return (
    <StickyFooter
      safeAreaBottom={safeAreaBottom}
      style={s.footer}
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
