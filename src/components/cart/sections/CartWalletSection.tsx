import React from 'react';
import { View, Text, Image } from 'react-native';
import { cartStyles as s } from '../cart.styles';
import { HOME_IMAGES } from '@/src/constants/images';
import { CustomSwitch } from '@/src/components/ui/CustomSwitch';
import { CartWalletSectionProps } from '@/src/types/cart';

export const CartWalletSection: React.FC<CartWalletSectionProps> = ({ value, walletBalance, onToggle }) => {
    return (
        <View className="mx-4 mt-3 bg-[#FFFBE1] border border-[#919EAB33] rounded-[12px] px-4 py-3.5 flex-row items-center">
            <Image source={HOME_IMAGES.walletCredit} style={s.walletIcon} resizeMode="contain" />
            <View className="flex-1 ml-3">
                <Text style={s.walletTitle} className="font-inter-semibold text-brand-[#0F1724]">CareSure Wallet Credits</Text>
                <Text style={s.walletSub} className="font-inter-medium text-brand-subtext mt-0.5">Available Balance: ₹{Number(walletBalance).toFixed(2)}</Text>
            </View>
            <CustomSwitch value={value} onValueChange={onToggle} />
        </View>
    );
};
