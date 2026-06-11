import { HealthProblem } from '@/src/api/health-problem.api';
import { icons } from '@/src/constants/icons';
import { Touchable } from '@/src/components/ui/Touchable';
import { GorhomBottomSheet } from '@/src/components/ui/GorhomBottomSheet';
import { BottomSheetFlatList, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHealthProblems } from '@/src/hooks/queries/useHealthProblems';

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
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [customText, setCustomText] = useState('');
    const { data: healthProblems, isLoading } = useHealthProblems({ isActive: true });

    const OTHER_OPTION: HealthProblem = {
        id: 'other',
        slug: 'other',
        label: 'Other',
        icon: '➕',
        description: null,
        sortOrder: 9999,
        isActive: true,
    };

    const activeProblems = healthProblems ? [...healthProblems, OTHER_OPTION] : [OTHER_OPTION];

    const filtered = query.trim()
        ? activeProblems.filter(p => p.label.toLowerCase().includes(query.toLowerCase()))
        : activeProblems;

    const handleSelect = (item: HealthProblem) => {
        if (item.id === 'other') {
            setIsCustomMode(true);
            return;
        }
        onSelect(item);
        setQuery('');
        onClose();
    };

    const handleCustomSubmit = () => {
        if (customText.trim()) {
            onSelect({
                ...OTHER_OPTION,
                id: `custom_${Date.now()}`,
                label: customText.trim(),
                icon: '✍️'
            });
            setIsCustomMode(false);
            setCustomText('');
            setQuery('');
            onClose();
        }
    };

    const handleClose = () => {
        setIsCustomMode(false);
        setCustomText('');
        onClose();
    };

    const snapPoints = useMemo(() => ['75%'], []);

    return (
        <GorhomBottomSheet
            isVisible={isVisible}
            onClose={handleClose}
            snapPoints={snapPoints}
            closeButtonOffset={0}
        >
            <View style={{ flex: 1, paddingTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 }}>
                <Text style={{ fontSize: 17, fontFamily: 'Inter-Bold', color: '#1A1C1E' }}>
                    {isCustomMode ? 'Enter Health Problem' : 'Select Health Problem'}
                </Text>
                <Touchable onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <icons.close_icon width={18} height={18} fill="#6A6A6A" />
                </Touchable>
            </View>

            {isCustomMode ? (
                <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: Math.max(bottom, 20) }}>
                    <BottomSheetTextInput
                        value={customText}
                        onChangeText={setCustomText}
                        placeholder="E.g., Back pain, acidity, etc."
                        placeholderTextColor="#919EAB"
                        autoFocus
                        style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 14, fontSize: 15, fontFamily: 'Inter-Medium', color: '#1A1C1E', backgroundColor: '#fff' }}
                    />
                    <Touchable 
                        activeOpacity={0.8}
                        onPress={handleCustomSubmit}
                        style={{ backgroundColor: '#0F7635', borderRadius: 8, paddingVertical: 14, marginTop: 16, alignItems: 'center', opacity: customText.trim() ? 1 : 0.5 }}
                        disabled={!customText.trim()}
                    >
                        <Text style={{ color: '#fff', fontFamily: 'Inter-Bold', fontSize: 15 }}>Confirm</Text>
                    </Touchable>
                    <Touchable 
                        activeOpacity={0.8}
                        onPress={() => setIsCustomMode(false)}
                        style={{ marginTop: 12, paddingVertical: 12, alignItems: 'center' }}
                    >
                        <Text style={{ color: '#6A6A6A', fontFamily: 'Inter-Medium', fontSize: 14 }}>Back to list</Text>
                    </Touchable>
                </View>
            ) : (
                <>
                    <View style={{ marginHorizontal: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, backgroundColor: '#fff' }}>
                        <icons.search width={16} height={16} />
                        <BottomSheetTextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search health problem..."
                            placeholderTextColor="#919EAB"
                            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 14, fontFamily: 'Inter', color: '#1A1C1E' }}
                        />
                    </View>

                    {isLoading ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                            <ActivityIndicator size="large" color="#0F7635" />
                            <Text style={{ marginTop: 12, fontSize: 14, fontFamily: 'Inter-Medium', color: '#6A6A6A' }}>Loading health problems...</Text>
                        </View>
                    ) : (
                        <BottomSheetFlatList
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
                                            <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? '#fff' : '#F8F9FA', overflow: 'hidden' }}>
                                                {item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/') || item.icon.includes('.')) ? (
                                                    <Image source={{ uri: item.icon }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                                ) : (
                                                    <Text style={{ fontSize: 22, lineHeight: 28 }}>{item.icon}</Text>
                                                )}
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
                    )}
                </>
            )}
            </View>
        </GorhomBottomSheet>
    );
};
