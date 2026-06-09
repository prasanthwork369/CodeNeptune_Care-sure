import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { Touchable } from '@/src/components/ui/Touchable';
import { PRESCRIPTIONS } from '@/src/constants/data';
import { icons } from '@/src/constants/icons';
import { useNav } from '@/src/hooks/useNav';
import React from 'react';
import { FlatList, Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'Verified': return { bg: 'bg-[#F1FEF8]', text: 'text-[#0F7635]', borderColor: '#0F76351A' };
        case 'Pending': return { bg: 'bg-[#FFF3E6]', text: 'text-[#F26E01]', borderColor: '#CD77001A' };
        case 'Rejected': return { bg: 'bg-[#FFF6F4]', text: 'text-[#C22307]', borderColor: '#B60C031A' };
        default: return { bg: 'bg-gray-100', text: 'text-gray-600', borderColor: '#919EAB33' };
    }
};

export const PrescriptionHistoryLayout: React.FC = () => {
    const router = useNav();
    const insets = useSafeAreaInsets();

    const renderItem = ({ item }: { item: typeof PRESCRIPTIONS[0] }) => {
        const statusStyle = getStatusStyles(item.status);
        return (
            <View className="mb-6">
                <Text className="text-[14px] font-inter-medium text-brand-subtext mb-3">Uploaded on {item.uploadedDate}</Text>
                <View className="flex-row items-center">
                    <View className="w-[80px] h-[80px] rounded-md border border-[#919EAB33] overflow-hidden bg-white items-center justify-center mr-4">
                        <Image source={item.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                    </View>
                    <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1.5">
                            <Text className="text-[16px] font-inter-semibold text-[#222222]">#{item.id}</Text>
                            <View className={`${statusStyle.bg} px-2 py-1 rounded`}>
                                <Text className={`${statusStyle.text} text-[11px] font-inter-semibold`}>{item.status}</Text>
                            </View>
                        </View>
                        <Text className="text-[14px] font-inter-medium text-[#6A6A6A]">{item.patientName}</Text>
                    </View>
                    <Touchable activeOpacity={0.7} className="p-2" onPress={() => router.push({ pathname: '/(prescription)/preview', params: { uri: Image.resolveAssetSource(item.image).uri } })}>
                        <icons.eye width={24} height={24} fill="#6A6A6A" />
                    </Touchable>
                </View>
                <View className="h-[1px] bg-[#919EAB1A] mt-6" />
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white">
            <ScreenHeader title="My Prescriptions" />
            <FlatList data={PRESCRIPTIONS} keyExtractor={(item, index) => `${item.id}-${index}`} renderItem={renderItem} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false} />
        </View>
    );
};
