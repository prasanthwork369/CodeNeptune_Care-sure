import { Skeleton } from "@/src/components/ui/Skeleton";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { StyleSheet, View } from "react-native";

// Placeholder shown while coupons load and their availability is pre-validated,
// so cards never appear active and then flip to faded. Mirrors CouponCard's
// own structure — icon, three text lines, dashed divider, code row and notches —
// so the real card lands on the same pixels instead of reflowing into place.
export const CouponCardSkeleton: React.FC = () => (
  <View style={{ marginBottom: exactScale(12), position: "relative" }}>
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: exactScale(13),
        borderWidth: 1,
        borderColor: "#919EAB33",
      }}
    >
      <View
        style={{
          minHeight: exactScale(67),
          paddingHorizontal: exactScale(16),
          paddingVertical: exactScale(12),
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Skeleton
          width={exactScale(40)}
          height={exactScale(40)}
          borderRadius={exactScale(6)}
        />
        <View style={{ marginLeft: exactScale(12), flex: 1 }}>
          <Skeleton width="45%" height={exactScale(17)} borderRadius={4} />
          <View style={{ marginTop: exactScale(5) }}>
            <Skeleton width="70%" height={exactScale(13)} borderRadius={4} />
          </View>
          <View style={{ marginTop: exactScale(5) }}>
            <Skeleton width="35%" height={exactScale(11)} borderRadius={4} />
          </View>
        </View>
      </View>

      <View style={styles.dashedDivider} />

      <View
        style={{
          height: exactScale(46),
          paddingHorizontal: exactScale(16),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Skeleton width="30%" height={exactScale(14)} borderRadius={4} />
        <Skeleton
          width={exactScale(55)}
          height={exactScale(28)}
          borderRadius={exactScale(4)}
        />
      </View>
    </View>

    <View style={styles.leftNotchWrapper}>
      <View style={styles.leftNotchCircle} />
    </View>
    <View style={styles.rightNotchWrapper}>
      <View style={styles.rightNotchCircle} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  dashedDivider: {
    height: 1,
    marginHorizontal: exactScale(10),
    borderWidth: 1,
    borderColor: "#919EAB33",
    borderStyle: "dashed",
    borderRadius: 1,
  },
  leftNotchWrapper: {
    position: "absolute",
    left: 0,
    bottom: exactScale(36),
    width: exactScale(10),
    height: exactScale(20),
    overflow: "hidden",
    zIndex: 10,
  },
  leftNotchCircle: {
    width: exactScale(20),
    height: exactScale(20),
    borderRadius: exactScale(10),
    backgroundColor: "#F5F6FB",
    borderWidth: 1,
    borderColor: "#919EAB33",
    position: "absolute",
    left: exactScale(-10),
    top: 0,
  },
  rightNotchWrapper: {
    position: "absolute",
    right: 0,
    bottom: exactScale(36),
    width: exactScale(10),
    height: exactScale(20),
    overflow: "hidden",
    zIndex: 10,
  },
  rightNotchCircle: {
    width: exactScale(20),
    height: exactScale(20),
    borderRadius: exactScale(10),
    backgroundColor: "#F5F6FB",
    borderWidth: 1,
    borderColor: "#919EAB33",
    position: "absolute",
    right: exactScale(-10),
    top: 0,
  },
});
