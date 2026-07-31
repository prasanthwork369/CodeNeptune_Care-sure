import { PdfViewer } from "@/src/components/ui/PdfViewer";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { useNav } from "@/src/hooks/useNav";
import { useZoomGesture } from "@/src/hooks/ui/useZoomGesture";
import { useLocalSearchParams } from "expo-router";
import { icons } from "@/src/constants/icons";
import { PRESCRIPTION_STATUS_LABELS } from "@/src/constants/prescription-status";
import { prescriptionService } from "@/src/services/prescription.service";
import React, { useEffect, useState } from "react";
import {
  LayoutChangeEvent,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { moderateScale } from "@/src/utils/exactScale";

// Diameter of the prev/next page buttons; also used to centre them vertically.
const PAGE_BTN = 40;

export const PrescriptionViewerLayout: React.FC = () => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { width } = useWindowDimensions();
  const [containerHeight, setContainerHeight] = useState(0);

  const onContainerLayout = (e: LayoutChangeEvent) =>
    setContainerHeight(e.nativeEvent.layout.height);

  const {
    imageUrls,
    source,
    status,
    prescriptionOrderId,
    prescriptionId,
    toPay,
  } = useLocalSearchParams<{
    prescriptionId: string;
    imageUrls: string;
    doctorName: string;
    patientName: string;
    uploadedDate: string;
    toPay?: string;
    source?: string;
    status?: string;
    prescriptionOrderId?: string;
  }>();

  // The push payload carries no order id, so resolve it before the footer decides.
  const [resolved, setResolved] = useState<{
    status: string;
    orderId: string;
  } | null>(null);

  useEffect(() => {
    if (source !== "notification" || !prescriptionId || prescriptionOrderId)
      return;
    let isActive = true;
    (async () => {
      const res = await prescriptionService.getById(prescriptionId);
      if (!isActive || !res.success || !res.data) return;
      setResolved({
        status: PRESCRIPTION_STATUS_LABELS[res.data.status] ?? "",
        orderId: res.data.prescriptionOrderId ?? "",
      });
    })();
    return () => {
      isActive = false;
    };
  }, [source, prescriptionId, prescriptionOrderId]);

  const effectiveStatus = resolved?.status ?? status;
  const effectiveOrderId = resolved?.orderId ?? prescriptionOrderId;

  const isOrderEntry = source === "notification" || source === "upload";
  const showVerifiedCard =
    isOrderEntry && effectiveStatus === "Verified" && !!effectiveOrderId;
  const isRejected = effectiveStatus === "Rejected" || source === "rejection";
  const showSelect = !showVerifiedCard && !isRejected && source !== "view_only";

  const urls: string[] = imageUrls ? JSON.parse(imageUrls) : [];
  const [pageIndex, setPageIndex] = useState(0);
  const currentUrl = urls[pageIndex] ?? "";
  const isPdf = currentUrl.toLowerCase().endsWith(".pdf");
  const hasPages = urls.length > 1;
  const hasFooter = showVerifiedCard || showSelect;

  const { resetZoom, composedGesture, animatedStyle } = useZoomGesture({
    containerWidth: width,
    containerHeight,
  });

  const goToPage = (next: number) => {
    if (next < 0 || next >= urls.length) return;
    resetZoom();
    setPageIndex(next);
  };

  const handleSelect = () => {
    const filesPayload = urls.map((u) => ({
      localUri: u,
      name: u.split("/").pop() ?? "prescription",
      type: u.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg",
    }));
    router.push({
      pathname: "/(prescription)/preview",
      params: {
        files: JSON.stringify(filesPayload),
        toPay: toPay ?? "0",
        source: source === "cart" ? "cart" : "existing",
      },
    });
  };

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="Prescription" />

      <View className="flex-1" onLayout={onContainerLayout}>
        {containerHeight > 0 &&
          (isPdf ? (
            <PdfViewer
              uri={currentUrl}
              style={{
                width,
                height: containerHeight,
                backgroundColor: "#F5F6FB",
              }}
            />
          ) : (
            <GestureDetector gesture={composedGesture}>
              <Animated.View
                style={{
                  width,
                  height: containerHeight,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <Animated.Image
                  source={{ uri: currentUrl }}
                  style={[{ width, height: containerHeight }, animatedStyle]}
                  resizeMode="contain"
                />
              </Animated.View>
            </GestureDetector>
          ))}

        {hasPages && (
          <>
            <Touchable
              activeOpacity={0.8}
              disabled={pageIndex === 0}
              onPress={() => goToPage(pageIndex - 1)}
              className="absolute items-center justify-center"
              style={{
                left: 16,
                top: containerHeight / 2 - PAGE_BTN / 2,
                width: PAGE_BTN,
                height: PAGE_BTN,
                borderRadius: PAGE_BTN / 2,
                backgroundColor: "#FFFFFF",
                opacity: pageIndex === 0 ? 0.35 : 1,
                borderWidth: 1,
                borderColor: "#919EAB33",
              }}
            >
              <icons.arrow_back_ios width={14} height={14} fill="#222222" />
            </Touchable>

            <Touchable
              activeOpacity={0.8}
              disabled={pageIndex === urls.length - 1}
              onPress={() => goToPage(pageIndex + 1)}
              className="absolute items-center justify-center"
              style={{
                right: 16,
                top: containerHeight / 2 - PAGE_BTN / 2,
                width: PAGE_BTN,
                height: PAGE_BTN,
                borderRadius: PAGE_BTN / 2,
                backgroundColor: "#FFFFFF",
                opacity: pageIndex === urls.length - 1 ? 0.35 : 1,
                borderWidth: 1,
                borderColor: "#919EAB33",
              }}
            >
              <icons.arrow_forward_ios width={14} height={14} fill="#222222" />
            </Touchable>

            <View
              className="absolute self-center"
              style={{
                bottom: hasFooter ? 16 : adjustedBottom + 16,
                backgroundColor: "rgba(0,0,0,0.65)",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}
            >
              <Text
                className="font-inter-semibold text-white"
                style={{ fontSize: moderateScale(12) }}
              >
                {pageIndex + 1} / {urls.length}
              </Text>
            </View>
          </>
        )}
      </View>

      {showVerifiedCard ? (
        <View
          style={{ paddingBottom: adjustedBottom + 12 }}
          className="px-5 pt-4 bg-white border-t border-[#EEEFF1]"
        >
          <Touchable
            activeOpacity={0.85}
            onPress={() => {
              router.push({
                pathname: "/(prescription)/medicine-comparison",
                params: {
                  prescriptionOrderId: effectiveOrderId,
                  prescriptionId: prescriptionId,
                },
              });
            }}
            className="flex-row items-center bg-[#F1FEF8] border border-[#0F763533] rounded-xl p-4"
          >
            <View className="mr-3 bg-[#D1F2E1] rounded-full p-2 items-center justify-center">
              <icons.check_circle width={20} height={20} fill="#0F7635" />
            </View>
            <View className="flex-1 justify-center">
              <Text
                className="font-inter-bold text-[#111827]"
                style={{ fontSize: moderateScale(14) }}
              >
                Prescription Verified
              </Text>
              <Text
                className="font-inter-medium text-[#6A6A6A] mt-0.5"
                style={{ fontSize: moderateScale(12) }}
              >
                Your medicines are ready to order
              </Text>
            </View>
            <icons.arrow_forward_green width={16} height={16} />
          </Touchable>
        </View>
      ) : (
        showSelect && (
          <View
            className="flex-row gap-3 px-5 pt-3 bg-white border-t border-[#EEEFF1]"
            style={{ paddingBottom: adjustedBottom + 12 }}
          >
            <Touchable
              onPress={handleSelect}
              activeOpacity={0.85}
              className="flex-1 items-center justify-center py-3.5 rounded-lg bg-brand-primary"
            >
              <Text
                className="font-inter-semibold text-white"
                style={{ fontSize: moderateScale(14) }}
              >
                Select
              </Text>
            </Touchable>
          </View>
        )
      )}
    </View>
  );
};
