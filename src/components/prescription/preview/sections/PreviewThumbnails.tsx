import { icons } from "@/src/constants/icons";
import { PreviewThumbnailsProps } from "@/src/types/prescription";
import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    View,
} from "react-native";

const isPdf = (uri: string, type?: string) =>
  type === "application/pdf" || uri.toLowerCase().endsWith(".pdf");

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
        {items.map((item, index) => (
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
                  <Text className="text-[8px] font-inter-bold text-[#1A1C1E] mt-1">
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
        ))}
      </ScrollView>

      <View
        className="px-3 py-4 border-t border-[#919EAB1A] flex-row items-center justify-between"
        style={{ paddingBottom: Math.max(safeAreaBottom + 8, 24) }}
      >
        <Text className="text-[14px] font-inter-medium text-[#000000]">
          {items.length} / {maxFiles} Prescription
          {items.length !== 1 ? "s" : ""} Uploaded
        </Text>
        <Touchable
          className="bg-[#0F7635] py-3.5 rounded-md flex-row items-center justify-center gap-x-2"
          activeOpacity={0.8}
          disabled={submitting || items.length === 0}
          style={{
            opacity: submitting || items.length === 0 ? 0.6 : 1,
            minWidth: 136,
            paddingHorizontal: 24,
          }}
          onPress={onSubmit}
        >
          {submitting && <ActivityIndicator size="small" color="#fff" />}
          <Text className="text-white text-[14px] font-inter-semibold">
            {submitting ? "Uploading..." : "Proceed"}
          </Text>
        </Touchable>
      </View>
    </View>
  );
};
