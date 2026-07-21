import { LocationBottomSheet } from "@/src/components/home/sections";
import { icons } from "@/src/constants/icons";
import { useCreateOrder } from "@/src/hooks/mutations/useCreateOrder";
import { useDeliveryAddress } from "@/src/hooks/useDeliveryAddress";
import { useCart } from "@/src/hooks/queries/useCart";
import { useCheckoutStore } from "@/src/store/checkoutStore";
import { useCouponStore } from "@/src/store/couponStore";
import { buildOrderPayload } from "@/src/utils/order";
import { orderErrorMessage } from "@/src/utils/orderError";
import { reportError } from "@/src/services/firebase";
import ArrowForwardIosWhite from "@/assets/icons/arrow_forward_ios_white.svg";
import { LinearGradient } from "expo-linear-gradient";
import { useNav } from "@/src/hooks/useNav";
import { useLocalSearchParams } from "expo-router";
import { Touchable } from "@/src/components/ui/Touchable";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { moderateScale } from "@/src/utils/exactScale";

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

const RadioDot = ({ selected }: { selected: boolean }) => (
  <View
    style={{
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: selected ? "#0F7635" : "#E5E7EB",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
    }}
  >
    {selected && (
      <LinearGradient
        colors={["#0F7635", "#22C55E"]}
        style={{ width: 12, height: 12, borderRadius: 6 }}
      />
    )}
  </View>
);

