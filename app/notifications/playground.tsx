import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, ToastAndroid, Platform, Alert, Animated } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { exactScale, moderateScale } from '@/src/utils/exactScale';
import { isExpoGo } from '@/src/utils/environment';
import { NotificationService } from '@/src/services/notifications/NotificationService';

interface HistoryItem {
    id: string;
    type: string;
    timestamp: string;
    channel: string;
}

export default function NotificationPlayground() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    // Section expansion states
    const [expandedCommerce, setExpandedCommerce] = useState(true);
    const [expandedHealth, setExpandedHealth] = useState(false);
    const [expandedSystem, setExpandedSystem] = useState(false);
    const [expandedModernUI, setExpandedModernUI] = useState(false);
    const [expandedInteractive, setExpandedInteractive] = useState(true);

    // Dynamic states
    const [notificationHistory, setNotificationHistory] = useState<HistoryItem[]>([]);
    const [badgeCount, setBadgeCount] = useState(0);

    // Interactive 1: Progress state
    const [currentProgress, setCurrentProgress] = useState(0);
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Interactive 2: Carousel state
    const [carouselIndex, setCarouselIndex] = useState(0);
    const carouselIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Interactive 3: Countdown state
    const [countdownSeconds, setCountdownSeconds] = useState(0);
    const [countdownType, setCountdownType] = useState<'flash' | 'medicine' | 'appointment'>('flash');
    const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Clean up timers on unmount
    useEffect(() => {
        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            if (carouselIntervalRef.current) clearInterval(carouselIntervalRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, []);

    // Generic Action Wrapper
    const triggerAction = async (
        label: string,
        channel: string,
        action: () => Promise<string | null | undefined>
    ) => {
        if (isExpoGo) {
            const warning = "Notifee notifications require a native build (Dev Client) and cannot run inside Expo Go.";
            if (Platform.OS === 'android') {
                ToastAndroid.show(warning, ToastAndroid.LONG);
            } else {
                Alert.alert("Expo Go Constraint", warning);
            }
            return;
        }

        try {
            const returnedId = await action();
            const id = returnedId || "demo_id";
            const newItem: HistoryItem = {
                id,
                type: label,
                timestamp: new Date().toLocaleTimeString(),
                channel,
            };
            setNotificationHistory(prev => [newItem, ...prev].slice(0, 10));
        } catch (error: any) {
            Alert.alert("Notification Error", error.message || "Failed to display notification");
        }
    };

    // --- Interactive Demos Actions ---

    // Progress Demo
    const startProgressSimulation = () => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setCurrentProgress(0);
        
        let localProgress = 0;
        progressIntervalRef.current = setInterval(async () => {
            localProgress += 20;
            setCurrentProgress(localProgress);
            
            await triggerAction("Upload Progress (Simulated)", "playground_progress", async () => {
                const builder = NotificationService.interactive.buildProgress(localProgress);
                return await NotificationService.display(builder);
            });

            if (localProgress >= 100) {
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                }
            }
        }, 1200);
    };

    const stepProgress = async () => {
        const next = currentProgress >= 100 ? 0 : currentProgress + 20;
        setCurrentProgress(next);
        await triggerAction("Upload Progress (Manual)", "playground_progress", async () => {
            const builder = NotificationService.interactive.buildProgress(next);
            return await NotificationService.display(builder);
        });
    };

    const cancelProgress = async () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        await NotificationService.cancel("interactive_progress_demo");
    };

    // Carousel Demo
    const advanceCarousel = async (step: number) => {
        const nextIndex = (carouselIndex + step + 3) % 3;
        setCarouselIndex(nextIndex);
        await triggerAction("Offer Carousel Rotation", "playground_basic", async () => {
            const builder = NotificationService.interactive.buildCarousel(nextIndex);
            return await NotificationService.display(builder);
        });
    };

    const startCarouselAutoplay = () => {
        if (carouselIntervalRef.current) clearInterval(carouselIntervalRef.current);
        let nextIdx = carouselIndex;
        carouselIntervalRef.current = setInterval(async () => {
            nextIdx = (nextIdx + 1) % 3;
            setCarouselIndex(nextIdx);
            await triggerAction("Offer Carousel Autoplay", "playground_basic", async () => {
                const builder = NotificationService.interactive.buildCarousel(nextIdx);
                return await NotificationService.display(builder);
            });
        }, 3000);
    };

    const cancelCarousel = async () => {
        if (carouselIntervalRef.current) {
            clearInterval(carouselIntervalRef.current);
            carouselIntervalRef.current = null;
        }
        await NotificationService.cancel("interactive_carousel_demo");
    };

    // Countdown Demo
    const startCountdown = (sec: number, type: 'flash' | 'medicine' | 'appointment') => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setCountdownType(type);
        setCountdownSeconds(sec);

        let localSec = sec;
        countdownIntervalRef.current = setInterval(async () => {
            localSec -= 1;
            setCountdownSeconds(localSec);

            await triggerAction("Interactive Countdown", "playground_reminders", async () => {
                const builder = NotificationService.interactive.buildCountdown(localSec, type);
                return await NotificationService.display(builder);
            });

            if (localSec <= 0) {
                if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                }
            }
        }, 1000);
    };

    const cancelCountdown = async () => {
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        await NotificationService.cancel("interactive_countdown_demo");
    };

    // Badge Count Demo
    const updateBadgeCount = async (val: number) => {
        const next = Math.max(0, badgeCount + val);
        setBadgeCount(next);
        if (!isExpoGo) {
            await NotificationService.setBadgeCount(next);
        }
    };

    // --- Component Helpers ---

    const renderCard = (
        title: string,
        desc: string,
        channel: string,
        icon: string,
        color: string,
        action: () => Promise<any>
    ) => {
        const Icon = (icons as any)[icon] || icons.notifications;
        return (
            <View className="bg-white rounded-xl border border-[#919EAB33] p-4 mb-4 shadow-sm">
                <View className="flex-row items-start mb-2">
                    <View 
                        className="rounded-lg items-center justify-center mr-3 mt-0.5"
                        style={{ width: exactScale(36), height: exactScale(36), backgroundColor: `${color}1A` }}
                    >
                        <Icon width={20} height={20} color={color} fill={color} />
                    </View>
                    <View className="flex-1">
                        <Text className="font-inter-bold text-[#1A1C1E]">{title}</Text>
                        <Text className="font-inter-regular text-[#6A6A6A] mt-1" style={{ fontSize: moderateScale(12) }}>
                            {desc}
                        </Text>
                    </View>
                </View>
                
                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-[#F2F4F7]">
                    <View>
                        <Text className="text-[10px] font-inter-semibold text-brand-subtext/70 uppercase">
                            Channel: {channel}
                        </Text>
                    </View>
                    <Touchable
                        onPress={() => triggerAction(title, channel, action)}
                        activeOpacity={0.7}
                        className="py-1.5 px-4 rounded-lg items-center justify-center"
                        style={{ backgroundColor: color }}
                    >
                        <Text className="font-inter-bold text-white text-xs">Trigger Alert</Text>
                    </Touchable>
                </View>
            </View>
        );
    };

    const renderHeaderSection = (title: string, count: number, expanded: boolean, setExpanded: (v: boolean) => void) => {
        return (
            <Touchable
                activeOpacity={0.8}
                onPress={() => setExpanded(!expanded)}
                className="flex-row items-center justify-between py-3 px-4 bg-[#EAECF0] rounded-xl mb-4 border border-[#D0D5DD]"
            >
                <View className="flex-row items-center">
                    <Text className="font-inter-bold text-[#1D2939]" style={{ fontSize: moderateScale(14) }}>
                        {title}
                    </Text>
                    <View className="bg-[#475467] rounded-full px-2 py-0.5 ml-2">
                        <Text className="text-white text-[10px] font-inter-semibold">{count}</Text>
                    </View>
                </View>
                {expanded ? (
                    <icons.arrow_up width={18} height={18} color="#475467" />
                ) : (
                    <icons.arrow_down width={18} height={18} color="#475467" />
                )}
            </Touchable>
        );
    };

    return (
        <View className="flex-1 bg-[#F5F6FB]">
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Custom M3 Gradient Header */}
            <LinearGradient
                colors={['#0F7635', '#0A5A28']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                className="pt-6 pb-6 px-4 flex-row items-center"
                style={{ paddingTop: insets.top + exactScale(12) }}
            >
                <Touchable 
                    onPress={() => router.back()} 
                    className="mr-3 p-1.5 rounded-full bg-white/10"
                >
                    <icons.arrow_back width={24} height={24} color="#FFFFFF" />
                </Touchable>
                <View className="flex-1">
                    <Text className="font-inter-bold text-white" style={{ fontSize: moderateScale(20) }}>
                        Notification Showcase
                    </Text>
                    <Text className="font-inter-medium text-white/70 mt-0.5" style={{ fontSize: moderateScale(12) }}>
                        Interactive Material 3 Notifee Playground
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
                                Expo Go Detected
                            </Text>
                            <Text className="font-inter-medium text-[#B45309] mt-1" style={{ fontSize: moderateScale(12), lineHeight: 18 }}>
                                You are currently using Expo Go. Local triggers that execute native background Notifee bindings require a development client build and cannot be fully demonstrated here.
                            </Text>
                        </View>
                    </View>
                )}

                {/* ======================================================== */}
                {/* 1. INTERACTIVE DEMOS */}
                {/* ======================================================== */}
                {renderHeaderSection("Interactive Simulations", 4, expandedInteractive, setExpandedInteractive)}
                {expandedInteractive && (
                    <View className="px-1">
                        
                        {/* 1A. Progress simulation */}
                        <View className="bg-white rounded-xl border border-[#919EAB33] p-4 mb-4 shadow-sm">
                            <View className="flex-row items-start mb-2">
                                <View className="rounded-lg bg-orange-50 items-center justify-center mr-3 p-2">
                                    <icons.hourglass_bottom width={20} height={20} color="#F59E0B" />
                                </View>
                                <View className="flex-grow">
                                    <Text className="font-inter-bold text-[#1A1C1E]">Progress Sim: Prescription Scans</Text>
                                    <Text className="font-inter-regular text-[#6A6A6A] mt-1 text-xs">
                                        Simulates prescription uploads in-place inside the notification (reusing ID).
                                    </Text>
                                </View>
                            </View>
                            {/* Visual Progress bar */}
                            <View className="h-2 bg-[#EAECF0] rounded-full overflow-hidden mt-3 mb-2">
                                <View className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${currentProgress}%` }} />
                            </View>
                            <Text className="text-right text-[10px] font-inter-semibold text-brand-subtext mb-3">
                                Current Progress: {currentProgress}%
                            </Text>
                            
                            <View className="flex-row gap-x-2 mt-1">
                                <Touchable onPress={startProgressSimulation} className="flex-1 bg-orange-500 py-2 rounded-lg items-center">
                                    <Text className="text-white text-xs font-inter-bold">Run Auto</Text>
                                </Touchable>
                                <Touchable onPress={stepProgress} className="flex-1 bg-orange-100 py-2 rounded-lg items-center">
                                    <Text className="text-orange-700 text-xs font-inter-bold">Step (+20%)</Text>
                                </Touchable>
                                <Touchable onPress={cancelProgress} className="flex-1 bg-red-50 py-2 rounded-lg items-center">
                                    <Text className="text-red-700 text-xs font-inter-bold">Cancel</Text>
                                </Touchable>
                            </View>
                        </View>

                        {/* 1B. Countdown Simulation */}
                        <View className="bg-white rounded-xl border border-[#919EAB33] p-4 mb-4 shadow-sm">
                            <View className="flex-row items-start mb-2">
                                <View className="rounded-lg bg-emerald-50 items-center justify-center mr-3 p-2">
                                    <icons.calendar_month width={20} height={20} color="#10B981" />
                                </View>
                                <View className="flex-grow">
                                    <Text className="font-inter-bold text-[#1A1C1E]">Countdown Sim: Reminders</Text>
                                    <Text className="font-inter-regular text-[#6A6A6A] mt-1 text-xs">
                                        Counts down time. Triggers completed notification on reaching zero.
                                    </Text>
                                </View>
                            </View>
                            {countdownSeconds > 0 && (
                                <Text className="font-inter-semibold text-[#10B981] my-2 text-center text-xs">
                                    Simulating: {countdownSeconds} seconds remaining...
                                </Text>
                            )}
                            <View className="flex-row gap-x-2 mt-3">
                                <Touchable onPress={() => startCountdown(10, 'flash')} className="flex-1 bg-emerald-600 py-2 rounded-lg items-center">
                                    <Text className="text-white text-xs font-inter-bold">Flash (10s)</Text>
                                </Touchable>
                                <Touchable onPress={() => startCountdown(30, 'medicine')} className="flex-1 bg-emerald-100 py-2 rounded-lg items-center">
                                    <Text className="text-emerald-700 text-xs font-inter-bold">Meds (30s)</Text>
                                </Touchable>
                                <Touchable onPress={() => startCountdown(60, 'appointment')} className="flex-1 bg-emerald-100 py-2 rounded-lg items-center">
                                    <Text className="text-emerald-700 text-xs font-inter-bold">Doc (60s)</Text>
                                </Touchable>
                                <Touchable onPress={cancelCountdown} className="flex-1 bg-red-50 py-2 rounded-lg items-center">
                                    <Text className="text-red-700 text-xs font-inter-bold">Cancel</Text>
                                </Touchable>
                            </View>
                        </View>

                        {/* 1C. Carousel Simulation */}
                        <View className="bg-white rounded-xl border border-[#919EAB33] p-4 mb-4 shadow-sm">
                            <View className="flex-row items-start mb-2">
                                <View className="rounded-lg bg-purple-50 items-center justify-center mr-3 p-2">
                                    <icons.outline_gallery width={20} height={20} color="#7C3AED" />
                                </View>
                                <View className="flex-grow">
                                    <Text className="font-inter-bold text-[#1A1C1E]">Offer Banner Carousel</Text>
                                    <Text className="font-inter-regular text-[#6A6A6A] mt-1 text-xs">
                                        Updates a single notification in-place rotating health products.
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-xs font-inter-semibold text-purple-700 my-1 text-center">
                                Current Offer Item Index: {carouselIndex + 1} of 3
                            </Text>
                            <View className="flex-row gap-x-2 mt-3">
                                <Touchable onPress={startCarouselAutoplay} className="flex-1 bg-purple-600 py-2 rounded-lg items-center">
                                    <Text className="text-white text-xs font-inter-bold">Autoplay (3s)</Text>
                                </Touchable>
                                <Touchable onPress={() => advanceCarousel(1)} className="flex-1 bg-purple-100 py-2 rounded-lg items-center">
                                    <Text className="text-purple-700 text-xs font-inter-bold">Next Offer</Text>
                                </Touchable>
                                <Touchable onPress={cancelCarousel} className="flex-1 bg-red-50 py-2 rounded-lg items-center">
                                    <Text className="text-red-700 text-xs font-inter-bold">Cancel</Text>
                                </Touchable>
                            </View>
                        </View>

                        {/* 1D. Badge count Demo */}
                        <View className="bg-white rounded-xl border border-[#919EAB33] p-4 mb-4 shadow-sm">
                            <View className="flex-row items-center mb-2 justify-between">
                                <View className="flex-row items-center">
                                    <View className="rounded-lg bg-pink-50 items-center justify-center mr-3 p-2">
                                        <icons.notifications width={20} height={20} color="#EC4899" />
                                    </View>
                                    <View>
                                        <Text className="font-inter-bold text-[#1A1C1E]">App Badge Count</Text>
                                        <Text className="font-inter-regular text-[#6A6A6A] mt-0.5 text-xs">
                                            Increments launcher badge count.
                                        </Text>
                                    </View>
                                </View>
                                <View className="bg-pink-500 rounded-full w-7 h-7 items-center justify-center">
                                    <Text className="text-white text-xs font-inter-bold">{badgeCount}</Text>
                                </View>
                            </View>
                            <View className="flex-row gap-x-2 mt-3">
                                <Touchable onPress={() => updateBadgeCount(1)} className="flex-1 bg-pink-600 py-2 rounded-lg items-center">
                                    <Text className="text-white text-xs font-inter-bold">Add Badge (+1)</Text>
                                </Touchable>
                                <Touchable onPress={() => updateBadgeCount(-1)} className="flex-1 bg-pink-100 py-2 rounded-lg items-center">
                                    <Text className="text-pink-700 text-xs font-inter-bold">Reduce (-1)</Text>
                                </Touchable>
                                <Touchable onPress={() => updateBadgeCount(-badgeCount)} className="flex-1 bg-red-50 py-2 rounded-lg items-center">
                                    <Text className="text-red-700 text-xs font-inter-bold">Clear</Text>
                                </Touchable>
                            </View>
                        </View>

                    </View>
                )}

                {/* ======================================================== */}
                {/* 2. SHOPPING & COMMERCE SECTION */}
                {/* ======================================================== */}
                {renderHeaderSection("Shopping & Commerce", 9, expandedCommerce, setExpandedCommerce)}
                {expandedCommerce && (
                    <View className="px-1">
                        {renderCard(
                            "Order Confirmed",
                            "Fired right after checkout is completed, displaying order details.",
                            "playground_basic",
                            "check_circle",
                            "#0F7635",
                            async () => NotificationService.commerce.buildOrderConfirmed()
                        )}
                        {renderCard(
                            "Order Packed",
                            "Alerts the customer that items are ready and verified by the pharmacist.",
                            "playground_basic",
                            "check_circle",
                            "#475467",
                            async () => NotificationService.commerce.buildOrderPacked()
                        )}
                        {renderCard(
                            "Out for Delivery",
                            "Provides rider's details and direct contact numbers.",
                            "playground_basic",
                            "internet",
                            "#1D4ED8",
                            async () => NotificationService.commerce.buildOutForDelivery()
                        )}
                        {renderCard(
                            "Delivered Successfully",
                            "Final confirmation with delivered timestamp.",
                            "playground_basic",
                            "check_circle",
                            "#0F7635",
                            async () => NotificationService.commerce.buildDelivered()
                        )}
                        {renderCard(
                            "Payment Successful",
                            "Acknowledges payment success and credits CareSure coins.",
                            "playground_basic",
                            "account_balance_wallet",
                            "#0F7635",
                            async () => NotificationService.commerce.buildPaymentSuccess()
                        )}
                        {renderCard(
                            "Payment Failed",
                            "Declined payment notification offering a quick retry checkout link.",
                            "playground_basic",
                            "cancel_circle",
                            "#CA2B25",
                            async () => NotificationService.commerce.buildPaymentFailed()
                        )}
                        {renderCard(
                            "Refund Processed",
                            "Confirming refund credits back to the original source bank.",
                            "playground_basic",
                            "dots",
                            "#7C3AED",
                            async () => NotificationService.commerce.buildRefundProcessed()
                        )}
                        {renderCard(
                            "Invoice Downloaded",
                            "Lab invoice confirmation saved locally in folders.",
                            "playground_progress",
                            "account_balance_wallet",
                            "#0891B2",
                            async () => NotificationService.commerce.buildInvoiceDownloaded()
                        )}
                        {renderCard(
                            "Download Completed",
                            "Standard download completion dialog showing PDF naming details.",
                            "playground_progress",
                            "upload_file",
                            "#0891B2",
                            async () => NotificationService.commerce.buildDownloadCompleted()
                        )}
                    </View>
                )}

                {/* ======================================================== */}
                {/* 3. HEALTH & CARESURE SECTION */}
                {/* ======================================================== */}
                {renderHeaderSection("Health & CareSure", 6, expandedHealth, setExpandedHealth)}
                {expandedHealth && (
                    <View className="px-1">
                        {renderCard(
                            "Medicine Dosage Reminder",
                            "Hourly medicine alarms mapped with reminder priority headers.",
                            "playground_reminders",
                            "pill_gray",
                            "#0F7635",
                            async () => NotificationService.health.buildMedicineReminder()
                        )}
                        {renderCard(
                            "Prescription Approved",
                            "Physician review complete. Unblocks purchase checkout flow.",
                            "playground_basic",
                            "check_circle",
                            "#0F7635",
                            async () => NotificationService.health.buildPrescriptionApproved()
                        )}
                        {renderCard(
                            "Prescription Rejected",
                            "Declined prescription notification detailing corrective steps.",
                            "playground_basic",
                            "cancel_circle",
                            "#CA2B25",
                            async () => NotificationService.health.buildPrescriptionRejected()
                        )}
                        {renderCard(
                            "Health Check Reminder",
                            "Lab checkups schedule alerts prior to sample collections.",
                            "playground_reminders",
                            "faq_info",
                            "#1D4ED8",
                            async () => NotificationService.health.buildHealthCheckReminder()
                        )}
                        {renderCard(
                            "Doctor Video consultation",
                            "Time slot reminders with direct action links to consult room.",
                            "playground_reminders",
                            "notifications",
                            "#0F7635",
                            async () => NotificationService.health.buildDoctorAppointmentReminder()
                        )}
                        {renderCard(
                            "Refill Orders Alarms",
                            "Proactively prompts refills for regular prescription clients.",
                            "playground_reminders",
                            "calendar_month",
                            "#F59E0B",
                            async () => NotificationService.health.buildRefillReminder()
                        )}
                    </View>
                )}

                {/* ======================================================== */}
                {/* 4. SYSTEM ALERTS SECTION */}
                {/* ======================================================== */}
                {renderHeaderSection("System & Syncing", 9, expandedSystem, setExpandedSystem)}
                {expandedSystem && (
                    <View className="px-1">
                        {renderCard(
                            "Upload Progress indicator",
                            "Indeterminate upload status for prescriptions.",
                            "playground_progress",
                            "hourglass_bottom",
                            "#F59E0B",
                            async () => NotificationService.system.buildUploadProgress()
                        )}
                        {renderCard(
                            "Download Progress indicator",
                            "Download status tracking for medical invoices.",
                            "playground_progress",
                            "hourglass_bottom",
                            "#F59E0B",
                            async () => NotificationService.system.buildDownloadProgress()
                        )}
                        {renderCard(
                            "Background Sync Active",
                            "Indeterminate telemetry sync happening in the background.",
                            "playground_progress",
                            "internet",
                            "#475467",
                            async () => NotificationService.system.buildBackgroundSync()
                        )}
                        {renderCard(
                            "Background Sync Finished",
                            "Dismisses ongoing progress bar and shows complete state.",
                            "playground_progress",
                            "check_circle",
                            "#0F7635",
                            async () => NotificationService.system.buildSyncCompleted()
                        )}
                        {renderCard(
                            "Backup Successful",
                            "Confirmation that data records are saved in the cloud.",
                            "playground_basic",
                            "check_circle",
                            "#0F7635",
                            async () => NotificationService.system.buildBackupCompleted()
                        )}
                        {renderCard(
                            "Storage Capacity Alert",
                            "Prompts cleaner utilities for storage logs.",
                            "playground_basic",
                            "info_error",
                            "#E2A93E",
                            async () => NotificationService.system.buildStorageWarning()
                        )}
                        {renderCard(
                            "Inactivity Session Alarm",
                            "Logout countdown warning due to session timeouts.",
                            "playground_basic",
                            "cancel_circle",
                            "#CA2B25",
                            async () => NotificationService.system.buildSessionExpiry()
                        )}
                        {renderCard(
                            "Internet Restored",
                            "Centralized network connected update notification.",
                            "playground_basic",
                            "internet",
                            "#0F7635",
                            async () => NotificationService.system.buildInternetRestored()
                        )}
                        {renderCard(
                            "Offline Mode Enabled",
                            "Centralized network disconnected update notification.",
                            "playground_basic",
                            "internet",
                            "#CA2B25",
                            async () => NotificationService.system.buildOfflineMode()
                        )}
                    </View>
                )}

                {/* ======================================================== */}
                {/* 5. MODERN UI STYLES */}
                {/* ======================================================== */}
                {renderHeaderSection("Modern UI Styles", 10, expandedModernUI, setExpandedModernUI)}
                {expandedModernUI && (
                    <View className="px-1">
                        {renderCard(
                            "Big Picture Promotion",
                            "Renders full visual banners inside expanded notification tray.",
                            "playground_basic",
                            "outline_gallery",
                            "#7C3AED",
                            async () => NotificationService.modernUI.buildBigPicturePromotion()
                        )}
                        {renderCard(
                            "Messaging Layout",
                            "Simulates native messaging threads with Doctor's profile avatar.",
                            "playground_basic",
                            "faq_info",
                            "#0891B2",
                            async () => NotificationService.modernUI.buildMessagingStyle()
                        )}
                        {renderCard(
                            "Inbox Detail List",
                            "Summarizes multiple lines of events in list layouts.",
                            "playground_basic",
                            "article",
                            "#0891B2",
                            async () => NotificationService.modernUI.buildInboxStyle()
                        )}
                        {renderCard(
                            "Trigger Group Item #1",
                            "Creates a notification tied to 'demo_group'.",
                            "playground_basic",
                            "dots",
                            "#3B82F6",
                            async () => NotificationService.modernUI.buildGrouped(1)
                        )}
                        {renderCard(
                            "Trigger Group Item #2",
                            "Creates a second notification tied to the same 'demo_group'.",
                            "playground_basic",
                            "dots",
                            "#3B82F6",
                            async () => NotificationService.modernUI.buildGrouped(2)
                        )}
                        {renderCard(
                            "Trigger Group Summary",
                            "Fires summary card collapsing Group Item 1 & 2 natively.",
                            "playground_basic",
                            "dots",
                            "#475467",
                            async () => NotificationService.modernUI.buildGroupSummary(2)
                        )}
                        {renderCard(
                            "Call Action Buttons",
                            "Presents action triggers (Join, Dismiss) directly.",
                            "playground_basic",
                            "sell",
                            "#1D4ED8",
                            async () => NotificationService.modernUI.buildActionButtons()
                        )}
                        {renderCard(
                            "Ongoing / Sticky Alert",
                            "Persistent warning which cannot be dismissed via user swiping.",
                            "playground_basic",
                            "internet",
                            "#475467",
                            async () => NotificationService.modernUI.buildPersistent()
                        )}
                        {renderCard(
                            "Silent Notification",
                            "Triggers warning with zero sounds or vibration patterns.",
                            "playground_progress",
                            "notifications",
                            "#6B7280",
                            async () => NotificationService.modernUI.buildSilent()
                        )}
                        {renderCard(
                            "Heads-up Dialog Alert",
                            "High importance alert that floats on top screen immediately.",
                            "playground_basic",
                            "info_error",
                            "#CA2B25",
                            async () => NotificationService.modernUI.buildHeadsUp()
                        )}
                    </View>
                )}

                {/* ======================================================== */}
                {/* 6. PLAYGROUND CONTROLS & LOG HISTORY */}
                {/* ======================================================== */}
                <Text className="font-inter-bold text-brand-text mt-8 mb-3 uppercase tracking-wider text-xs" style={{ fontSize: moderateScale(12) }}>
                    Playground Management
                </Text>
                
                {/* Global Controls */}
                <View className="bg-white rounded-xl border border-[#919EAB33] p-4 mb-4 shadow-sm">
                    <View className="flex-row gap-x-2">
                        <Touchable
                            activeOpacity={0.7}
                            onPress={async () => {
                                await NotificationService.cancel("persistent_demo_id");
                                await NotificationService.cancel("ongoing_demo");
                                await NotificationService.cancel("interactive_progress_demo");
                            }}
                            className="flex-1 bg-[#EAECF0] border border-[#D0D5DD] py-2.5 rounded-lg items-center justify-center flex-row"
                        >
                            <icons.cancel_circle width={16} height={16} color="#344054" className="mr-1.5" />
                            <Text className="font-inter-bold text-[#344054] text-xs">Clear Ongoing</Text>
                        </Touchable>
                        <Touchable
                            activeOpacity={0.7}
                            onPress={async () => {
                                await NotificationService.cancelAll();
                                setNotificationHistory([]);
                            }}
                            className="flex-1 bg-red-50 border border-red-200 py-2.5 rounded-lg items-center justify-center flex-row"
                        >
                            <icons.delete_red width={16} height={16} className="mr-1.5" />
                            <Text className="font-inter-bold text-[#CA2B25] text-xs">Clear All Alerts</Text>
                        </Touchable>
                    </View>
                </View>

                {/* History Log Panel */}
                <Text className="font-inter-bold text-brand-text mt-4 mb-3 uppercase tracking-wider text-xs" style={{ fontSize: moderateScale(12) }}>
                    Notification History Log ({notificationHistory.length})
                </Text>
                
                <View className="bg-white rounded-xl border border-[#919EAB33] p-4 shadow-sm">
                    {notificationHistory.length === 0 ? (
                        <Text className="text-center text-brand-subtext py-6 text-xs font-inter-medium">
                            No notifications triggered in this session yet. Trigger some alerts above to see history logs here.
                        </Text>
                    ) : (
                        <View>
                            {notificationHistory.map((item, idx) => (
                                <View 
                                    key={`${item.id}-${idx}`}
                                    className={`py-3 ${idx < notificationHistory.length - 1 ? 'border-b border-[#F2F4F7]' : ''}`}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <Text className="font-inter-bold text-[#1A1C1E] text-xs flex-1 mr-2" numberOfLines={1}>
                                            {item.type}
                                        </Text>
                                        <Text className="text-[10px] font-inter-semibold text-brand-subtext">
                                            {item.timestamp}
                                        </Text>
                                    </View>
                                    
                                    <View className="flex-row items-center justify-between mt-1">
                                        <Text className="text-[10px] font-inter-medium text-brand-subtext/70" numberOfLines={1}>
                                            ID: {item.id}
                                        </Text>
                                        <Text className="text-[9px] font-inter-semibold bg-[#F2F4F7] px-1.5 py-0.5 rounded text-brand-subtext">
                                            {item.channel}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                            
                            <Touchable
                                onPress={() => setNotificationHistory([])}
                                className="mt-3 pt-3 border-t border-[#F2F4F7] items-center"
                            >
                                <Text className="font-inter-bold text-brand-subtext text-xs">Clear Local Log History</Text>
                            </Touchable>
                        </View>
                    )}
                </View>

            </ScrollView>
        </View>
    );
}
