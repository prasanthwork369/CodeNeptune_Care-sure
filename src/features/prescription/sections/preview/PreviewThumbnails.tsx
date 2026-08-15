import { icons } from "@/src/constants/icons";
import { PreviewThumbnailsProps } from "@/src/features/prescription/types";
import { AppButton } from "@/src/components/ui/AppButton";
import { StickyFooter } from "@/src/components/ui/StickyFooter";
import { Touchable } from "@/src/components/ui/Touchable";
import { uploadKeyOf } from "@/src/hooks/ui/usePrescriptionUploader";
import type { FileUploadState } from "@/src/hooks/ui/usePrescriptionUploader";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { moderateScale } from "@/src/utils/exactScale";

const isPdf = (uri: string, type?: string) =>
  type === "application/pdf" || uri.toLowerCase().endsWith(".pdf");

// Sits over the thumbnail so a successful file stays visible rather than being hidden.
const StatusBadge: React.FC<{
  state: FileUploadState;
  onRetry?: () => void;
}> = ({ state, onRetry }) => {
  if (state.status === "success") {
    return (
      <View className="absolute bottom-1 left-1 right-1 bg-[#0F7635] rounded-md items-center py-0.5">
        <Text
          className="text-white font-inter-semibold"
          style={{ fontSize: moderateScale(9) }}
        >
          ✓ Uploaded
        </Text>
      </View>
    );
  }
  if (state.status === "error") {
    return (
      <Touchable
        onPress={onRetry}
        className="absolute bottom-1 left-1 right-1 bg-[#E02D5B] rounded-md items-center py-0.5"
      >
        <Text
          className="text-white font-inter-semibold"
          style={{ fontSize: moderateScale(9) }}
        >
          Retry
        </Text>
      </Touchable>
    );
  }
  if (state.status === "uploading") {
    return (
      <View className="absolute bottom-1 left-1 right-1 bg-[#1A1C1E]/80 rounded-md items-center py-0.5">
        <Text
          className="text-white font-inter-semibold"
          style={{ fontSize: moderateScale(9) }}
        >
          {state.progress > 0 ? `${state.progress}%` : "Uploading…"}
        </Text>
      </View>
    );
  }
  return (
    <View className="absolute bottom-1 left-1 right-1 bg-[#6A6A6A]/80 rounded-md items-center py-0.5">
      <Text
        className="text-white font-inter-semibold"
        style={{ fontSize: moderateScale(9) }}
      >
        Waiting
      </Text>
    </View>
  );
};

export const PreviewThumbnails: React.FC<PreviewThumbnailsProps> = ({
  items,
  activeIndex,
  maxFiles,
  onAdd,
  onSelect,
  onRemove,
  onSubmit,
  submitting,
  safeAreaBottom,
  uploadStates,
  onRetry,
}) => {
  return (
    <View
      className="bg-white"
      style={{
        borderTopWidth: 1,
        borderTopColor: "#919EAB33",
        shadowColor: "#919EAB33",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingVertical: 20,
          gap: 12,
        }}
      >
        {items.length < maxFiles && (
          <Touchable
            onPress={onAdd}
            disabled={submitting}
            className="w-[82px] h-[82px] rounded-[14px] border border-[#919EAB33] bg-[#FCFDFF] items-center justify-center"
            style={{ opacity: submitting ? 0.5 : 1 }}
            activeOpacity={0.7}
          >
            <icons.add_photo width={28} height={28} />
          </Touchable>
        )}
        {items.map((item, index) => {
          const state = uploadStates?.[uploadKeyOf(item)];
          return (
            <Touchable
              key={index}
              onPress={() => onSelect(index)}
              activeOpacity={0.8}
            >
              <View
                className="w-[82px] h-[82px] rounded-lg overflow-hidden"
                style={{
                  borderWidth: activeIndex === index ? 2 : 1,
                  borderColor: activeIndex === index ? "#0F7635" : "#919EAB33",
                  backgroundColor: "#F9FAFB",
                }}
              >
                {isPdf(item.localUri, item.type) ? (
                  <View className="flex-1 items-center justify-center">
                    <icons.upload_file width={24} height={24} />
                    <Text
                      className="font-inter-bold text-[#1A1C1E] mt-1"
                      style={{ fontSize: moderateScale(8) }}
                    >
                      PDF
                    </Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: item.localUri }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                )}
                {state && (
                  <StatusBadge state={state} onRetry={() => onRetry?.(item)} />
                )}
              </View>
              {!submitting && (
                <Touchable
                  onPress={() => onRemove(index)}
                  className="absolute top-1.5 right-1.5 bg-white rounded-full w-5 h-5 items-center justify-center border border-[#919EAB33] z-30"
                  style={{ elevation: 2 }}
                >
                  <icons.close_small width={10} height={10} fill="#222222" />
                </Touchable>
              )}
            </Touchable>
          );
        })}
      </ScrollView>

      <StickyFooter
        safeAreaBottom={safeAreaBottom}
        contentStyle={{
          flexDirection: "row",
          alignItems: "center",
          maxWidth: undefined,
        }}
      >
        <Text
          className="font-inter-medium text-[#000000]"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          style={{
            flexShrink: 1,
            marginRight: 12,
            fontSize: moderateScale(14),
          }}
        >
          {items.length} Prescription
          {items.length !== 1 ? "s" : ""} Uploaded
        </Text>
        <AppButton
          title={submitting ? "Uploading..." : "Proceed"}
          disabled={submitting || items.length === 0}
          loading={submitting}
          style={{ flex: 1, minWidth: 136 }}
          onPress={onSubmit}
          accessibilityLabel="Proceed with uploaded prescriptions"
          accessibilityState={{
            disabled: submitting || items.length === 0,
            busy: submitting,
          }}
        />
      </StickyFooter>
    </View>
  );
};
