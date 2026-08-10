import { moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";

interface UploadProgressPanelProps {
  total: number;
  done: number;
  /** Averaged real byte progress across all files, 0-100. */
  percent: number;
  failed: number;
}

// Memoised: byte progress ticks several times a second and must not re-render the screen.
export const UploadProgressPanel: React.FC<UploadProgressPanelProps> =
  React.memo(({ total, done, percent, failed }) => {
    return (
      <View
        className="bg-white border-t border-[#919EAB1A]"
        style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 4 }}
      >
        <View className="flex-row items-center justify-between">
          <Text
            className="font-inter-semibold text-[#1A1C1E]"
            style={{ fontSize: moderateScale(14) }}
          >
            Uploading prescriptions…
          </Text>
          <Text
            className="font-inter-semibold text-[#0F7635]"
            style={{ fontSize: moderateScale(14) }}
          >
            {percent}%
          </Text>
        </View>

        <Text
          className="font-inter-medium text-[#6A6A6A]"
          style={{ fontSize: moderateScale(12), marginTop: 4 }}
        >
          {done} of {total} uploaded
          {failed > 0 ? ` · ${failed} failed` : ""}
        </Text>

        <View
          style={{
            height: 6,
            borderRadius: 999,
            backgroundColor: "#E5E7EB",
            overflow: "hidden",
            marginTop: 10,
          }}
        >
          <View
            style={{
              height: 6,
              borderRadius: 999,
              backgroundColor: "#0F7635",
              width: `${Math.max(0, Math.min(100, percent))}%`,
            }}
          />
        </View>

        <Text
          className="font-inter-medium text-[#6A6A6A]"
          style={{ fontSize: moderateScale(11), marginTop: 8 }}
        >
          Please keep the app open while your files upload.
        </Text>
      </View>
    );
  });
UploadProgressPanel.displayName = "UploadProgressPanel";
