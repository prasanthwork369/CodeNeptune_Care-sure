import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { profileStyles as s } from '../profile.styles';
import { SUPPORT_PHONE } from "@/src/constants/data";
import { icons } from "@/src/constants/icons";
import { useContactActions } from "@/src/hooks/ui/useContactActions";
import { Touchable } from "@/src/components/ui/Touchable";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useSettings } from "@/src/hooks/queries/useSettings";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { moderateScale } from "@/src/utils/exactScale";

const HelpCard = ({ children }: { children: React.ReactNode }) => (
  <View
    className="bg-white rounded-2xl px-5 py-5 mb-3"
    style={{
      borderWidth: 1,
      borderColor: "#919EAB33",
      shadowColor: "#919EAB33",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    }}
  >
    {children}
  </View>
);

const IconCircle = ({ children }: { children: React.ReactNode }) => (
  <View
    className="w-12 h-12 rounded-full items-center justify-center mb-3"
    style={{ backgroundColor: "#F1F9F4" }}
  >
    {children}
  </View>
);

const HelpSkeleton = () => (
  <View className="flex-1 px-4 pt-4">
    {[1, 2, 3].map((_, index) => (
      <View
        key={index}
        className="bg-white rounded-2xl px-5 py-5 mb-3"
        style={{
          borderWidth: 1,
          borderColor: "#919EAB33",
        }}
      >
        <Skeleton width={48} height={48} borderRadius={24} style={{ marginBottom: 12 }} />
        <Skeleton width="40%" height={18} style={{ marginBottom: 8 }} />
        <Skeleton width="85%" height={12} style={{ marginBottom: 6 }} />
        <Skeleton width="60%" height={12} style={{ marginBottom: 16 }} />
        {index === 1 ? (
          <View style={{ gap: 6 }}>
            <Skeleton width="50%" height={16} style={{ marginBottom: 4 }} />
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
    whatsapp: settings?.whatsappNumber,
    email: settings?.contactEmail,
  });

  const displayPhone = settings?.contactPhone || SUPPORT_PHONE;
  const formattedPhone = displayPhone.startsWith('+')
    ? displayPhone
    : `+91 ${displayPhone.replace(/(\d{5})(\d{5})/, "$1 $2")}`;

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="Help" backgroundColor="#FFFFFF" />
      {isLoading ? (
        <HelpSkeleton />
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: adjustedBottom + 24,
          }}
        >
          <HelpCard>
            <IconCircle>
              <icons.whatsapp width={28} height={28} />
            </IconCircle>
            <Text style={s.helpTitle} className="font-inter-bold text-brand-text mb-1">
              Chat On Whatsapp
            </Text>
            <Text className="font-inter-medium text-brand-subtext leading-[19px] mb-3" style={{ fontSize: moderateScale(13) }}>
              Real-time assistance for urgent clinical queries.{"\n"}Available
              24/7.
            </Text>
            <Touchable
              className="flex-row items-center"
              activeOpacity={0.7}
              onPress={whatsappOrder}
            >
              <Text className="font-inter-semibold text-[#0F7635] mr-2" style={{ fontSize: moderateScale(14) }}>
                Start Chat
              </Text>
              <icons.green_arrow width={15} height={15} />
            </Touchable>
          </HelpCard>

          <Touchable activeOpacity={0.9} onPress={callSupport}>
            <HelpCard>
              <IconCircle>
                <icons.tel width={26} height={26} />
              </IconCircle>
              <Text style={s.helpTitle} className="font-inter-bold text-brand-text mb-1">
                Direct Line
              </Text>
              <Text className="font-inter-medium text-brand-subtext leading-[19px] mb-2" style={{ fontSize: moderateScale(13) }}>
                Speak directly with a restorative architect specialist.
              </Text>
              <Text className="font-inter-semibold text-brand-text mb-0.5" style={{ fontSize: moderateScale(15) }}>
                {formattedPhone}
              </Text>
              <Text className="font-inter-medium text-[#3D4A43]" style={{ fontSize: moderateScale(13) }}>
                Average wait: 2 mins
              </Text>
            </HelpCard>
          </Touchable>

          <HelpCard>
            <IconCircle>
              <icons.mail width={26} height={26} fill="#0F7635" />
            </IconCircle>
            <Text className="font-inter-semibold text-brand-text mb-1" style={{ fontSize: moderateScale(16) }}>
              Email Support
            </Text>
            <Text className="font-inter-medium text-brand-subtext leading-[19px] mb-3" style={{ fontSize: moderateScale(13) }}>
              Detailed requests and documentation for{"\n"}non-urgent matters.
            </Text>
            <Touchable
              className="flex-row items-center"
              activeOpacity={0.7}
              onPress={emailSupport}
            >
              <Text className="font-inter-semibold text-[#0F7635] mr-2" style={{ fontSize: moderateScale(14) }}>
                Open Ticket
              </Text>
              <icons.green_arrow width={15} height={15} />
            </Touchable>
          </HelpCard>
        </ScrollView>
      )}
    </View>
  );
};
