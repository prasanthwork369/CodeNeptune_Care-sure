import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { useNav } from "@/src/hooks/useNav";
import { exactScale } from "@/src/utils/exactScale";
import React, { useRef } from "react";
import { Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles as s } from "./ProductHeader.styles";

interface ProductHeaderProps {
  cartCount?: number;
  query?: string;
  onQueryChange?: (text: string) => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  isSearching?: boolean;
  onBack?: () => void;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({
  cartCount = 0,
  query,
  onQueryChange,
  onSubmit,
  onFocus,
  isSearching = false,
  onBack,
}) => {
  const router = useNav();
  const insets = useSafeAreaInsets();
  const handleBack = onBack ?? (() => router.back());
  const inputRef = useRef<TextInput>(null);

  return (
    <View
      style={[
        s.outerPad,
        { paddingTop: Math.max(insets.top, exactScale(20)) + exactScale(8) },
      ]}
    >
      <View style={s.row}>
        <Touchable
          activeOpacity={onQueryChange ? 1 : 0.5}
          onPress={onQueryChange ? undefined : () => router.push("/search")}
          style={s.searchBox}
        >
          <Touchable
            onPress={handleBack}
            style={s.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <icons.arrow_back width={exactScale(18)} height={exactScale(18)} fill={colors.text} />
          </Touchable>

          {onQueryChange ? (
            <View style={s.inputWrap}>
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={onQueryChange}
                onSubmitEditing={onSubmit}
                onFocus={onFocus}
                placeholder="Search medicines & health products"
                placeholderTextColor="#6A6A6A"
                style={s.inputText}
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
              style={s.clearBtn}
            >
              <icons.close_dark width={exactScale(15)} height={exactScale(15)} fill="#6A6A6A" />
            </Touchable>
          )}

          {!onQueryChange && (
            <Text style={s.queryText} numberOfLines={1}>
              {query || "Search affordable substitute"}
            </Text>
          )}

          {!isSearching && (
            <Touchable
              onPress={() => router.push("/upload")}
              style={s.uploadBtn}
            >
              <icons.uploadActive width={exactScale(22)} height={exactScale(22)} />
            </Touchable>
          )}
        </Touchable>

        {isSearching && (
          <Touchable
            onPress={() => router.push("/(commerce)/cart")}
            style={s.cartBtn}
          >
            <icons.Add_Cart width={exactScale(30)} height={exactScale(30)} />
            {cartCount > 0 && (
              <View style={s.cartBadge}>
                <Text style={s.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </Touchable>
        )}
      </View>
    </View>
  );
};
