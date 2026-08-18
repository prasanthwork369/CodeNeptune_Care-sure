import React, { useEffect, useState } from "react";
import { profileStyles as s } from "../profile.styles";
import { View, Text, ActivityIndicator } from "react-native";
import { Touchable } from "@/src/components/ui/Touchable";
import { AvatarPreviewModal } from "@/src/components/ui/AvatarPreviewModal";
import { AvatarEditSheet } from "./AvatarEditSheet";
import { useAvatarPreview } from "@/src/features/profile/hooks/useAvatarPreview";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { icons } from "@/src/constants/icons";
import { format } from "@/src/utils/validation";
import type { CustomerProfile } from "../types";

interface ProfileHeaderProps {
  profile?: CustomerProfile | null;
  localAvatar: string | null;
  avatarUploading: boolean;
  onPickAvatar: () => void;
  onSelectCamera: () => void;
  onSelectLibrary: () => void;
  safeAreaTop: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  localAvatar,
  avatarUploading,
  onPickAvatar,
  onSelectCamera,
  onSelectLibrary,
  safeAreaTop,
}) => {
  const preview = useAvatarPreview();
  const [showEditSheet, setShowEditSheet] = useState(false);

  // Cache-busted so a freshly uploaded photo replaces the cached one.
  const photoUri =
    localAvatar ??
    (profile?.avatarUrl
      ? `${profile.avatarUrl}?v=${profile.updatedAt ?? ""}`
      : null);

  const fullName =
    profile?.firstName || profile?.lastName
      ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
      : "";

  // Warm the cache at full-screen size so opening the preview never decodes mid-animation.
  useEffect(() => {
    if (photoUri) void Image.prefetch(photoUri, { cachePolicy: "memory-disk" });
  }, [photoUri]);

  const handlePickFrom = (pick: () => void) => {
    setShowEditSheet(false);
    pick();
  };

  return (
    <LinearGradient
      colors={["#C8EADA", "#F9FAFB"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        alignItems: "center",
        paddingTop: safeAreaTop + 8,
        paddingBottom: 60,
      }}
    >
      <View className="relative">
        {/* Tapping the photo opens the full-screen preview; the placeholder does not. */}
        <Touchable
          onPress={preview.open}
          disabled={!photoUri}
          activeOpacity={0.9}
        >
          <View
            style={s.avatarImg}
            className="rounded-full bg-[#D0E8DA] items-center justify-center overflow-hidden border-2 border-white"
          >
            {/* The preview collapses onto this box, not the bordered circle, so it
                lands on exactly the photo that is visible. */}
            <View
              ref={preview.targetRef}
              collapsable={false}
              className="w-full h-full items-center justify-center"
            >
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              ) : (
                <icons.person
                  width={s.avatarIcon.width}
                  height={s.avatarIcon.height}
                  fill="#0F7635"
                />
              )}
            </View>
          </View>
        </Touchable>
        <Touchable
          onPress={onPickAvatar}
          disabled={avatarUploading}
          className="absolute rounded-full items-center justify-center border-2 border-white"
          style={[
            s.avatarEditBtn,
            {
              backgroundColor: "#059669",
              right: -8,
              bottom: 0,
              opacity: avatarUploading ? 0.7 : 1,
            },
          ]}
        >
          {avatarUploading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <icons.photo_camera
              width={s.avatarEditIcon.width}
              height={s.avatarEditIcon.height}
              fill="#fff"
            />
          )}
        </Touchable>
      </View>

      <Text
        style={s.personName}
        className="mt-3 font-inter-bold text-brand-text"
      >
        {fullName || "—"}
      </Text>
      <Text
        style={s.personPhone}
        className="mt-1 font-inter-semibold text-brand-text"
      >
        {format.phone(profile?.phoneNumber) || "—"}
      </Text>

      <AvatarPreviewModal
        visible={preview.visible}
        uri={photoUri}
        title="Profile"
        originRect={preview.rect}
        onClose={() => {
          setShowEditSheet(false);
          preview.close();
        }}
        onEdit={() => setShowEditSheet(true)}
        onHardwareBack={() => {
          if (!showEditSheet) return false;
          setShowEditSheet(false);
          return true;
        }}
      >
        <AvatarEditSheet
          visible={showEditSheet}
          onClose={() => setShowEditSheet(false)}
          onSelectCamera={() => handlePickFrom(onSelectCamera)}
          onSelectLibrary={() => handlePickFrom(onSelectLibrary)}
        />
      </AvatarPreviewModal>
    </LinearGradient>
  );
};
