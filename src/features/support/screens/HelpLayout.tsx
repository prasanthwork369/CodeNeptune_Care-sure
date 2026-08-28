import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { icons } from "@/src/constants/icons";
import { useContactActions } from "@/src/features/support/hooks/useContactActions";
import { Touchable } from "@/src/components/ui/Touchable";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useSettings } from "@/src/hooks/queries/useSettings";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { exactScale } from "@/src/utils/exactScale";
import { styles as s } from "./HelpLayout.styles";

const HelpCard = ({ children }: { children: React.ReactNode }) => (
  <View style={s.helpCard}>{children}</View>
);

const IconCircle = ({ children }: { children: React.ReactNode }) => (
  <View style={s.iconCircle}>{children}</View>
);

const HelpSkeleton = () => (
  <View style={s.skeletonRoot}>
    {[1, 2, 3].map((_, index) => (
      <View key={index} style={s.helpCard}>
        <Skeleton
          width={48}
          height={48}
          borderRadius={24}
          style={{ marginBottom: exactScale(12) }}
        />
        <Skeleton width="40%" height={18} style={{ marginBottom: exactScale(8) }} />
        <Skeleton width="85%" height={12} style={{ marginBottom: exactScale(6) }} />
        <Skeleton width="60%" height={12} style={{ marginBottom: exactScale(16) }} />
        {index === 1 ? (
          <View style={{ gap: exactScale(6) }}>
            <Skeleton width="50%" height={16} style={{ marginBottom: exactScale(4) }} />
            <Skeleton width="30%" height={12} />
          </View>
        ) : (
          <Skeleton width="25%" height={14} />
        )}
      </View>
    ))}
  </View>
);

export const HelpLayout: React.FC = () => {
  const { data: settings, isLoading } = useSettings();
  const adjustedBottom = useAdjustedBottomInset();

  const { callSupport, whatsappOrder, emailSupport } = useContactActions({
    phone: settings?.contactPhone,
    whatsapp: settings?.whatsappNumber || settings?.contactPhone,
    email: settings?.contactEmail,
  });

  const displayPhone = settings?.contactPhone ?? "";
  const phoneDigits = displayPhone.replace(/\D/g, "");
  const localPhone =
    phoneDigits.length >= 10 ? phoneDigits.slice(-10) : phoneDigits;
  const formattedPhone =
    localPhone.length === 10
      ? `+91 ${localPhone.slice(0, 5)} ${localPhone.slice(5)}`
      : displayPhone;

  return (
    <View style={s.root}>
      <ScreenHeader title="Help" backgroundColor="#FFFFFF" />
      {isLoading ? (
        <HelpSkeleton />
      ) : (
        <ScrollView
          style={s.scrollView}
          showsVerticalScrollIndicator={false}
          overScrollMode="auto"
          contentContainerStyle={{
            paddingHorizontal: exactScale(16),
            paddingTop: exactScale(16),
            paddingBottom: adjustedBottom + exactScale(24),
          }}
        >
          <HelpCard>
            <IconCircle>
              <icons.whatsapp width={28} height={28} />
            </IconCircle>
            <Text style={s.cardTitle}>Chat On Whatsapp</Text>
            <Text style={s.cardBody}>
              Real-time assistance for urgent clinical queries.{"\n"}Available
              24/7.
            </Text>
            <Touchable style={s.ctaRow} activeOpacity={0.7} onPress={whatsappOrder}>
              <Text style={s.ctaText}>Start Chat</Text>
              <icons.green_arrow width={15} height={15} />
            </Touchable>
          </HelpCard>

          <Touchable activeOpacity={0.9} onPress={callSupport}>
            <HelpCard>
              <IconCircle>
                <icons.tel width={26} height={26} />
              </IconCircle>
              <Text style={s.cardTitle}>Direct Line</Text>
              <Text style={s.cardBody}>
                Speak directly with a restorative{"\n"}architect specialist.
              </Text>
              {/* Hidden rather than showing a stale constant when settings omit the number. */}
              {formattedPhone ? (
                <Text style={s.phoneText}>{formattedPhone}</Text>
              ) : null}
              <Text style={s.waitText}>Average wait: 2 mins</Text>
            </HelpCard>
          </Touchable>

          <HelpCard>
            <IconCircle>
              <icons.mail width={26} height={26} fill="#0F7635" />
            </IconCircle>
            <Text style={s.cardTitle}>Email Support</Text>
            <Text style={s.cardBody}>
              Detailed requests and documentation for{"\n"}non-urgent matters.
            </Text>
            <Touchable style={s.ctaRow} activeOpacity={0.7} onPress={emailSupport}>
              <Text style={s.ctaText}>Open Ticket</Text>
              <icons.green_arrow width={15} height={15} />
            </Touchable>
          </HelpCard>
        </ScrollView>
      )}
    </View>
  );
};
