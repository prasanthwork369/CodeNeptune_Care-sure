import { asError } from "@/src/api/errors";
import { storageApi } from "@/src/api/storage.api";
import { LocationBottomSheet } from "@/src/components/location/LocationBottomSheet";
import { RemoveConfirmModal } from "@/src/features/prescription/sections/preview/RemoveConfirmModal";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import {
  CLOSED_RETURN_STATUSES,
  REFUND_METHOD,
  RefundMethodValue,
} from "../constants/return";
import { useCreateReturn } from "@/src/features/orders/hooks/useCreateReturn";
import { useAddress } from "@/src/features/profile/hooks/useAddress";
import { useOrderById } from "@/src/features/orders/hooks/useOrderById";
import { usePaymentSettings } from "@/src/hooks/queries/useSettings";
import { useNav } from "@/src/hooks/useNav";
import { useReturnDraftStore } from "@/src/store/returnDraftStore";
import { CreateReturnRequest, OrderItem, ReturnItemImages } from "../types";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  Text,
  View,
} from "react-native";
import { orderStyles as s } from "../orders.styles";
import { ReturnReason, ReturnReasonModal } from "../components/ReturnReasonModal";
import { ReturnSuccessModal } from "../components/ReturnSuccessModal";

import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { moderateScale } from "@/src/utils/exactScale";
import { requireInternet } from "@/src/utils/offline";

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`bg-white rounded-lg mx-base ${className}`}
      style={{ borderWidth: 1, borderColor: "#F0F1F3", elevation: 0 }}
    >
      {children}
    </View>
  );
}

// Module scope, or React remounts both radios on every render.
function RadioOption({
  method,
  selected,
  onSelect,
}: {
  method: RefundMethodValue;
  selected: RefundMethodValue;
  onSelect: (m: RefundMethodValue) => void;
}) {
  const isSelected = selected === method;
  return (
    <Touchable
      onPress={() => onSelect(method)}
      activeOpacity={0.8}
      className="mx-base rounded-lg"
      style={{
        borderWidth: 1.33,
        borderColor: isSelected ? "#0F7635" : "#919EAB33",
        backgroundColor: isSelected ? "#F4FBF6" : "#FFFFFF",
      }}
    >
      <View className="flex-row items-center px-4 py-4 gap-3">
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: isSelected ? "#0F7635" : "#919EAB",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isSelected && (
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#0F7635",
              }}
            />
          )}
        </View>
        <View className="flex-1">
          <Text
            style={[
              s.labelMd,
              {
                fontWeight: "700",
                color: isSelected ? "#0F7635" : "#0F1724",
              },
            ]}
          >
            {method === REFUND_METHOD.WALLET
              ? "CareSure Wallet"
              : "Original Payment Method"}
          </Text>
          <Text
            style={s.labelSm}
            className="font-inter-medium text-brand-subtext mt-0.5"
          >
            {method === REFUND_METHOD.WALLET
              ? "Instant refund once the item is picked up successfully"
              : "Refund will reflect in 5-7 business days after pickup"}
          </Text>
        </View>
      </View>
    </Touchable>
  );
}

function isItemReturnable(item: OrderItem): boolean {
  if (item.medicineSnapshot?.isReturnable === false) return false;
  if (item.isReturnable === false) return false;
  return true;
}

