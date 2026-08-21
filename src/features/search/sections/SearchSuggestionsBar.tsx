import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";

interface SearchSuggestionsBarProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export const SearchSuggestionsBar: React.FC<SearchSuggestionsBarProps> = ({
  suggestions,
  onSelect,
}) => {
  if (suggestions.length === 0) return null;

  return (
    <View
      className="border-b border-[#919EAB1A] bg-white pb-2"
      accessibilityRole="summary"
      accessibilityLabel="Related search suggestions"
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
  );
};
