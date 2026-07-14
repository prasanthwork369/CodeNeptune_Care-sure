import React, { useState } from 'react';
import { View, Text, ScrollView, ToastAndroid, Platform, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { exactScale, moderateScale } from '@/src/utils/exactScale';
import { isExpoGo } from '@/src/utils/environment';
import { NotificationService } from '@/src/services/notifications/NotificationService';

export default function NotificationPlayground() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [scheduledMsg, setScheduledMsg] = useState<string | null>(null);

    const triggerAction = async (name: string, action: () => Promise<void>) => {
        if (isExpoGo) {
            const warning = "Notifee notifications are only supported on a native build (Dev Client / Release) and cannot be tested inside Expo Go.";
            if (Platform.OS === 'android') {
                ToastAndroid.show(warning, ToastAndroid.LONG);
            } else {
                Alert.alert("Expo Go Constraint", warning);
            }
            return;
        }

        try {
            await action();
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to trigger notification");
        }
    };

    const renderButton = (label: string, iconName: string, color: string, onPress: () => Promise<void>) => {
        const Icon = (icons as any)[iconName] || icons.notifications;
        return (
            <Touchable
                activeOpacity={0.7}
                onPress={() => triggerAction(label, onPress)}
                className="bg-white rounded-xl border border-[#919EAB33] p-4 flex-row items-center justify-between mb-3 shadow-sm"
            >
                <View className="flex-row items-center flex-1">
                    <View 
                        className="rounded-lg items-center justify-center mr-3"
                        style={{ width: exactScale(40), height: exactScale(40), backgroundColor: `${color}1A` }}
                    >
                        <Icon width={22} height={22} color={color} fill={color} />
                    </View>
                    <Text className="font-inter-semibold text-[#1A1C1E] flex-1" style={{ fontSize: moderateScale(14) }}>
                        {label}
                    </Text>
                </View>
                <icons.arrow_forward_gray width={16} height={16} />
            </Touchable>
        );
    };

    return (
        <View className="flex-1 bg-[#F5F6FB]">
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Header */}
            <LinearGradient
                colors={['#0F7635', '#0A5A28']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                className="pt-6 pb-6 px-4 flex-row items-center"
                style={{ paddingTop: insets.top + exactScale(12) }}
            >
                <Touchable 
                    onPress={() => router.back()} 
                    className="mr-3 p-1 rounded-full bg-white/10"
                >
                    <icons.arrow_back width={24} height={24} color="#FFFFFF" />
                </Touchable>
                <View className="flex-1">
                    <Text className="font-inter-bold text-white" style={{ fontSize: moderateScale(20) }}>
                        Notification Playground
                    </Text>
                    <Text className="font-inter-medium text-white/70 mt-0.5" style={{ fontSize: moderateScale(12) }}>
                        Test local Notifee alerts & styles
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
            >
                {isExpoGo && (
                    <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex-row items-start">
                        <View className="mr-3 mt-0.5">
                            <icons.info_outline width={20} height={20} color="#D97706" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-inter-bold text-[#92400E]" style={{ fontSize: moderateScale(14) }}>
                                Expo Go Warning
                            </Text>
                            <Text className="font-inter-medium text-[#B45309] mt-1" style={{ fontSize: moderateScale(12), lineHeight: 18 }}>
                                Local Notifee notification triggers require native code. They will not display inside the Expo Go app. To test these, use a development build or production build.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Section: Basic Styles */}
                <Text className="font-inter-bold text-brand-text mb-3 uppercase tracking-wider text-xs" style={{ fontSize: moderateScale(12) }}>
                    Notification Styles
                </Text>
                {renderButton("Basic Notification", "notifications", "#0F7635", NotificationService.triggerBasic)}
                {renderButton("Big Text Style", "article", "#1D4ED8", NotificationService.triggerBigText)}
                {renderButton("Big Picture Style", "outline_gallery", "#7C3AED", NotificationService.triggerBigPicture)}
                {renderButton("Inbox Style", "faq_info", "#0891B2", NotificationService.triggerInboxStyle)}

                {/* Section: State & Actions */}
                <Text className="font-inter-bold text-brand-text mt-5 mb-3 uppercase tracking-wider text-xs" style={{ fontSize: moderateScale(12) }}>
                    Progress & Tasks
                </Text>
                {renderButton("Download Progress (0-100%)", "hourglass_bottom", "#F59E0B", NotificationService.triggerProgress)}
                {renderButton("Download Completed", "check_circle", "#10B981", NotificationService.triggerDownloadCompleted)}
                {renderButton("Invoice Saved", "account_balance_wallet", "#059669", NotificationService.triggerInvoiceDownloaded)}
                {renderButton("Upload Completed", "upload_file", "#8B5CF6", NotificationService.triggerUploadCompleted)}
                {renderButton("Ongoing (Persistent) Alert", "internet", "#6B7280", NotificationService.triggerOngoing)}
                {renderButton("Countdown Chronometer (1 Min)", "calendar_today", "#EC4899", NotificationService.triggerCountdownTimer)}
                {renderButton("Scheduled Timer (10 Seconds)", "calendar_month", "#10B981", async () => {
                    await NotificationService.triggerScheduled();
                    setScheduledMsg("Triggered! Notification will fire in 10 seconds...");
                    setTimeout(() => setScheduledMsg(null), 10000);
                })}
                {scheduledMsg && (
                    <Text className="text-center font-inter-semibold text-[#10B981] mb-3 text-xs">
                        {scheduledMsg}
                    </Text>
                )}

                {/* Section: Action buttons & groups */}
                <Text className="font-inter-bold text-brand-text mt-5 mb-3 uppercase tracking-wider text-xs" style={{ fontSize: moderateScale(12) }}>
                    Interactions & Grouping
                </Text>
                {renderButton("Alert with Action Buttons", "sell", "#3B82F6", NotificationService.triggerActionButtons)}
                {renderButton("Grouped Notifications", "dots", "#EF4444", NotificationService.triggerGrouped)}

                {/* Section: Status Themes */}
                <Text className="font-inter-bold text-brand-text mt-5 mb-3 uppercase tracking-wider text-xs" style={{ fontSize: moderateScale(12) }}>
                    System Status alerts
                </Text>
                {renderButton("Success Notification", "check_circle", "#10B981", NotificationService.triggerSuccess)}
                {renderButton("Error Notification", "cancel_circle", "#EF4444", NotificationService.triggerError)}
                {renderButton("Warning Notification", "info_error", "#F59E0B", NotificationService.triggerWarning)}
                {renderButton("Medicine Reminder Alert", "pill_gray", "#3B82F6", NotificationService.triggerMedicineReminder)}
                {renderButton("Cart Abandoned Alert", "cart_outline_profile", "#EC4899", NotificationService.triggerCartReminder)}

                {/* Section: Controls */}
                <Text className="font-inter-bold text-brand-text mt-5 mb-3 uppercase tracking-wider text-xs" style={{ fontSize: moderateScale(12) }}>
                    Notification Controls
                </Text>
                
                <Touchable
                    activeOpacity={0.7}
                    onPress={() => triggerAction("Cancel Ongoing", () => NotificationService.cancelNotification("ongoing_demo"))}
                    className="bg-white border border-[#919EAB33] rounded-xl p-4 flex-row items-center justify-between mb-3 shadow-sm"
                >
                    <View className="flex-row items-center">
                        <View className="rounded-lg bg-red-50 p-2 mr-3">
                            <icons.cancel_circle width={20} height={20} color="#EF4444" />
                        </View>
                        <Text className="font-inter-semibold text-[#1A1C1E]">
                            Cancel Ongoing Notification
                        </Text>
                    </View>
                    <icons.arrow_forward_gray width={16} height={16} />
                </Touchable>

                <Touchable
                    activeOpacity={0.7}
                    onPress={() => triggerAction("Cancel All", NotificationService.cancelAll)}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 flex-row items-center justify-between shadow-sm"
                >
                    <View className="flex-row items-center">
                        <View className="rounded-lg bg-red-100 p-2 mr-3">
                            <icons.delete_red width={20} height={20} />
                        </View>
                        <Text className="font-inter-bold text-[#CA2B25]">
                            Cancel All Notifications
                        </Text>
                    </View>
                    <icons.arrow_forward_gray width={16} height={16} color="#CA2B25" />
                </Touchable>
            </ScrollView>
        </View>
    );
}
