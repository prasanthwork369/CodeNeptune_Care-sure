import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { icons } from '@/src/constants/icons';
import { Touchable } from '@/src/components/ui/Touchable';
import React, { useState, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useWebsiteContent } from '@/src/hooks/queries/useWebsiteContent';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { moderateScale } from "@/src/utils/exactScale";

const FaqSkeleton = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        <View className="rounded-xl overflow-hidden" style={{ borderWidth: 1, borderColor: '#EEEFF1', backgroundColor: '#FFFFFF' }}>
            {[1, 2, 3, 4, 5].map((_, index) => (
                <View key={index}>
                    <View className="px-5 py-6 flex-row items-center justify-between">
                        <Skeleton width={index % 2 === 0 ? "75%" : "85%"} height={16} borderRadius={4} />
                        <Skeleton width={16} height={16} borderRadius={8} />
                    </View>
                    {index < 4 && <View style={{ height: 1, backgroundColor: '#919EAB33' }} />}
                </View>
            ))}
        </View>
    </ScrollView>
);

export const FaqLayout: React.FC = () => {
    const { data: cmsFaqs, isLoading } = useWebsiteContent('faqs');
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs: { question: string; answer: string }[] = useMemo(() => {
        if (!cmsFaqs) return [];

        // Try direct array
        if (Array.isArray(cmsFaqs)) {
            const valid = cmsFaqs.filter((item: any) => item && typeof item.question === 'string' && typeof item.answer === 'string');
            if (valid.length > 0) return valid;
        }

        // Try value field
        if (cmsFaqs.value) {
            let val = cmsFaqs.value;
            if (typeof val === 'string') {
                try {
                    val = JSON.parse(val);
                } catch (e) {
                    // ignore
                }
            }
            if (Array.isArray(val)) {
                const valid = val.filter((item: any) => item && typeof item.question === 'string' && typeof item.answer === 'string');
                if (valid.length > 0) return valid;
            }
        }

        // Try faqs field
        if (Array.isArray(cmsFaqs.faqs)) {
            const valid = cmsFaqs.faqs.filter((item: any) => item && typeof item.question === 'string' && typeof item.answer === 'string');
            if (valid.length > 0) return valid;
        }

        return [];
    }, [cmsFaqs]);

    return (
        <View className="flex-1 bg-[#F5F6FB]">
            <ScreenHeader title="FAQs" backgroundColor="#FFFFFF" />
            {isLoading ? (
                <FaqSkeleton />
            ) : faqs.length === 0 ? (
                <View className="flex-1 items-center justify-center p-8">
                    <Text className="font-inter-medium text-brand-subtext text-center" style={{ fontSize: moderateScale(14) }}>
                        No FAQs found at the moment.
                    </Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
                    <View className="rounded-xl overflow-hidden" style={{ borderWidth: 1, borderColor: '#EEEFF1' }}>
                        {faqs.map((item, index) => (
                            <View key={index}>
                                <Touchable
                                    onPress={() => setOpenIndex(prev => prev === index ? null : index)}
                                    activeOpacity={0.7}
                                    className="flex-row items-center px-5 py-6"
                                >
                                    <Text className="flex-1 font-inter-semibold text-brand-text pr-3" style={{ fontSize: moderateScale(15), lineHeight: moderateScale(22) }}>
                                        {item.question}
                                    </Text>
                                    {openIndex === index
                                        ? <icons.arrow_up width={15} height={15} fill="#1C1B1F" />
                                        : <icons.arrow_down width={15} height={15} fill="#1C1B1F" />
                                    }
                                </Touchable>
                                {openIndex === index && (
                                    <View className="px-5 pb-5">
                                        <Text className="font-inter-medium text-brand-subtext" style={{ fontSize: moderateScale(13), lineHeight: moderateScale(20) }}>
                                            {item.answer}
                                        </Text>
                                    </View>
                                )}
                                {index < faqs.length - 1 && <View style={{ height: 1, backgroundColor: '#919EAB33' }} />}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
        </View>
    );
};
