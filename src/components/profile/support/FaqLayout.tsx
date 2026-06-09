import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { icons } from '@/src/constants/icons';
import { Touchable } from '@/src/components/ui/Touchable';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

const FAQ_ITEMS = [
    { question: 'Are substitute medicines safe?', answer: "Yes, all suggested substitutes contain the same active ingredients and are approved for use. Always follow your doctor's advice if unsure." },
    { question: 'Why is the price different for substitutes?', answer: 'Substitute medicines are made by different manufacturers which may have lower production costs, resulting in a more affordable price without compromising quality.' },
    { question: 'How do I know if a substitute matches my medicine?', answer: 'We verify substitutes based on the same active ingredients, dosage, and form. You can view the full composition details on each product page.' },
    { question: 'Do I need a prescription for substitutes?', answer: 'If the original medicine requires a prescription, the substitute will too. You can upload your prescription during checkout.' },
    { question: 'Can I save money using substitutes?', answer: 'Yes! Generic substitutes can save you up to 80% compared to branded medicines while offering the same therapeutic effect.' },
];

export const FaqLayout: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <View className="flex-1 bg-[#F5F6FB]">
            <ScreenHeader title="FAQs" backgroundColor="#FFFFFF" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
                <View className="rounded-xl overflow-hidden" style={{ borderWidth: 1, borderColor: '#EEEFF1' }}>
                    {FAQ_ITEMS.map((item, index) => (
                        <View key={index}>
                            <Touchable
                                onPress={() => setOpenIndex(prev => prev === index ? null : index)}
                                activeOpacity={0.7}
                                className="flex-row items-center px-5 py-6"
                            >
                                <Text className="flex-1 text-[15px] font-inter-semibold text-brand-text pr-3" style={{ lineHeight: 22 }}>
                                    {item.question}
                                </Text>
                                {openIndex === index
                                    ? <icons.arrow_up width={15} height={15} fill="#1C1B1F" />
                                    : <icons.arrow_down width={15} height={15} fill="#1C1B1F" />
                                }
                            </Touchable>
                            {openIndex === index && (
                                <View className="px-5 pb-5">
                                    <Text className="text-[13px] font-inter-medium text-brand-subtext" style={{ lineHeight: 20 }}>
                                        {item.answer}
                                    </Text>
                                </View>
                            )}
                            {index < FAQ_ITEMS.length - 1 && <View style={{ height: 1, backgroundColor: '#919EAB33' }} />}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};
