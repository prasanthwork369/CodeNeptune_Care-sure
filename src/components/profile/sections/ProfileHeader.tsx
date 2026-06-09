import React from 'react';
import { profileStyles as s } from '../profile.styles';
import { View, Text, ActivityIndicator } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { icons } from '@/src/constants/icons';

interface ProfileHeaderProps {
    profile: any;
    localAvatar: string | null;
    avatarUploading: boolean;
    onPickAvatar: () => void;
    safeAreaTop: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    profile,
    localAvatar,
    avatarUploading,
    onPickAvatar,
    safeAreaTop
}) => {
    return (
        <LinearGradient
            colors={['#C8EADA', '#F9FAFB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ alignItems: 'center', paddingTop: safeAreaTop + 8, paddingBottom: 60 }}
        >
            <View className="relative">
                <View className="w-[88px] h-[88px] rounded-full bg-[#D0E8DA] items-center justify-center overflow-hidden border-2 border-white">
                    {localAvatar || profile?.avatarUrl ? (
                        <Image
                            source={{ uri: localAvatar ?? `${profile!.avatarUrl!}?v=${profile?.updatedAt ?? ''}` }}
                            style={s.avatarImg}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                        />
                    ) : (
                        <icons.person width={s.avatarIcon.width} height={s.avatarIcon.height} fill="#0F7635" />
                    )}
                </View>
                <Touchable
                    onPress={onPickAvatar}
                    disabled={avatarUploading}
                    className="absolute rounded-full items-center justify-center border-2 border-white"
                    style={[s.avatarEditBtn, { backgroundColor: '#059669', right: -8, bottom: 0, opacity: avatarUploading ? 0.7 : 1 }]}
                >
                    {avatarUploading
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <icons.photo_camera width={s.avatarEditIcon.width} height={s.avatarEditIcon.height} fill="#fff" />
                    }
                </Touchable>
            </View>

            <Text style={s.personName} className="mt-3 font-inter-bold text-brand-text">
                {profile?.firstName || profile?.lastName
                    ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
                    : '—'}
            </Text>
            <Text style={s.personPhone} className="mt-1 font-inter-semibold text-brand-text">{profile?.phoneNumber ?? '—'}</Text>
        </LinearGradient>
    );
};
