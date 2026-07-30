import React from "react";
import { View, Text, TextInput } from "react-native";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { PatientHealthProblemProps } from "@/src/types/patient";
import { RemoteIcon } from "@/src/components/ui/RemoteIcon";
import { resolveAssetUrl } from "@/src/utils/urls";
import { moderateScale } from "@/src/utils/exactScale";

export const PatientHealthProblem: React.FC<PatientHealthProblemProps> = ({
  selected,
  onPress,
  customText,
  setCustomText,
}) => {
  return (
    <View className="mb-4">
      <Text
        className="font-inter-semibold text-[#1A1C1E] mb-2"
        style={{ fontSize: moderateScale(13) }}
      >
        Select Your Health Problem
      </Text>
      <Touchable
        onPress={onPress}
        className="flex-row items-center justify-between border border-[#919EAB33] rounded-md px-[14px] py-[10px] bg-white"
        activeOpacity={0.85}
      >
        {selected ? (
          <View className="flex-row items-center gap-[10px]">
            {selected.icon &&
            (selected.icon.startsWith("http") ||
              selected.icon.startsWith("/") ||
              selected.icon.includes(".")) ? (
              <RemoteIcon
                uri={resolveAssetUrl(selected.icon)}
                size={24}
                style={{ borderRadius: 12 }}
              />
            ) : (
              <Text
                className="leading-[24px]"
                style={{ fontSize: moderateScale(20) }}
              >
                {selected.icon}
              </Text>
            )}
            <Text
              className="font-inter-medium text-[#1A1C1E]"
              style={{ fontSize: moderateScale(14) }}
            >
              {selected.label}
            </Text>
          </View>
        ) : (
          <Text
            className="font-inter-medium text-[#6A6A6A]"
            style={{ fontSize: moderateScale(14) }}
          >
            Select
          </Text>
        )}
        <icons.down_arrow width={16} height={16} />
      </Touchable>

      {selected?.id === "other" && setCustomText && (
        <View className="mt-2">
          <TextInput
            value={customText}
            onChangeText={setCustomText}
            placeholder="Type the health problem..."
            placeholderTextColor="#6A6A6A"
            className="w-full font-inter text-[#1A1C1E] bg-white border border-[#919EAB33] rounded-md px-[14px] py-3"
            style={{ fontSize: moderateScale(14) }}
          />
        </View>
      )}
    </View>
  );
};
