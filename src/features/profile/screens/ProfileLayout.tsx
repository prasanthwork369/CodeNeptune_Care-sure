import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { components } from "@/src/constants/theme";
import { useAuth } from "@/src/hooks/mutations/useAuth";
import { useProfile } from "@/src/hooks/queries/useProfile";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useScrollStatusBar } from "@/src/hooks/ui/useScrollStatusBar";
import { useAuthStore } from "@/src/store/authStore";
import { useTabBarStore } from "@/src/store/useTabBarStore";
import * as ImagePicker from "expo-image-picker";
import { Redirect } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, RefreshControl, ScrollView, View } from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ProfileCoinsCard,
  ProfileHeader,
  ProfileInfoList,
  ProfileUpdateCard,
  ProfileQuickTiles,
} from "../sections";
import UploadBottomSheet from "../sections/UploadBottomSheet";
import { LogoutConfirmModal } from "../components/LogoutConfirmModal";
import { SoftUpdateModal } from "@/src/components/common/SoftUpdateModal";
import { useSoftUpdate } from "@/src/hooks/ui/useSoftUpdate";
import { useInAppUpdate } from "@/src/hooks/ui/useInAppUpdate";
import { ProfileSkeleton } from "../components/ProfileSkeleton";

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
  const [showUpdateSheet, setShowUpdateSheet] = useState(false);
  const softUpdate = useSoftUpdate();
  const inAppUpdate = useInAppUpdate();
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const scrollY = useSharedValue(0);
  const headerHeightShared = useSharedValue(0);
  const { safeAreaBgStyle } = useScrollStatusBar(scrollY, headerHeightShared);
  const tabBarHeight = useTabBarStore((s) => s.tabBarHeight);

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  const uploadUri = async (uri: string) => {
    setLocalAvatar(uri);
    try {
      await uploadAvatar(uri);
    } catch (err) {
      if (__DEV__) console.error("[Avatar Upload Error]", err);
      setLocalAvatar(null);
    }
  };

  const showPermissionAlert = (title: string, message: string) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => void Linking.openSettings() },
    ]);
  };

  // Close the sheet and immediately launch the picker — iOS presents
  // UIImagePickerController on top of any open sheet without conflict.
  const handleSelectCamera = () => {
    setShowUploadSheet(false);
    void (async () => {
      try {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          showPermissionAlert(
            "Permission Required",
            "Please allow camera access in Settings to continue.",
          );
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"] as ImagePicker.MediaType[],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
          await uploadUri(result.assets[0].uri);
        }
      } catch (err) {
        if (__DEV__) console.error("[Camera Pick Error]", err);
        Alert.alert("Error", "Failed to capture photo. Please try again.");
      }
    })();
  };

  const handleSelectLibrary = () => {
    setShowUploadSheet(false);
    void (async () => {
      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          showPermissionAlert(
            "Permission Required",
            "Please allow photo library access in Settings to continue.",
          );
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"] as ImagePicker.MediaType[],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
          await uploadUri(result.assets[0].uri);
        }
      } catch (err) {
        if (__DEV__) console.error("[Library Pick Error]", err);
        showPermissionAlert(
          "Permission Required",
          "Please allow photo library access in Settings to continue.",
        );
      }
    })();
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <Animated.View
        style={[safeAreaBgStyle, { backgroundColor: "#F5F6FB" }]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="auto"
        style={{ flex: 1, backgroundColor: "#F5F6FB" }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          backgroundColor: "#F5F6FB",
          flexGrow: 1,
          paddingBottom: tabBarHeight + adjustedBottom + 32,
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
            onSelectCamera={handleSelectCamera}
            onSelectLibrary={handleSelectLibrary}
            safeAreaTop={insets.top}
          />
        </View>

        <ProfileQuickTiles />

        <ProfileCoinsCard />

        {/* Uses raw availability, not the popup's dismissal state, so declining
            "Maybe Later" still leaves a way to update. */}
        <ProfileUpdateCard
          visible={softUpdate.available}
          onPress={() => setShowUpdateSheet(true)}
        />

        <ProfileInfoList onLogout={() => setShowLogoutModal(true)} />
      </ScrollView>

      {/* Same prompt the app shows automatically; opening it from the row
          reuses one component rather than a second update UI. */}
      <SoftUpdateModal
        visible={showUpdateSheet}
        latestVersion={softUpdate.latestVersion}
        onDismiss={() => setShowUpdateSheet(false)}
        onUpdate={() => inAppUpdate.runFlexibleUpdate()}
      />

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
