import { icons } from '@/src/constants/icons';
import { Touchable } from '@/src/components/ui/Touchable';
import React from 'react';
import { Modal, Text, View, ActivityIndicator } from 'react-native';

interface LogoutConfirmModalProps {
    isVisible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    isLoggingOut?: boolean;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ isVisible, onCancel, onConfirm, isLoggingOut }) => {
    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View className="flex-1 bg-black/60 items-center justify-center px-6">
                <View
                    className="bg-white w-full items-center"
                    style={{ borderRadius: 16, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 24 }}
                >
                    {/* Logout icon — oval pink bg */}
                    <View
                        style={{
                            width: 90,
                            height: 90,
                            borderRadius: 45,
                            backgroundColor: '#FFE4E4',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 18,
                        }}
                    >
                        <icons.logout width={36} height={36} fill="#CA2B25" />
                    </View>

                    {/* Message */}
                    <Text
                        className="font-inter-bold text-[#1A1C1E] text-center"
                        style={{ fontSize: 16, marginBottom: 24 }}
                    >
                        Are you sure you want to logout
                    </Text>

                    {/* Buttons */}
                    <View className="flex-row w-full" style={{ gap: 10 }}>
                        <Touchable
                            onPress={onCancel}
                            disabled={isLoggingOut}
                            activeOpacity={0.8}
                            style={{
                                flex: 1,
                                paddingVertical: 13,
                                borderRadius: 999,
                                borderWidth: 1,
                                borderColor: '#DDDDDD',
                                backgroundColor: '#FFFFFF',
                                alignItems: 'center',
                                opacity: isLoggingOut ? 0.6 : 1,
                            }}
                        >
                            <Text className="text-[15px] font-inter-semibold text-[#1A1C1E]">No</Text>
                        </Touchable>

                        <Touchable
                            onPress={onConfirm}
                            disabled={isLoggingOut}
                            activeOpacity={0.8}
                            style={{
                                flex: 1,
                                paddingVertical: 13,
                                borderRadius: 999,
                                backgroundColor: '#E53935',
                                alignItems: 'center',
                            }}
                        >
                            {isLoggingOut ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text className="text-[15px] font-inter-semibold text-white">Yes</Text>
                            )}
                        </Touchable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
