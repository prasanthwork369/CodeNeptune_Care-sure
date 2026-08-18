import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { useNav } from "@/src/hooks/useNav";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useRef } from "react";
import { Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { searchHeaderStyles as hs } from "@/src/features/search/search.styles";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

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
  const inputRef = useRef<TextInput>(null);

  // autoFocus only fires on mount, and returning from the product page doesn't
  // remount this screen — refocus so the keyboard comes back with it.
  useFocusEffect(
    useCallback(() => {
      if (!onQueryChange) return;
      // Android drops a focus() issued mid-transition, so wait a frame or two.
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }, [onQueryChange]),
  );

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
                ref={inputRef}
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
              className="flex-1 font-inter-medium text-[#222222]"
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
            onPress={() => router.push("/(commerce)/cart")}
            style={{
              height: exactScale(60),
              width: exactScale(60),
              borderWidth: 1.05,
              borderColor: "#919EAB33",
              shadowColor: "#919EAB0A",
              shadowOffset: { width: 0, height: exactScale(6) },
              shadowRadius: exactScale(10),
              shadowOpacity: 0.1,
              elevation: 4,
            }}
            className="bg-white items-center justify-center rounded-[12px] relative"
          >
            <icons.Add_Cart width={30} height={30} />
            {cartCount > 0 && (
              <View
                style={{
                  minWidth: 20,
                  height: 20,
                  paddingHorizontal: 4,
                }}
                className="absolute -top-1 -right-1 rounded-full bg-[#C22923] items-center justify-center"
              >
                <Text
                  className="font-inter-bold text-white leading-none"
                  style={{ fontSize: moderateScale(11) }}
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
