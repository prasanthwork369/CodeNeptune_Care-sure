import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";

interface ProfileUpdateCardProps {
  visible: boolean;
  onPress: () => void;
}

/**
 * Quiet, persistent entry point to the optional update.
 *
 * Driven by raw availability rather than the popup's dismissal state: once the
 * user taps "Maybe Later" the popup stops asking, and this row becomes the only
 * way back to updating before the next release.
 */
export const ProfileUpdateCard: React.FC<ProfileUpdateCardProps> = ({
  visible,
  onPress,
}) => {
  if (!visible) return null;

  return (
    // Each profile section owns its top margin (ProfileCoinsCard mt-[14px],
    // ProfileInfoList my-6). Without one this card sat flush against the coins
    // card above it. The gap below comes from ProfileInfoList's my-6.
    <View className="mx-4 mt-5">
      <Touchable
        onPress={onPress}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel="Update available. Tap to update CareSure."
        className="flex-row items-center bg-white rounded-lg border border-[#919EAB33] px-4 py-[15px]"
      >
        <View
          style={{
            width: exactScale(24),
            height: exactScale(24),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <icons.autorenew width={exactScale(24)} height={exactScale(24)} />
        </View>

        <View style={{ flex: 1, marginLeft: exactScale(14) }}>
          <View
            className="flex-row items-center"
            style={{ gap: exactScale(8) }}
          >
            <Text
              className="font-inter-bold text-brand-text"
              style={{ fontSize: moderateScale(15) }}
            >
              Update Available
            </Text>
            <View
              style={{
                backgroundColor: "#F4511E",
                borderRadius: exactScale(4),
                paddingHorizontal: exactScale(6),
                paddingVertical: exactScale(2),
              }}
            >
              <Text
                className="font-inter-bold text-white"
                style={{ fontSize: moderateScale(10) }}
              >
                NEW
              </Text>
            </View>
          </View>
          <Text
            className="font-inter-medium text-brand-subtext"
            style={{ fontSize: moderateScale(13), marginTop: exactScale(2) }}
            numberOfLines={1}
          >
            Enjoy a more seamless experience
          </Text>
        </View>

        <icons.arrow_forward_gray width={16} height={16} />
      </Touchable>
    </View>
  );
};
