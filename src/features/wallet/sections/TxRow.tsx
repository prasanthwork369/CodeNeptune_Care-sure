import { HOME_IMAGES } from "@/src/constants/images";
import { Transaction, TxIconType } from "../types";
import React from "react";
import { Image, Text, View } from "react-native";
import { styles as s } from "./TxRow.styles";

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
      style={[
        s.iconContainer,
        { backgroundColor: isCredit ? "#DFF3E6" : "#FCE8E8" },
      ]}
    >
      <Image
        source={src}
        style={s.iconImage}
        resizeMode="contain"
      />
    </View>
  );
};

// Memoized — rendered inside a virtualized list, and props (tx, isLast) are
// stable across re-renders so this correctly skips unrelated parent updates.
export const TxRow = React.memo(function TxRow({
  tx,
  isLast,
}: {
  tx: Transaction;
  isLast: boolean;
}) {
  return (
    <View>
      <View style={s.rowItem}>
        <TransactionIcon type={tx.iconType} />
        <View style={s.detailsWrap}>
          <Text style={s.titleText}>
            {tx.title}
          </Text>
          <Text style={s.dateText}>
            {tx.date}
          </Text>
        </View>
        {tx.isCoin ? (
          <View style={s.coinAmountWrap}>
            <Image
              source={HOME_IMAGES.dollarCoins}
              style={s.coinIcon}
              resizeMode="contain"
            />
            <Text
              style={[
                s.amountText,
                { color: tx.amountColor },
              ]}
            >
              {tx.amount}
            </Text>
          </View>
        ) : (
          <Text
            style={[
              s.amountText,
              { color: tx.amountColor },
            ]}
          >
            {tx.amount}
          </Text>
        )}
      </View>
      {!isLast && <View style={s.separator} />}
    </View>
  );
});
