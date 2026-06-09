import { HOME_IMAGES } from "@/src/constants/images";
import { colors } from "@/src/constants/theme";
import React from "react";
import { Image, Text, useWindowDimensions, View } from "react-native";
import Svg, { Line } from "react-native-svg";
import { styles as s } from "./ValidPrescriptionInfo.styles";

const VALID_ITEMS = [
  "Doctor's details",
  "Date of prescription",
  "Patient's details",
  "Medicine details",
];

export const ValidPrescriptionInfo: React.FC = () => {
  const { width: screenWidth } = useWindowDimensions();

  const rxBoxW = Math.round(screenWidth * 0.27);
  const rxBoxH = Math.round(rxBoxW * 1.09);
  const rxImgW = Math.round(rxBoxW * 0.71);
  const rxImgH = Math.round(rxImgW * 1.23);

  return (
    <View
      className="bg-white rounded-[14px] p-4"
      style={{ borderWidth: 1, borderColor: "#919EAB33" }}
    >
      <View className="flex-row">
        <View
          style={{
            backgroundColor: "#F2FFFA",
            borderWidth: 1,
            borderColor: "#919EAB33",
            width: rxBoxW,
            height: rxBoxH,
          }}
          className="rounded-[12px] items-center justify-center"
        >
          <Image
            source={HOME_IMAGES.samplePrescription}
            style={{ width: rxImgW, height: rxImgH }}
            resizeMode="contain"
          />
        </View>
        <View className="flex-1 ml-4">
          <Text
            style={s.sectionTitle}
            className="font-inter-bold text-[#1A1C1E] mb-2"
          >
            Valid prescription includes:
          </Text>
          {VALID_ITEMS.map((item, idx) => (
            <View key={item} className="flex-row items-center mt-1.5">
              <View
                style={[s.numberCircle, { backgroundColor: colors.primary }]}
                className="rounded-full items-center justify-center mr-2"
              >
                <Text
                  style={s.numberText}
                  className="font-inter-bold text-white leading-none"
                >
                  {idx + 1}
                </Text>
              </View>
              <Text
                style={s.itemLabel}
                className="font-inter-medium text-[#1A1C1E]"
              >
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 2, marginVertical: 14 }}>
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

      <Text style={s.footerNote} className="font-inter text-brand-subtext mb-1">
        File size should be less than 5 MB
      </Text>
      <Text style={s.footerNote} className="font-inter text-brand-subtext mb-1">
        Supported formats: PDF, JPG, JPEG, PNG
      </Text>
    </View>
  );
};
