import { useNav } from '@/src/hooks/useNav';
import { Touchable } from '@/src/components/ui/Touchable';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { icons } from '@/src/constants/icons';
import { PrescriptionHistoryItemProps } from '@/src/types/prescription';

const resolveImageSource = (image: any) => {
    if (typeof image === 'string') return { uri: image };
    if (Array.isArray(image) && image.length > 0) return { uri: image[0] };
    return image;
};

const isPdf = (image: any): boolean => {
    if (typeof image === 'string') return image.toLowerCase().endsWith('.pdf');
    if (Array.isArray(image) && image.length > 0) return image[0].toLowerCase().endsWith('.pdf');
    return false;
};

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'Verified': return { bg: 'bg-[#F1FEF8]', text: 'text-[#0F7635]' };
        case 'Pending': return { bg: 'bg-[#FFF3E6]', text: 'text-[#F26E01]' };
        case 'Rejected': return { bg: 'bg-[#FFF6F4]', text: 'text-[#C22307]' };
        default: return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
};

export const PrescriptionHistoryItem: React.FC<PrescriptionHistoryItemProps> = ({ item }) => {
    const router = useNav();
    const statusStyle = getStatusStyles(item.status);
    const imageSource = resolveImageSource(item.image);
    const pdf = isPdf(item.image);

    const handleView = () => {
        router.push({
            pathname: '/(prescription)/prescription-viewer',
            params: {
                prescriptionId: item.rawId,
                imageUrls: JSON.stringify(Array.isArray(item.image) ? item.image : [item.image]),
                doctorName: item.doctorName,
                patientName: item.patientName,
                uploadedDate: item.uploadedDate,
                source: item.source,
                toPay: item.toPay,
            },
        });
    };

    return (
        <View className="mb-6">
            <Text className="text-[14px] font-inter-medium text-brand-subtext mb-3">Uploaded on {item.uploadedDate}</Text>
            <View className="flex-row items-center">
                <View className="w-[80px] h-[80px] rounded-md border border-[#919EAB33] overflow-hidden bg-white items-center justify-center mr-4">
                    {pdf ? (
                        <icons.note_book width={36} height={36} />
                    ) : (
                        <Image source={imageSource} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                    )}
                </View>
                <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1.5">
                        <Text className="text-[16px] font-inter-semibold text-[#222222] shrink" numberOfLines={1}>#{item.id}</Text>
                        <View className={`${statusStyle.bg} px-2 py-1 rounded shrink-0`}>
                            <Text className={`${statusStyle.text} text-[11px] font-inter-semibold`}>{item.status}</Text>
                        </View>
                    </View>
                    <Text className="text-[14px] font-inter-medium text-[#6A6A6A]">{item.patientName}</Text>
                </View>
                <Touchable activeOpacity={0.7} className="p-2" onPress={handleView}>
                    <icons.eye width={24} height={24} fill="#6A6A6A" />
                </Touchable>
            </View>
            <View className="h-[1px] bg-[#919EAB1A] mt-6" />
        </View>
    );
};
