import { HealthProblem } from "@/src/api/health-problem.api";
import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { RemoteIcon } from "@/src/components/ui/RemoteIcon";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useHealthProblems } from "@/src/hooks/queries/useHealthProblems";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { resolveAssetUrl } from "@/src/utils/urls";
import { BottomSheetTextInput } from "@/src/components/ui/BottomSheetTextInput";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { typography } from "@/src/constants/typography";

interface HealthProblemSheetProps {
  isVisible: boolean;
  selected: HealthProblem | null;
  onSelect: (problem: HealthProblem) => void;
  onClose: () => void;
}

export const HealthProblemSheet: React.FC<HealthProblemSheetProps> = ({
  isVisible,
  selected,
  onSelect,
  onClose,
}) => {
  const adjustedBottom = useAdjustedBottomInset();
  const [query, setQuery] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");
  const { data: healthProblems, isLoading } = useHealthProblems({
    isActive: true,
  });

  const OTHER_OPTION: HealthProblem = {
    id: "other",
    slug: "other",
    label: "Other",
    icon: "➕",
    description: null,
    sortOrder: 9999,
    isActive: true,
  };

  const activeProblems = healthProblems
    ? [...healthProblems, OTHER_OPTION]
    : [OTHER_OPTION];

  const filtered = query.trim()
    ? activeProblems.filter((p) =>
        p.label.toLowerCase().includes(query.toLowerCase()),
      )
    : activeProblems;

  const handleSelect = (item: HealthProblem) => {
    if (item.id === "other") {
      setIsCustomMode(true);
      return;
    }
    onSelect(item);
    setQuery("");
    onClose();
  };

  const handleCustomSubmit = () => {
    if (customText.trim()) {
      onSelect({
        ...OTHER_OPTION,
        id: `custom_${Date.now()}`,
        label: customText.trim(),
        icon: "✍️",
      });
      setIsCustomMode(false);
      setCustomText("");
      setQuery("");
      onClose();
    }
  };

  const handleClose = () => {
    setIsCustomMode(false);
    setCustomText("");
    onClose();
  };

  const snapPoints = useMemo(() => ["75%"], []);

  return (
    <GorhomBottomSheet
      isVisible={isVisible}
      onClose={handleClose}
      snapPoints={snapPoints}
      closeButtonOffset="75%"
    >
      <View style={{ flex: 1, paddingTop: exactScale(8) }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: exactScale(20),
            paddingBottom: exactScale(12),
          }}
        >
          <Text style={{ fontSize: moderateScale(17), fontWeight: "700", color: "#1A1C1E" }}>
            {isCustomMode ? "Enter Health Problem" : "Select Health Problem"}
          </Text>
          <Touchable
            onPress={handleClose}
            hitSlop={{ top: exactScale(10), bottom: exactScale(10), left: exactScale(10), right: exactScale(10) }}
          >
            <icons.close_icon width={exactScale(18)} height={exactScale(18)} fill="#6A6A6A" />
          </Touchable>
        </View>

        {isCustomMode ? (
          <View
            style={{
              paddingHorizontal: exactScale(20),
              paddingTop: exactScale(10),
              paddingBottom: Math.max(adjustedBottom, exactScale(20)),
            }}
          >
            <BottomSheetTextInput
              value={customText}
              onChangeText={setCustomText}
              placeholder="E.g., Back pain, acidity, etc."
              placeholderTextColor="#6A6A6A"
              autoFocus
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: exactScale(8),
                padding: exactScale(14),
                fontSize: moderateScale(15),
                fontWeight: "400",
                color: "#1A1C1E",
                backgroundColor: "#fff",
              }}
            />
            <Touchable
              activeOpacity={0.8}
              onPress={handleCustomSubmit}
              style={{
                backgroundColor: "#0F7635",
                borderRadius: exactScale(8),
                paddingVertical: exactScale(14),
                marginTop: exactScale(16),
                alignItems: "center",
                opacity: customText.trim() ? 1 : 0.5,
              }}
              disabled={!customText.trim()}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: moderateScale(15),
                }}
              >
                Confirm
              </Text>
            </Touchable>
            <Touchable
              activeOpacity={0.8}
              onPress={() => setIsCustomMode(false)}
              style={{
                marginTop: exactScale(12),
                paddingVertical: exactScale(12),
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#6A6A6A",
                  fontWeight: "600",
                  fontSize: moderateScale(14),
                }}
              >
                Back to list
              </Text>
            </Touchable>
          </View>
        ) : (
          <>
            <View
              style={{
                marginHorizontal: exactScale(20),
                marginBottom: exactScale(12),
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: exactScale(12),
                paddingHorizontal: exactScale(14),
                backgroundColor: "#fff",
              }}
            >
              <icons.search width={exactScale(16)} height={exactScale(16)} />
              <BottomSheetTextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search health problem..."
                placeholderTextColor="#6A6A6A"
                style={{
                  flex: 1,
                  paddingVertical: exactScale(12),
                  paddingHorizontal: exactScale(8),
                  fontSize: moderateScale(14),
                  fontWeight: "400",
                  color: "#1A1C1E",
                }}
              />
            </View>

            {isLoading ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: exactScale(200),
                }}
              >
                <ActivityIndicator size="large" color="#0F7635" />
                <Text
                  style={{
                    marginTop: exactScale(12),
                    fontSize: moderateScale(14),
                    fontWeight: "500",
                    color: "#6A6A6A",
                  }}
                >
                  Loading health problems...
                </Text>
              </View>
            ) : (
              <BottomSheetFlatList
                data={filtered}
                numColumns={3}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                  paddingHorizontal: exactScale(16),
                  paddingBottom: Math.max(adjustedBottom, exactScale(16)) + exactScale(8),
                }}
                columnWrapperStyle={{ gap: exactScale(10), marginBottom: exactScale(10) }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const isSelected = selected?.id === item.id;
                  return (
                    <Touchable
                      activeOpacity={0.8}
                      onPress={() => handleSelect(item)}
                      style={{
                        flex: 1,
                        borderRadius: exactScale(14),
                        alignItems: "center",
                        paddingVertical: exactScale(12),
                        paddingHorizontal: exactScale(8),
                        gap: exactScale(8),
                        borderWidth: isSelected ? 1.5 : 1,
                        borderColor: isSelected ? "#0F7635" : "#E5E7EB",
                        backgroundColor: isSelected ? "#F0FFF6" : "#fff",
                      }}
                    >
                      <View style={{ position: "relative" }}>
                        <View
                          style={{
                            width: exactScale(44),
                            height: exactScale(44),
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {item.icon &&
                          (item.icon.startsWith("http") ||
                            item.icon.startsWith("/") ||
                            item.icon.includes(".")) ? (
                            <RemoteIcon
                              uri={resolveAssetUrl(item.icon)}
                              size={exactScale(44)}
                            />
                          ) : (
                            <Text style={{ fontSize: typography.h2.fontSize, lineHeight: typography.h2.lineHeight }}>
                              {item.icon}
                            </Text>
                          )}
                        </View>
                      </View>
                      <Text
                        numberOfLines={2}
                        style={{
                          fontSize: moderateScale(13),
                          textAlign: "center",
                          lineHeight: moderateScale(16),
                          fontWeight: isSelected ? "600" : "500",
                          color: isSelected ? "#0F7635" : "#1A1C1E",
                        }}
                      >
                        {item.label}
                      </Text>
                    </Touchable>
                  );
                }}
              />
            )}
          </>
        )}
      </View>
    </GorhomBottomSheet>
  );
};
