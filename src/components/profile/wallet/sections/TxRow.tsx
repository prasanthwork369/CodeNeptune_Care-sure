import { HOME_IMAGES } from "@/src/constants/images";
import { Transaction, TxIconType } from "@/src/types/wallet";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { Image, Text, View } from "react-native";

const TransactionIcon = ({ type }: { type: TxIconType }) => {
  const isCredit = type === "plus" || type === "coin_credit" || type === "cash";
  const src =
    type === "coin_credit"
      ? HOME_IMAGES.coinCredit
      : type === "coin_debit"
        ? HOME_IMAGES.coinDebit
        : isCredit
          ? HOME_IMAGES.accountBalanceCredit
          : HOME_IMAGES.accountBalanceDebit;
  return (
    <View
      style={{
        width: exactScale(40),
        height: exactScale(40),
        borderRadius: exactScale(20),
        backgroundColor: isCredit ? "#DFF3E6" : "#FCE8E8",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={src}
        style={{ width: exactScale(18), height: exactScale(18) }}
        resizeMode="contain"
      />
    </View>
  );
};

export const TxRow: React.FC<{ tx: Transaction; isLast: boolean }> = ({
  tx,
  isLast,
}) => (
  <View>
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: exactScale(20),
        paddingVertical: exactScale(14),
      }}
    >
      <TransactionIcon type={tx.iconType} />
      <View style={{ flex: 1, marginLeft: exactScale(14) }}>
        <Text
          style={{
            fontSize: moderateScale(14),
            fontWeight: "600",
            color: "#111827",
          }}
        >
          {tx.title}
        </Text>
        <Text
          style={{
            fontSize: moderateScale(12),
            color: "#6B7280",
            marginTop: exactScale(2),
          }}
        >
          {tx.date}
        </Text>
      </View>
      {tx.isCoin ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Image
            source={HOME_IMAGES.dollarCoins}
            style={{ width: exactScale(16), height: exactScale(16) }}
            resizeMode="contain"
          />
          <Text
            style={{
              fontSize: moderateScale(14),
              fontWeight: "700",
              color: tx.amountColor,
            }}
          >
            {tx.amount}
          </Text>
        </View>
      ) : (
        <Text
          style={{
            fontSize: moderateScale(14),
            fontWeight: "700",
            color: tx.amountColor,
          }}
        >
          {tx.amount}
        </Text>
      )}
    </View>
    {!isLast && (
      <View
        style={{
          height: 1,
          backgroundColor: "#F3F4F6",
          marginHorizontal: exactScale(20),
        }}
      />
    )}
  </View>
);
