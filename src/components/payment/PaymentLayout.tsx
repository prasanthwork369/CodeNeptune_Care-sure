import { LocationBottomSheet } from "@/src/components/home/sections";
import { icons } from "@/src/constants/icons";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { usePaymentCalculations } from "@/src/hooks/usePaymentCalculations";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { ScrollView, View } from "react-native";
import {
  PaymentAddressCard,
  PaymentFooter,
  PaymentHeader,
  PaymentMethodsList,
  PaymentTotalBanner,
} from "./sections";

const PAYMENT_METHODS = [
  {
    id: "COD",
    title: "Cash on Delivery",
    subtitle: "Pay Via Cash on Delivery",
    icon: (
      <icons.account_balance_wallet width={24} height={24} fill="#0F7635" />
    ),
  },
  {
    id: "CARD",
    title: "Credit / Debit Card",
    subtitle: "Pay via Visa, Mastercard & more",
    icon: <icons.credit_card width={24} height={24} fill="#0F7635" />,
  },
];

export const PaymentLayout: React.FC = () => {
  const {
    router,
    insets,
    toPay,
    selectedMethod,
    setSelectedMethod,
    showLocationSheet,
    setShowLocationSheet,
    deliveryLabel,
    deliveryCity,
    hasAddress,
    ordering,
    handlePlaceOrder,
  } = usePaymentCalculations();
  const adjustedBottom = useAdjustedBottomInset();

  return (
    <View
      style={{ flex: 1, backgroundColor: "#F8F9FC", paddingTop: insets.top }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: exactScale(16),
          paddingBottom: adjustedBottom + exactScale(100),
        }}
      >
        <PaymentHeader onBack={() => router.back()} title="Checkout" />

        <PaymentTotalBanner toPay={toPay} />

        <PaymentAddressCard
          hasAddress={hasAddress}
          deliveryLabel={deliveryLabel}
          deliveryCity={deliveryCity}
          onPress={() => setShowLocationSheet(true)}
        />

        <PaymentMethodsList
          methods={PAYMENT_METHODS}
          selectedId={selectedMethod}
          onSelect={setSelectedMethod}
        />
      </ScrollView>

      <PaymentFooter
        onPress={handlePlaceOrder}
        loading={ordering}
        hasAddress={hasAddress}
        safeAreaBottom={adjustedBottom}
      />

      <LocationBottomSheet
        isVisible={showLocationSheet}
        onClose={() => setShowLocationSheet(false)}
      />
    </View>
  );
};
