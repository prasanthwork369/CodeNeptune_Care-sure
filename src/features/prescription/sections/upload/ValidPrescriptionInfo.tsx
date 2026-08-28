import { HOME_IMAGES } from "@/src/constants/images";
import { useUploadConfig } from "@/src/hooks/queries/useSettings";
import React from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import Svg, { Line } from "react-native-svg";
import { exactScale } from "@/src/utils/exactScale";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { styles as s } from "./upload.styles";

const VALID_ITEMS = [
  "Doctor's details",
  "Date of prescription",
  "Patient's details",
  "Medicine details",
];

export const ValidPrescriptionInfo: React.FC = () => {
  const {
    data: uploadConfig,
    isError: isUploadConfigError,
    maxSizeLabel,
    validityLabel,
  } = useUploadConfig();
  const uploadRulesReady = Boolean(uploadConfig) || isUploadConfigError;
  const rxBoxW = Math.round(exactScale(105));
  const rxBoxH = Math.round(rxBoxW * 1.09);
  const rxImgW = Math.round(rxBoxW * 0.71);
  const rxImgH = Math.round(rxImgW * 1.23);

  return (
    <View style={s.card}>
      <View style={s.validRow}>
        <View
          style={[
            s.sampleRxBox,
            {
              width: rxBoxW,
              height: rxBoxH,
            },
          ]}
        >
          <Image
            source={HOME_IMAGES.samplePrescription}
            style={{ width: rxImgW, height: rxImgH }}
            contentFit="contain"
          />
        </View>
        <View style={s.validRightCol}>
          <Text style={s.validSectionTitle}>
            Valid prescription includes:
          </Text>
          {VALID_ITEMS.map((item, idx) => (
            <View key={item} style={s.validItemRow}>
              <View style={s.numberCircle}>
                <Text style={s.numberText}>
                  {idx + 1}
                </Text>
              </View>
              <Text style={s.validItemLabel}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={s.dashedSeparator}>
        <Svg height="2" width="100%">
          <Line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke="#0B7E6943"
            strokeWidth="2"
            strokeDasharray="2,4"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {uploadRulesReady ? (
        <>
          <Text style={s.footerNote}>
            File size should be less than {maxSizeLabel}
          </Text>
          <Text style={s.footerNote}>
            Supported formats: PDF, JPG, JPEG, PNG
          </Text>
          <Text style={s.footerNote}>
            Prescription should be less than {validityLabel} old
          </Text>
        </>
      ) : (
        <View style={{ gap: exactScale(8) }}>
          <Skeleton
            width={exactScale(220)}
            height={exactScale(12)}
            borderRadius={exactScale(4)}
          />
          <Skeleton
            width={exactScale(260)}
            height={exactScale(12)}
            borderRadius={exactScale(4)}
          />
          <Skeleton
            width={exactScale(240)}
            height={exactScale(12)}
            borderRadius={exactScale(4)}
          />
        </View>
      )}
    </View>
  );
};
