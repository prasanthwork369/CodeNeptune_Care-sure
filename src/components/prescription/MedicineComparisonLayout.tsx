import { BillDetailsSheet } from "@/src/components/cart/BillDetailsSheet";
import { CartBillSummary } from "@/src/components/cart/sections/CartBillSummary";
import { CartCoinsSection } from "@/src/components/cart/sections/CartCoinsSection";
import { CartCouponSection } from "@/src/components/cart/sections/CartCouponSection";
import { CartDeliveringTo } from "@/src/components/cart/sections/CartDeliveringTo";
import { CartFooter } from "@/src/components/cart/sections/CartFooter";
import { CartSavingsBreakdown } from "@/src/components/cart/sections/CartSavingsBreakdown";
import { CartTerms } from "@/src/components/cart/sections/CartTerms";
import { CartWalletSection } from "@/src/components/cart/sections/CartWalletSection";
import { LocationBottomSheet } from "@/src/components/home/sections/LocationBottomSheet";
import { CustomSwitch } from "@/src/components/ui/CustomSwitch";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { useAddress } from "@/src/hooks/queries/useAddress";
import { useCart } from "@/src/hooks/queries/useCart";
import { useCartWalletSettings } from "@/src/hooks/queries/useSettings";
import { useWalletBalance } from "@/src/hooks/queries/useWallet";
import { useNav } from "@/src/hooks/useNav";
import { useCouponStore } from "@/src/store/couponStore";
import { useLocationStore } from "@/src/store/locationStore";
import { usePrescriptionBannerStore } from "@/src/store/prescriptionBannerStore";
import { usePrescriptionOrderStore } from "@/src/store/prescriptionOrderStore";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Image,
    ScrollView,
    Text,
    View,
    useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ComparisonMedicine {
  id: string;
  saltComposition: string;
  prescribed: {
    name: string;
    manufacturer: string;
    packSize: string;
    image: any;
    mrp: number;
  };
  recommended: {
    id: string;
    productId?: string;
    slug: string;
    name: string;
    manufacturer: string;
    packSize: string;
    image: any;
    price: number;
    mrp: number;
    discountPercent: number;
  };
  quantity?: number;
}

interface MedicineComparisonLayoutProps {
  medicines: ComparisonMedicine[];
  prescriptionId?: string;
}

// ─── Savings Banner ───────────────────────────────────────────────────────────

const SavingsBanner: React.FC<{ amount: number }> = ({ amount }) => (
  <LinearGradient
    colors={["#D0EBFE", "#D7FFEA"]}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
    }}
  >
    <Image
      source={HOME_IMAGES.discountTag}
      style={{ width: 32, height: 32 }}
      resizeMode="contain"
    />
    <Text
      style={{ fontSize: 14, fontFamily: "Inter-SemiBold", color: "#0A0A0A" }}
    >
      {"You saved  "}
      <Text style={{ fontFamily: "Inter-ExtraBold" }}>
        ₹{Number(amount).toFixed(0)}
      </Text>
      {" on this Order"}
    </Text>
  </LinearGradient>
);

// ─── Refill Reminder ──────────────────────────────────────────────────────────

const RefillReminder: React.FC<{
  value: boolean;
  onToggle: (v: boolean) => void;
}> = ({ value, onToggle }) => (
  <View
    style={{
      marginHorizontal: 16,
      marginTop: 12,
      backgroundColor: "#fff",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#919EAB33",
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: value ? 10 : 14,
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Image
        source={HOME_IMAGES.clockIcon}
        style={{ width: 36, height: 36 }}
        resizeMode="contain"
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{ fontSize: 14, fontFamily: "Inter-Bold", color: "#111827" }}
        >
          Refill Reminder
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontFamily: "Inter-Medium",
            color: "#6B7280",
            marginTop: 2,
          }}
        >
          Never miss your medicines
        </Text>
      </View>
      <CustomSwitch value={value} onValueChange={onToggle} />
    </View>
    {value && (
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Inter-Medium",
          color: "#6B7280",
          marginTop: 10,
        }}
      >
        We'll send your reminder in 7 days
      </Text>
    )}
  </View>
);

// ─── Comparison Card ──────────────────────────────────────────────────────────

