import { TextCycler } from "@/src/components/ui/TextCycler";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { HomeSearchCycler } from "@/src/features/home/sections/HomeSearchCycler";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { styles as s, SEARCH_ICON_SIZE } from "./SearchBar.styles";
import { exactScale } from "@/src/utils/exactScale";

const PLACEHOLDER_LINE_HEIGHT = 18;

interface SearchBarProps {
  placeholder: string;
  words?: string[];
  useHomeCycler?: boolean;
  onSearch?: (text: string) => void;
  onPress?: () => void;
  onPressIn?: () => void;
  rightSlot?: React.ReactNode;
}

// Memoised: wraps an animated cycler inside the frequently re-rendering feed.
export const SearchBar: React.FC<SearchBarProps> = React.memo(
  ({
    placeholder,
    words,
    useHomeCycler = false,
    onSearch,
    onPress,
    onPressIn,
    rightSlot,
  }) => {
    const [isPressed, setIsPressed] = useState(false);
    const [query, setQuery] = useState("");

    if (onPress) {
      return (
        <Touchable
          testID="home-search-bar"
          onPress={onPress}
          onPressIn={() => {
            setIsPressed(true);
            onPressIn?.();
          }}
          onPressOut={() => setIsPressed(false)}
          activeOpacity={1}
          accessibilityRole="search"
          accessibilityLabel={placeholder}
        >
          <View
            style={[
              s.touchableContainer,
              { backgroundColor: isPressed ? "#F5F7F9" : "#FFFFFF" },
            ]}
          >
            <icons.search width={SEARCH_ICON_SIZE} height={SEARCH_ICON_SIZE} />
            <View style={s.cyclerWrapper}>
              {useHomeCycler ? (
                <HomeSearchCycler />
              ) : words && words.length > 0 ? (
                <TextCycler
                  words={words}
                  lineHeight={PLACEHOLDER_LINE_HEIGHT}
                  style={s.cyclerText}
                />
              ) : (
                <Text
                  style={s.placeholderText}
                  numberOfLines={1}
                >
                  {placeholder}
                </Text>
              )}
            </View>
            {rightSlot && <View style={s.rightSlotWrap}>{rightSlot}</View>}
          </View>
        </Touchable>
      );
    }

    return (
      <View style={s.inputContainer}>
        <icons.search width={SEARCH_ICON_SIZE} height={SEARCH_ICON_SIZE} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.subtext}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            onSearch?.(text);
          }}
          style={s.inputText}
        />
        {query.length > 0 && (
          <Touchable
            onPress={() => setQuery("")}
            hitSlop={{
              top: exactScale(8),
              bottom: exactScale(8),
              left: exactScale(8),
              right: exactScale(8),
            }}
          >
            <icons.close_dark
              width={exactScale(15)}
              height={exactScale(15)}
              fill="#6A6A6A"
            />
          </Touchable>
        )}
        {rightSlot && <View style={s.rightSlotWrap}>{rightSlot}</View>}
      </View>
    );
  },
);
SearchBar.displayName = "SearchBar";
