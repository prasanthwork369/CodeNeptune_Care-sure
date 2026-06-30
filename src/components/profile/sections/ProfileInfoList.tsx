import React from "react";
import { profileStyles as s } from "../profile.styles";
import { View, Text } from "react-native";
import { Touchable } from "@/src/components/ui/Touchable";
import { useNav } from "@/src/hooks/useNav";
import { icons } from "@/src/constants/icons";
import { INFO_ITEMS } from "@/src/constants/profiel_info";

interface ProfileInfoListProps {
  onLogout: () => void;
}

export const ProfileInfoList: React.FC<ProfileInfoListProps> = ({
  onLogout,
}) => {
  const router = useNav();

  return (
    <View className="mx-4 my-6">
      <Text
        style={s.sectionTitle}
        className="font-inter-bold text-brand-text mb-3"
      >
        Your Information
      </Text>
      <View className="bg-white rounded-xl overflow-hidden border border-[#919EAB33]">
        {INFO_ITEMS.map((item, index) => {
          const Icon = (icons as any)[item.icon];
          return (
            <View key={item.label}>
              <Touchable
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.6}
                className="flex-row items-center px-4 py-[15px]"
              >
                <Icon width={22} height={22} fill="#222222" />
                <Text
                  style={s.infoLabel}
                  className="flex-1 ml-[14px] font-inter-medium text-brand-text"
                >
                  {item.label}
                </Text>
                <icons.arrow_forward_gray width={16} height={16} />
              </Touchable>
              {index < INFO_ITEMS.length - 1 && (
                <View
                  style={{
                    marginHorizontal: 20,
                    borderTopWidth: 1,
                    borderColor: "#E5E7EB",
                    borderStyle: "dashed",
                  }}
                />
              )}
            </View>
          );
        })}

        <Touchable
          onPress={onLogout}
          className="flex-row items-center px-4 py-6 border-t border-[#919EAB33]"
          style={{ borderStyle: "dotted" }}
        >
          <icons.logout width={22} height={22} fill="#CA2B25" />
          <Text
            style={s.logoutText}
            className="ml-[10px] font-inter-semibold text-[#CA2B25]"
          >
            Logout
          </Text>
        </Touchable>
      </View>
    </View>
  );
};
