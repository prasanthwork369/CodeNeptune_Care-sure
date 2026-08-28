import { icons } from "@/src/constants/icons";
import { PreviewThumbnailsProps } from "@/src/features/prescription/types";
import { AppButton } from "@/src/components/ui/AppButton";
import { StickyFooter } from "@/src/components/ui/StickyFooter";
import { Touchable } from "@/src/components/ui/Touchable";
import { uploadKeyOf } from "../../hooks/usePrescriptionUploader";
import type { FileUploadState } from "../../hooks/usePrescriptionUploader";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { styles as s } from "./preview.styles";

const isPdf = (uri: string, type?: string) =>
  type === "application/pdf" || uri.toLowerCase().endsWith(".pdf");

// Sits over the thumbnail so a successful file stays visible rather than being hidden.
const StatusBadge: React.FC<{
  state: FileUploadState;
  onRetry?: () => void;
}> = ({ state, onRetry }) => {
  if (state.status === "success") {
    return (
      <View style={s.statusBadgeSuccess}>
        <Text style={s.statusBadgeText}>
          ✓ Uploaded
        </Text>
      </View>
    );
  }
  if (state.status === "error") {
    return (
      <Touchable
        onPress={onRetry}
        style={s.statusBadgeError}
      >
        <Text style={s.statusBadgeText}>
          Retry
        </Text>
      </Touchable>
    );
  }
  if (state.status === "uploading") {
    return (
      <View style={s.statusBadgeUploading}>
        <Text style={s.statusBadgeText}>
          {state.progress > 0 ? `${state.progress}%` : "Uploading…"}
        </Text>
      </View>
    );
  }
  return (
    <View style={s.statusBadgeWaiting}>
      <Text style={s.statusBadgeText}>
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
    <View style={s.thumbnailsRoot}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.thumbnailsScrollContent}
      >
        {items.length < maxFiles && (
          <Touchable
            onPress={onAdd}
            disabled={submitting}
            style={[s.addPhotoBtn, { opacity: submitting ? 0.5 : 1 }]}
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
                style={[
                  s.thumbBox,
                  {
                    borderWidth: activeIndex === index ? 2 : 1,
                    borderColor: activeIndex === index ? "#0F7635" : "#919EAB33",
                  },
                ]}
              >
                {isPdf(item.localUri, item.type) ? (
                  <View style={s.pdfThumbBox}>
                    <icons.upload_file width={24} height={24} />
                    <Text style={s.pdfThumbText}>
                      PDF
                    </Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: item.localUri }}
                    style={s.thumbImage}
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
                  style={s.removeThumbBtn}
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
          maxWidth: undefined,
        }}
      >
        <Text
          style={s.footerTitle}
          numberOfLines={1}
        >
          {items.length} Prescription
          {items.length !== 1 ? "s" : ""} Uploaded
        </Text>
        <AppButton
          title={submitting ? "Uploading..." : "Proceed"}
          disabled={submitting || items.length === 0}
          loading={submitting}
          style={s.proceedBtnFull}
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
