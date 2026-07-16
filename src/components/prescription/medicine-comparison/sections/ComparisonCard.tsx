import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { moderateScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ComparisonMedicine } from "../types";

interface ComparisonCardProps {
  item: ComparisonMedicine;
  cardWidth: number;
  count: number;
}

const COLUMN_PADDING = 14;
const IMAGE_BOX = 76;
const QTY_PILL_HEIGHT = 30;
const BORDER = "#919EAB33";

const nameStyle = {
  fontSize: moderateScale(15),
  fontWeight: "700",
  color: "#111827",
  lineHeight: moderateScale(20),
} as const;

const manufacturerStyle = {
  fontSize: moderateScale(12),
  fontWeight: "500",
  color: "#6B7280",
} as const;

const packSizeStyle = {
  fontSize: moderateScale(12),
  fontWeight: "400",
  color: "#6B7280",
} as const;

const priceStyle = {
  fontSize: moderateScale(18),
  fontWeight: "800",
  color: "#111827",
} as const;

/**
 * One row of the comparison table. Both cells live in the same flex row, so
 * they always stretch to the taller of the two — that is what keeps the
 * columns aligned without reserving fixed heights or truncating long names.
 */
const Row: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
  marginBottom?: number;
}> = ({ left, right, marginBottom = 0 }) => (
  <View style={{ flexDirection: "row", marginBottom }}>
    <View style={{ flex: 1, paddingHorizontal: COLUMN_PADDING }}>{left}</View>
    <View style={{ flex: 1, paddingHorizontal: COLUMN_PADDING }}>{right}</View>
  </View>
);

const ImageBox: React.FC<{
  source: ComparisonMedicine["prescribed"]["image"];
  borderColor: string;
  backgroundColor: string;
}> = ({ source, borderColor, backgroundColor }) => (
  <View
    style={{
      borderRadius: 10,
      borderWidth: 1,
      borderColor,
      backgroundColor,
      width: IMAGE_BOX,
      height: IMAGE_BOX,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "flex-start",
      overflow: "hidden",
    }}
  >
    {source ? (
      <Image
        source={source}
        style={{ width: "80%", height: "80%" }}
        contentFit="contain"
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
    <View
      style={{
        width: cardWidth,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BORDER,
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      {/* Salt badge */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: COLUMN_PADDING,
          paddingTop: 12,
          paddingBottom: 6,
          gap: 6,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
        }}
      >
        <icons.info_outline width={13} height={13} fill="#6B7280" />
        <Text
          style={{
            fontSize: moderateScale(11),
            fontWeight: "500",
            color: "#6B7280",
            letterSpacing: 0.4,
          }}
        >
          SAME SALT COMPOSITION IN BOTH
        </Text>
      </View>
      <Text
        style={{
          fontSize: moderateScale(13),
          fontWeight: "600",
          color: "#111827",
          paddingHorizontal: COLUMN_PADDING,
          paddingBottom: 12,
        }}
      >
        {item.saltComposition}
      </Text>

      {/* Two-column body, laid out as a table so rows align across the divider */}
      <View style={{ borderTopWidth: 1, borderTopColor: BORDER }}>
        {/* Backgrounds and divider span every row, so they sit on their own
            layer behind the content rather than on the columns themselves. */}
        <View
          style={[StyleSheet.absoluteFill, { flexDirection: "row" }]}
          pointerEvents="none"
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRightWidth: 1,
              borderRightColor: BORDER,
              borderBottomLeftRadius: 15,
            }}
          />
          <LinearGradient
            colors={["#F0FCE1", "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1, borderBottomRightRadius: 15 }}
          />
        </View>

        <View style={{ paddingVertical: COLUMN_PADDING }}>
          <Row
            marginBottom={18}
            left={
              <ImageBox
                source={item.prescribed.image}
                borderColor={BORDER}
                backgroundColor="#F9FAFB"
              />
            }
            right={
              <ImageBox
                source={item.recommended.image}
                borderColor="#D3ECB0"
                backgroundColor="#FFFFFF"
              />
            }
          />

          <Row
            marginBottom={4}
            left={<Text style={nameStyle}>{item.prescribed.name}</Text>}
            right={<Text style={nameStyle}>{item.recommended.name}</Text>}
          />

          <Row
            marginBottom={2}
            left={
              <Text style={manufacturerStyle} numberOfLines={1}>
                {item.prescribed.manufacturer}
              </Text>
            }
            right={
              <Text style={manufacturerStyle} numberOfLines={1}>
                {item.recommended.manufacturer}
              </Text>
            }
          />

          <Row
            left={
              <Text style={packSizeStyle} numberOfLines={1}>
                {item.prescribed.packSize}
              </Text>
            }
            right={
              <Text style={packSizeStyle} numberOfLines={1}>
                {item.recommended.packSize}
              </Text>
            }
          />

          <View style={{ flexDirection: "row", marginTop: 12 }}>
            <View
              style={{
                flex: 1,
                paddingHorizontal: COLUMN_PADDING,
                justifyContent: "center",
                minHeight: QTY_PILL_HEIGHT,
              }}
            >
              <Text style={priceStyle}>
                ₹{Number(item.prescribed.mrp).toFixed(1)}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                paddingHorizontal: COLUMN_PADDING,
                flexDirection: "row",
                alignItems: "center",
                minHeight: QTY_PILL_HEIGHT,
                gap: 4,
              }}
            >
              <Text style={priceStyle}>
                ₹{Number(item.recommended.price).toFixed(1)}
              </Text>
              {hasMrp && (
                <Text
                  style={{
                    fontSize: moderateScale(12),
                    fontWeight: "500",
                    color: "#9CA3AF",
                    textDecorationLine: "line-through",
                  }}
                >
                  ₹{Number(item.recommended.mrp).toFixed(1)}
                </Text>
              )}
              {/* Qty is read-only here — it comes from the prescription */}
              <View
                style={{
                  marginLeft: "auto",
                  borderRadius: 8,
                  backgroundColor: "#F4F6F8",
                  height: QTY_PILL_HEIGHT,
                  paddingHorizontal: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: moderateScale(13),
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  Qty: {count}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {hasDiscount && (
          <View
            style={{
              position: "absolute",
              top: 0,
              right: 12,
              width: 38,
              height: 42,
              zIndex: 10,
            }}
          >
            <Image
              source={HOME_IMAGES.couponRibbon}
              style={{ width: 38, height: 42 }}
              contentFit="fill"
            />
            <View
              style={{
                position: "absolute",
                top: 2,
                left: 0,
                right: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: moderateScale(11),
                  fontWeight: "700",
                  color: "#fff",
                  textAlign: "center",
                  lineHeight: moderateScale(12),
                }}
              >
                {item.recommended.discountPercent}%
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(8),
                  fontWeight: "700",
                  color: "#fff",
                  textAlign: "center",
                  lineHeight: moderateScale(9),
                  marginTop: 1,
                }}
              >
                OFF
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
