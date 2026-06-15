import { PolicyLink } from "@/src/components/auth/PolicyLink";
import { icons } from "@/src/constants/icons";
import { useMobileAppLinks } from "@/src/hooks/queries/useSettings";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { styles as s } from "./AuthFooter.styles";

type LinkKey = "terms" | "privacy" | "refund";

export const AuthFooter: React.FC = () => {
  const { data: links } = useMobileAppLinks();
  const [policy, setPolicy] = useState<{ title: string; url?: string } | null>(
    null,
  );
  const [pressedLink, setPressedLink] = useState<LinkKey | null>(null);

  const linkStyle = (key: LinkKey, enabled?: string) => [
    s.link,
    {
      opacity: enabled ? 1 : 0.5,
      borderRadius: 6,
      paddingHorizontal: 3,
      backgroundColor:
        pressedLink === key ? "rgba(15, 118, 53, 0.18)" : "transparent",
    },
  ];

  const handlePressTerms = () => {
    if (!links?.termsLink) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPolicy({ title: "Terms", url: links.termsLink });
  };

  const handlePressPrivacy = () => {
    if (!links?.privacyLink) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPolicy({ title: "Privacy Policy", url: links.privacyLink });
  };

  const handlePressRefund = () => {
    if (!links?.refundLink) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPolicy({ title: "Refund Policy", url: links.refundLink });
  };

  return (
    <View style={s.wrap}>
      <View className="flex-row items-center justify-center gap-x-2 mb-2">
        <icons.verified_user width={s.icon.width} height={s.icon.height} />
        <Text style={s.secureText}>Secure & Encrypted</Text>
      </View>
      <Text style={s.policyText}>
        By continuing, you agree to our{" "}
        <Text
          style={linkStyle("terms", links?.termsLink)}
          onPress={handlePressTerms}
          onPressIn={() => links?.termsLink && setPressedLink("terms")}
          onPressOut={() => setPressedLink(null)}
          suppressHighlighting
        >
          Terms
        </Text>
        {", "}
        <Text
          style={linkStyle("privacy", links?.privacyLink)}
          onPress={handlePressPrivacy}
          onPressIn={() => links?.privacyLink && setPressedLink("privacy")}
          onPressOut={() => setPressedLink(null)}
          suppressHighlighting
        >
          Privacy Policy
        </Text>
        {" & "}
        <Text
          style={linkStyle("refund", links?.refundLink)}
          onPress={handlePressRefund}
          onPressIn={() => links?.refundLink && setPressedLink("refund")}
          onPressOut={() => setPressedLink(null)}
          suppressHighlighting
        >
          Refund Policy
        </Text>
      </Text>

      <PolicyLink
        isVisible={!!policy}
        onClose={() => setPolicy(null)}
        title={policy?.title ?? ""}
        url={policy?.url}
      />
    </View>
  );
};
