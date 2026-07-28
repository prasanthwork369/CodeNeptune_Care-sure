import { PolicyLink } from "@/src/components/auth/PolicyLink";
import { icons } from "@/src/constants/icons";
import { useMobileAppLinks } from "@/src/hooks/queries/useSettings";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { styles as s } from "./AuthFooter.styles";

type LinkKey = "terms" | "privacy" | "refund";

export const AuthFooter: React.FC = () => {
  const { data: links } = useMobileAppLinks();
  const [policy, setPolicy] = useState<{ title: string; url?: string } | null>(
    null,
  );
  const [pressedLink, setPressedLink] = useState<LinkKey | null>(null);

  const handlePress = (title: string, url?: string) => {
    if (!url) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPolicy({ title, url });
  };

  // Bordered element, not an inline <Text>: borders don't apply to text spans.
  const renderLink = (key: LinkKey, label: string, url?: string) => (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={() => handlePress(label, url)}
      onPressIn={() => url && setPressedLink(key)}
      onPressOut={() => setPressedLink(null)}
      style={[
        s.linkPress,
        {
          opacity: url ? 1 : 0.5,
          backgroundColor:
            pressedLink === key ? "rgba(15, 118, 53, 0.18)" : "transparent",
        },
      ]}
    >
      <View style={s.linkUnderline}>
        <Text style={s.linkText}>{label}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={s.wrap}>
      <View className="flex-row items-center justify-center gap-x-2 mb-2">
        <icons.verified_user width={s.icon.width} height={s.icon.height} />
        <Text style={s.secureText}>Secure & Encrypted</Text>
      </View>

      <View style={s.policyRow}>
        <Text style={s.policyText}>By continuing, you agree to our </Text>
        {renderLink("terms", "Terms", links?.termsLink)}
        <Text style={s.policyText}>, </Text>
        {renderLink("privacy", "Privacy Policy", links?.privacyLink)}
        <Text style={s.policyText}> & </Text>
        {renderLink("refund", "Refund Policy", links?.refundLink)}
      </View>

      <PolicyLink
        isVisible={!!policy}
        onClose={() => setPolicy(null)}
        title={policy?.title ?? ""}
        url={policy?.url}
      />
    </View>
  );
};