export const PaymentLayout: React.FC = () => {
  const router = useNav();
  const insets = useSafeAreaInsets();
  const adjustedBottom = useAdjustedBottomInset();
  const {
    toPay = "0",
    patientMemberId = "",
    prescriptionId = "",
    problem = "",
    symptoms = "",
    patientPhone = "",
  } = useLocalSearchParams<{
    toPay: string;
    patientMemberId?: string;
    prescriptionId?: string;
    problem?: string;
    symptoms?: string;
    patientPhone?: string;
  }>();

  const { bill, walletUsed, coinsUsed, corporateCreditsUsed, couponCode, clear: clearCheckout } = useCheckoutStore();
  const removeCoupon = useCouponStore((s) => s.remove);
  const [selected, setSelected] = useState("COD");
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  // Resolved once, shared by the header text and the order payload below, so
  // the address on screen is always the address the order ships to.
  const { address: defaultAddress, displayLocation } = useDeliveryAddress();
  const { items: cartItems } = useCart();
  const { createOrder, loading: ordering } = useCreateOrder();
  const deliveryLabel = displayLocation?.label ?? defaultAddress?.label ?? null;
  const deliveryCity = displayLocation?.city ?? null;
  const hasAddress = !!deliveryCity && !!defaultAddress;

  const handlePlaceOrder = async () => {
    if (!hasAddress || !defaultAddress) {
      setShowLocationSheet(true);
      return;
    }
    const payload = buildOrderPayload({
      cartItems,
      address: defaultAddress,
      bill,
      toPay,
      walletUsed,
      coinsUsed,
      corporateCreditsUsed,
      couponCode,
      patientMemberId,
      prescriptionId,
      problem,
      symptoms,
      patientPhone,
    });
    try {
      const order: any = await createOrder(payload);
      removeCoupon();
      clearCheckout();
      router.replace({
        pathname: "/(stack)/order-success",
        params: { orderId: order?.id ?? "", total: toPay },
      });
    } catch (err: any) {
      if (__DEV__) {
        console.log("[PlaceOrder] payload:", JSON.stringify(payload, null, 2));
        console.log("[PlaceOrder] error:", JSON.stringify(err?.data ?? err?.response?.data ?? err, null, 2));
      }
      reportError(err, "placeOrder:prescription");
      Alert.alert("Order Failed", orderErrorMessage(err));
    }
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#F8F9FC", paddingTop: insets.top }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: adjustedBottom + 100,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <Touchable
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#919EAB33",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <icons.arrow_back width={20} height={20} fill="#1A1C1E" />
          </Touchable>
          <Text
            style={{
              fontSize: moderateScale(18),
              fontWeight: "700",
              color: "#1A1C1E",
            }}
          >
            Checkout
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <LinearGradient
          colors={["#0F7635", "#16A34A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24,
            padding: 24,
            marginBottom: 24,
            shadowColor: "#0F7635",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          <Text
            style={{
              fontSize: moderateScale(14),
              fontWeight: "500",
              color: "rgba(255,255,255,0.8)",
              letterSpacing: 0.5,
            }}
          >
            Total Amount to Pay
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontSize: moderateScale(24),
                fontWeight: "700",
                color: "#fff",
                marginRight: 4,
              }}
            >
              ₹
            </Text>
            <Text
              style={{
                fontSize: moderateScale(42),
                fontWeight: "800",
                color: "#fff",
              }}
            >
              {Number(toPay).toFixed(2)}
            </Text>
          </View>
          <View
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: "rgba(255,255,255,0.15)",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <icons.verified_user width={16} height={16} fill="#fff" />
            <Text
              style={{
                fontSize: moderateScale(12),
                fontWeight: "600",
                color: "#fff",
                marginLeft: 8,
              }}
            >
              Safe & Secure Transaction
            </Text>
          </View>
        </LinearGradient>

        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: moderateScale(16),
              fontWeight: "700",
              color: "#1A1C1E",
              marginBottom: 12,
              marginLeft: 4,
            }}
          >
            Delivery Address
          </Text>
          <Touchable
            activeOpacity={0.85}
            onPress={() => setShowLocationSheet(true)}
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: hasAddress ? 0 : 1.5,
              borderColor: "#FCA5A5",
              shadowColor: "#919EAB33",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: hasAddress ? "#F0FDF4" : "#FEF2F2",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <icons.location_on
                width={24}
                height={24}
                fill={hasAddress ? "#0F7635" : "#EF4444"}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text
                style={{
                  fontSize: moderateScale(14),
                  fontWeight: "700",
                  color: "#1A1C1E",
                }}
              >
                {hasAddress
                  ? (deliveryLabel ?? "Default Address")
                  : "No Address Selected"}
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(13),
                  fontWeight: "500",
                  color: "#6B7280",
                  marginTop: 4,
                }}
                numberOfLines={1}
              >
                {hasAddress
                  ? deliveryCity!
                  : "Please select a delivery location"}
              </Text>
            </View>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#F3F4F6",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <icons.arrow_forward_ios width={12} height={12} fill="#9CA3AF" />
            </View>
          </Touchable>
        </View>

        <View>
          <Text
            style={{
              fontSize: moderateScale(16),
              fontWeight: "700",
              color: "#1A1C1E",
              marginBottom: 12,
              marginLeft: 4,
            }}
          >
            Payment Method
          </Text>
          <View style={{ gap: 12 }}>
            {PAYMENT_METHODS.map((method) => (
              <Touchable
                key={method.id}
                activeOpacity={0.85}
                onPress={() => setSelected(method.id)}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: selected === method.id ? 2 : 0,
                  borderColor: "#0F7635",
                  shadowColor: "#919EAB33",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.04,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor: "#F0FDF4",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {method.icon}
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text
                    style={{
                      fontSize: moderateScale(15),
                      fontWeight: "700",
                      color: "#1A1C1E",
                    }}
                  >
                    {method.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(12),
                      fontWeight: "500",
                      color: "#6B7280",
                      marginTop: 4,
                    }}
                  >
                    {method.subtitle}
                  </Text>
                </View>
                <RadioDot selected={selected === method.id} />
              </Touchable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 20,
          paddingBottom: adjustedBottom + 10,
          backgroundColor: "#fff",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          shadowColor: "#919EAB33",
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.05,
          shadowRadius: 20,
          elevation: 20,
        }}
      >
        <Touchable
          activeOpacity={0.88}
          onPress={handlePlaceOrder}
          disabled={ordering}
          style={{ borderRadius: 20, overflow: "hidden" }}
        >
          <LinearGradient
            colors={["#0F7635", "#16A34A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingVertical: 18,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {ordering ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text
                  style={{
                    fontSize: moderateScale(17),
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  {hasAddress ? "Confirm Order" : "Set Delivery Address"}
                </Text>
                <ArrowForwardIosWhite
                  width={14}
                  height={14}
                />
              </>
            )}
          </LinearGradient>
        </Touchable>
      </View>

      <LocationBottomSheet
        isVisible={showLocationSheet}
        onClose={() => setShowLocationSheet(false)}
      />
    </View>
  );
};
