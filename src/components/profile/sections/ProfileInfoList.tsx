import React from 'react';
import { profileStyles as s } from '../profile.styles';
import { View, Text } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { useNav } from '@/src/hooks/useNav';
import { icons } from '@/src/constants/icons';

const INFO_ITEMS = [
    { label: 'My Profile', icon: 'person', route: '/profile/my-profile' },
    { label: 'My Order', icon: 'package_icon', route: '/profile/orders' },
    { label: 'Frequently Ordered List', icon: 'article', route: '/profile/orders/frequent' },
    { label: 'My Address', icon: 'location_on', route: '/profile/addresses' },
    { label: 'Cart', icon: 'cart_outline_profile', route: '/(modal)/cart' },
    { label: 'My Wallet /  CareSure Coins', icon: 'account_balance_wallet', route: '/profile/wallet' },
    { label: 'Prescriptions', icon: 'prescriptions_list', route: '/profile/orders/prescriptions' },
    { label: 'Patient Details', icon: 'clinical_notes', route: '/profile/patients/details' },
    { label: 'Need Help', icon: 'help', route: '/profile/support/help' },
    { label: 'Notification', icon: 'notifications', route: '/profile/support/notifications' },
    { label: 'FAQ', icon: 'faq_info', route: '/profile/support/faq' },
] as const;

interface ProfileInfoListProps {
    onLogout: () => void;
}

export const ProfileInfoList: React.FC<ProfileInfoListProps> = ({ onLogout }) => {
    const router = useNav();

    return (
        <View className="mx-4 my-6">
            <Text style={s.sectionTitle} className="font-inter-bold text-brand-text mb-3">Your Information</Text>
            <View className="bg-white rounded-xl overflow-hidden border border-[#919EAB33]">
                {INFO_ITEMS.map((item, index) => {
                    const Icon = (icons as any)[item.icon];
                    return (
                        <View key={item.label}>
                            <Touchable
                                onPress={() => router.push(item.route as any)}
                                activeOpacity={0.6}
                                className="flex-row items-center px-4 py-[15px]"
                            >
                                <Icon width={22} height={22} fill="#222222" />
                                <Text style={s.infoLabel} className="flex-1 ml-[14px] font-inter-medium text-brand-text">{item.label}</Text>
                                <icons.arrow_forward_gray width={16} height={16} />
                            </Touchable>
                            {index < INFO_ITEMS.length - 1 && (
                                <View style={{ height: 1, backgroundColor: '#EEEFF1' }} />
                            )}
                        </View>
                    );
                })}

                <Touchable
                    onPress={onLogout}
                    className="flex-row items-center px-4 py-6 border-t border-[#919EAB33]"
                    style={{ borderStyle: 'dotted' }}
                >
                    <icons.logout width={22} height={22} fill="#CA2B25" />
                    <Text style={s.logoutText} className="ml-[10px] font-inter-semibold text-[#CA2B25]">Logout</Text>
                </Touchable>
            </View>
        </View>
    );
};
