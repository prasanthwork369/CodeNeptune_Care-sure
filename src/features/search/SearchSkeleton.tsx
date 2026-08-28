import React from "react";
import { View, ScrollView } from "react-native";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { styles as s } from "./SearchSkeleton.styles";
import { exactScale } from "@/src/utils/exactScale";

export const SearchSkeleton = () => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.container}
      style={{ flex: 1 }}
    >
      {/* Mocking ColumnHeaders */}
      <View style={s.headerRow}>
        <View style={s.headerCell}>
          <Skeleton width={80} height={12} />
        </View>
        <View style={s.headerCell}>
          <Skeleton width={100} height={12} />
        </View>
      </View>

      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={s.itemWrapper}>
          <View style={s.cardRoot}>
            {/* Top Section */}
            <View style={s.splitRow}>
              {/* Left Side */}
              <View style={s.sidePad}>
                <View style={s.topCol}>
                  <Skeleton width="90%" height={16} style={{ marginBottom: 8 }} />
                  <Skeleton width="60%" height={12} />
                </View>
                <View style={s.bottomAuto}>
                  <Skeleton width={60} height={22} style={{ marginBottom: 6 }} />
                  <Skeleton width={50} height={12} />
                </View>
              </View>

              {/* Right Side */}
              <View style={s.sidePad}>
                <View style={s.topCol}>
                  <Skeleton width="90%" height={16} style={{ marginBottom: 8 }} />
                  <Skeleton width="60%" height={12} />
                </View>
                <View style={s.bottomAuto}>
                  <View style={s.priceBaseRow}>
                    <Skeleton width={60} height={22} />
                    <Skeleton width={40} height={14} />
                  </View>
                  <Skeleton width={80} height={12} style={{ marginTop: 4 }} />
                </View>
              </View>
            </View>

            {/* Divider */}
            <View style={s.divider} />

            {/* Bottom Row */}
            <View style={s.bottomRow}>
              <View style={s.bottomLeft}>
                <Skeleton width={18} height={18} borderRadius={9} />
                <Skeleton width={120} height={12} style={{ marginLeft: exactScale(8) }} />
              </View>
              <Skeleton width={70} height={34} borderRadius={8} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};
