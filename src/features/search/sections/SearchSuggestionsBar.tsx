import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { durations, easings } from "@/src/theme/animations";
import { moderateScale } from "@/src/utils/exactScale";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface SearchSuggestionsBarProps {
  suggestions: string[];
  // Collapses/fades the bar instead of it being mounted/unmounted outright —
  // an instant unmount snapped the results list up the moment scroll started.
  visible: boolean;
  onSelect: (suggestion: string) => void;
}

export const SearchSuggestionsBar: React.FC<SearchSuggestionsBarProps> = ({
  suggestions,
  visible,
  onSelect,
}) => {
  // Natural content height, remeasured whenever the suggestion rows change —
  // the animated wrapper interpolates toward this instead of a guessed value.
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: durations.fast,
      easing: easings.out,
    });
  }, [visible, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    height: contentHeight * progress.value,
  }));

  if (suggestions.length === 0) return null;

  return (
    <Animated.View
      testID="search-suggestions-bar"
      style={[{ overflow: "hidden" }, containerStyle]}
      pointerEvents={visible ? "auto" : "none"}
      accessibilityRole="summary"
      accessibilityLabel="Related search suggestions"
    >
      <View
        className="border-b border-[#919EAB1A] bg-white pb-2"
        onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
      >
        {suggestions.map((suggestion, index) => (
          <Touchable
            key={`${suggestion}-${index}`}
            onPress={() => onSelect(suggestion)}
            className="flex-row items-center px-4 py-3 gap-x-2.5"
            accessibilityRole="button"
            accessibilityLabel={`Search for ${suggestion}`}
          >
            <icons.search_grey width={16} height={16} />
            <Text
              numberOfLines={1}
              className="flex-1 font-inter-medium text-[#222222]"
              style={{ fontSize: moderateScale(13) }}
            >
              {suggestion}
            </Text>
          </Touchable>
        ))}
      </View>
    </Animated.View>
  );
};
