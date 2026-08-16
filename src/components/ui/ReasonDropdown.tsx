import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import React, { useEffect } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { moderateScale } from "@/src/utils/exactScale";

export interface ReasonOption {
  id: number | string;
  label: string;
}

interface ReasonDropdownProps {
  options: ReasonOption[];
  loading?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  selectedLabel?: string | null;
  selectedId: number | string | null;
  onSelect: (id: number | string) => void;
  includeOther?: boolean;
  isOtherSelected?: boolean;
  onSelectOther?: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxListHeight?: number;
}

/** Shared "tap to open a floating list" reason picker -- used by both the
 * cancel-order and return-reason flows so they look/behave identically. */
export function ReasonDropdown({
  options,
  loading,
  isOpen,
  onToggle,
  selectedLabel,
  selectedId,
  onSelect,
  includeOther = false,
  isOtherSelected = false,
  onSelectOther,
  disabled,
  placeholder = "Select a reason",
  maxListHeight = 220,
}: ReasonDropdownProps) {
  // Smoothly rotate the chevron between 0deg (closed) and 180deg (open).
  const arrowRotation = useSharedValue(0);
  useEffect(() => {
    arrowRotation.value = withTiming(isOpen ? 1 : 0, { duration: 180 });
  }, [isOpen, arrowRotation]);
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotation.value * 180}deg` }],
  }));

  return (
    <View style={{ width: "100%", zIndex: 10 }}>
      <Touchable
        onPress={onToggle}
        disabled={disabled || loading}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          borderWidth: 1,
          borderColor: isOpen ? colors.primary : "#E5E7EB",
          backgroundColor: "#fff",
          borderRadius: 10,
          paddingVertical: 14,
          paddingHorizontal: 14,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontSize: moderateScale(13),
            fontWeight: "500",
            color: selectedLabel ? "#1A1C1E" : "#9CA3AF",
          }}
        >
          {selectedLabel ?? placeholder}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Animated.View style={arrowStyle}>
            <icons.down_arrow width={14} height={14} fill="#6B7280" />
          </Animated.View>
        )}
      </Touchable>

      {isOpen && (
        <Animated.View
          entering={FadeInDown.duration(160)}
          exiting={FadeOutUp.duration(120)}
          style={{
            position: "absolute",
            top: 54,
            left: 0,
            right: 0,
            zIndex: 999,
            elevation: 10, // needed on Android to float above sibling buttons
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            overflow: "hidden",
            // Soft shadow for depth (iOS); Android uses elevation above.
            shadowColor: "#111827",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            style={{ maxHeight: maxListHeight }}
          >
            {options.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <Touchable
                  key={item.id}
                  onPress={() => onSelect(item.id)}
                  disabled={disabled}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 18,
                    paddingHorizontal: 20,
                    backgroundColor: isSelected ? "#F1FFF6" : "#fff",
                    borderBottomWidth: 1,
                    borderBottomColor: "#E5E7EB",
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: moderateScale(16),
                      fontWeight: "400",
                      color: isSelected ? colors.primary : "#1A1C1E",
                    }}
                  >
                    {item.label}
                  </Text>
                  {isSelected && (
                    <icons.check_circle width={18} height={18} fill={colors.primary} />
                  )}
                </Touchable>
              );
            })}
          </ScrollView>

          {/* "Other" sits outside the scroll area so it's always visible/reachable,
              even when the reasons list overflows maxListHeight and needs scrolling
              (which doesn't work reliably when nested inside a bottom sheet's own
              scroll view, e.g. the return-reason modal). */}
          {includeOther && (
            <Touchable
              onPress={onSelectOther}
              disabled={disabled}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 18,
                paddingHorizontal: 20,
                backgroundColor: isOtherSelected ? "#F1FFF6" : "#fff",
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontSize: moderateScale(16),
                  fontWeight: "400",
                  color: isOtherSelected ? colors.primary : "#1A1C1E",
                }}
              >
                Other
              </Text>
              {isOtherSelected && (
                <icons.check_circle width={18} height={18} fill={colors.primary} />
              )}
            </Touchable>
          )}
        </Animated.View>
      )}
    </View>
  );
}
