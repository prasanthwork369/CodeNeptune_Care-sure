import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Touchable } from "@/src/components/ui/Touchable";
import { useNav } from "@/src/hooks/useNav";
import { icons } from "@/src/constants/icons";
import {
  moderateScale,
  exactScale,
  verticalScale,
} from "@/src/utils/exactScale";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { typography } from "@/src/constants/typography";
import { colors } from "@/src/constants/theme";

export function ReturnSuccessLayout() {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#F8F9FB" }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: exactScale(16),
          paddingBottom: verticalScale(100),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Section */}
        <View
          style={{
            alignItems: "center",
            marginTop: verticalScale(32),
            marginBottom: verticalScale(24),
          }}
        >
          <View
            style={{
              width: exactScale(64),
              height: exactScale(64),
              borderRadius: exactScale(32),
              backgroundColor: "#E4F6EB",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: verticalScale(16),
            }}
          >
            <icons.return_check
              width={exactScale(32)}
              height={exactScale(32)}
              color={colors.primary}
            />
          </View>

          <Text
            style={{
              fontSize: typography.h2.fontSize,
              lineHeight: typography.h2.lineHeight,
              fontWeight: "700",
              color: colors.text,
              textAlign: "center",
              marginBottom: verticalScale(8),
            }}
          >
            Return Requested{"\n"}Submitted!
          </Text>

          <Text
            style={{
              fontSize: typography.body.fontSize,
              lineHeight: typography.body.lineHeight,
              fontWeight: "400",
              color: colors.subtext,
              textAlign: "center",
              paddingHorizontal: exactScale(16),
            }}
          >
            We&apos;ve Received Your Return Request And{"\n"}Will Notify You
            Once It&apos;s Approved
          </Text>
        </View>

        {/* Details Card */}
        <View
          style={{
            backgroundColor: colors.white,
            borderRadius: exactScale(12),
            padding: exactScale(16),
            marginBottom: verticalScale(16),
          }}
        >
          {/* Refund Method */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: exactScale(40),
                height: exactScale(40),
                borderRadius: exactScale(20),
                backgroundColor: "#E4F6EB",
                alignItems: "center",
                justifyContent: "center",
                marginRight: exactScale(12),
              }}
            >
              <icons.return_wallet
                width={exactScale(20)}
                height={exactScale(20)}
                color={colors.primary}
              />
            </View>
            <View>
              <Text
                style={{
                  fontSize: typography.caption.fontSize,
                  color: colors.subtext,
                  marginBottom: verticalScale(2),
                }}
              >
                Refund Method
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(14),
                  fontWeight: "600",
                  color: colors.text,
                }}
              >
                Wallet Refund
              </Text>
            </View>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: "#F1F5F9",
              marginVertical: verticalScale(16),
            }}
          />

          {/* Submitted On */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: exactScale(40),
                height: exactScale(40),
                borderRadius: exactScale(20),
                backgroundColor: "#E4F6EB",
                alignItems: "center",
                justifyContent: "center",
                marginRight: exactScale(12),
              }}
            >
              <icons.return_calendar_today
                width={exactScale(20)}
                height={exactScale(20)}
                color={colors.primary}
              />
            </View>
            <View>
              <Text
                style={{
                  fontSize: typography.caption.fontSize,
                  color: colors.subtext,
                  marginBottom: verticalScale(2),
                }}
              >
                Submitted On
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(14),
                  fontWeight: "600",
                  color: colors.text,
                }}
              >
                24 June 2026, 10.35 AM
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline Card */}
        <View
          style={{
            backgroundColor: colors.white,
            borderRadius: exactScale(12),
            padding: exactScale(16),
            paddingBottom: exactScale(32),
          }}
        >
          <Text
            style={{
              fontSize: typography.title.fontSize,
              fontWeight: "700",
              color: colors.text,
              marginBottom: verticalScale(24),
            }}
          >
            What&apos;s Next
          </Text>

          {/* Timeline Wrapper */}
          <View style={{ paddingLeft: exactScale(8) }}>
            {/* Step 1 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View
                  style={[
                    styles.circleFilled,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <icons.return_check
                    width={exactScale(14)}
                    height={exactScale(11)}
                    color={colors.white}
                  />
                </View>
                <View
                  style={[
                    styles.timelineLine,
                    { backgroundColor: colors.primary },
                  ]}
                />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Return Requested</Text>
                <Text style={styles.timelineSubtitle}>24 Mar, 10:35 AM</Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View
                  style={[
                    styles.circleOutline,
                    { borderColor: colors.primary },
                  ]}
                >
                  <icons.return_review
                    width={exactScale(18)}
                    height={exactScale(18)}
                    color={colors.primary}
                  />
                </View>
                {/* Dotted Line approach */}
                <View style={styles.timelineLineDotted}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Under Review</Text>
                <Text style={styles.timelineSubtitle}>Within 24 Hours</Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View
                  style={[styles.circleOutline, { borderColor: "#E2E8F0" }]}
                >
                  <icons.return_calendar
                    width={exactScale(16)}
                    height={exactScale(16)}
                    color={colors.subtext}
                  />
                </View>
                <View style={styles.timelineLineDotted}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Pickup Scheduled</Text>
                <Text style={styles.timelineSubtitle}>2-3 Days</Text>
              </View>
            </View>

            {/* Step 4 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View
                  style={[styles.circleOutline, { borderColor: "#E2E8F0" }]}
                >
                  <icons.return_pickup
                    width={exactScale(18)}
                    height={exactScale(18)}
                    color={colors.subtext}
                  />
                </View>
                <View style={styles.timelineLineDotted}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Pickup Completed</Text>
                <Text style={styles.timelineSubtitle}>After Pickup</Text>
              </View>
            </View>

            {/* Step 5 */}
            <View style={[styles.timelineItem, { marginBottom: 0 }]}>
              <View style={styles.timelineIconContainer}>
                <View
                  style={[styles.circleOutline, { borderColor: "#E2E8F0" }]}
                >
                  <icons.return_rupee
                    width={exactScale(16)}
                    height={exactScale(16)}
                    color={colors.subtext}
                  />
                </View>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Refund Processed</Text>
                <Text style={styles.timelineSubtitle}>Instant</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Fixed Action */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: exactScale(16),
          paddingBottom: exactScale(16) + adjustedBottom,
          backgroundColor: "#F8F9FB", // Matches screen background
        }}
      >
        <Touchable
          onPress={() => router.replace("/(tabs)" as any)}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: verticalScale(14),
            borderRadius: exactScale(8),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: colors.white,
              fontSize: moderateScale(16),
              fontWeight: "600",
            }}
          >
            Go Home
          </Text>
        </Touchable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  timelineItem: {
    flexDirection: "row",
    marginBottom: verticalScale(32),
  },
  timelineIconContainer: {
    alignItems: "center",
    width: exactScale(36),
    marginRight: exactScale(16),
  },
  circleFilled: {
    width: exactScale(36),
    height: exactScale(36),
    borderRadius: exactScale(18),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  circleOutline: {
    width: exactScale(36),
    height: exactScale(36),
    borderRadius: exactScale(18),
    borderWidth: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  timelineLine: {
    position: "absolute",
    top: exactScale(36),
    bottom: -verticalScale(32),
    width: 1,
    zIndex: 1,
  },
  timelineLineDotted: {
    position: "absolute",
    top: exactScale(36),
    bottom: -verticalScale(32),
    width: 1,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: 4,
  },
  dot: {
    width: 2,
    height: 3,
    backgroundColor: "#E2E8F0",
    marginBottom: 4,
  },
  timelineContent: {
    flex: 1,
    justifyContent: "center",
    paddingTop: exactScale(4),
  },
  timelineTitle: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: colors.text,
    marginBottom: verticalScale(4),
  },
  timelineSubtitle: {
    fontSize: moderateScale(13),
    fontWeight: "400",
    color: colors.subtext,
  },
});