interface ComparisonCardProps {
  item: ComparisonMedicine;
  cardWidth: number;
  count: number;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({
  item,
  cardWidth,
  count,
}) => {
  const colWidth = cardWidth / 2;

  return (
    <View
      style={{
        width: cardWidth,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        overflow: "hidden",
        marginBottom: 16,
        backgroundColor: "#fff",
      }}
    >
      {/* Salt badge */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          paddingTop: 12,
          paddingBottom: 6,
          gap: 6,
        }}
      >
        <icons.info_outline width={13} height={13} fill="#6B7280" />
        <Text
          style={{
            fontSize: 11,
            fontFamily: "Inter-Medium",
            color: "#6B7280",
            letterSpacing: 0.4,
          }}
        >
          SAME SALT COMPOSITION IN BOTH
        </Text>
      </View>
      <Text
        style={{
          fontSize: 13,
          fontFamily: "Inter-SemiBold",
          color: "#111827",
          paddingHorizontal: 14,
          paddingBottom: 12,
        }}
      >
        {item.saltComposition}
      </Text>

      {/* Two-column body */}
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        }}
      >
        {/* Left — Prescribed */}
        <View
          style={{
            width: colWidth,
            padding: 12,
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#fff",
          }}
        >
          <View>
            <View
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                width: 76,
                height: 76,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
                backgroundColor: "#F9FAFB",
                alignSelf: "flex-start",
                overflow: "hidden",
              }}
            >
              {item.prescribed.image ? (
                <Image
                  source={item.prescribed.image}
                  style={{ width: "80%", height: "80%" }}
                  resizeMode="contain"
                />
              ) : (
                <icons.placeholder width="70%" height="70%" />
              )}
            </View>
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Inter-Bold",
                color: "#111827",
                lineHeight: 20,
                marginBottom: 4,
                marginTop: 8,
              }}
              numberOfLines={2}
            >
              {item.prescribed.name}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter-Medium",
                color: "#6B7280",
                marginBottom: 2,
              }}
              numberOfLines={1}
            >
              {item.prescribed.manufacturer}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter-Regular",
                color: "#6B7280",
              }}
              numberOfLines={1}
            >
              {item.prescribed.packSize}
            </Text>
          </View>
          <View style={{ marginTop: 12 }}>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter-Medium",
                color: "#6B7280",
                marginBottom: 2,
              }}
            >
              MRP
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter-ExtraBold",
                color: "#111827",
              }}
            >
              ₹{Number(item.prescribed.mrp).toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Right — Recommended */}
        <LinearGradient
          colors={["#F0FCE1", "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            width: colWidth,
            padding: 12,
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          {item.recommended.discountPercent > 0 && (
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 12,
                width: 38,
                height: 42,
                zIndex: 10,
              }}
            >
              <Image
                source={HOME_IMAGES.couponRibbon}
                style={{ width: 38, height: 42 }}
                resizeMode="stretch"
              />
              <View
                style={{
                  position: "absolute",
                  top: 2,
                  left: 0,
                  right: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Inter-Bold",
                    color: "#fff",
                    textAlign: "center",
                    lineHeight: 12,
                  }}
                >
                  {item.recommended.discountPercent}%
                </Text>
                <Text
                  style={{
                    fontSize: 8,
                    fontFamily: "Inter-Bold",
                    color: "#fff",
                    textAlign: "center",
                    lineHeight: 9,
                    marginTop: 1,
                  }}
                >
                  OFF
                </Text>
              </View>
            </View>
          )}

          <View>
            {/* Image box — left-aligned square box */}
            <View
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#D3ECB0",
                width: 76,
                height: 76,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FFFFFF",
                alignSelf: "flex-start",
                overflow: "hidden",
                marginBottom: 10,
              }}
            >
              {item.recommended.image ? (
                <Image
                  source={item.recommended.image}
                  style={{ width: "80%", height: "80%" }}
                  resizeMode="contain"
                />
              ) : (
                <icons.placeholder width="70%" height="70%" />
              )}
            </View>
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Inter-Bold",
                color: "#111827",
                lineHeight: 20,
                marginBottom: 4,
                marginTop: 8,
              }}
              numberOfLines={2}
            >
              {item.recommended.name}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter-Medium",
                color: "#6B7280",
                marginBottom: 2,
              }}
              numberOfLines={1}
            >
              {item.recommended.manufacturer}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter-Regular",
                color: "#6B7280",
              }}
              numberOfLines={1}
            >
              {item.recommended.packSize}
            </Text>
          </View>

          {/* Price + qty display */}
          <View style={{ marginTop: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter-ExtraBold",
                  color: "#111827",
                }}
              >
                ₹{Number(item.recommended.price).toFixed(1)}
              </Text>
              {item.recommended.mrp > item.recommended.price && (
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter-Medium",
                    color: "#9CA3AF",
                    textDecorationLine: "line-through",
                    marginLeft: 4,
                  }}
                >
                  MRP ₹{Number(item.recommended.mrp).toFixed(1)}
                </Text>
              )}
            </View>
            {/* Qty display — non-editable white button with green border */}
            <View
              style={{
                borderRadius: 10,
                borderWidth: 1.25,
                borderColor: "#0F7635",
                backgroundColor: "#FFFFFF",
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter-Bold",
                  color: "#111827",
                }}
              >
                Qty {count}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

