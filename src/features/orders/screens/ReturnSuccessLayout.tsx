import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Touchable } from "@/src/components/ui/Touchable";
import { useNav } from "@/src/hooks/useNav";
import { icons } from "@/src/constants/icons";
import { exactScale } from "@/src/utils/exactScale";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { colors } from "@/src/constants/theme";
import { styles as s } from "./ReturnSuccessLayout.styles";

export function ReturnSuccessLayout() {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={s.root}
    >
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        overScrollMode="auto"
      >
        {/* Top Header Section */}
        <View style={s.headerSection}>
          <View style={s.checkIconBox}>
            <icons.return_check
              width={exactScale(32)}
              height={exactScale(32)}
              color={colors.primary}
            />
          </View>

          <Text style={s.headerTitle}>
            Return Requested{"\n"}Submitted!
          </Text>

          <Text style={s.headerDesc}>
            We&apos;ve Received Your Return Request And{"\n"}Will Notify You
            Once It&apos;s Approved
          </Text>
        </View>

        {/* Details Card */}
        <View style={s.card}>
          {/* Refund Method */}
          <View style={s.cardRow}>
            <View style={s.rowIconBox}>
              <icons.return_wallet
                width={exactScale(20)}
                height={exactScale(20)}
                color={colors.primary}
              />
            </View>
            <View>
              <Text style={s.rowCaption}>Refund Method</Text>
              <Text style={s.rowValue}>Wallet Refund</Text>
            </View>
          </View>

          <View style={s.rowDivider} />

          {/* Submitted On */}
          <View style={s.cardRow}>
            <View style={s.rowIconBox}>
              <icons.return_calendar_today
                width={exactScale(20)}
                height={exactScale(20)}
                color={colors.primary}
              />
            </View>
            <View>
              <Text style={s.rowCaption}>Submitted On</Text>
              <Text style={s.rowValue}>24 June 2026, 10.35 AM</Text>
            </View>
          </View>
        </View>

        {/* Timeline Card */}
        <View style={s.timelineCard}>
          <Text style={s.timelineCardTitle}>
            What&apos;s Next
          </Text>

          {/* Timeline Wrapper */}
          <View style={s.timelineWrap}>
            {/* Step 1 */}
            <View style={s.timelineItem}>
              <View style={s.timelineIconContainer}>
                <View style={s.circleFilled}>
                  <icons.return_check
                    width={exactScale(14)}
                    height={exactScale(11)}
                    color={colors.white}
                  />
                </View>
                <View style={s.timelineLine} />
              </View>
              <View style={s.timelineContent}>
                <Text style={s.timelineTitle}>Return Requested</Text>
                <Text style={s.timelineSubtitle}>24 Mar, 10:35 AM</Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={s.timelineItem}>
              <View style={s.timelineIconContainer}>
                <View
                  style={[
                    s.circleOutline,
                    { borderColor: colors.primary },
                  ]}
                >
                  <icons.return_review
                    width={exactScale(18)}
                    height={exactScale(18)}
                    color={colors.primary}
                  />
                </View>
                {/* Dotted Line */}
                <View style={s.timelineLineDotted}>
                  <View style={s.dot} />
                  <View style={s.dot} />
                  <View style={s.dot} />
                  <View style={s.dot} />
                  <View style={s.dot} />
                </View>
              </View>
              <View style={s.timelineContent}>
                <Text style={s.timelineTitle}>Under Review</Text>
                <Text style={s.timelineSubtitle}>Within 24 Hours</Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={s.timelineItem}>
              <View style={s.timelineIconContainer}>
                <View
                  style={[s.circleOutline, { borderColor: "#E2E8F0" }]}
                >
                  <icons.return_calendar
                    width={exactScale(16)}
                    height={exactScale(16)}
                    color={colors.subtext}
                  />
                </View>
                <View style={s.timelineLineDotted}>
                  <View style={s.dot} />
                  <View style={s.dot} />
                  <View style={s.dot} />
                  <View style={s.dot} />
                  <View style={s.dot} />
                </View>
              </View>
              <View style={s.timelineContent}>
                <Text style={s.timelineTitle}>Pickup Scheduled</Text>
                <Text style={s.timelineSubtitle}>2-3 Days</Text>
              </View>
            </View>

            {/* Step 4 */}
            <View style={s.timelineItem}>
              <View style={s.timelineIconContainer}>
                <View
                  style={[s.circleOutline, { borderColor: "#E2E8F0" }]}
                >
                  <icons.return_pickup
                    width={exactScale(18)}
                    height={exactScale(18)}
                    color={colors.subtext}
                  />
                </View>
                <View style={s.timelineLineDotted}>
                  <View style={s.dot} />
                  <View style={s.dot} />
                  <View style={s.dot} />
                  <View style={s.dot} />
                  <View style={s.dot} />
                </View>
              </View>
              <View style={s.timelineContent}>
                <Text style={s.timelineTitle}>Pickup Completed</Text>
                <Text style={s.timelineSubtitle}>After Pickup</Text>
              </View>
            </View>

            {/* Step 5 */}
            <View style={[s.timelineItem, { marginBottom: 0 }]}>
              <View style={s.timelineIconContainer}>
                <View
                  style={[s.circleOutline, { borderColor: "#E2E8F0" }]}
                >
                  <icons.return_rupee
                    width={exactScale(16)}
                    height={exactScale(16)}
                    color={colors.subtext}
                  />
                </View>
              </View>
              <View style={s.timelineContent}>
                <Text style={s.timelineTitle}>Refund Processed</Text>
                <Text style={s.timelineSubtitle}>Instant</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Fixed Action */}
      <View
        style={[
          s.footer,
          { paddingBottom: exactScale(16) + adjustedBottom },
        ]}
      >
        <Touchable
          onPress={() => router.replace("/(tabs)")}
          style={s.homeBtn}
        >
          <Text style={s.homeBtnText}>
            Go Home
          </Text>
        </Touchable>
      </View>
    </SafeAreaView>
  );
}
