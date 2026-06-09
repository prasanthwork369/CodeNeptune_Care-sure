import { HEALTH_PROBLEMS, HealthProblem } from '@/src/constants/data';
import { icons } from '@/src/constants/icons';
import { Touchable } from '@/src/components/ui/Touchable';
import { BaseBottomSheet } from '@/src/components/ui/BaseBottomSheet';
import React, { useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HealthProblemSheetProps {
    isVisible: boolean;
    selected: HealthProblem | null;
    onSelect: (problem: HealthProblem) => void;
    onClose: () => void;
}

export const HealthProblemSheet: React.FC<HealthProblemSheetProps> = ({
    isVisible, selected, onSelect, onClose,
}) => {
    const { bottom } = useSafeAreaInsets();
    const [query, setQuery] = useState('');

    const filtered = query.trim()
        ? HEALTH_PROBLEMS.filter(p => p.label.toLowerCase().includes(query.toLowerCase()))
        : HEALTH_PROBLEMS;

    const handleSelect = (item: HealthProblem) => {
        onSelect(item);
        setQuery('');
        onClose();
    };

    return (
        <BaseBottomSheet
            isVisible={isVisible}
            onClose={onClose}
            showCloseButton={false}
            maxHeightPercent={75}
            pt={8}
            px={0}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 }}>
                <Text style={{ fontSize: 17, fontFamily: 'Inter-Bold', color: '#1A1C1E' }}>Select Health Problem</Text>
                <Touchable onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <icons.close_icon width={18} height={18} fill="#6A6A6A" />
                </Touchable>
            </View>

            <View style={{ marginHorizontal: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, backgroundColor: '#fff' }}>
                <icons.search width={16} height={16} />
                <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search health problem..."
                    placeholderTextColor="#919EAB"
                    style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 14, fontFamily: 'Inter', color: '#1A1C1E' }}
                />
            </View>

            <FlatList
                data={filtered}
                numColumns={3}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: Math.max(bottom, 16) + 8 }}
                columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                    const isSelected = selected?.id === item.id;
                    return (
                        <Touchable activeOpacity={0.8} onPress={() => handleSelect(item)}
                            style={{ flex: 1, borderRadius: 14, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, gap: 8, borderWidth: isSelected ? 2 : 1, borderColor: isSelected ? '#0F7635' : '#E5E7EB', backgroundColor: isSelected ? '#F0FFF6' : '#fff' }}>
                            <View style={{ position: 'relative' }}>
                                <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? '#fff' : '#F8F9FA' }}>
                                    <Text style={{ fontSize: 22, lineHeight: 28 }}>{item.emoji}</Text>
                                </View>
                                {isSelected && (
                                    <View style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#0F7635', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }}>
                                        <Text style={{ color: '#fff', fontSize: 10, fontFamily: 'Inter-Bold' }}>✓</Text>
                                    </View>
                                )}
                            </View>
                            <Text numberOfLines={2} style={{ fontSize: 13, textAlign: 'center', lineHeight: 16, fontFamily: isSelected ? 'Inter-SemiBold' : 'Inter-Medium', color: isSelected ? '#0F7635' : '#1A1C1E' }}>
                                {item.label}
                            </Text>
                        </Touchable>
                    );
                }}
            />
        </BaseBottomSheet>
    );
};
