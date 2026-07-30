import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";

const ITEM_H = 44;
const VISIBLE = 5;
const PICKER_H = ITEM_H * VISIBLE;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const START_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => String(START_YEAR + i));

const daysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();

const opacityAt = (d: number) =>
  ([1, 0.55, 0.28, 0.12] as const)[Math.min(d, 3)];
const sizeAt = (d: number) => ([18, 16, 14, 13] as const)[Math.min(d, 3)];

interface ColProps {
  items: string[];
  index: number;
  onChange: (i: number) => void;
  flex?: number;
  align?: "flex-start" | "center" | "flex-end";
}

const WheelCol: React.FC<ColProps> = ({
  items,
  index,
  onChange,
  flex = 1,
  align = "center",
}) => {
  const ref = useRef<ScrollView>(null);
  const [active, setActive] = useState(index);

  useEffect(() => {
    ref.current?.scrollTo({ y: index * ITEM_H, animated: false });
    setActive(index);
  }, [index]);

  const onEnd = useCallback(
    (e: any) => {
      const i = Math.round(
        Math.max(
          0,
          Math.min(e.nativeEvent.contentOffset.y / ITEM_H, items.length - 1),
        ),
      );
      setActive(i);
      onChange(i);
    },
    [items.length, onChange],
  );

  return (
    <View style={{ flex, height: PICKER_H, overflow: "hidden" }}>
      {/* Centre highlight */}
      <View
        style={{
          position: "absolute",
          top: ITEM_H * 2,
          left: 0,
          right: 0,
          height: ITEM_H,
          backgroundColor: "rgba(15,118,53,0.05)",
          borderTopWidth: 0.5,
          borderBottomWidth: 0.5,
          borderColor: "rgba(15,118,53,0.15)",
        }}
      />

      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: ITEM_H * 2,
          paddingBottom: ITEM_H * 2,
        }}
        onMomentumScrollEnd={onEnd}
      >
        {items.map((label, idx) => {
          const d = Math.abs(idx - active);
          const isSelected = d === 0;
          return (
            <View
              key={idx}
              style={{
                height: ITEM_H,
                justifyContent: "center",
                alignItems: align,
                paddingHorizontal: 8,
              }}
            >
              <Text
                style={{
                  opacity: opacityAt(d),
                  fontSize: sizeAt(d),
                  fontFamily: isSelected ? "Inter_700Bold" : "Inter_400Regular",
                  color: isSelected ? "#1565C0" : "#0D0D0D",
                }}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

interface Props {
  value: Date;
  onChange: (d: Date) => void;
  onDone?: () => void;
}

export const DateWheelPicker: React.FC<Props> = ({ value, onChange }) => {
  const [mIdx, setMIdx] = useState(value.getMonth());
  const [dIdx, setDIdx] = useState(value.getDate() - 1);
  const [yIdx, setYIdx] = useState(
    Math.max(0, YEARS.indexOf(String(value.getFullYear()))),
  );

  const days = Array.from(
    { length: daysInMonth(mIdx, Number(YEARS[yIdx])) },
    (_, i) => String(i + 1),
  );

  const emit = (m: number, d: number, y: number) => {
    const year = Number(YEARS[y]);
    const day = Math.min(d + 1, daysInMonth(m, year));
    onChange(new Date(year, m, day));
  };

  const onMonth = (i: number) => {
    setMIdx(i);
    emit(i, dIdx, yIdx);
  };
  const onDay = (i: number) => {
    setDIdx(i);
    emit(mIdx, i, yIdx);
  };
  const onYear = (i: number) => {
    setYIdx(i);
    emit(mIdx, dIdx, i);
  };

  return (
    <View style={{ flexDirection: "row", backgroundColor: "#fff" }}>
      <WheelCol
        items={MONTHS}
        index={mIdx}
        onChange={onMonth}
        flex={2.2}
        align="flex-start"
      />
      <WheelCol
        items={days}
        index={Math.min(dIdx, days.length - 1)}
        onChange={onDay}
        flex={1}
      />
      <WheelCol
        items={YEARS}
        index={yIdx}
        onChange={onYear}
        flex={1.4}
        align="flex-end"
      />
    </View>
  );
};
