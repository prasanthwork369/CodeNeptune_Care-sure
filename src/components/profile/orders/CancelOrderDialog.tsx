import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { useCancellationReasons } from '@/src/hooks/queries/useCancellationReasons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, View } from 'react-native';

interface CancelOrderDialogProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    loading?: boolean;
}

const OTHER_OPTION = '__other__';

export function CancelOrderDialog({
    visible,
    onClose,
    onConfirm,
    loading = false,
}: CancelOrderDialogProps) {
    const { data: reasons = [], isLoading: reasonsLoading } = useCancellationReasons();
    const [selectedReasonId, setSelectedReasonId] = useState<number | typeof OTHER_OPTION | null>(null);
    const [otherReason, setOtherReason] = useState('');
    const [error, setError] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Reset selection each time the dialog is (re)opened.
    useEffect(() => {
        if (visible) {
            setSelectedReasonId(null);
            setOtherReason('');
            setError('');
            setIsDropdownOpen(false);
        }
    }, [visible]);

    const isOtherSelected = selectedReasonId === OTHER_OPTION;
    const selectedReason = reasons.find((r) => r.id === selectedReasonId);
    const selectedLabel = isOtherSelected ? 'Other' : selectedReason?.label;

    const selectReason = (id: number | typeof OTHER_OPTION) => {
        setSelectedReasonId(id);
        setIsDropdownOpen(false);
        if (error) setError('');
    };

    const handleConfirm = () => {
        const finalReason = isOtherSelected ? otherReason.trim() : selectedReason?.label;
        if (!finalReason) {
            setError(
                isOtherSelected
                    ? 'Please describe your reason for cancellation.'
                    : 'Please select a reason for cancellation.',
            );
            return;
        }
        onConfirm(finalReason);
        setError('');
    };

    const handleClose = () => {
        setError('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleClose}>
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
                        maxHeight: '80%',
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
                            fontSize: 19,
                            color: '#222222',
                            textAlign: 'center',
                            marginBottom: 12,
                            lineHeight: 24,
                        }}
                    >
                        Cancel Order
                    </Text>

                    {/* Subtitle */}
                    <Text
                        style={{
                            fontSize: 13,
                            fontFamily: 'Inter_400Regular',
                            color: '#6A6A6A',
                            textAlign: 'center',
                            marginBottom: 16,
                            lineHeight: 18,
                        }}
                    >
                        Please let us know why you want to cancel this order.
                    </Text>

                    {reasonsLoading ? (
                        <ActivityIndicator color="#0F7635" style={{ marginBottom: 20 }} />
                    ) : (
                        <View style={{ width: '100%' }}>
                            {/* Dropdown trigger — shows the selected reason, tap to open the list */}
                            <Touchable
                                onPress={() => setIsDropdownOpen((v) => !v)}
                                disabled={loading}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    borderWidth: 1,
                                    borderColor: isDropdownOpen ? '#0F7635' : '#E5E7EB',
                                    backgroundColor: '#fff',
                                    borderRadius: 10,
                                    paddingVertical: 14,
                                    paddingHorizontal: 14,
                                }}
                            >
                                <Text
                                    style={{
                                        flex: 1,
                                        fontSize: 13,
                                        fontFamily: 'Inter_500Medium',
                                        color: selectedLabel ? '#1A1C1E' : '#9CA3AF',
                                    }}
                                    numberOfLines={1}
                                >
                                    {selectedLabel ?? 'Select a reason'}
                                </Text>
                                <icons.down_arrow
                                    width={14}
                                    height={14}
                                    fill="#6B7280"
                                    style={{ transform: [{ rotate: isDropdownOpen ? '180deg' : '0deg' }] }}
                                />
                            </Touchable>

                            {isDropdownOpen && (
                                <ScrollView
                                    style={{ width: '100%', maxHeight: 200, marginTop: 8 }}
                                    contentContainerStyle={{ width: '100%' }}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {reasons.map((item) => {
                                        const isSelected = selectedReasonId === item.id;
                                        return (
                                            <Touchable
                                                key={item.id}
                                                onPress={() => selectReason(item.id)}
                                                disabled={loading}
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                    borderWidth: 1,
                                                    borderColor: isSelected ? '#0F7635' : '#E5E7EB',
                                                    backgroundColor: isSelected ? '#F1FFF6' : '#fff',
                                                    borderRadius: 10,
                                                    paddingVertical: 12,
                                                    paddingHorizontal: 14,
                                                    marginBottom: 8,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        flex: 1,
                                                        fontSize: 13,
                                                        fontFamily: 'Inter_500Medium',
                                                        color: '#1A1C1E',
                                                    }}
                                                >
                                                    {item.label}
                                                </Text>
                                                {isSelected && (
                                                    <icons.check_circle width={16} height={16} fill="#0F7635" />
                                                )}
                                            </Touchable>
                                        );
                                    })}

                                    {/* "Other" — reveals a free-text field for a custom reason */}
                                    <Touchable
                                        onPress={() => selectReason(OTHER_OPTION)}
                                        disabled={loading}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            width: '100%',
                                            borderWidth: 1,
                                            borderColor: isOtherSelected ? '#0F7635' : '#E5E7EB',
                                            backgroundColor: isOtherSelected ? '#F1FFF6' : '#fff',
                                            borderRadius: 10,
                                            paddingVertical: 12,
                                            paddingHorizontal: 14,
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                flex: 1,
                                                fontSize: 13,
                                                fontFamily: 'Inter_500Medium',
                                                color: '#1A1C1E',
                                            }}
                                        >
                                            Other
                                        </Text>
                                    </Touchable>
                                </ScrollView>
                            )}
                        </View>
                    )}

                    {isOtherSelected && (
                        <TextInput
                            placeholder="Enter cancellation reason..."
                            placeholderTextColor="#9CA3AF"
                            value={otherReason}
                            onChangeText={(value) => {
                                setOtherReason(value);
                                if (error && value.trim()) setError('');
                            }}
                            editable={!loading}
                            multiline
                            numberOfLines={3}
                            autoFocus
                            style={{
                                width: '100%',
                                minHeight: 80,
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
                                marginTop: 4,
                                marginBottom: 12,
                            }}
                        />
                    )}

                    {!!error && (
                        <Text
                            style={{
                                width: '100%',
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
                            marginTop: 12,
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
                                    backgroundColor: '#fff',
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                },
                                loading && { opacity: 0.5 },
                            ]}
                        >
                            <Text
                                style={{
                                    fontSize: 15,
                                    fontFamily: 'Inter_700Bold',
                                    color: '#111827',
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
                                    fontSize: 15,
                                    fontFamily: 'Inter_700Bold',
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
