import React from "react";
import { Text, View } from "react-native";
import { styles as s } from "./preview.styles";

interface UploadProgressPanelProps {
  total: number;
  done: number;
  /** Byte-weighted overall progress across all files, 0-100. */
  percent: number;
  failed: number;
  /** True while POST /prescriptions runs after every file already hit 100%. */
  saving?: boolean;
}

// Memoised: byte progress ticks several times a second and must not re-render the screen.
export const UploadProgressPanel: React.FC<UploadProgressPanelProps> =
  React.memo(({ total, done, percent, failed, saving }) => {
    return (
      <View style={s.progressPanel}>
        <View style={s.progressHeaderRow}>
          <Text style={s.progressTitle}>
            {saving ? "Saving prescription…" : "Uploading prescriptions…"}
          </Text>
          <Text style={s.progressPercent}>
            {percent}%
          </Text>
        </View>

        <Text style={s.progressSubtext}>
          {done} of {total} files completed
          {failed > 0 ? ` · ${failed} failed` : ""}
        </Text>

        <View style={s.progressBarTrack}>
          <View
            style={[
              s.progressBarFill,
              { width: `${Math.max(0, Math.min(100, percent))}%` },
            ]}
          />
        </View>

        <Text style={s.progressKeepOpenText}>
          Please keep the app open while your files upload.
        </Text>
      </View>
    );
  });
UploadProgressPanel.displayName = "UploadProgressPanel";
