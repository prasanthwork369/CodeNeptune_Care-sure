import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import React from "react";
import { Text, View } from "react-native";
import { styles as s } from "./upload.styles";

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
    <View style={s.card}>
      <View style={s.actionsRow}>
        <Touchable
          onPress={onPickImage}
          activeOpacity={0.85}
          style={s.actionBtn}
        >
          <icons.upload_file
            width={s.actionIcon.width}
            height={s.actionIcon.height}
          />
          <Text style={s.actionLabel}>
            Upload Image
          </Text>
        </Touchable>

        <Touchable
          onPress={onTakePhoto}
          activeOpacity={0.85}
          style={s.actionBtn}
        >
          <icons.photo_camera_green
            width={s.actionIcon.width}
            height={s.actionIcon.height}
          />
          <Text style={s.actionLabel}>
            Take a Photo
          </Text>
        </Touchable>

        <Touchable
          onPress={onPickPdf}
          activeOpacity={0.85}
          style={s.actionBtn}
        >
          <icons.upload_pdf
            width={s.actionIcon.width}
            height={s.actionIcon.height}
          />
          <Text style={s.actionLabel}>
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
        style={s.historySelectCard}
      >
        <View style={s.historyIconBox}>
          <icons.prescriptions
            width={s.historyIcon.width}
            height={s.historyIcon.height}
            fill="#0F7635"
          />
        </View>
        <View style={s.historyTextCol}>
          <Text style={s.historyTitle}>
            Select from My Prescriptions
          </Text>
          <View style={s.historyBadgeBox}>
            <Text style={s.historyBadgeText}>
              FASTER VERIFICATION
            </Text>
          </View>
        </View>
        <icons.arrow_forward_ios
          width={s.arrowIcon.width}
          height={s.arrowIcon.height}
          fill="#6A6A6A"
        />
      </Touchable>

      <Text style={s.historyHelperText}>
        Select from already uploaded prescriptions for faster verification.
      </Text>
    </View>
  );
};
