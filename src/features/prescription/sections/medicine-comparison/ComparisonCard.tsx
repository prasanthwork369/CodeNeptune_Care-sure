import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ComparisonMedicine } from "@/src/features/prescription/types";
import { styles as s } from "./medicine-comparison.styles";

interface ComparisonCardProps {
  item: ComparisonMedicine;
  cardWidth: number;
  count: number;
}

const Row: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
  marginBottom?: number;
}> = ({ left, right, marginBottom = 0 }) => (
  <View style={[s.tableRow, { marginBottom }]}>
    <View style={s.tableCol}>{left}</View>
    <View style={s.tableCol}>{right}</View>
  </View>
);

const ImageBox: React.FC<{
  source: ComparisonMedicine["prescribed"]["image"];
  isRecommended?: boolean;
}> = ({ source, isRecommended }) => (
  <View
    style={[
      s.imageBoxBase,
      isRecommended ? s.imageBoxRecommended : s.imageBoxPrescribed,
    ]}
  >
    {source ? (
      <Image
        source={source}
        style={{ width: "80%", height: "80%" }}
        contentFit="contain"
        cachePolicy="memory-disk"
      />
    ) : (
      <icons.placeholder width="70%" height="70%" />
    )}
  </View>
);

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  item,
  cardWidth,
  count,
}) => {
  const hasDiscount = item.recommended.discountPercent > 0;
  const hasMrp = item.recommended.mrp > item.recommended.price;

  return (
    <View style={[s.cardRoot, { width: cardWidth }]}>
      {/* Salt badge */}
      <View style={s.saltBadgeRow}>
        <icons.info_outline width={13} height={13} fill="#6B7280" />
        <Text style={s.saltBadgeText}>
          SAME SALT COMPOSITION IN BOTH
        </Text>
      </View>
      <Text style={s.saltCompositionText}>
        {item.saltComposition}
      </Text>

      {/* Two-column body */}
      <View style={s.bodyTableWrapper}>
        <View
          style={[StyleSheet.absoluteFill, s.backgroundSplitOverlay]}
          pointerEvents="none"
        >
          <View style={s.bgLeftPrescribed} />
          <LinearGradient
            colors={["#F0FCE1", "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={s.bgRightRecommended}
          />
        </View>

        <View style={s.tableRowsContent}>
          <Row
            marginBottom={18}
            left={
              <ImageBox
                source={item.prescribed.image}
              />
            }
            right={
              <ImageBox
                source={item.recommended.image}
                isRecommended
              />
            }
          />

          <Row
            marginBottom={4}
            left={<Text style={s.medName}>{item.prescribed.name}</Text>}
            right={<Text style={s.medName}>{item.recommended.name}</Text>}
          />

          <Row
            marginBottom={2}
            left={
              <Text style={s.prescribedMfg} numberOfLines={1}>
                {item.prescribed.manufacturer}
              </Text>
            }
            right={
              <Text style={s.recommendedMfg} numberOfLines={1}>
                {item.recommended.manufacturer}
              </Text>
            }
          />

          <Row
            left={
              <Text style={s.packSizeText} numberOfLines={1}>
                {item.prescribed.packagingDetail}
              </Text>
            }
            right={
              <Text style={s.packSizeText} numberOfLines={1}>
                {item.recommended.packagingDetail}
              </Text>
            }
          />

          <View style={s.priceRow}>
            <View style={s.priceColPrescribed}>
              <Text style={s.priceBold}>
                ₹{Number(item.prescribed.mrp).toFixed(1)}
              </Text>
            </View>
            <View style={s.priceColRecommended}>
              <Text style={s.priceBold}>
                ₹{Number(item.recommended.price).toFixed(1)}
              </Text>
              {hasMrp && (
                <Text style={s.mrpStrike}>
                  ₹{Number(item.recommended.mrp).toFixed(1)}
                </Text>
              )}
              <View style={s.qtyPill}>
                <Text style={s.qtyPillText}>
                  Qty: {count}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {hasDiscount && (
          <View style={s.discountRibbonWrap}>
            <Image
              source={HOME_IMAGES.couponRibbon}
              style={s.discountRibbonImg}
              contentFit="fill"
            />
            <View style={s.discountRibbonTextWrap}>
              <Text style={s.discountPercentText}>
                {item.recommended.discountPercent}%
              </Text>
              <Text style={s.discountOffText}>
                OFF
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
