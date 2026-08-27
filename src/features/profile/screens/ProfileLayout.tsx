import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { SoftUpdateModal } from "@/src/components/common/SoftUpdateModal";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useProfile } from "@/src/features/profile/hooks/useProfile";
import { useInAppUpdate } from "@/src/hooks/system/useInAppUpdate";
import { useSoftUpdate } from "@/src/hooks/system/useSoftUpdate";
import { useIsOffline } from "@/src/hooks/ui/useIsOffline";
import { useAuthStore } from "@/src/store/authStore";
import { useTabBarStore } from "@/src/store/useTabBarStore";
import { armSettingsReturn } from "@/src/store/lastRouteStore";
import * as ImagePicker from "expo-image-picker";
import { Redirect } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, RefreshControl, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { requireInternet } from "@/src/utils/offline";
import { LogoutConfirmModal } from "../components/LogoutConfirmModal";
import { ProfileSkeleton } from "../components/ProfileSkeleton";
import {
  ProfileCoinsCard,
  ProfileHeader,
  ProfileInfoList,
  ProfileQuickTiles,
  ProfileUpdateCard,
} from "../sections";
import UploadBottomSheet from "../sections/UploadBottomSheet";

export const ProfileLayout: React.FC = () => {
  const isOffline = useIsOffline();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const tabBarHeight = useTabBarStore((s) => s.tabBarHeight);
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

  // Runs on the UI thread so the status-bar fade never lags behind a fast fling.
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const safeAreaBgStyle = useAnimatedStyle(() => {
    const threshold = headerHeightShared.value > 0 ? headerHeightShared.value : 200;
    const shouldShow = scrollY.value >= threshold;
    return {
      opacity: shouldShow ? 1 : 0,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: insets.top + 8.5,
      zIndex: 101,
    };
  });

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  if (isOffline) {
    return (
      <View className="flex-1 bg-white">
        <NoInternetState
          onRetry={() => void refreshProfile()}
          retrying={refreshing}
        />
      </View>
    );
  }

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
      {
        text: "Open Settings",
        onPress: () => {
          armSettingsReturn();
          void Linking.openSettings();
        },
      },
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

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="auto"
        style={{ flex: 1, backgroundColor: "#F5F6FB" }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          backgroundColor: "#F5F6FB",
          flexGrow: 1,
          paddingBottom: tabBarHeight + 16,
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

        <ProfileInfoList
          onLogout={() => {
            if (!requireInternet({ critical: true })) return;
            setShowLogoutModal(true);
          }}
        />
      </Animated.ScrollView>

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
        onConfirm={() => {
          if (!requireInternet({ critical: true })) {
            setShowLogoutModal(false);
            return;
          }
          logout();
        }}
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