export const ReturnProductLayout: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();
  const router = useNav();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { order, loading: orderLoading } = useOrderById(orderId);
  const { createReturn, loading: submitting } = useCreateReturn();
  const { addresses, updateAddress } = useAddress();
  const [isAddressSheetVisible, setIsAddressSheetVisible] = useState(false);

  const pickupAddress =
    addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
  const { data: paymentSettings } = usePaymentSettings();
  const activeReturnMethods = paymentSettings?.active_return_methods?.length
    ? paymentSettings.active_return_methods
    : [REFUND_METHOD.WALLET, REFUND_METHOD.ORIGINAL_PAYMENT];

  // Confirmed return items persist in this store across modal open/close --
  // mirrors the web's Redux returnSlice -- and reset automatically if the
  // customer is now returning a different order.
  const draftItems = useReturnDraftStore((st) => st.items);
  const refundMethod = useReturnDraftStore((st) => st.refundMethod);
  const setOrderIdDraft = useReturnDraftStore((st) => st.setOrderId);
  const addConfirmedItem = useReturnDraftStore((st) => st.addConfirmedItem);
  const removeConfirmedItem = useReturnDraftStore(
    (st) => st.removeConfirmedItem,
  );
  const setRefundMethod = useReturnDraftStore((st) => st.setRefundMethod);
  const clearReturnDraft = useReturnDraftStore((st) => st.clearReturnDraft);

  useEffect(() => {
    if (orderId) setOrderIdDraft(orderId);
  }, [orderId, setOrderIdDraft]);

  // Auto-select the first active return method if settings load and the
  // currently selected one isn't actually enabled (matches the web).
  useEffect(() => {
    if (
      paymentSettings?.active_return_methods?.length &&
      !activeReturnMethods.includes(refundMethod)
    ) {
      setRefundMethod(activeReturnMethods[0] as RefundMethodValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentSettings, refundMethod]);

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Leaving this screen without submitting would silently drop confirmed
  // items/reasons/photos -- warn first, same pattern as the prescription
  // upload preview screen.
  const handleBackPress = useCallback(() => {
    if (useReturnDraftStore.getState().items.length > 0)
      setShowLeaveConfirm(true);
    else router.back();
  }, [router]);

  // Intercepts the Android hardware back button too.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          handleBackPress();
          return true;
        },
      );
      return () => subscription.remove();
    }, [handleBackPress]),
  );

  const items: OrderItem[] = order?.items ?? [];

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  function getDraftItem(itemId: string) {
    return draftItems.find((i) => i.orderItemId === itemId);
  }

  function getQty(item: OrderItem) {
    return quantities[item.id] ?? getDraftItem(item.id)?.quantity ?? 1;
  }

  function toggleItem(item: OrderItem) {
    if (!isItemReturnable(item)) return;
    const isConfirmed = !!getDraftItem(item.id);
    if (isConfirmed) {
      removeConfirmedItem(item.id);
    } else {
      setEditingItemId(item.id);
      setIsModalVisible(true);
    }
  }

  function updateQty(item: OrderItem, delta: number) {
    if (!isItemReturnable(item)) return;
    const max = item.quantity;
    setQuantities((prev) => ({
      ...prev,
      [item.id]: Math.max(1, Math.min(max, getQty(item) + delta)),
    }));
  }

  const editingItem = items.find((i) => i.id === editingItemId) ?? null;

  const handleSaveReason = (data: ReturnReason) => {
    if (!editingItem) return;
    const snap = editingItem.medicineSnapshot;
    const unitPrice = parseFloat(editingItem.unitPrice ?? "0");
    const qty = getQty(editingItem);

    addConfirmedItem({
      orderItemId: editingItem.id,
      medicineId: editingItem.medicineId,
      quantity: qty,
      reason: data.reason,
      images: data.images,
      details: data.details,
      name: snap?.name ?? "Medicine Item",
      thumbnailUrl: snap?.image,
      unitPrice,
      total: qty * unitPrice,
    });
  };

  const handleSelectAddress = async (addrId: string) => {
    try {
      await updateAddress({ id: addrId, isDefault: true });
      setIsAddressSheetVisible(false);
    } catch (e) {
      Alert.alert(
        "Error",
        asError(e).message ?? "Could not update default address.",
      );
    }
  };

  const [uploadingImages, setUploadingImages] = useState(false);

  // Each item's photos are still local file:// URIs at this point (picking
  // a photo no longer uploads it -- see ReturnReasonModal). Upload them all
  // now, in one batch, right before submitting.
  const uploadDraftImages = async (): Promise<
    Record<string, ReturnItemImages>
  > => {
    const uploaded: Record<string, ReturnItemImages> = {};
    for (const item of draftItems) {
      const itemImages: ReturnItemImages = {};
      for (const [slot, uri] of Object.entries(item.images)) {
        if (!uri) continue;
        if (uri.startsWith("http")) {
          itemImages[slot as keyof ReturnItemImages] = uri;
          continue;
        }
        const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
        const type =
          ext === "png"
            ? "image/png"
            : ext === "webp"
              ? "image/webp"
              : "image/jpeg";
        itemImages[slot as keyof ReturnItemImages] = (
          await storageApi.upload(
            { uri, name: `${slot}.${ext}`, type },
            "returns",
          )
        ).url;
      }
      uploaded[item.orderItemId] = itemImages;
    }
    return uploaded;
  };

  const handleSubmit = async () => {
    if (!pickupAddress) {
      Alert.alert(
        "Pickup address required",
        "Please add a pickup address before requesting a return.",
      );
      return;
    }
    // Defensive check: only allow confirmed items that are strictly returnable
    const validReturnItems = draftItems.filter((draft) => {
      const originalItem = items.find((it) => it.id === draft.orderItemId);
      return originalItem ? isItemReturnable(originalItem) : true;
    });

    if (validReturnItems.length === 0) {
      Alert.alert(
        "Select items",
        "Please select and confirm at least one returnable item to return.",
      );
      return;
    }
    // Critical: uploads the evidence images then creates the return, so a
    // half-finished attempt is worth blocking on.
    if (!requireInternet({ critical: true })) return;

    try {
      setUploadingImages(true);
      const uploadedImagesByItem = await uploadDraftImages();
      setUploadingImages(false);

      const payload: CreateReturnRequest = {
        orderId: order!.orderId,
        refundMethod,
        items: validReturnItems.map((item) => ({
          orderItemId: item.orderItemId,
          medicineId: item.medicineId,
          quantity: item.quantity,
          reason: item.reason,
          images: uploadedImagesByItem[item.orderItemId],
          details: item.details,
        })),
      };

      await createReturn({ data: payload, orderUuid: order!.id });
      clearReturnDraft();
      setIsSuccessModalVisible(true);
    } catch (e) {
      const err = asError(e);
      setUploadingImages(false);
      Alert.alert(
        "Return Failed",
        err?.message ?? "Something went wrong. Please try again.",
      );
    }
  };

  if (orderLoading) {
    return (
      <View className="flex-1 bg-[#F5F6FB] items-center justify-center">
        <ActivityIndicator color="#0F7635" />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-[#F5F6FB]">
        <ScreenHeader
          title="Return Product"
          backgroundColor="#FFFFFF"
          showBorder
        />
        <View className="flex-1 items-center justify-center px-8">
          <Text
            style={s.labelLg}
            className="font-inter-bold text-[#222222] text-center mb-2"
          >
            Order Not Found
          </Text>
          <Text
            style={s.labelSm}
            className="font-inter-medium text-brand-subtext text-center"
          >
            We couldn&apos;t load the order details for this return request.
          </Text>
        </View>
      </View>
    );
  }

  const hasActiveReturn = order.returns?.some(
    (r) => !CLOSED_RETURN_STATUSES.includes(r.status),
  );

  if (hasActiveReturn) {
    return (
      <View className="flex-1 bg-[#F5F6FB]">
        <ScreenHeader
          title="Return Product"
          backgroundColor="#FFFFFF"
          showBorder
        />
        <View className="flex-1 items-center justify-center px-8">
          <icons.check_circle width={40} height={40} fill="#92600A" />
          <Text
            style={s.labelLg}
            className="font-inter-bold text-[#222222] text-center mt-4 mb-2"
          >
            Return Request Already Exists
          </Text>
          <Text
            style={s.labelSm}
            className="font-inter-medium text-brand-subtext text-center mb-6"
          >
            A return request has already been submitted for this order. You can
            monitor the progress of your return in the order details.
          </Text>
          <Touchable
            onPress={() => router.back()}
            className="bg-[#0F1724] rounded-lg py-3.5 px-8"
            activeOpacity={0.85}
          >
            <Text style={s.labelMd} className="font-inter-bold text-white">
              View Order Details
            </Text>
          </Touchable>
        </View>
      </View>
    );
  }

  const addressText = pickupAddress
    ? `${pickupAddress.line1}${pickupAddress.line2 ? `, ${pickupAddress.line2}` : ""}, ${pickupAddress.city}, ${pickupAddress.state.toUpperCase()}, ${pickupAddress.pincode}`
    : "No pickup address on file -- add one to continue";

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader
        title="Return Product"
        backgroundColor="#FFFFFF"
        showBorder
        onBack={handleBackPress}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="auto"
        contentContainerStyle={{ paddingVertical: 12, gap: 10 }}
      >
        <SectionCard>
          <View className="flex-row items-center px-4 py-3 gap-3">
            <icons.check_circle width={22} height={22} fill="#16A34A" />
            <Text
              style={s.labelSm}
              className="font-inter-semibold text-brand-text"
            >
              Eligible for return
            </Text>
          </View>
          <View className="h-px bg-[#919EAB33]" />
          <View className="flex-row items-center px-4 py-3 gap-3">
            <icons.pickup width={22} height={22} fill="#16A34A" />
            <Text
              style={s.labelSm}
              className="font-inter-semibold text-brand-text"
            >
              Pickup in 2-3 days
            </Text>
          </View>
        </SectionCard>

        <SectionCard>
          <Text
            style={s.labelMd}
            className="font-inter-bold text-[#222222] px-4 pt-4 pb-3"
          >
            Selected Items ({draftItems.length}/{items.length})
          </Text>
          {items.map((item, index) => {
            const isReturnable = isItemReturnable(item);
            const reasonData = getDraftItem(item.id);
            const isChecked = !!reasonData;
            const snap = item.medicineSnapshot;
            return (
              <View
                key={item.id}
                style={{ opacity: isReturnable ? 1 : 0.6 }}
              >
                <View className="flex-row items-start px-4 py-3">
                  <Touchable
                    onPress={isReturnable ? () => toggleItem(item) : undefined}
                    activeOpacity={isReturnable ? 0.7 : 1}
                    className="flex-1 flex-row items-start"
                  >
                    <View className="w-14 h-14 rounded-sm border border-[#919EAB33] bg-[#FAFAFA] items-center justify-center mr-3 overflow-hidden">
                      {snap?.image ? (
                        <Image
                          source={{ uri: snap.image }}
                          style={{ width: 50, height: 50 }}
                          contentFit="contain"
                        />
                      ) : (
                        <icons.package_icon width={28} height={28} />
                      )}
                    </View>
                    <View className="flex-1 mr-2">
                      <Text
                        style={[
                          s.labelSm,
                          {
                            color: !isReturnable
                              ? "#6A6A6A"
                              : isChecked
                                ? "#222222"
                                : "#9CA3AF",
                          },
                        ]}
                        className="font-inter-semibold"
                        numberOfLines={2}
                      >
                        {snap?.name ?? "Medicine Item"}
                      </Text>
                      <Text
                        style={[
                          s.labelSm,
                          {
                            color: !isReturnable
                              ? "#9CA3AF"
                              : isChecked
                                ? "#6A6A6A"
                                : "#9CA3AF",
                          },
                        ]}
                        className="font-inter-medium mt-0.5"
                      >
                        {[snap?.brand, snap?.pack].filter(Boolean).join(" • ")}
                      </Text>
                    </View>
                  </Touchable>
                  <Touchable
                    onPress={isReturnable ? () => toggleItem(item) : undefined}
                    activeOpacity={isReturnable ? 0.7 : 1}
                    className="ml-2 mt-0.5 w-6 h-6 rounded items-center justify-center"
                    style={{
                      borderWidth: 1.5,
                      borderColor: !isReturnable
                        ? "#D1D5DB"
                        : isChecked
                          ? "#0F7635"
                          : "#9CA3AF",
                      backgroundColor: !isReturnable
                        ? "#F3F4F6"
                        : isChecked
                          ? "#0F7635"
                          : "transparent",
                    }}
                  >
                    {isChecked && isReturnable && (
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: moderateScale(12),
                          fontWeight: "700",
                          lineHeight: moderateScale(14),
                        }}
                      >
                        ✓
                      </Text>
                    )}
                  </Touchable>
                </View>

                {/* Non-returnable badge OR quantity selector */}
                <View style={{ paddingLeft: 72, paddingBottom: 12 }}>
                  {!isReturnable ? (
                    <View
                      style={{
                        backgroundColor: "#FEF2F2",
                        borderColor: "#FECACA",
                        borderWidth: 1,
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        alignSelf: "flex-start",
                      }}
                    >
                      <Text
                        style={{
                          color: "#DC2626",
                          fontSize: moderateScale(11),
                          fontWeight: "700",
                          letterSpacing: 0.2,
                        }}
                      >
                        Non-Returnable Item
                      </Text>
                    </View>
                  ) : (
                    <View
                      className="flex-row items-center px-3 py-1 gap-3"
                      style={{
                        borderWidth: 1,
                        borderColor: "#919EAB33",
                        borderRadius: 6,
                        alignSelf: "flex-start",
                      }}
                    >
                      <Touchable
                        onPress={() => updateQty(item, -1)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            s.labelXl,
                            { color: isChecked ? "#222222" : "#9CA3AF" },
                          ]}
                          className="font-inter-medium leading-none"
                        >
                          −
                        </Text>
                      </Touchable>
                      <Text
                        style={[
                          s.labelSm,
                          { color: isChecked ? "#222222" : "#9CA3AF" },
                        ]}
                        className="font-inter-bold min-w-[14px] text-center"
                      >
                        {getQty(item)}
                      </Text>
                      <Touchable
                        onPress={() => updateQty(item, 1)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            s.labelXl,
                            { color: isChecked ? "#222222" : "#9CA3AF" },
                          ]}
                          className="font-inter-medium leading-none"
                        >
                          +
                        </Text>
                      </Touchable>
                    </View>
                  )}
                </View>
                {isChecked && reasonData && (
                  <View className="px-4 pb-4">
                    <View
                      style={{
                        height: 1,
                        width: "100%",
                        borderBottomWidth: 1,
                        borderBottomColor: "#919EAB33",
                        borderStyle: "dashed",
                        marginBottom: 16,
                      }}
                    />
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <icons.info_outline width={16} height={16} />
                          <Text
                            style={s.labelMd}
                            className="font-inter-bold text-[#222222]"
                          >
                            {reasonData.reason}
                          </Text>
                        </View>
                        {!!reasonData.details && (
                          <Text
                            className="font-inter-medium text-brand-subtext mt-1"
                            style={{ fontSize: moderateScale(12) }}
                          >
                            {reasonData.details}
                          </Text>
                        )}
                        <View className="flex-row mt-3 gap-2">
                          {Object.values(reasonData.images)
                            .filter(Boolean)
                            .map((img, i) => (
                              <Image
                                key={i}
                                source={{ uri: img }}
                                style={{
                                  width: 52,
                                  height: 52,
                                  borderRadius: 8,
                                }}
                                contentFit="cover"
                              />
                            ))}
                        </View>
                      </View>
                      <Touchable
                        onPress={() => {
                          setEditingItemId(item.id);
                          setIsModalVisible(true);
                        }}
                        activeOpacity={0.7}
                        className="mt-1"
                        style={{ alignSelf: "flex-end", marginBottom: 2 }}
                      >
                        <Text
                          style={s.labelMd}
                          className="font-inter-bold text-[#0F7635]"
                        >
                          Edit
                        </Text>
                      </Touchable>
                    </View>
                  </View>
                )}
                {index < items.length - 1 && (
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderColor: "#E5E7EB",
                      marginHorizontal: 10,
                      borderStyle: "dashed",
                    }}
                  />
                )}
              </View>
            );
          })}
        </SectionCard>

        {activeReturnMethods.includes(REFUND_METHOD.WALLET) && (
          <RadioOption
            method={REFUND_METHOD.WALLET}
            selected={refundMethod}
            onSelect={setRefundMethod}
          />
        )}
        {activeReturnMethods.includes(REFUND_METHOD.ORIGINAL_PAYMENT) && (
          <RadioOption
            method={REFUND_METHOD.ORIGINAL_PAYMENT}
            selected={refundMethod}
            onSelect={setRefundMethod}
          />
        )}
      </ScrollView>

      <View
        className="bg-white px-base border-t border-[#F0F0F0]"
        style={{ paddingTop: 16, paddingBottom: adjustedBottom + 16 }}
      >
        <View className="mb-4">
          <Text
            style={s.labelMd}
            className="font-inter-bold text-[#222222] mb-1"
          >
            Pickup Address
          </Text>
          <View
            className="flex-row items-start justify-between"
            style={{ gap: 16 }}
          >
            <Text
              style={[s.labelSm, { flex: 1 }]}
              className="font-inter-medium text-brand-subtext leading-5"
            >
              {addressText}
            </Text>
            <Touchable
              onPress={() => {
                if (addresses.length === 0) {
                  router.push("/profile/addresses");
                } else {
                  setIsAddressSheetVisible(true);
                }
              }}
              activeOpacity={0.6}
              style={{ paddingTop: 2 }}
            >
              <Text
                style={s.labelSm}
                className="text-[#0F7635] font-inter-bold"
              >
                Change
              </Text>
            </Touchable>
          </View>
        </View>
        <Touchable
          className="bg-[#0F7635] rounded-lg py-4 items-center"
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={submitting || uploadingImages}
          style={submitting || uploadingImages ? { opacity: 0.7 } : undefined}
        >
          {uploadingImages ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="#FFFFFF" />
              <Text
                style={s.labelLg}
                className="font-inter-semibold text-white"
              >
                Uploading photos...
              </Text>
            </View>
          ) : submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={s.labelLg} className="font-inter-semibold text-white">
              Request Return
            </Text>
          )}
        </Touchable>
      </View>

      <ReturnReasonModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        item={
          editingItem
            ? {
                name: editingItem.medicineSnapshot?.name ?? "Medicine Item",
                image: editingItem.medicineSnapshot?.image
                  ? { uri: editingItem.medicineSnapshot.image }
                  : undefined,
                pack: editingItem.medicineSnapshot?.pack ?? "",
              }
            : null
        }
        quantity={
          editingItemId ? getQty(items.find((i) => i.id === editingItemId)!) : 1
        }
        initialData={(() => {
          const draft = editingItemId ? getDraftItem(editingItemId) : null;
          return draft
            ? {
                reason: draft.reason,
                details: draft.details ?? "",
                images: draft.images,
              }
            : null;
        })()}
        onSave={handleSaveReason}
      />
      <ReturnSuccessModal
        isVisible={isSuccessModalVisible}
        onClose={() => setIsSuccessModalVisible(false)}
        onGoHome={() => {
          setIsSuccessModalVisible(false);
          router.replace("/(tabs)");
        }}
      />

      <RemoveConfirmModal
        visible={showLeaveConfirm}
        title="Leave this page?"
        message="Your selected items, reasons and uploaded photos will be removed"
        icon={HOME_IMAGES.leaveWarning}
        iconBg="#FFF1F1"
        confirmBg="#E02D5B"
        cancelLabel="Continue"
        confirmLabel="Leave"
        onConfirm={() => {
          setShowLeaveConfirm(false);
          clearReturnDraft();
          router.back();
        }}
        onCancel={() => setShowLeaveConfirm(false)}
      />

      <LocationBottomSheet
        isVisible={isAddressSheetVisible}
        onClose={() => setIsAddressSheetVisible(false)}
        onSelect={async (label, city, addr) => {
          if (addr) {
            await handleSelectAddress(addr.id);
          }
        }}
      />
    </View>
  );
};
