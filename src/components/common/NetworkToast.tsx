import { apiClient } from '@/src/api/client';
import { AlertDialog } from '@/src/components/ui/AlertDialog';
import { useNetworkStore } from '@/src/store/useNetworkStore';
import { requestQueue } from '@/src/utils/requestQueue';
import { icons } from '@/src/constants/icons';
import NetInfo from '@react-native-community/netinfo';
import { Touchable } from '@/src/components/ui/Touchable';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Text, View } from 'react-native';
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale } from "@/src/utils/exactScale";

const NetworkToast = () => {
    const { isConnected, isInternetReachable, setIsConnected, offlineAlertVisible, hideOfflineAlert } = useNetworkStore();
    const adjustedBottom = useAdjustedBottomInset();

    const [isLoading, setIsLoading] = useState(false);
    const translateY = useRef(new Animated.Value(300)).current;
    const [signalStep, setSignalStep] = useState(1);

    const showToast = isConnected === false || isInternetReachable === false;
    const isLowNetwork = isConnected === true && isInternetReachable === false;

    useEffect(() => {
        if (showToast) {
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                friction: 12,
                tension: 50,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: 300,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setIsLoading(false);
            });
        }
    }, [showToast]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isLowNetwork) {
            interval = setInterval(() => {
                setSignalStep(prev => (prev >= 4 ? 1 : prev + 1));
            }, 400);
        } else {
            setSignalStep(1);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isLowNetwork]);

    const handleRefresh = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        const state = await NetInfo.refresh();
        const connected = state.isConnected;
        const reachable = state.isInternetReachable;
        setIsConnected(connected, reachable);
        if (connected === true && reachable === true) {
            requestQueue.process(apiClient);
        } else {
            setIsLoading(false);
        }
    };

    const getMessage = () => {
        if (isConnected === false) return 'Internet connection lost';
        if (isInternetReachable === false) return 'Low network connection';
        return '';
    };

    return (
        <>
        <AlertDialog
            visible={offlineAlertVisible}
            onClose={hideOfflineAlert}
            icon="no_internet"
            title={'No Internet Connection\nPlease check your connection\nand try again.'}
            buttons={[{ label: 'Got it', onPress: hideOfflineAlert, variant: 'outline' }]}
        />
        <Animated.View
            pointerEvents={showToast ? 'auto' : 'none'}
            className="absolute left-0 right-0 items-center z-[1000000]"
            style={[
                {
                    bottom: adjustedBottom + 90,
                    transform: [{ translateY }]
                }
            ]}
        >
            <View
                className="bg-[#333333] flex-row items-center justify-between py-3 px-5 rounded-lg shadow-lg shadow-black/30"
                style={{ width: exactScale(367) }}
            >
                {isLoading ? (
                    <View className="flex-row items-center flex-1">
                        <ActivityIndicator size="small" color="#10B981" />
                        <Text className="text-white text-base font-inter-medium ml-3">
                            Checking connection...
                        </Text>
                    </View>
                ) : (
                    <>
                        <View className="flex-row items-center flex-1">
                            <Text className="text-white text-base font-inter-medium">
                                {getMessage()}
                            </Text>
                        </View>
                        {isLowNetwork ? (
                            <View className="ml-4">
                                {(() => {
                                    const WifiIcon = icons[`wifi_${signalStep}` as keyof typeof icons] || icons.wifi_1;
                                    return <WifiIcon width={22} height={22} color="#10B981" />;
                                })()}
                            </View>
                        ) : (
                            <Touchable
                                onPress={handleRefresh}
                                disabled={isLoading}
                                className="ml-4 bg-white/10 py-1.5 px-4 rounded-md"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Text className="text-[#10B981] text-base font-inter-bold uppercase tracking-wider">
                                    Refresh
                                </Text>
                            </Touchable>
                        )}
                    </>
                )}
            </View>
        </Animated.View>
        </>
    );
};

export default NetworkToast;
