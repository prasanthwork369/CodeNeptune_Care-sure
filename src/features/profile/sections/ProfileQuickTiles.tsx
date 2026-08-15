import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import React from "react";
import { Text, View } from "react-native";
import { profileStyles as s } from "../profile.styles";

const QUICK_TILES = [
  { label: "My\nOrders", icon: "admin_meds", route: "/profile/orders" },
  {
    label: "Caresure\nWallet",
    icon: "account_balance_wallet_green",
    route: "/profile/wallet",
  },
  {
    label: "My\nPrescriptions",
    icon: "prescription_green",
    route: "/profile/orders/prescriptions",
  },
] as const;

export const ProfileQuickTiles: React.FC = () => {
  const router = useNav();

  return (
    <View className="flex-row mx-4 gap-[10px]" style={{ marginTop: -44 }}>
      {QUICK_TILES.map((tile) => {
        const Icon = icons[tile.icon];
        return (
          <Touchable
            key={tile.label}
            onPress={() => router.push(tile.route)}
            className="flex-1 bg-white rounded-xl py-[14px] items-center border border-[#919EAB33]"
          >
            <View className="w-11 h-11 items-center justify-center ">
              <Icon width={24} height={24} fill="#0F7635" />
            </View>
            <Text
              style={s.tileLabel}
              className="font-inter-medium text-brand-text text-center leading-4"
            >
              {tile.label}
            </Text>
          </Touchable>
        );
      })}
    </View>
  );
};
