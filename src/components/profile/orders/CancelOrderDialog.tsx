import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import React, { useState } from 'react';
import { Modal, Text, TextInput, View } from 'react-native';

interface CancelOrderDialogProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    loading?: boolean;
}

export function CancelOrderDialog({
    visible,
    onClose,
    onConfirm,
    loading = false,
}: CancelOrderDialogProps) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError('Please provide a reason for cancellation.');
            return;
        }
        onConfirm(reason.trim());
        setError('');
        setReason('');
    };

    const handleClose = () => {
        setError('');
        setReason('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 24,
                }}
            >
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 20,
                        width: '100%',
                        paddingHorizontal: 24,
                        paddingTop: 32,
                        paddingBottom: 24,
                        alignItems: 'center',
                    }}
                >
                    {/* Cancel Icon */}
                    <View
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 32,
                            backgroundColor: '#FFF1F1',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 18,
                        }}
                    >
                        <icons.return_package width={30} height={30} fill="#DC2626" />
                    </View>

                    {/* Title */}
                    <Text
                        style={{
                            fontSize: 16,
                            fontFamily: 'Inter_700Bold',
                            color: '#1A1C1E',
                            textAlign: 'center',
                            marginBottom: 12,
                            lineHeight: 22,
                        }}
                    >
                        Cancel Order
                    </Text>

                    {/* Subtitle */}
                    <Text
                        style={{
                            fontSize: 13,
                            fontFamily: 'Inter_400Regular',
                            color: '#6B7280',
                            textAlign: 'center',
                            marginBottom: 20,
                            lineHeight: 18,
                        }}
                    >
                        Please let us know why you want to cancel this order.
                    </Text>

                    {/* Reason Input */}
                    <TextInput
                        placeholder="Enter cancellation reason..."
                        placeholderTextColor="#9CA3AF"
                        value={reason}
                        onChangeText={(value) => {
                            setReason(value);
                            if (error && value.trim()) setError('');
                        }}
                        editable={!loading}
                        multiline
                        numberOfLines={4}
                        style={{
                            width: '100%',
                            minHeight: 100,
                            backgroundColor: '#F9FAFB',
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            borderRadius: 10,
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                            fontFamily: 'Inter_400Regular',
                            fontSize: 13,
                            color: '#1A1C1E',
                            textAlignVertical: 'top',
                            marginBottom: 20,
                        }}
                    />

                    {!!error && (
                        <Text
                            style={{
                                width: '100%',
                                marginTop: -12,
                                marginBottom: 16,
                                fontFamily: 'Inter_400Regular',
                                fontSize: 12,
                                color: '#DC2626',
                            }}
                        >
                            {error}
                        </Text>
                    )}

                    {/* Buttons */}
                    <View
                        style={{
                            flexDirection: 'row',
                            gap: 10,
                            width: '100%',
                        }}
                    >
                        <Touchable
                            onPress={handleClose}
                            activeOpacity={0.85}
                            disabled={loading}
                            style={[
                                {
                                    flex: 1,
                                    paddingVertical: 13,
                                    borderRadius: 999,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#FFF1F1',
                                },
                                loading && { opacity: 0.5 },
                            ]}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontFamily: 'Inter_600SemiBold',
                                    color: '#222222',
                                }}
                            >
                                Keep Order
                            </Text>
                        </Touchable>

                        <Touchable
                            onPress={handleConfirm}
                            activeOpacity={0.85}
                            disabled={loading}
                            style={[
                                {
                                    flex: 1,
                                    paddingVertical: 13,
                                    borderRadius: 999,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#EF4444',
                                },
                                loading && { opacity: 0.7 },
                            ]}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontFamily: 'Inter_600SemiBold',
                                    color: '#fff',
                                }}
                            >
                                {loading ? 'Cancelling...' : 'Cancel Order'}
                            </Text>
                        </Touchable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
