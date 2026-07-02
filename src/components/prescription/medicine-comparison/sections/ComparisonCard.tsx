import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { ComparisonMedicine } from "../types";
import { moderateScale } from "@/src/utils/exactScale";

interface ComparisonCardProps {
  item: ComparisonMedicine;
  cardWidth: number;
  count: number;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  item,
  cardWidth,
  count,
}) => {
  const colWidth = cardWidth / 2;

  return (
    <View
      style={{
        width: cardWidth,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#919EAB33",
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      {/* Salt badge */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
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
          paddingHorizontal: 14,
          paddingBottom: 12,
        }}
      >
        {item.saltComposition}
      </Text>

      {/* Two-column body */}
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: "#919EAB33",
        }}
      >
        {/* Left — Prescribed */}
        <View
          style={{
            width: colWidth,
            padding: 12,
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#fff",
            borderBottomLeftRadius: 15,
            borderRightWidth: 1,
            borderRightColor: "#919EAB33",
          }}
        >
          <View>
            <View
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#919EAB33",
                width: 76,
                height: 76,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
                backgroundColor: "#F9FAFB",
                alignSelf: "flex-start",
                overflow: "hidden",
              }}
            >
              {item.prescribed.image ? (
                <Image
                  source={item.prescribed.image}
                  style={{ width: "80%", height: "80%" }}
                  contentFit="contain"
                />
              ) : (
                <icons.placeholder width="70%" height="70%" />
              )}
            </View>
            <Text
              style={{
                fontSize: moderateScale(15),
                fontWeight: "700",
                color: "#111827",
                lineHeight: moderateScale(20),
                marginBottom: 4,
                marginTop: 8,
              }}
              numberOfLines={2}
            >
              {item.prescribed.name}
            </Text>
            <Text
              style={{
                fontSize: moderateScale(12),
                fontWeight: "500",
                color: "#6B7280",
                marginBottom: 2,
              }}
              numberOfLines={1}
            >
              {item.prescribed.manufacturer}
            </Text>
            <Text
              style={{
                fontSize: moderateScale(12),
                fontWeight: "400",
                color: "#6B7280",
              }}
              numberOfLines={1}
            >
              {item.prescribed.packSize}
            </Text>
          </View>
          <View style={{ marginTop: 12 }}>
            <Text
              style={{
                fontSize: moderateScale(12),
                fontWeight: "500",
                color: "#6B7280",
                marginBottom: 2,
              }}
            >
              MRP
            </Text>
            <Text
              style={{
                fontSize: moderateScale(18),
                fontWeight: "800",
                color: "#111827",
              }}
            >
              ₹{Number(item.prescribed.mrp).toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Right — Recommended */}
        <LinearGradient
          colors={["#F0FCE1", "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            width: colWidth,
            padding: 12,
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            borderBottomRightRadius: 15,
          }}
        >
          {item.recommended.discountPercent > 0 && (
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

          <View>
            {/* Image box — left-aligned square box */}
            <View
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#D3ECB0",
                width: 76,
                height: 76,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FFFFFF",
                alignSelf: "flex-start",
                overflow: "hidden",
                marginBottom: 10,
              }}
            >
              {item.recommended.image ? (
                <Image
                  source={item.recommended.image}
                  style={{ width: "80%", height: "80%" }}
                  contentFit="contain"
                />
              ) : (
                <icons.placeholder width="70%" height="70%" />
              )}
            </View>
            <Text
              style={{
                fontSize: moderateScale(15),
                fontWeight: "700",
                color: "#111827",
                lineHeight: moderateScale(20),
                marginBottom: 4,
                marginTop: 8,
              }}
              numberOfLines={2}
            >
              {item.recommended.name}
            </Text>
            <Text
              style={{
                fontSize: moderateScale(12),
                fontWeight: "500",
                color: "#6B7280",
                marginBottom: 2,
              }}
              numberOfLines={1}
            >
              {item.recommended.manufacturer}
            </Text>
            <Text
              style={{
                fontSize: moderateScale(12),
                fontWeight: "400",
                color: "#6B7280",
              }}
              numberOfLines={1}
            >
              {item.recommended.packSize}
            </Text>
          </View>

          {/* Price + qty display */}
          <View style={{ marginTop: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text
                style={{
                  fontSize: moderateScale(18),
                  fontWeight: "800",
                  color: "#111827",
                }}
              >
                ₹{Number(item.recommended.price).toFixed(1)}
              </Text>
              {item.recommended.mrp > item.recommended.price && (
                <Text
                  style={{
                    fontSize: moderateScale(12),
                    fontWeight: "500",
                    color: "#9CA3AF",
                    textDecorationLine: "line-through",
                    marginLeft: 4,
                  }}
                >
                  MRP ₹{Number(item.recommended.mrp).toFixed(1)}
                </Text>
              )}
            </View>
            {/* Qty display — non-editable white button with green border */}
            <View
              style={{
                borderRadius: 10,
                borderWidth: 1.25,
                borderColor: "#0F7635",
                backgroundColor: "#FFFFFF",
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 12,
              }}
            >
              <Text
                style={{
                  fontSize: moderateScale(15),
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                Qty {count}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};
