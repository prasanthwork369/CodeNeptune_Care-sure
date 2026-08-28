import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { FrequentSubstitutes } from "@/src/features/home/sections";
import { useLastMinuteBuy } from "@/src/features/product/hooks/useFeaturedMedicines";
import { ApiSearchHistoryItem } from "@/src/features/search/types";
import { verticalScale } from "@/src/utils/exactScale";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { styles as s } from "./SearchRecentSection.styles";

const DeleteBadge = ({ onPress }: { onPress: () => void }) => (
  <Touchable
    onPress={onPress}
    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
    style={s.deleteBadge}
  >
    <Text style={s.deleteBadgeText}>✕</Text>
  </Touchable>
);

export const SearchRecentSection = React.memo(
  ({
    history,
    trending,
    onTermPress,
    onClear,
    isClearing = false,
    onDeleteHistoryItem,
    onProductPress,
    showFrequent = true,
  }: {
    history: ApiSearchHistoryItem[];
    trending: string[];
    onTermPress: (term: string) => void;
    onClear: () => void;
    isClearing?: boolean;
    onDeleteHistoryItem: (id: string) => void;
    onProductPress: (id: string) => void;
    showFrequent?: boolean;
  }) => {
    const { products: lastMinuteBuy = [] } = useLastMinuteBuy();
    const [hiddenTrending, setHiddenTrending] = useState<Set<string>>(
      new Set(),
    );
    const visibleTrending = trending.filter((t) => !hiddenTrending.has(t));

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.scrollContent}
      >
        {history.length > 0 && (
          <View style={s.historySectionWrap}>
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>Recent Searches</Text>
              <Touchable
                onPress={onClear}
                disabled={isClearing}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {isClearing ? (
                  <ActivityIndicator size="small" color="#0F7635" />
                ) : (
                  <Text style={s.clearBtn}>Clear All</Text>
                )}
              </Touchable>
            </View>
            <View style={s.chipRow}>
              {history.map((item) => (
                <View key={item.id} style={s.chipWrapper}>
                  <Touchable
                    onPress={() => onTermPress(item.query)}
                    style={s.chipTouchable}
                  >
                    <icons.resent width={14} height={14} fill="#6A6A6A" />
                    <Text style={s.chipText}>{item.query}</Text>
                  </Touchable>
                  <DeleteBadge onPress={() => onDeleteHistoryItem(item.id)} />
                </View>
              ))}
            </View>
          </View>
        )}

        {visibleTrending.length > 0 && (
          <View style={s.historySectionWrap}>
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>Trending Search</Text>
            </View>
            <View style={s.chipRow}>
              {visibleTrending.map((term) => (
                <View key={term} style={s.chipWrapper}>
                  <Touchable
                    onPress={() => onTermPress(term)}
                    style={s.chipTouchable}
                  >
                    <icons.fire width={13} height={13} />
                    <Text style={s.chipText}>{term}</Text>
                  </Touchable>
                  <DeleteBadge
                    onPress={() =>
                      setHiddenTrending((prev) => new Set([...prev, term]))
                    }
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={[s.frequentWrap, { paddingTop: verticalScale(30) }]}>
          {showFrequent && lastMinuteBuy.length > 0 && (
            <FrequentSubstitutes
              substitutes={lastMinuteBuy}
              title="Before you go"
              onProductPress={onProductPress}
            />
          )}
        </View>
      </ScrollView>
    );
  },
);

SearchRecentSection.displayName = "SearchRecentSection";