// ─── Main Layout ──────────────────────────────────────────────────────────────

export const MedicineComparisonLayout: React.FC<
  MedicineComparisonLayoutProps
> = ({ medicines, prescriptionId }) => {
  const router = useNav();
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardWidth = width - 32;

  const { totalItems } = useCart();
  const { markVerifiedBannerCompleted, isVerifiedBannerCompleted } =
    usePrescriptionBannerStore();
  const setPrescriptionOrderItems = usePrescriptionOrderStore((s) => s.setItems);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [walletOn, setWalletOn] = useState(false);
  const [coinsOn, setCoinsOn] = useState(false);
  const [refillOn, setRefillOn] = useState(false);

  // Delivery location
  const storeLocation = useLocationStore((s) => s.location);
  const { addresses } = useAddress();
  const defaultAddress =
    addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
  const deliveryLabel =
    storeLocation?.label ?? defaultAddress?.label ?? "Address";
  const deliveryDescription =
    storeLocation?.city ??
    [defaultAddress?.line1, defaultAddress?.line2, defaultAddress?.city]
      .filter(Boolean)
      .join(", ") ??
    "No address saved";

  // Wallet & coins
  const { balance } = useWalletBalance();
  const { data: settings } = useCartWalletSettings();
  const walletBalance = balance != null ? Number(balance.walletBalance) : 0;
  const availableCoins = balance?.coinsBalance ?? 0;
  const coinValue = settings?.wallet?.coinValueInRupees ?? 1;
  const coinLimitPct = settings?.wallet?.coinUsagePercentage ?? 10;

  // Coupon
  const { applied: appliedCoupon, remove: removeCoupon } = useCouponStore();

  // Pricing — qty based on recommended medicine quantity
  const subtotal = (medicines ?? []).reduce(
    (sum, item) => sum + (item.recommended.price * (item.quantity || 1)),
    0,
  );
  const mrpTotal = (medicines ?? []).reduce(
    (sum, item) => sum + (item.recommended.mrp * (item.quantity || 1)),
    0,
  );
  const productSavings = Math.max(0, mrpTotal - subtotal);
  const COUPON_DISCOUNT = appliedCoupon
    ? Math.min(Number(appliedCoupon.discount) || 0, subtotal)
    : 0;
  const maxCoinsUsable = Math.min(
    availableCoins,
    (subtotal * (coinLimitPct / 100)) / coinValue,
  );
  const COINS_DISCOUNT = coinsOn
    ? Math.round(Math.floor(maxCoinsUsable) * coinValue * 10) / 10
    : 0;
  const subtotalBeforeWallet = Math.max(
    subtotal - COUPON_DISCOUNT - COINS_DISCOUNT,
    0,
  );
  const WALLET_DISCOUNT = walletOn
    ? Math.round(Math.min(walletBalance, subtotalBeforeWallet) * 10) / 10
    : 0;
  const toPay = Math.max(subtotalBeforeWallet - WALLET_DISCOUNT, 0);

  const savingsRows = [
    { label: "Product Discount", value: productSavings },
    { label: "Coupon Discount", value: COUPON_DISCOUNT },
    { label: "CareSure Wallet", value: WALLET_DISCOUNT },
    { label: "CareSure Coins", value: COINS_DISCOUNT },
  ];
  const totalSavings = savingsRows.reduce((sum, r) => sum + r.value, 0);

  const handleProceed = () => {
    if (prescriptionId && !isVerifiedBannerCompleted(prescriptionId)) {
      markVerifiedBannerCompleted(prescriptionId);
    }
    setPrescriptionOrderItems(
      (medicines ?? []).map((item) => ({
        medicineId: item.recommended.id,
        medicineName: item.recommended.name,
        medicineSlug: item.recommended.slug,
        unitPrice: item.recommended.price,
        mrp: item.recommended.mrp,
        discountPercent: item.recommended.discountPercent,
        quantity: item.quantity || 1,
        image: typeof item.recommended.image === "string" ? item.recommended.image : null,
        productId: item.recommended.productId ?? null,
      }))
    );
    router.push({
      pathname: "/(prescription)/select-patient",
      params: {
        toPay: toPay.toFixed(2),
        prescriptionId: prescriptionId ?? "",
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <ScreenHeader
        title="Medicine Comparison"
        showBorder
        rightSlot={
          <Touchable
            onPress={() => router.push("/(modal)/cart")}
            className="w-12 h-12 rounded-full bg-white border border-[#919EAB33] items-center justify-center shadow-sm"
            style={{ position: "relative" }}
          >
            <icons.cart_outline width={22} height={22} />
            {totalItems > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: "#FF3B30",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontFamily: "Inter-Bold",
                    color: "#fff",
                    lineHeight: 12,
                  }}
                >
                  {totalItems}
                </Text>
              </View>
            )}
          </Touchable>
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottom + 100 }}
      >
        {/* Savings banner */}
        {totalSavings > 0 && <SavingsBanner amount={totalSavings} />}

        {/* Delivery bar */}
        <CartDeliveringTo
          label={deliveryLabel}
          description={deliveryDescription}
          onChange={() => setShowLocationSheet(true)}
          flat
        />
        {/* Tab header — sticky above scrollable content */}
        <View
          style={{
            flexDirection: "row",
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: "#E5E7EB",
            marginTop: 1,
          }}
        >
          <View
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              backgroundColor: "#fff",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter-Medium",
                color: "#6B7280",
              }}
            >
              Medicine in Prescription
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              backgroundColor: "#E8F5EC",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter-SemiBold",
                color: "#0F7635",
              }}
            >
              Our Recommendation
            </Text>
          </View>
        </View>
        {/* Comparison cards */}
        <View style={{ padding: 16, paddingBottom: 0 }}>
          {(medicines ?? []).map((item) => (
            <ComparisonCard
              key={item.id}
              item={item}
              cardWidth={cardWidth}
              count={item.quantity || 1}
            />
          ))}
        </View>

        {/* Refill Reminder */}
        <RefillReminder value={refillOn} onToggle={setRefillOn} />

        {/* Coupons */}
        <CartCouponSection
          appliedCoupon={appliedCoupon}
          onRemove={removeCoupon}
        />

        {/* Wallet */}
        <CartWalletSection
          value={walletOn}
          walletBalance={walletBalance}
          onToggle={setWalletOn}
        />

        {/* Coins */}
        <CartCoinsSection
          value={coinsOn}
          availableCoins={availableCoins}
          redeemedCoins={coinsOn ? Math.floor(maxCoinsUsable) : 0}
          onToggle={() => setCoinsOn((v) => !v)}
          onInfoPress={() => {}}
        />

        {/* Total Bill */}
        <CartBillSummary
          mrpTotal={mrpTotal}
          toPay={toPay}
          onPress={() => setShowBillDetails(true)}
        />

        {/* Savings Breakdown */}
        {totalSavings > 0 && (
          <CartSavingsBreakdown
            totalSavings={totalSavings}
            rows={savingsRows}
          />
        )}

        {/* Terms */}
        <CartTerms />
      </ScrollView>

      {/* Footer */}
      <CartFooter
        toPay={toPay}
        safeAreaBottom={bottom}
        onProceed={handleProceed}
      />

      {/* Sheets & Modals */}
      <BillDetailsSheet
        isVisible={showBillDetails}
        onClose={() => setShowBillDetails(false)}
        linesCount={medicines?.length ?? 0}
        mrpTotal={mrpTotal}
        productSavings={productSavings}
        couponDiscount={COUPON_DISCOUNT}
        walletDiscount={WALLET_DISCOUNT}
        coinsDiscount={COINS_DISCOUNT}
        deliveryFee={0}
        handlingCharge={0}
        toPay={toPay}
      />

      <LocationBottomSheet
        isVisible={showLocationSheet}
        onClose={() => setShowLocationSheet(false)}
      />
    </View>
  );
};
