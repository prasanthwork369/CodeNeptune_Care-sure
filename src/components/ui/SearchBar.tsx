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
  rightSlot?: React.ReactNode;
}

const containerStyle = {
  shadowColor: "#919EAB",
  shadowOffset: { width: 0, height: exactScale(16) },
  shadowRadius: 20,
  shadowOpacity: 0.04,
  elevation: 1,
} as const;

// Memoised: wraps an animated cycler inside the frequently re-rendering feed.
export const SearchBar: React.FC<SearchBarProps> = React.memo(
  ({
    placeholder,
    words,
    useHomeCycler = false,
    onSearch,
    onPress,
    rightSlot,
  }) => {
    const [isPressed, setIsPressed] = useState(false);
    const [query, setQuery] = useState("");

    if (onPress) {
      return (
        <Touchable
          testID="home-search-bar"
          onPress={onPress}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          activeOpacity={1}
          accessibilityRole="search"
          accessibilityLabel={placeholder}
        >
          <View
            style={[
              containerStyle,
              { backgroundColor: isPressed ? "#F5F7F9" : "#FFFFFF" },
            ]}
            className="flex-row items-center rounded-md px-4 py-3 border border-[#919EAB33]"
          >
            <icons.search width={SEARCH_ICON_SIZE} height={SEARCH_ICON_SIZE} />
            <View className="flex-1 ml-2 py-1.5 overflow-hidden">
              {useHomeCycler ? (
                <HomeSearchCycler />
              ) : words && words.length > 0 ? (
                <TextCycler
                  words={words}
                  lineHeight={PLACEHOLDER_LINE_HEIGHT}
                  style={s.cyclerText}
                  className="font-inter-medium text-brand-subtext"
                />
              ) : (
                <Text
                  style={s.placeholderText}
                  className="font-inter-medium text-brand-subtext"
                  numberOfLines={1}
                >
                  {placeholder}
                </Text>
              )}
            </View>
            {rightSlot && <View className="ml-2">{rightSlot}</View>}
          </View>
        </Touchable>
      );
    }

    return (
      <View
        style={containerStyle}
        className="flex-row items-center bg-white rounded-md px-4 py-3.5 border border-[#919EAB33]"
      >
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
          className="flex-1 font-inter text-brand-text py-1.5 ml-2"
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
        {rightSlot && <View className="ml-2">{rightSlot}</View>}
      </View>
    );
  },
);
SearchBar.displayName = "SearchBar";
