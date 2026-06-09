import { FrequentSubstitutes } from '@/src/components/home/sections';
import { icons } from '@/src/constants/icons';
import { ApiSearchHistoryItem } from '@/src/api/search.api';
import { useFrequentlyOrdered } from '@/src/hooks/queries/useOrders';
import { Touchable } from '@/src/components/ui/Touchable';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { searchRecentStyles as s } from '../search.styles';

const DeleteBadge = ({ onPress }: { onPress: () => void }) => (
    <Touchable
        onPress={onPress}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        style={{
            position: 'absolute',
            top: 3,
            right: 1,
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: '#FFE4E4',
            borderWidth: 1,
            borderColor: '#FFBDBD',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
        }}
    >
        <Text style={{ fontSize: 7, color: '#E53E3E', fontWeight: '700', lineHeight: 9 }}>✕</Text>
    </Touchable>
);

export const SearchRecentSection = ({
    history,
    trending,
    onTermPress,
    onClear,
    onDeleteHistoryItem,
    onProductPress,
    onViewAllFrequent,
    showFrequent = true,
}: {
    history: ApiSearchHistoryItem[];
    trending: string[];
    onTermPress: (term: string) => void;
    onClear: () => void;
    onDeleteHistoryItem: (id: string) => void;
    onProductPress: (id: string) => void;
    onViewAllFrequent?: () => void;
    showFrequent?: boolean;
}) => {
    const { data: frequentlyOrdered = [] } = useFrequentlyOrdered({ limit: 5 });
    const [hiddenTrending, setHiddenTrending] = useState<Set<string>>(new Set());
    const visibleTrending = trending.filter(t => !hiddenTrending.has(t));

    return (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
            {history.length > 0 && (
                <View className="px-4 pt-5">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text style={s.sectionTitle} className="font-inter-bold text-brand-text">Recent Searches</Text>
                        <Touchable onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Text style={s.clearBtn} className="font-inter-semibold text-brand-primary">Clear All</Text>
                        </Touchable>
                    </View>
                    <View className="flex-row flex-wrap gap-2">
                        {history.map((item) => (
                            <View key={item.id} style={{ position: 'relative', paddingTop: 8, paddingRight: 8 }}>
                                <Touchable
                                    onPress={() => onTermPress(item.query)}
                                    className="flex-row items-center bg-white border border-[#919EAB33] rounded-sm px-3 py-1.5 gap-x-1.5"
                                >
                                    <icons.resent width={14} height={14} fill="#6A6A6A" />
                                    <Text style={s.chipText} className="font-inter-medium text-brand-text">{item.query}</Text>
                                </Touchable>
                                <DeleteBadge onPress={() => onDeleteHistoryItem(item.id)} />
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {visibleTrending.length > 0 && (
                <View className="px-4 pt-5">
                    <View className="flex-row items-center gap-x-1.5 mb-3">
                        <icons.trend_up width={16} height={16} />
                        <Text style={s.sectionTitle} className="font-inter-bold text-brand-text">Trending Search</Text>
                    </View>
                    <View className="flex-row flex-wrap gap-2">
                        {visibleTrending.map((term) => (
                            <View key={term} style={{ position: 'relative', paddingTop: 8, paddingRight: 8 }}>
                                <Touchable
                                    onPress={() => onTermPress(term)}
                                    className="flex-row items-center bg-white border border-[#919EAB33] rounded-sm px-3 py-1.5 gap-x-1.5"
                                >
                                    <icons.trend_up width={13} height={13} />
                                    <Text style={s.chipText} className="font-inter-medium text-brand-text">{term}</Text>
                                </Touchable>
                                <DeleteBadge onPress={() => setHiddenTrending(prev => new Set([...prev, term]))} />
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {showFrequent && frequentlyOrdered.length > 0 && (
                <FrequentSubstitutes substitutes={frequentlyOrdered} onProductPress={onProductPress} onViewAll={onViewAllFrequent} />
            )}
        </ScrollView>
    );
};
