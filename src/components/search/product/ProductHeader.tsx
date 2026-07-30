import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { useNav } from "@/src/hooks/useNav";
import React from "react";
import { Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { searchHeaderStyles as hs } from "@/src/components/search/search.styles";
import { moderateScale } from "@/src/utils/exactScale";

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

  return (
    <View
      className="px-4 z-10 mb-2"
      style={{ paddingTop: Math.max(insets.top, 20) + 8 }}
    >
      <View className="flex-row items-stretch justify-between">
        <Touchable
          activeOpacity={onQueryChange ? 1 : 0.5}
          onPress={onQueryChange ? undefined : () => router.push("/search")}
          style={[hs.box, { flex: 1, marginRight: 12 }]}
          className="flex-row items-center bg-white"
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
              <TextInput
                value={query}
                onChangeText={onQueryChange}
                onSubmitEditing={onSubmit}
                placeholder="Search medicines & health products"
                placeholderTextColor="#6A6A6A"
                style={hs.inputText}
                textAlignVertical="center"
                allowFontScaling={false}
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
              <icons.close_dark width={15} height={15} fill="#6A6A6A" />
            </Touchable>
          )}

          {!onQueryChange && (
            <Text
              className="flex-1 font-inter text-[#222222]"
              style={{ fontSize: moderateScale(15) }}
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
            onPress={() => router.push("/(stack)/cart")}
            style={{
              elevation: 3,
              shadowColor: "#919EAB",
              shadowOpacity: 0.04,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 10 },
            }}
            className="bg-white items-center justify-center aspect-square rounded-[12px] relative"
          >
            <icons.Add_Cart width={30} height={30} />
            {cartCount > 0 && (
              <View className="absolute -top-1 -right-1 w-[20px] h-[20px] rounded-full bg-[#C22923] items-center justify-center">
                <Text
                  className="font-inter-bold text-white leading-none"
                  style={{ fontSize: moderateScale(12) }}
                >
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
