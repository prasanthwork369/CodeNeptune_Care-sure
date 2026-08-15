import { Skeleton } from "@/src/components/ui/Skeleton";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { ScrollView, View } from "react-native";

/** Initial server-cart placeholder. It intentionally excludes controls and
 * totals so no mutation affordance is shown before the cart is restored. */
export const CartInitialSkeleton: React.FC = () => (
  <ScrollView
    accessibilityRole="progressbar"
    accessibilityLabel="Loading cart"
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: exactScale(24) }}
  >
    <View
      style={{
        backgroundColor: "#FFFFFF",
        paddingHorizontal: exactScale(16),
        paddingVertical: exactScale(16),
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Skeleton
          width={exactScale(40)}
          height={exactScale(40)}
          borderRadius={exactScale(4)}
        />
        <View
          style={{ flex: 1, marginLeft: exactScale(14), gap: exactScale(7) }}
        >
          <Skeleton width="42%" height={exactScale(14)} />
          <Skeleton width="76%" height={exactScale(12)} />
        </View>
      </View>
    </View>

    <View
      style={{
        marginHorizontal: exactScale(16),
        marginTop: exactScale(12),
        backgroundColor: "#FFFFFF",
        borderRadius: exactScale(12),
        padding: exactScale(16),
      }}
    >
      <Skeleton width={exactScale(84)} height={exactScale(16)} />
      {[0, 1].map((index) => (
        <View
          key={index}
          style={{
            flexDirection: "row",
            paddingTop: exactScale(16),
            marginTop: exactScale(12),
            borderTopWidth: index ? 1 : 0,
            borderColor: "#E5E7EB",
          }}
        >
          <Skeleton
            width={exactScale(64)}
            height={exactScale(64)}
            borderRadius={exactScale(10)}
          />
          <View
            style={{ flex: 1, marginLeft: exactScale(12), gap: exactScale(8) }}
          >
            <Skeleton width="82%" height={exactScale(14)} />
            <Skeleton width="56%" height={exactScale(12)} />
            <Skeleton width={exactScale(52)} height={exactScale(12)} />
          </View>
          <View
            style={{ alignItems: "flex-end", justifyContent: "space-between" }}
          >
            <Skeleton
              width={exactScale(70)}
              height={exactScale(32)}
              borderRadius={exactScale(8)}
            />
            <Skeleton width={exactScale(56)} height={exactScale(16)} />
          </View>
        </View>
      ))}
    </View>

    <View
      style={{
        marginHorizontal: exactScale(16),
        marginTop: exactScale(12),
        backgroundColor: "#FFFFFF",
        borderRadius: exactScale(12),
        padding: exactScale(16),
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Skeleton
        width={exactScale(40)}
        height={exactScale(40)}
        borderRadius={exactScale(4)}
      />
      <View style={{ flex: 1, marginLeft: exactScale(12), gap: exactScale(7) }}>
        <Skeleton width={exactScale(72)} height={exactScale(14)} />
        <Skeleton width={exactScale(60)} height={exactScale(12)} />
      </View>
      <Skeleton width={exactScale(68)} height={exactScale(18)} />
    </View>
  </ScrollView>
);
