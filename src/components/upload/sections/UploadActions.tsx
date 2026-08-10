import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { useNav } from "@/src/hooks/useNav";
import React from "react";
import { Text, View } from "react-native";
import { styles as s } from "./UploadActions.styles";

interface UploadActionsProps {
  onPickImage: () => void;
  onTakePhoto: () => void;
  onPickPdf: () => void;
}

export const UploadActions: React.FC<UploadActionsProps> = ({
  onPickImage,
  onTakePhoto,
  onPickPdf,
}) => {
  const router = useNav();

  return (
    <View
      className="bg-white rounded-[14px] p-4"
      style={{ borderWidth: 1, borderColor: "#919EAB33" }}
    >
      <View className="flex-row" style={{ gap: 12 }}>
        <Touchable
          onPress={onPickImage}
          activeOpacity={0.85}
          style={{ backgroundColor: "#FFFEF8" }}
          className="flex-1 border border-[#919EAB33] rounded-[14px] py-5 items-center justify-center"
        >
          <icons.upload_file
            width={s.actionIcon.width}
            height={s.actionIcon.height}
          />
          <Text
            className="font-inter-semibold text-[#1A1C1E] mt-2"
            style={s.actionLabel}
          >
            Upload Image
          </Text>
        </Touchable>

        <Touchable
          onPress={onTakePhoto}
          activeOpacity={0.85}
          style={{ backgroundColor: "#FFFEF8" }}
          className="flex-1 border border-[#919EAB33] rounded-[14px] py-5 items-center justify-center"
        >
          <icons.photo_camera_green
            width={s.actionIcon.width}
            height={s.actionIcon.height}
          />
          <Text
            style={s.actionLabel}
            className="font-inter-semibold text-[#1A1C1E] mt-2"
          >
            Take a Photo
          </Text>
        </Touchable>

        <Touchable
          onPress={onPickPdf}
          activeOpacity={0.85}
          style={{ backgroundColor: "#FFFEF8" }}
          className="flex-1 border border-[#919EAB33] rounded-[14px] py-5 items-center justify-center"
        >
          <icons.upload_pdf
            width={s.actionIcon.width}
            height={s.actionIcon.height}
          />
          <Text
            style={s.actionLabel}
            className="font-inter-semibold text-[#1A1C1E] mt-2"
          >
            Upload PDF
          </Text>
        </Touchable>
      </View>

      <Touchable
        // Marks the entry so a verified pick offers ordering, not re-upload.
        onPress={() =>
          router.push({
            pathname: "/prescription-history",
            params: { source: "upload" },
          })
        }
        activeOpacity={0.85}
        className="bg-white border border-[#919EAB33] rounded-[14px] p-4 flex-row items-center my-4"
      >
        <View
          style={[s.historyIconBox, { backgroundColor: "#E3F4F0" }]}
          className="rounded-full items-center justify-center"
        >
          <icons.prescriptions
            width={s.historyIcon.width}
            height={s.historyIcon.height}
            fill={"#0F7635"}
          />
        </View>
        <View className="flex-1 ml-3">
          <Text
            style={s.historyTitle}
            className="font-inter-medium text-[#0F2B22]"
          >
            Select from My Prescriptions
          </Text>
          <View
            style={{ backgroundColor: "#F3FAF7" }}
            className="self-start rounded px-2 py-0.5 mt-1"
          >
            <Text
              style={[s.historyBadge, { color: colors.primary }]}
              className="font-inter-bold tracking-wider"
            >
              FASTER VERIFICATION
            </Text>
          </View>
        </View>
        <icons.arrow_forward_ios
          width={s.arrowIcon.width}
          height={s.arrowIcon.height}
          fill={colors.text}
        />
      </Touchable>
    </View>
  );
};
