import { Touchable } from "@/src/components/ui/Touchable";
import { moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

interface SearchSuggestionsBarProps {
  suggestions: string[];
  isLoading?: boolean;
  onSelect: (suggestion: string) => void;
}

export const SearchSuggestionsBar: React.FC<SearchSuggestionsBarProps> = ({
  suggestions,
  isLoading = false,
  onSelect,
}) => {
  if (!isLoading && suggestions.length === 0) return null;

  return (
    <View
      className="border-b border-[#919EAB1A] bg-[#FAFFEF]"
      accessibilityRole="summary"
      accessibilityLabel="Related search suggestions"
    >
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Text
          className="font-inter-bold uppercase text-[#6A6A6A]"
          style={{ fontSize: moderateScale(11), letterSpacing: 0.7 }}
        >
          Related Suggestions
        </Text>
        {isLoading && (
          <ActivityIndicator
            size="small"
            color="#0F7635"
            style={{ marginLeft: 8 }}
          />
        )}
      </View>

      {suggestions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 12,
            gap: 8,
          }}
        >
          {suggestions.map((suggestion, index) => (
            <Touchable
              key={`${suggestion}-${index}`}
              onPress={() => onSelect(suggestion)}
              className="rounded-full border border-[#919EAB33] bg-white px-3 py-2"
              accessibilityRole="button"
              accessibilityLabel={`Search for ${suggestion}`}
            >
              <Text
                numberOfLines={1}
                className="font-inter-semibold text-[#222222]"
                style={{ fontSize: moderateScale(12) }}
              >
                {suggestion}
              </Text>
            </Touchable>
          ))}
        </ScrollView>
      )}
    </View>
  );
};
