import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import * as Application from "expo-application";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

export const AboutLayout: React.FC = () => {
  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="About App" />

      <View className="flex-1 items-center justify-center gap-y-3 px-8">
        <Image
          source={require("@/assets/images/icon.png")}
          style={{ width: 100, height: 100, borderRadius: 22 }}
          contentFit="contain"
        />

        <Text className="font-inter-bold text-[#212B36] text-xl mt-2">
          CareSure
        </Text>

        <Text className="font-inter-semibold text-[#919EAB] text-sm">
          Your trusted online pharmacy
        </Text>

        <View className="items-center mt-4 gap-y-1">
          <Text className="font-inter-bold text-[#637381] text-xs">
            App Version
          </Text>
          <Text className="font-inter-semibold text-[#212B36] text-sm">
            v{Application.nativeApplicationVersion ?? "—"} (
            {Application.nativeBuildVersion ?? "—"})
          </Text>
        </View>

        <Text className="font-inter-semibold text-[#6A6A6A] text-xs mt-6">
          © {new Date().getFullYear()} CareSure. All rights reserved.
        </Text>
      </View>
    </View>
  );
};
