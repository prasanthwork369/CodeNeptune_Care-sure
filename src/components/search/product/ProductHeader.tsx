import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { Touchable } from "@/src/components/ui/Touchable";
import { HomeSearchCycler } from "@/src/components/home/sections/HomeSearchCycler";
import { useNav } from "@/src/hooks/useNav";
import React from "react";
import { Text, View, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ProductHeaderProps {
  cartCount?: number;
  query?: string;
  onQueryChange?: (text: string) => void;
  onSubmit?: () => void;
  isSearching?: boolean;
  onBack?: () => void;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({
  cartCount = 0,
  query,
  onQueryChange,
  onSubmit,
  isSearching = false,
  onBack,
}) => {
  const router = useNav();
  const insets = useSafeAreaInsets();
  const handleBack = onBack ?? (() => router.back());

  const [isFocused, setIsFocused] = React.useState(false);
  const showCycler = !!onQueryChange && !query && !isFocused;

  return (
    <View
      className="px-4 z-10 mb-2"
      style={{ paddingTop: Math.max(insets.top, 20) + 8 }}
    >
      <View className="flex-row items-stretch justify-between">
        <Touchable
          activeOpacity={onQueryChange ? 1 : 0.5}
          onPress={
            onQueryChange ? undefined : () => router.push("/search" as any)
          }
          style={{
            shadowColor: "#919EAB0A",
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 10,
            shadowOpacity: 0.1,
            elevation: 4,
            flex: 1,
            marginRight: 12,
          }}
          className="flex-row border border-[#919EAB33] items-center bg-white rounded-lg px-4 py-3.5"
        >
          <Touchable
            onPress={handleBack}
            className="mr-3 items-center justify-center"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <icons.arrow_back width={18} height={18} fill={colors.text} />
          </Touchable>

          {onQueryChange ? (
            <View style={{ flex: 1, justifyContent: "center" }}>
              {/* Cycling placeholder — visible only when input is empty */}
              {showCycler && (
                <View
                  pointerEvents="none"
                  style={{ position: "absolute", left: 0, right: 0 }}
                >
                  <HomeSearchCycler />
                </View>
              )}
              <TextInput
                value={query}
                onChangeText={onQueryChange}
                onSubmitEditing={onSubmit}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={
                  isFocused && !query
                    ? " Search medicines & health products"
                    : ""
                }
                placeholderTextColor="#6A6A6A"
                style={{
                  fontSize: 13,
                  fontFamily: "Inter",
                  color: "#222222",
                  padding: 0,
                  margin: 0,
                  height: 28,
                  lineHeight: 20,
                  includeFontPadding: false,
                }}
                autoFocus
                returnKeyType="search"
              />
            </View>
          ) : null}

          {!!query && onQueryChange && (
            <Touchable
              onPress={() => onQueryChange("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="ml-2"
            >
              <icons.close_small width={15} height={15} fill="#6A6A6A" />
            </Touchable>
          )}

          {!onQueryChange && (
            <Text
              className="flex-1 text-[15px] font-inter text-[#222222]"
              numberOfLines={1}
            >
              {query || "Search affordable substitute"}
            </Text>
          )}

          {!isSearching && (
            <Touchable
              onPress={() => router.push("/upload")}
              className="border-l border-[#919EAB33] pl-3 ml-1"
            >
              <icons.uploadActive width={22} height={22} />
            </Touchable>
          )}
        </Touchable>

        {isSearching && (
          <Touchable
            onPress={() => router.push("/(modal)/cart")}
            style={{
              elevation: 3,
              shadowColor: "#919EAB",
              shadowOpacity: 0.04,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 10 },
            }}
            className="bg-white items-center justify-center aspect-square rounded-[12px] relative"
          >
            <icons.Add_Cart width={24} height={24} />
            {cartCount > 0 && (
              <View className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full bg-[#C22923] items-center justify-center">
                <Text className="text-[9px] font-inter-bold text-white leading-none">
                  {cartCount}
                </Text>
              </View>
            )}
          </Touchable>
        )}
      </View>
    </View>
  );
};
