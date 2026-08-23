import { LocationBottomSheet } from "@/src/components/location/LocationBottomSheet";
import { icons } from "@/src/constants/icons";
import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useLiveScreenState } from "@/src/hooks/ui/useLiveScreenState";
import { usePaymentCalculations } from "../hooks/usePaymentCalculations";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { ScrollView, View } from "react-native";
import {
  PaymentAddressCard,
  PaymentFooter,
  PaymentHeader,
  PaymentMethodsList,
  PaymentTotalBanner,
} from "../sections";

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
    refetchCart,
  } = usePaymentCalculations();
  const adjustedBottom = useAdjustedBottomInset();

  // Checkout is the most transactional screen there is: the total, the address
  // and the payment methods below all exist to be committed. The bill itself is
  // local, so there is no failed query to classify — being offline is the whole
  // condition, and placing an order is separately gated in handlePlaceOrder.
  const liveState = useLiveScreenState({ error: null, hasData: true });

  if (liveState === "offline") {
    return (
      <View
        style={{ flex: 1, backgroundColor: "#F8F9FC", paddingTop: insets.top }}
      >
        <PaymentHeader onBack={() => router.back()} title="Checkout" />
        <NoInternetState onRetry={() => void refetchCart()} />
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: "#F8F9FC", paddingTop: insets.top }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="auto"
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
