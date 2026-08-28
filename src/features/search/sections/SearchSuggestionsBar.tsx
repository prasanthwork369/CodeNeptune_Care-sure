import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { durations, easings } from "@/src/theme/animations";
import { exactScale } from "@/src/utils/exactScale";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { styles as s } from "./SearchSuggestionsBar.styles";

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
      style={[s.wrapper, containerStyle]}
      pointerEvents={visible ? "auto" : "none"}
      accessibilityRole="summary"
      accessibilityLabel="Related search suggestions"
    >
      <View
        style={s.innerRow}
        onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
      >
        {suggestions.map((suggestion, index) => (
          <Touchable
            key={`${suggestion}-${index}`}
            onPress={() => onSelect(suggestion)}
            style={s.suggestionItem}
            accessibilityRole="button"
            accessibilityLabel={`Search for ${suggestion}`}
          >
            <icons.search_grey width={exactScale(16)} height={exactScale(16)} />
            <Text numberOfLines={1} style={s.suggestionText}>
              {suggestion}
            </Text>
          </Touchable>
        ))}
      </View>
    </Animated.View>
  );
};
