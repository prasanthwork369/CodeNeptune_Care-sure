import { LogoutConfirmModal } from './LogoutConfirmModal';
import { ProfileSkeleton } from './ProfileSkeleton';
import UploadBottomSheet from '../sections/UploadBottomSheet';
import { SignupBonusPopup } from '@/src/components/auth/SignupBonusPopup';
import { components } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/mutations/useAuth';
import { useProfile } from '@/src/hooks/queries/useProfile';
import { useScrollStatusBar } from '@/src/hooks/ui/useScrollStatusBar';
import { useAuthStore } from '@/src/store/authStore';
import * as ImagePicker from 'expo-image-picker';
import { Redirect } from 'expo-router';
import { Touchable } from '@/src/components/ui/Touchable';
import React, { useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
    ProfileHeader, 
    ProfileQuickTiles, 
    ProfileCoinsCard, 
    ProfileInfoList 
} from '../sections';

export const ProfileLayout: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { isAuthenticated } = useAuthStore();
    const { logout, loading: isLoggingOut } = useAuth();
    const { profile, loading, refreshing, avatarUploading, refreshProfile, uploadAvatar } = useProfile();

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showUploadSheet, setShowUploadSheet] = useState(false);
    const [localAvatar, setLocalAvatar] = useState<string | null>(null);
    const [bonusTestKey, setBonusTestKey] = useState<number | null>(null);
    const scrollY = useSharedValue(0);
    const { safeAreaBgStyle } = useScrollStatusBar(scrollY);

    if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

    const handleScroll = (event: any) => {
        scrollY.value = event.nativeEvent.contentOffset.y;
    };

    const uploadUri = async (uri: string) => {
        setLocalAvatar(uri);
        setShowUploadSheet(false);
        try {
            await uploadAvatar(uri);
        } catch (err) {
            console.error('[Avatar Upload Error]', err);
            setLocalAvatar(null);
        }
    };

    const handleSelectCamera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return;
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (result.canceled) return;
        await uploadUri(result.assets[0].uri);
    };

    const handleSelectLibrary = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'] as any,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (result.canceled) return;
        await uploadUri(result.assets[0].uri);
    };


    if (loading) return <ProfileSkeleton />;

    return (
        <View className="flex-1 bg-[#F5F6FB]">
            <Animated.View style={safeAreaBgStyle} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{
                    paddingBottom: components.tabBar.height + insets.bottom + 16,
                }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={refreshProfile} colors={['#0F7635']} tintColor="#0F7635" />
                }
            >
                <ProfileHeader
                    profile={profile}
                    localAvatar={localAvatar}
                    avatarUploading={avatarUploading}
                    onPickAvatar={() => setShowUploadSheet(true)}
                    safeAreaTop={insets.top}
                />

                <ProfileQuickTiles />

                <ProfileCoinsCard />

                <ProfileInfoList onLogout={() => setShowLogoutModal(true)} />

                {__DEV__ && (
                    <Touchable
                        activeOpacity={0.8}
                        onPress={() => setBonusTestKey((k) => (k ?? 0) + 1)}
                        className="mx-4 mt-4 items-center rounded-xl py-3"
                        style={{ backgroundColor: '#AD6CFE22' }}
                    >
                        <Text className="font-inter-semibold text-[#AD6CFE]" style={{ fontSize: 13 }}>
                            Test Signup Bonus Popup
                        </Text>
                    </Touchable>
                )}

            </ScrollView>

            <LogoutConfirmModal
                isVisible={showLogoutModal}
                isLoggingOut={isLoggingOut}
                onCancel={() => setShowLogoutModal(false)}
                onConfirm={logout}
            />

            <UploadBottomSheet
                visible={showUploadSheet}
                onClose={() => setShowUploadSheet(false)}
                onSelectCamera={handleSelectCamera}
                onSelectLibrary={handleSelectLibrary}
            />

            {bonusTestKey !== null && (
                <SignupBonusPopup key={bonusTestKey} testMode onClose={() => setBonusTestKey(null)} />
            )}
        </View>
    );
};
