import { components } from "@/src/constants/theme";
import { useAuth } from "@/src/hooks/mutations/useAuth";
import { useProfile } from "@/src/hooks/queries/useProfile";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useScrollStatusBar } from "@/src/hooks/ui/useScrollStatusBar";
import { useAuthStore } from "@/src/store/authStore";
import * as ImagePicker from "expo-image-picker";
import { Redirect } from "expo-router";
import React, { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ProfileCoinsCard,
  ProfileHeader,
  ProfileInfoList,
  ProfileQuickTiles,
} from "../sections";
import UploadBottomSheet from "../sections/UploadBottomSheet";
import { LogoutConfirmModal } from "./LogoutConfirmModal";
import { ProfileSkeleton } from "./ProfileSkeleton";

export const ProfileLayout: React.FC = () => {
  const insets = useSafeAreaInsets();
  const adjustedBottom = useAdjustedBottomInset();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { logout, loading: isLoggingOut } = useAuth();
  const {
    profile,
    loading,
    refreshing,
    avatarUploading,
    refreshProfile,
    uploadAvatar,
  } = useProfile();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const scrollY = useSharedValue(0);
  const headerHeightShared = useSharedValue(0);
  const { safeAreaBgStyle } = useScrollStatusBar(scrollY, headerHeightShared);

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
      if (__DEV__) console.error("[Avatar Upload Error]", err);
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
      mediaTypes: ["images"] as any,
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
      <Animated.View
        style={[safeAreaBgStyle, { backgroundColor: "#F5F6FB" }]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        style={{ backgroundColor: "#F5F6FB" }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          backgroundColor: "#F5F6FB",
          flexGrow: 1,
          paddingBottom: components.tabBar.height + adjustedBottom + 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshProfile}
            colors={["#0F7635"]}
            tintColor="#0F7635"
            progressBackgroundColor="#F5F6FB"
          />
        }
      >
        <View
          onLayout={(e) => {
            headerHeightShared.value = e.nativeEvent.layout.height;
          }}
        >
          <ProfileHeader
            profile={profile}
            localAvatar={localAvatar}
            avatarUploading={avatarUploading}
            onPickAvatar={() => setShowUploadSheet(true)}
            safeAreaTop={insets.top}
          />
        </View>

        <ProfileQuickTiles />

        <ProfileCoinsCard />

        <ProfileInfoList onLogout={() => setShowLogoutModal(true)} />
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

    </View>
  );
};
