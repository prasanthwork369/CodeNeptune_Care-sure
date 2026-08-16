import { Touchable } from "@/src/components/ui/Touchable";
import { colors } from "@/src/constants/theme";
import { useNav } from "@/src/hooks/useNav";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Shown for any route the app can't match — a stale campaign deep link, a
 * mistyped shared URL, or a notification pointing at a removed screen.
 * Replaces Expo Router's unstyled "Unmatched Route" screen.
 */
export const NotFoundLayout: React.FC = () => {
  const router = useNav();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View
        className="flex-1 items-center justify-center"
        style={{ paddingHorizontal: exactScale(32) }}
      >
        <Text
          style={{
            fontSize: moderateScale(18),
            fontWeight: "700",
            color: "#333232",
            textAlign: "center",
          }}
        >
          Page not found
        </Text>
        <Text
          style={{
            fontSize: moderateScale(14),
            color: "#6A6A6A",
            textAlign: "center",
            marginTop: exactScale(8),
          }}
        >
          This link may have expired or moved. Let&apos;s get you back on track.
        </Text>

        {/* replace, not push: a cold-start deep link has no stack to return to. */}
        <Touchable
          onPress={() => router.replace("/")}
          activeOpacity={0.88}
          style={{
            backgroundColor: colors.primary,
            borderRadius: exactScale(12),
            paddingVertical: exactScale(14),
            paddingHorizontal: exactScale(32),
            marginTop: exactScale(24),
          }}
        >
          <Text
            style={{
              fontSize: moderateScale(15),
              fontWeight: "600",
              color: "#FFFFFF",
            }}
          >
            Go to Home
          </Text>
        </Touchable>
      </View>
    </SafeAreaView>
  );
};
