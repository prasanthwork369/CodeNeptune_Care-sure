import { icons } from '@/src/constants/icons';
import { HOME_IMAGES } from '@/src/constants/images';
import { Touchable } from '@/src/components/ui/Touchable';
import React from 'react';
import { Image, Modal, Text, View } from 'react-native';

type IconVariant = 'package' | 'check' | 'check-green' | 'delete' | 'pdf' | 'no_internet';
type ButtonVariant = 'green' | 'red' | 'outline';

export interface AlertButton {
    label: string;
    onPress: () => void;
    variant: ButtonVariant;
}

export interface AlertDialogProps {
    visible: boolean;
    onClose: () => void;
    icon: IconVariant;
    title: string;
    buttons: AlertButton[];
}

function AlertIcon({ variant }: { variant: IconVariant }) {
    if (variant === 'check-green') {
        return (
            <View style={{ marginBottom: 18 }}>
                <Image source={HOME_IMAGES.successTick} style={{ width: 72, height: 72 }} resizeMode="contain" />
            </View>
        );
    }

    const bgColor = variant === 'delete' ? '#FEF2F2' : variant === 'pdf' ? '#E6F4EA' : variant === 'no_internet' ? '#F4EAD3' : '#FEFCE8';
    const borderColor = variant === 'no_internet' ? '#FFEAC3' : undefined;

    return (
        <View
            style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: bgColor,
                borderWidth: borderColor ? 1.5 : 0,
                borderColor: borderColor,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
            }}
        >
            {variant === 'package'     && <icons.package_icon  width={30} height={30} fill="#92400E" />}
            {variant === 'check'       && <icons.check_circle  width={30} height={30} fill="#16A34A" />}
            {variant === 'delete'      && <icons.delete_red    width={30} height={30} />}
            {variant === 'pdf'         && <icons.upload_pdf    width={30} height={30} />}
            {variant === 'no_internet' && <icons.internet      width={30} height={30} />}
        </View>
    );
}

export function AlertDialog({ visible, onClose, icon, title, buttons }: AlertDialogProps) {
    const isRow = buttons.length > 1;
    const isSingle = buttons.length === 1;

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
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
                    <AlertIcon variant={icon} />

                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: '#1A1C1E',
                            textAlign: 'center',
                            marginBottom: 24,
                            lineHeight: 22,
                        }}
                    >
                        {title}
                    </Text>

                    <View
                        style={{
                            flexDirection: isRow ? 'row' : 'column',
                            gap: 10,
                            width: '100%',
                            alignItems: isSingle ? 'center' : undefined,
                        }}
                    >
                        {buttons.map((btn, i) => (
                            <Touchable
                                key={i}
                                onPress={btn.onPress}
                                activeOpacity={0.85}
                                style={[
                                    {
                                        paddingVertical: 13,
                                        paddingHorizontal: isSingle ? 48 : undefined,
                                        flex: isSingle ? undefined : 1,
                                        borderRadius: 999,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    },
                                    btn.variant === 'green' && { backgroundColor: '#0F7635' },
                                    btn.variant === 'red' && { backgroundColor: '#EF4444' },
                                    btn.variant === 'outline' && {
                                        backgroundColor: '#fff',
                                        borderWidth: 1.5,
                                        borderColor: '#D1D5DB',
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        { fontSize: 14, fontWeight: '600' },
                                        (btn.variant === 'green' || btn.variant === 'red') && { color: '#fff' },
                                        btn.variant === 'outline' && { color: '#374151' },
                                    ]}
                                >
                                    {btn.label}
                                </Text>
                            </Touchable>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}
