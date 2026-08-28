import { LocationBottomSheet } from "@/src/components/location/LocationBottomSheet";
import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useLiveScreenState } from "@/src/hooks/ui/useLiveScreenState";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { ScrollView, View } from "react-native";
import { PAYMENT_METHODS } from "../constants/checkout.constants";
import { usePaymentCalculations } from "../hooks/usePaymentCalculations";
import { styles as s } from "./PaymentLayout.styles";
import {
  PaymentAddressCard,
  PaymentFooter,
  PaymentHeader,
  PaymentMethodsList,
  PaymentTotalBanner,
} from "../sections";

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

  const liveState = useLiveScreenState({ error: null, hasData: true });

  if (liveState === "offline") {
    return (
      <View style={[s.root, { paddingTop: insets.top }]}>
        <PaymentHeader onBack={() => router.back()} title="Checkout" />
        <NoInternetState onRetry={() => void refetchCart()} />
      </View>
    );
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="auto"
        contentContainerStyle={[
          s.scrollContent,
          { paddingBottom: adjustedBottom + exactScale(100) },
        ]}
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
