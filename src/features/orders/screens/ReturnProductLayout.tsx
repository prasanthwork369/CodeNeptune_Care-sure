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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ReturnReason, ReturnReasonModal } from "../components/ReturnReasonModal";
import { ReturnSuccessModal } from "../components/ReturnSuccessModal";
import { SectionCard } from "../sections/tracking";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { requireInternet } from "@/src/utils/offline";
import { styles as s } from "./ReturnProductLayout.styles";

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
      style={[
        s.radioCard,
        isSelected ? s.radioCardSelected : s.radioCardUnselected,
      ]}
    >
      <View style={s.radioInnerRow}>
        <View
          style={[
            s.radioCircle,
            isSelected ? s.radioCircleSelected : s.radioCircleUnselected,
          ]}
        >
          {isSelected && (
            <View style={s.radioDot} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              s.radioTitle,
              isSelected ? s.radioTitleSelected : s.radioTitleUnselected,
            ]}
          >
            {method === REFUND_METHOD.WALLET
              ? "CareSure Wallet"
              : "Original Payment Method"}
          </Text>
          <Text style={s.radioSubtitle}>
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
  const paymentActiveMethods = paymentSettings?.active_return_methods;
  const activeReturnMethods = useMemo(() => {
    return paymentActiveMethods?.length
      ? paymentActiveMethods
      : [REFUND_METHOD.WALLET, REFUND_METHOD.ORIGINAL_PAYMENT];
  }, [paymentActiveMethods]);

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

  useEffect(() => {
    if (
      paymentActiveMethods?.length &&
      !activeReturnMethods.includes(refundMethod)
    ) {
      setRefundMethod(activeReturnMethods[0] as RefundMethodValue);
    }
  }, [activeReturnMethods, paymentActiveMethods, refundMethod, setRefundMethod]);

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleBackPress = useCallback(() => {
    if (useReturnDraftStore.getState().items.length > 0)
      setShowLeaveConfirm(true);
    else router.back();
  }, [router]);

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

  const validReturnItems = draftItems.filter((draft) => {
    const originalItem = items.find((it) => it.id === draft.orderItemId);
    return originalItem ? isItemReturnable(originalItem) : true;
  });

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
    if (validReturnItems.length === 0) {
      Alert.alert(
        "Select items",
        "Please select and confirm at least one returnable item to return.",
      );
      return;
    }
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
      <View style={s.loadingCenter}>
        <ActivityIndicator color="#0F7635" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={s.root}>
        <ScreenHeader
          title="Return Product"
          backgroundColor="#FFFFFF"
          showBorder
        />
        <View style={s.emptyCenter}>
          <Text style={s.emptyTitle}>
            Order Not Found
          </Text>
          <Text style={s.emptySubtitle}>
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
      <View style={s.root}>
        <ScreenHeader
          title="Return Product"
          backgroundColor="#FFFFFF"
          showBorder
        />
        <View style={s.emptyCenter}>
          <icons.check_circle width={40} height={40} fill="#92600A" />
          <Text style={s.emptyTitle}>
            Return Request Already Exists
          </Text>
          <Text style={[s.emptySubtitle, { marginBottom: 24 }]}>
            A return request has already been submitted for this order. You can
            monitor the progress of your return in the order details.
          </Text>
          <Touchable
            onPress={() => router.back()}
            style={s.existingReturnBtn}
            activeOpacity={0.85}
          >
            <Text style={s.existingReturnBtnText}>
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
    <View style={s.root}>
      <ScreenHeader
        title="Return Product"
        backgroundColor="#FFFFFF"
        showBorder
        onBack={handleBackPress}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="auto"
        contentContainerStyle={s.scrollContent}
      >
        <SectionCard>
          <View style={s.benefitRow}>
            <icons.check_circle width={22} height={22} fill="#16A34A" />
            <Text style={s.benefitText}>
              Eligible for return
            </Text>
          </View>
          <View style={s.benefitDivider} />
          <View style={s.benefitRow}>
            <icons.pickup width={22} height={22} fill="#16A34A" />
            <Text style={s.benefitText}>
              Pickup in 2-3 days
            </Text>
          </View>
        </SectionCard>

        <SectionCard>
          <Text style={s.sectionHeading}>
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
                <View style={s.itemRow}>
                  <Touchable
                    onPress={isReturnable ? () => toggleItem(item) : undefined}
                    activeOpacity={isReturnable ? 0.7 : 1}
                    style={s.itemTouch}
                  >
                    <View style={s.itemImageWrap}>
                      {snap?.image ? (
                        <Image
                          source={{ uri: snap.image }}
                          style={s.itemImg}
                          contentFit="contain"
                        />
                      ) : (
                        <icons.package_icon width={28} height={28} />
                      )}
                    </View>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text
                        style={[
                          s.itemNameText,
                          {
                            color: !isReturnable
                              ? "#6A6A6A"
                              : isChecked
                                ? "#222222"
                                : "#9CA3AF",
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {snap?.name ?? "Medicine Item"}
                      </Text>
                      <Text
                        style={[
                          s.itemBrandText,
                          {
                            color: !isReturnable
                              ? "#9CA3AF"
                              : isChecked
                                ? "#6A6A6A"
                                : "#9CA3AF",
                          },
                        ]}
                      >
                        {[snap?.brand, snap?.pack].filter(Boolean).join(" • ")}
                      </Text>
                    </View>
                  </Touchable>
                  <Touchable
                    onPress={isReturnable ? () => toggleItem(item) : undefined}
                    activeOpacity={isReturnable ? 0.7 : 1}
                    style={[
                      s.checkbox,
                      !isReturnable
                        ? s.checkboxDisabled
                        : isChecked
                          ? s.checkboxChecked
                          : s.checkboxUnchecked,
                    ]}
                  >
                    {isChecked && isReturnable && (
                      <Text style={s.checkMarkText}>
                        ✓
                      </Text>
                    )}
                  </Touchable>
                </View>

                {/* Non-returnable badge OR quantity selector */}
                <View style={{ paddingLeft: 72, paddingBottom: 12 }}>
                  {!isReturnable ? (
                    <View style={s.nonReturnableBadge}>
                      <Text style={s.nonReturnableText}>
                        Non-Returnable Item
                      </Text>
                    </View>
                  ) : (
                    <View style={s.qtySelector}>
                      <Touchable
                        onPress={() => updateQty(item, -1)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            s.qtyBtnText,
                            { color: isChecked ? "#222222" : "#9CA3AF" },
                          ]}
                        >
                          −
                        </Text>
                      </Touchable>
                      <Text
                        style={[
                          s.qtyValueText,
                          { color: isChecked ? "#222222" : "#9CA3AF" },
                        ]}
                      >
                        {getQty(item)}
                      </Text>
                      <Touchable
                        onPress={() => updateQty(item, 1)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            s.qtyBtnText,
                            { color: isChecked ? "#222222" : "#9CA3AF" },
                          ]}
                        >
                          +
                        </Text>
                      </Touchable>
                    </View>
                  )}
                </View>
                {isChecked && reasonData && (
                  <View style={s.reasonDetailsCard}>
                    <View style={s.reasonDivider} />
                    <View style={s.reasonRow}>
                      <View style={{ flex: 1 }}>
                        <View style={s.reasonHeaderRow}>
                          <icons.info_outline width={16} height={16} />
                          <Text style={s.reasonTitleText}>
                            {reasonData.reason}
                          </Text>
                        </View>
                        {!!reasonData.details && (
                          <Text style={s.reasonDetailsText}>
                            {reasonData.details}
                          </Text>
                        )}
                        <View style={s.reasonPhotosRow}>
                          {Object.values(reasonData.images)
                            .filter(Boolean)
                            .map((img, i) => (
                              <Image
                                key={i}
                                source={{ uri: img }}
                                style={s.reasonThumb}
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
                        style={s.reasonEditBtn}
                      >
                        <Text style={s.reasonEditText}>
                          Edit
                        </Text>
                      </Touchable>
                    </View>
                  </View>
                )}
                {index < items.length - 1 && (
                  <View style={s.itemDashedDivider} />
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
        style={[
          s.bottomBar,
          { paddingBottom: adjustedBottom + 16 },
        ]}
      >
        <View style={{ marginBottom: 16 }}>
          <Text style={s.pickupAddressTitle}>
            Pickup Address
          </Text>
          <View style={s.pickupAddressRow}>
            <Text style={s.pickupAddressText}>
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
              <Text style={s.changeAddressText}>
                Change
              </Text>
            </Touchable>
          </View>
        </View>
        <Touchable
          style={[
            s.submitBtn,
            (submitting ||
              uploadingImages ||
              !pickupAddress ||
              validReturnItems.length === 0) && { opacity: 0.7 },
          ]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={
            submitting ||
            uploadingImages ||
            !pickupAddress ||
            validReturnItems.length === 0
          }
        >
          {uploadingImages ? (
            <View style={s.submitBtnUploadingRow}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={s.submitBtnText}>
                Uploading photos...
              </Text>
            </View>
          ) : submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={s.submitBtnText}>
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
        confirmLoading={isLeaving}
        confirmLoadingLabel="Leaving..."
        onConfirm={() => {
          if (isLeaving) return;
          setIsLeaving(true);
          requestAnimationFrame(() => {
            try {
              clearReturnDraft();
              router.back();
            } catch {
              setIsLeaving(false);
            }
          });
        }}
        onCancel={() => setShowLeaveConfirm(false)}
      />

      <LocationBottomSheet
        isVisible={isAddressSheetVisible}
        onClose={() => setIsAddressSheetVisible(false)}
        onSelect={async (_label, _city, addr) => {
          if (addr) {
            await handleSelectAddress(addr.id);
          }
        }}
      />
    </View>
  );
};
