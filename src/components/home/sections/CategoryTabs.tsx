import React from 'react';
import { View, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import type { CategoryTab } from '@/src/types/home';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { TabItem } from './TabItem';
import { useTabIndicator } from '@/src/hooks/animations/useTabIndicator';

interface CategoryTabsProps {
    tabs: CategoryTab[];
    activeId: string;
    onTabChange: (id: string) => void;
    isLoading?: boolean;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ tabs, activeId, onTabChange, isLoading }) => {
    const { 
        scrollViewRef, 
        onTabLayout, 
        animatedIndicatorStyle 
    } = useTabIndicator(activeId);

    if (isLoading) {
        return (
            <View className="border-b border-[#919EAB33]">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, gap: 32 }}
                >
                    {Array.from({ length: 5 }).map((_, i) => (
                        <View key={i} className="items-center gap-y-2">
                            <Skeleton width={40} height={40} borderRadius={20} />
                            <Skeleton width={48} height={10} borderRadius={4} />
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    }

    return (
        <View className="border-b border-[#919EAB33]">
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 14,
                    paddingBottom: 0,
                }}
            >
                {tabs.map((tab) => (
                    <TabItem
                        key={tab.id}
                        tab={tab}
                        isActive={tab.id === activeId}
                        onPress={() => onTabChange(tab.id)}
                        onLayout={(e) => onTabLayout(tab.id, e)}
                    />
                ))}

                <Animated.View
                    style={[
                        {
                            height: 5,
                            position: 'absolute',
                            bottom: 0,
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                            backgroundColor: '#107539' // Darker, brand-specific green from image
                        },
                        animatedIndicatorStyle
                    ]}
                />
            </ScrollView>
        </View>
    );
};
